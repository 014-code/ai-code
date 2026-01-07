import { getAppVOById, listLatestChatHistory } from '@/api/chat'
import { AppVO } from '@/api/vo/app'
import { ChatHistoryVO } from '@/api/vo/chat'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Avatar, Button, Icon, Overlay } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ChatPage() {
  const router = useRouter()
  const { appId } = useLocalSearchParams<{ appId: string }>()
  const insets = useSafeAreaInsets()
  
  const [messages, setMessages] = useState<ChatHistoryVO[]>([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [appInfo, setAppInfo] = useState<AppVO>()
  const [showDeploy, setShowDeploy] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (appId) {
      initPageData()
    }
  }, [appId])

  /**
   * 初始化页面数据
   * 加载应用信息和对话历史
   */
  const initPageData = () => {
    loadAppInfo()
    loadChatHistory()
  }

  /**
   * 加载应用信息
   * 调用API获取应用详情数据
   */
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

  /**
   * 加载对话历史
   * 获取应用的最新对话记录并按时间排序
   */
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
      }
    }).catch(err => {
      console.error('加载对话历史失败：', err)
    })
  }

  /**
   * 处理发送消息
   * 创建用户消息，通过SSE获取AI响应
   */
  const handleSendMessage = () => {
    const text = inputText.trim()
    if (!text) return

    setInputText('')
    setLoading(true)

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

    const url = `http://localhost:8101/api/workflow/execute-flux?prompt=${encodeURIComponent(text)}&appId=${appId}`

    let aiResponse = ''

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream',
      },
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      const readStream = async () => {
        if (!reader) return

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              setLoading(false)
              break
            }

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  setLoading(false)
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  if (parsed.d && typeof parsed.d === 'string') {
                    aiResponse += parsed.d
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
              }
            }
          }
        } catch (error) {
          setLoading(false)
          console.error('读取流数据失败：', error)
        }
      }

      readStream()
    }).catch(error => {
      setLoading(false)
      console.error('创建 SSE 连接失败：', error)
    })
  }

  /**
   * 处理部署应用
   * 显示应用预览地址
   */
  const handleDeploy = () => {
    if (!appInfo?.deployKey) {
      alert('应用未部署')
      return
    }
    setShowDeploy(true)
  }

  /**
   * 渲染单条消息
   * 根据消息类型显示不同的样式
   */
  const renderMessage = (message: ChatHistoryVO, index: number) => {
    if (!message) return null
    
    const isUser = message.messageType === 'user'
    const messageId = message.id || index
    
    return (
      <View
        key={messageId}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {!isUser && (
          <Avatar
            rounded
            icon={{ name: 'robot', type: 'font-awesome' }}
            size="medium"
            containerStyle={styles.avatar}
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text style={styles.messageText}>{message.messageContent || ''}</Text>
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
          <Icon name="rocket-launch" type="material" size={24} color="#667eea" />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map(renderMessage)}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#667eea" />
            <Text style={styles.loadingText}>AI 正在思考...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="输入消息..."
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Icon name="paper-plane" type="font-awesome" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Overlay
        isVisible={showDeploy}
        onBackdropPress={() => setShowDeploy(false)}
        overlayStyle={styles.overlay}
      >
        <Text style={styles.overlayTitle}>应用已部署</Text>
        <Text style={styles.overlayText}>预览地址：{getStaticPreviewUrl(appInfo?.codeGenType || '', String(appInfo?.id || ''), appInfo?.deployKey || '')}</Text>
        <Button
          title="关闭"
          onPress={() => setShowDeploy(false)}
          buttonStyle={styles.closeButton}
        />
      </Overlay>
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
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 12,
  },
  userBubble: {
    backgroundColor: '#667eea',
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
  },
  sendButton: {
    backgroundColor: '#667eea',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  overlay: {
    width: '80%',
    padding: 24,
    borderRadius: 12,
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  overlayText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
  },
}
