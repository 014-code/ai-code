import { getAppVOById, listLatestChatHistory } from '@/api/chat'
import { deployApp } from '@/api/app'
import { AppVO } from '@/api/vo/app'
import { ChatHistoryVO } from '@/api/vo/chat'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import { getToken } from '@/utils/cookies'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { Avatar, Icon, TabView } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Markdown from 'react-native-markdown-display'
import { WebView } from 'react-native-webview'
import { useTheme } from '@/hooks/useTheme'
import Logo from '@/components/Logo'

const BASE_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8123" 
  : "http://localhost:8123"

export default function ChatPage() {
  const router = useRouter()
  const { appId, prompt } = useLocalSearchParams<{ appId: string; prompt?: string }>()
  const insets = useSafeAreaInsets()
  const { themeColor } = useTheme()
  
  const [messages, setMessages] = useState<ChatHistoryVO[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [appInfo, setAppInfo] = useState<AppVO>()
  const [deploying, setDeploying] = useState(false)
  const [isAutoSend, setIsAutoSend] = useState(false)
  const [streamConnected, setStreamConnected] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (appId) {
      initPageData()
    }
  }, [appId])

  const initPageData = () => {
    loadAppInfo()
    loadChatHistory()
  }

  const loadAppInfo = () => {
    if (!appId) {
      console.error('应用ID不存在')
      return
    }
    
    getAppVOById(appId).then(res => {
      if (res.code === 0 && res.data) {
        setAppInfo(res.data)
      }
    }).catch(err => {
      console.error('加载应用信息失败：', err)
    })
  }

  const loadChatHistory = () => {
    if (!appId) {
      console.error('应用ID不存在')
      return
    }
    
    listLatestChatHistory(appId).then(res => {
      if (res.code === 0 && res.data) {
        const validMessages = res.data.filter((msg: ChatHistoryVO) => msg != null)
        const sortedMessages = [...validMessages].sort((a, b) =>
          new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
        )
        setMessages(sortedMessages)

        if (prompt && sortedMessages.length === 0) {
          setIsAutoSend(true)
          setTimeout(() => {
            setInputText(prompt)
            handleSendMessage()
          }, 500)
        }
      }
    }).catch(err => {
      console.error('加载对话历史失败：', err)
    })
  }

  const handleSendMessage = async () => {
    const text = inputText.trim()
    if (!text) return

    setInputText('')
    setLoading(true)
    setStreamConnected(false)

    const userMessage: ChatHistoryVO = {
      id: Date.now(),
      appId: Number(appId),
      messageType: 'user',
      messageContent: text,
      createTime: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])

    const aiMessageId = Date.now() + 1
    const aiMessage: ChatHistoryVO = {
      id: aiMessageId,
      appId: Number(appId),
      messageType: 'ai',
      messageContent: '',
      createTime: new Date().toISOString(),
    }

    setMessages(prev => [...prev, aiMessage])

    const url = `${BASE_URL}/api/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(text)}`

    let aiResponse = ''
    let closed = false
    let streamCompleted = false

    const closeConnection = () => {
      if (!closed) {
        closed = true
        setLoading(false)
        setStreamConnected(false)
      }
    }

    const handleError = (error: unknown) => {
      console.error('生成代码失败：', error)
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, messageContent: '抱歉，生成过程中出现了错误，请重试。' } : msg
      ))
      closeConnection()
      Alert.alert('生成失败', '请重试')
    }

    try {
      const token = await getToken()
      console.log('开始SSE请求，URL:', url)
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          'Authorization': token || '',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      console.log('SSE连接已建立')
      setStreamConnected(true)

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const readStream = async () => {
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done || streamCompleted) {
              console.log('流式读取完成')
              closeConnection()
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            console.log('接收到数据块:', chunk)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (streamCompleted) break

              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                console.log('解析data行:', data)
                if (data === '[DONE]') {
                  streamCompleted = true
                  closeConnection()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.d && typeof parsed.d === 'string') {
                    aiResponse += parsed.d
                    console.log('更新AI响应内容，长度:', aiResponse.length)
                    setMessages(prev => prev.map(msg =>
                      msg.id === aiMessageId ? { ...msg, messageContent: aiResponse } : msg
                    ))
                  }
                } catch (e) {
                  if (data) {
                    aiResponse += data
                    setMessages(prev => prev.map(msg =>
                      msg.id === aiMessageId ? { ...msg, messageContent: aiResponse } : msg
                    ))
                  }
                }
              } else if (line.startsWith('event: done')) {
                console.log('收到done事件')
                streamCompleted = true
                closeConnection()
                return
              }
            }
          }
        } catch (error) {
          console.error('读取流时出错:', error)
          handleError(error)
        }
      }

      await readStream()

      if (isAutoSend) {
        await handleAutoDeploy()
        setIsAutoSend(false)
      }
    } catch (error) {
      handleError(error)
    }
  }

  const handleAutoDeploy = async () => {
    if (!appId) {
      console.error('应用ID不存在')
      return
    }

    try {
      setDeploying(true)
      const res = await deployApp({ appId: Number(appId) })
      
      if (res.code === 0 && res.data) {
        console.log('部署成功，地址：', res.data)
        
        await loadAppInfo()
        
        const previewUrl = getStaticPreviewUrl(
          appInfo?.codeGenType || '',
          String(appInfo?.id || ''),
          res.data
        )
        
        if (previewUrl) {
          router.push({
            pathname: '/code/webview',
            params: { url: previewUrl }
          })
        }
      }
    } catch (error) {
      console.error('自动部署失败：', error)
      Alert.alert('自动部署失败', (error as Error).message)
    } finally {
      setDeploying(false)
    }
  }

  const handleDeploy = () => {
    setActiveTab(1)
  }

  const getPreviewUrl = () => {
    if (!appInfo?.codeGenType || !appInfo?.id) {
      return ''
    }
    return getStaticPreviewUrl(
      appInfo.codeGenType || '',
      String(appInfo.id || ''),
      appInfo.deployKey
    )
  }

  const renderMessage = (message: ChatHistoryVO, index: number) => {
    if (!message) return null
    
    const isUser = message.messageType === 'user'
    const messageId = message.id || index
    const isLastAIMessage = !isUser && index === messages.length - 1
    
    return (
      <View
        key={messageId}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.avatar}>
            <Logo size={32} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
            isUser && { backgroundColor: themeColor },
          ]}
        >
          <Markdown style={{
            ...styles.markdown,
            link: {
              color: themeColor,
              textDecorationLine: 'underline',
            }
          }}>{message.messageContent || ''}</Markdown>
          <Text style={styles.messageTime}>
            {message.createTime ? new Date(message.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        {isUser && (
          <Avatar
            rounded
            icon={{ name: 'user', type: 'font-awesome' }}
            size="medium"
            containerStyle={styles.avatar}
          />
        )}
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" type="material" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{appInfo?.appName || '对话'}</Text>
        <TouchableOpacity onPress={handleDeploy}>
          <Icon name="rocket-launch" type="material" size={24} color={themeColor} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tabHeaderItem, activeTab === 0 && styles.activeTabHeaderItem, activeTab === 0 && { borderBottomColor: themeColor }]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabHeaderText, activeTab === 0 && styles.activeTabHeaderText, activeTab === 0 && { color: themeColor }]}>对话</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabHeaderItem, activeTab === 1 && styles.activeTabHeaderItem, activeTab === 1 && { borderBottomColor: themeColor }]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabHeaderText, activeTab === 1 && styles.activeTabHeaderText, activeTab === 1 && { color: themeColor }]}>预览</Text>
        </TouchableOpacity>
      </View>

      <TabView
        value={activeTab}
        onChange={setActiveTab}
        animationType="spring"
      >
        <TabView.Item style={{ width: '100%', flex: 1 }}>
          <View style={{ flex: 1 }}>
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.map(renderMessage)}
              {loading && !streamConnected && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={themeColor} />
                  <Text style={styles.loadingText}>AI 正在连接...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="输入消息..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: themeColor }, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name="paper-plane" type="font-awesome" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TabView.Item>

        <TabView.Item style={{ width: '100%' }}>
          <View style={styles.previewContainer}>
            {getPreviewUrl() ? (
              <WebView
                source={{ uri: getPreviewUrl() }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={themeColor} />
                    <Text style={styles.loadingText}>加载中...</Text>
                  </View>
                )}
              />
            ) : (
              <View style={styles.noPreviewContainer}>
                <Text style={styles.noPreviewText}>暂无预览，请先发送消息并部署应用</Text>
              </View>
            )}
          </View>
        </TabView.Item>
      </TabView>
    </KeyboardAvoidingView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  aiMessage: {
    justifyContent: 'flex-start',
  },
  avatar: {
    marginHorizontal: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  markdown: {
    body: {
      fontSize: 15,
      color: '#333',
      lineHeight: 22,
    },
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
    },
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      marginTop: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
      marginTop: 6,
    },
    code_inline: {
      backgroundColor: '#f0f0f0',
      color: '#e83e8c',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    code_block: {
      backgroundColor: '#f6f8fa',
      padding: 10,
      borderRadius: 5,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    fence: {
      backgroundColor: '#f6f8fa',
      padding: 10,
      borderRadius: 5,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    blockquote: {
      backgroundColor: '#f0f0f0',
      borderLeftWidth: 4,
      borderLeftColor: '#ccc',
      paddingLeft: 10,
      marginVertical: 8,
    },
    list_item: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    bullet_list: {
      marginVertical: 8,
    },
    ordered_list: {
      marginVertical: 8,
    },
    table: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginVertical: 8,
    },
    th: {
      backgroundColor: '#f0f0f0',
      padding: 8,
      fontWeight: 'bold',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    td: {
      padding: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
  },
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 56,
    marginBottom: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    marginRight: 8,
    color: '#333',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabHeaderItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabHeaderItem: {
  },
  tabHeaderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  activeTabHeaderText: {
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  noPreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noPreviewText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}
