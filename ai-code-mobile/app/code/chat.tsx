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
import Logo from '@/components/ui/Logo'
import EventSource from 'react-native-sse'
import CommentSection from '@/components/ui/CommentSection'

/**
 * API基础URL常量
 * 根据平台选择不同的地址：
 * - Android: 使用10.0.2.2（Android模拟器的localhost映射）
 * - iOS: 使用localhost
 */
const BASE_URL = Platform.OS === 'android' 
  ? "http://10.0.2.2:8123" 
  : "http://localhost:8123"

/**
 * 对话页面组件
 * 提供AI代码生成对话界面，支持实时流式响应、应用预览和部署
 * 包含对话历史记录、消息发送、SSE流式响应、应用部署预览等功能
 */
export default function ChatPage() {
  /**
   * 路由导航钩子
   * 用于在应用中进行页面跳转
   */
  const router = useRouter()
  
  /**
   * 本地路由参数
   * 获取从路由传递的应用ID和初始提示词
   */
  const { appId, prompt } = useLocalSearchParams<{ appId: string; prompt?: string }>()
  
  /**
   * 安全区域 insets
   * 获取设备安全区域（如刘海屏、底部指示条等）的尺寸
   */
  const insets = useSafeAreaInsets()
  
  /**
   * 主题管理钩子
   * 获取当前主题色，用于动态设置UI元素颜色
   */
  const { themeColor } = useTheme()
  
  /**
   * 消息列表状态
   * 存储对话历史消息数组
   */
  const [messages, setMessages] = useState<ChatHistoryVO[]>([])
  
  /**
   * 输入框文本状态
   * 存储用户输入的消息内容
   */
  const [inputText, setInputText] = useState('')
  
  /**
   * 加载状态
   * 控制消息发送时的加载指示器显示
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * 应用信息状态
   * 存储当前应用的基本信息
   */
  const [appInfo, setAppInfo] = useState<AppVO>()
  
  /**
   * 部署状态
   * 控制应用部署时的加载指示器显示
   */
  const [deploying, setDeploying] = useState(false)
  
  /**
   * 自动发送状态
   * 标记是否需要自动发送初始提示词
   */
  const [isAutoSend, setIsAutoSend] = useState(false)
  
  /**
   * SSE连接状态
   * 标记Server-Sent Events连接是否已建立
   */
  const [streamConnected, setStreamConnected] = useState(false)
  
  /**
   * 活动标签页索引
   * 控制当前显示的标签页（0: 对话，1: 预览）
   */
  const [activeTab, setActiveTab] = useState(0)
  
  /**
   * 滚动视图引用
   * 用于控制消息列表的滚动
   */
  const scrollViewRef = useRef<ScrollView>(null)

  /**
   * 组件挂载时初始化页面数据
   * 当应用ID存在时，加载应用信息和对话历史
   */
  useEffect(() => {
    if (appId) {
      initPageData()
    }
  }, [appId])

  /**
   * 初始化页面数据
   * 加载应用信息和对话历史记录
   */
  const initPageData = () => {
    loadAppInfo()
    loadChatHistory()
  }

  /**
   * 加载应用信息
   * 从后端API获取当前应用的详细信息
   * 成功时更新appInfo状态
   * 失败时记录错误日志
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
   * 从后端API获取最新的对话历史记录
   * 过滤无效消息，按创建时间排序，更新messages状态
   * 如果存在初始提示词且历史为空，自动发送提示词
   */
  const loadChatHistory = () => {
    if (!appId) {
      console.error('应用ID不存在')
      return
    }
    
    listLatestChatHistory(appId).then(res => {
      if (res.code === 0 && res.data) {
        /**
         * 过滤掉null消息
         */
        const validMessages = res.data.filter((msg: ChatHistoryVO) => msg != null)
        /**
         * 按创建时间升序排序
         */
        const sortedMessages = [...validMessages].sort((a, b) =>
          new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
        )
        setMessages(sortedMessages)

        /**
         * 如果存在初始提示词且历史为空，自动发送提示词
         * 延迟500ms后执行，确保UI已渲染完成
         */
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

  /**
   * 处理发送消息
   * 使用Server-Sent Events (SSE) 实现流式AI响应
   * 包含消息验证、UI更新、SSE连接管理、错误处理等逻辑
   */
  const handleSendMessage = async () => {
    /**
     * 获取输入框文本并去除首尾空格
     */
    const text = inputText.trim()
    /**
     * 验证输入是否为空
     * 如果为空，直接返回
     */
    if (!text) return

    /**
     * 清空输入框
     */
    setInputText('')
    /**
     * 设置加载状态为true
     */
    setLoading(true)
    /**
     * 重置SSE连接状态
     */
    setStreamConnected(false)

    /**
     * 创建用户消息对象
     */
    const userMessage: ChatHistoryVO = {
      id: Date.now(),
      appId: Number(appId),
      messageType: 'user',
      messageContent: text,
      createTime: new Date().toISOString(),
    }

    /**
     * 将用户消息添加到消息列表
     */
    setMessages(prev => [...prev, userMessage])

    /**
     * 创建AI消息对象（初始内容为空）
     */
    const aiMessageId = Date.now() + 1
    const aiMessage: ChatHistoryVO = {
      id: aiMessageId,
      appId: Number(appId),
      messageType: 'ai',
      messageContent: '',
      createTime: new Date().toISOString(),
    }

    /**
     * 将AI消息添加到消息列表
     */
    setMessages(prev => [...prev, aiMessage])

    /**
     * 构建SSE请求URL
     * 包含应用ID和用户消息内容
     */
    const url = `${BASE_URL}/api/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(text)}`

    /**
     * AI响应内容
     * 累积接收到的流式数据
     */
    let aiResponse = ''
    /**
     * 连接关闭标志
     * 防止重复关闭连接
     */
    let closed = false
    /**
     * 流式完成标志
     * 标记是否已接收到结束标记
     */
    let streamCompleted = false

    /**
     * 关闭连接函数
     * 更新相关状态并标记连接已关闭
     */
    const closeConnection = () => {
      if (!closed) {
        closed = true
        setLoading(false)
        setStreamConnected(false)
      }
    }

    /**
     * 错误处理函数
     * 更新AI消息为错误提示，关闭连接，显示错误弹窗
     */
    const handleError = (error: unknown) => {
      console.error('生成代码失败：', error)
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, messageContent: '抱歉，生成过程中出现了错误，请重试。' } : msg
      ))
      closeConnection()
      Alert.alert('生成失败', '请重试')
    }

    try {
      /**
       * 获取认证令牌
       */
      const token = await getToken()
      console.log('开始SSE请求，URL:', url)
      
      /**
       * 创建SSE连接
       * 传入请求URL和认证头
       */
      const es = new EventSource(url, {
        headers: {
          'Authorization': token || '',
        },
      })

      /**
       * 监听SSE连接打开事件
       * 连接成功建立时触发
       */
      es.addEventListener('open', (event) => {
        console.log('SSE连接已建立')
        setStreamConnected(true)
      })

      /**
       * 监听SSE消息事件
       * 接收流式数据并更新UI
       */
      es.addEventListener('message', (event) => {
        console.log('接收到消息:', event.data)
        
        /**
         * 检查是否为结束标记
         * 如果是，关闭连接
         */
        if (event.data === '[DONE]') {
          streamCompleted = true
          closeConnection()
          es.close()
          return
        }

        try {
          /**
           * 尝试解析JSON格式数据
           * 解析成功后提取内容并更新AI消息
           */
          const parsed = JSON.parse(event.data)
          if (parsed.d && typeof parsed.d === 'string') {
            aiResponse += parsed.d
            console.log('更新AI响应内容，长度:', aiResponse.length)
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, messageContent: aiResponse } : msg
            ))
          }
        } catch (e) {
          /**
           * JSON解析失败，直接使用原始数据
           */
          if (event.data) {
            aiResponse += event.data
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? { ...msg, messageContent: aiResponse } : msg
            ))
          }
        }
      })

      /**
       * 监听SSE错误事件
       * 处理连接过程中的各种错误
       */
      es.addEventListener('error', (event) => {
        console.error('SSE错误:', event)
        if (event.type === 'error') {
          console.error('连接错误:', event.message)
        } else if (event.type === 'exception') {
          console.error('异常:', event.message, event.error)
        }
        handleError(event)
      })

      /**
       * 监听SSE关闭事件
       * 连接关闭时触发
       */
      es.addEventListener('close', (event) => {
        console.log('SSE连接已关闭')
        closeConnection()
      })

      /**
       * 如果是自动发送模式，执行自动部署
       */
      if (isAutoSend) {
        await handleAutoDeploy()
        setIsAutoSend(false)
      }
    } catch (error) {
      handleError(error)
    }
  }

  /**
   * 处理自动部署
   * 在自动发送模式下的AI响应完成后，自动部署应用并跳转到预览页面
   * 包含应用部署、应用信息刷新、预览URL生成和页面跳转
   */
  const handleAutoDeploy = async () => {
    /**
     * 验证应用ID是否存在
     */
    if (!appId) {
      console.error('应用ID不存在')
      return
    }

    try {
      /**
       * 设置部署状态为true
       */
      setDeploying(true)
      /**
       * 调用部署API
       */
      const res = await deployApp({ appId: Number(appId) })
      
      /**
       * 部署成功处理
       */
      if (res.code === 0 && res.data) {
        console.log('部署成功，地址：', res.data)
        
        /**
         * 重新加载应用信息
         * 获取最新的应用数据
         */
        await loadAppInfo()
        
        /**
         * 生成预览URL
         * 使用应用信息中的代码生成类型、应用ID和部署密钥
         */
        const previewUrl = getStaticPreviewUrl(
          appInfo?.codeGenType || '',
          String(appInfo?.id || ''),
          res.data
        )
        
        /**
         * 跳转到预览页面
         * 传递预览URL作为参数
         */
        if (previewUrl) {
          router.push({
            pathname: '/code/webview',
            params: { url: previewUrl }
          })
        }
      }
    } catch (error) {
      /**
       * 部署失败处理
       * 记录错误日志并显示错误弹窗
       */
      console.error('自动部署失败：', error)
      Alert.alert('自动部署失败', (error as Error).message)
    } finally {
      /**
       * 无论成功或失败，都关闭部署状态
       */
      setDeploying(false)
    }
  }

  /**
   * 处理部署按钮点击
   * 切换到预览标签页
   */
  const handleDeploy = () => {
    setActiveTab(1)
  }

  /**
   * 获取预览URL
   * 根据应用信息生成静态预览地址
   * @returns 预览URL字符串，如果应用信息不完整则返回空字符串
   */
  const getPreviewUrl = () => {
    /**
     * 验证应用信息是否完整
     */
    if (!appInfo?.codeGenType || !appInfo?.id) {
      return ''
    }
    /**
     * 生成并返回预览URL
     */
    return getStaticPreviewUrl(
      appInfo.codeGenType || '',
      String(appInfo.id || ''),
      appInfo.deployKey
    )
  }

  /**
   * 渲染消息组件
   * 根据消息类型渲染用户消息或AI消息
   * 包含头像、消息气泡、Markdown内容显示和时间戳
   * @param message - 消息数据对象
   * @param index - 消息在列表中的索引
   * @returns 消息组件
   */
  const renderMessage = (message: ChatHistoryVO, index: number) => {
    /**
     * 验证消息是否有效
     */
    if (!message) return null
    
    /**
     * 判断是否为用户消息
     */
    const isUser = message.messageType === 'user'
    /**
     * 生成消息ID（优先使用消息ID，否则使用索引）
     */
    const messageId = message.id || index
    /**
     * 判断是否为最后一条AI消息
     * 用于特殊样式处理（如加载状态）
     */
    const isLastAIMessage = !isUser && index === messages.length - 1
    
    return (
      <View
        key={messageId}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {/**
         * AI消息：显示Logo头像
         */}
        {!isUser && (
          <View style={styles.avatar}>
            <Logo size={32} />
          </View>
        )}
        {/**
         * 消息气泡
         * 包含Markdown内容显示和时间戳
         */}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.aiBubble,
            isUser && { backgroundColor: themeColor },
          ]}
        >
          {/**
           * Markdown内容渲染
           * 支持代码块、链接、列表等格式
           */}
          <Markdown style={{
            ...styles.markdown,
            link: {
              color: themeColor,
              textDecorationLine: 'underline',
            }
          }}>{message.messageContent || ''}</Markdown>
          {/**
           * 消息时间戳
           * 显示消息创建时间（小时:分钟）
           */}
          <Text style={styles.messageTime}>
            {message.createTime ? new Date(message.createTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        {/**
         * 用户消息：显示用户头像
         */}
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
    /**
     * 键盘避免视图
     * 在键盘弹出时自动调整布局，避免输入框被键盘遮挡
     * iOS平台使用padding行为，Android平台不需要调整
     */
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      {/**
       * 页面头部
       * 包含返回按钮、应用标题和部署按钮
       */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        {/**
         * 返回按钮
         * 点击返回上一页
         */}
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" type="material" size={24} color="#333" />
        </TouchableOpacity>
        {/**
         * 应用标题
         * 显示应用名称，如果未加载则显示"对话"
         */}
        <Text style={styles.headerTitle}>{appInfo?.appName || '对话'}</Text>
        {/**
         * 部署按钮
         * 点击切换到预览标签页
         */}
        <TouchableOpacity onPress={handleDeploy}>
          <Icon name="rocket-launch" type="material" size={24} color={themeColor} />
        </TouchableOpacity>
      </View>

      {/**
       * 标签页头部
       * 包含对话、预览和评论三个标签页的切换按钮
       */}
      <View style={styles.tabHeader}>
        {/**
         * 对话标签页按钮
         * 点击切换到对话标签页
         */}
        <TouchableOpacity
          style={[styles.tabHeaderItem, activeTab === 0 && styles.activeTabHeaderItem, activeTab === 0 && { borderBottomColor: themeColor }]}
          onPress={() => setActiveTab(0)}
        >
          <Text style={[styles.tabHeaderText, activeTab === 0 && styles.activeTabHeaderText, activeTab === 0 && { color: themeColor }]}>对话</Text>
        </TouchableOpacity>
        {/**
         * 预览标签页按钮
         * 点击切换到预览标签页
         */}
        <TouchableOpacity
          style={[styles.tabHeaderItem, activeTab === 1 && styles.activeTabHeaderItem, activeTab === 1 && { borderBottomColor: themeColor }]}
          onPress={() => setActiveTab(1)}
        >
          <Text style={[styles.tabHeaderText, activeTab === 1 && styles.activeTabHeaderText, activeTab === 1 && { color: themeColor }]}>预览</Text>
        </TouchableOpacity>
        {/**
         * 评论标签页按钮
         * 点击切换到评论标签页
         */}
        <TouchableOpacity
          style={[styles.tabHeaderItem, activeTab === 2 && styles.activeTabHeaderItem, activeTab === 2 && { borderBottomColor: themeColor }]}
          onPress={() => setActiveTab(2)}
        >
          <Text style={[styles.tabHeaderText, activeTab === 2 && styles.activeTabHeaderText, activeTab === 2 && { color: themeColor }]}>评论</Text>
        </TouchableOpacity>
      </View>

      {/**
       * 标签页视图
       * 使用弹簧动画切换标签页
       */}
      <TabView
        value={activeTab}
        onChange={setActiveTab}
        animationType="spring"
      >
        {/**
         * 对话标签页内容
         * 包含消息列表和输入框
         */}
        <TabView.Item style={{ width: '100%', flex: 1 }}>
          <View style={{ flex: 1 }}>
            {/**
             * 消息列表滚动视图
             * 显示所有对话消息，支持自动滚动到底部
             */}
            <ScrollView
              ref={scrollViewRef}
              style={styles.messagesContainer}
              contentContainerStyle={styles.messagesContent}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {/**
               * 渲染所有消息
               */}
              {messages.map(renderMessage)}
              {/**
               * 加载指示器
               * 在SSE连接未建立时显示
               */}
              {loading && !streamConnected && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={themeColor} />
                  <Text style={styles.loadingText}>AI 正在连接...</Text>
                </View>
              )}
            </ScrollView>

            {/**
             * 输入框容器
             * 包含文本输入框和发送按钮
             */}
            <View style={styles.inputContainer}>
              {/**
               * 文本输入框
               * 支持多行输入，最多1000字符
               */}
              <TextInput
                style={styles.input}
                placeholder="输入消息..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={1000}
              />
              {/**
               * 发送按钮
               * 点击发送消息，加载时显示加载指示器
               */}
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

        {/**
         * 预览标签页内容
         * 包含应用预览WebView或空状态提示
         */}
        <TabView.Item style={{ width: '100%' }}>
          <View style={styles.previewContainer}>
            {/**
             * 如果有预览URL，显示WebView
             */}
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
              /**
               * 如果没有预览URL，显示空状态提示
               */
              <View style={styles.noPreviewContainer}>
                <Text style={styles.noPreviewText}>暂无预览，请先发送消息并部署应用</Text>
              </View>
            )}
          </View>
        </TabView.Item>

        {/**
         * 评论标签页内容
         * 包含评论区组件
         */}
        <TabView.Item style={{ width: '100%', flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: '#fff' }}>
            {appId ? <CommentSection appId={appId} /> : null}
          </View>
        </TabView.Item>
      </TabView>
    </KeyboardAvoidingView>
  )
}

const styles = {
  /**
   * 容器样式
   * 占据整个屏幕，设置背景色
   */
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  /**
   * 页面头部样式
   * 水平布局，设置内边距和底部边框
   */
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
  /**
   * 头部标题样式
   * 大号粗体文字
   */
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  /**
   * 消息列表容器样式
   * 占据剩余空间
   */
  messagesContainer: {
    flex: 1,
  },
  /**
   * 消息列表内容容器样式
   * 设置内边距
   */
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  /**
   * 消息容器样式
   * 水平布局，设置底部外边距
   */
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  /**
   * 用户消息样式
   * 右对齐
   */
  userMessage: {
    justifyContent: 'flex-end',
  },
  /**
   * AI消息样式
   * 左对齐
   */
  aiMessage: {
    justifyContent: 'flex-start',
  },
  /**
   * 头像容器样式
   * 固定尺寸，居中对齐
   */
  avatar: {
    marginHorizontal: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * 消息气泡样式
   * 最大宽度75%，圆角，设置内边距
   */
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 12,
  },
  /**
   * 用户消息气泡样式
   * 背景色动态设置（使用主题色）
   */
  userBubble: {
  },
  /**
   * AI消息气泡样式
   * 白色背景，带边框
   */
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  /**
   * 消息文字样式
   * 中等字号，设置行高
   */
  messageText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  /**
   * Markdown样式配置
   * 定义各种Markdown元素的样式
   */
  markdown: {
    /**
     * 正文样式
     */
    body: {
      fontSize: 15,
      color: '#333',
      lineHeight: 22,
    },
    /**
     * 一级标题样式
     */
    heading1: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 10,
    },
    /**
     * 二级标题样式
     */
    heading2: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
      marginTop: 8,
    },
    /**
     * 三级标题样式
     */
    heading3: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 6,
      marginTop: 6,
    },
    /**
     * 行内代码样式
     */
    code_inline: {
      backgroundColor: '#f0f0f0',
      color: '#e83e8c',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 3,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    /**
     * 代码块样式
     */
    code_block: {
      backgroundColor: '#f6f8fa',
      padding: 10,
      borderRadius: 5,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    /**
     * 围栏代码块样式
     */
    fence: {
      backgroundColor: '#f6f8fa',
      padding: 10,
      borderRadius: 5,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    /**
     * 引用块样式
     */
    blockquote: {
      backgroundColor: '#f0f0f0',
      borderLeftWidth: 4,
      borderLeftColor: '#ccc',
      paddingLeft: 10,
      marginVertical: 8,
    },
    /**
     * 列表项样式
     */
    list_item: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    /**
     * 无序列表样式
     */
    bullet_list: {
      marginVertical: 8,
    },
    /**
     * 有序列表样式
     */
    ordered_list: {
      marginVertical: 8,
    },
    /**
     * 表格样式
     */
    table: {
      borderWidth: 1,
      borderColor: '#e0e0e0',
      marginVertical: 8,
    },
    /**
     * 表头单元格样式
     */
    th: {
      backgroundColor: '#f0f0f0',
      padding: 8,
      fontWeight: 'bold',
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
    /**
     * 表格单元格样式
     */
    td: {
      padding: 8,
      borderWidth: 1,
      borderColor: '#e0e0e0',
    },
  },
  /**
   * 消息时间样式
   * 小号灰色文字
   */
  messageTime: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  /**
   * 加载容器样式
   * 水平布局，显示加载指示器和文字
   */
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 56,
    marginBottom: 16,
  },
  /**
   * 加载文字样式
   * 灰色文字，设置左边距
   */
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#999',
  },
  /**
   * 输入框容器样式
   * 水平布局，设置内边距和顶部边框
   */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  /**
   * 输入框样式
   * 灰色背景，圆角，设置最大高度
   */
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
  /**
   * 发送按钮样式
   * 圆形按钮，居中对齐
   */
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /**
   * 禁用发送按钮样式
   * 灰色背景
   */
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  /**
   * 标签页头部样式
   * 水平布局，设置底部边框
   */
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  /**
   * 标签页头部项目样式
   * 居中对齐，设置底部边框宽度
   */
  tabHeaderItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  /**
   * 激活标签页头部项目样式
   */
  activeTabHeaderItem: {
  },
  /**
   * 标签页头部文字样式
   * 灰色文字，中等字重
   */
  tabHeaderText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  /**
   * 激活标签页头部文字样式
   */
  activeTabHeaderText: {
  },
  /**
   * 预览容器样式
   * 占据剩余空间，白色背景
   */
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  /**
   * WebView样式
   * 占据整个容器
   */
  webview: {
    flex: 1,
  },
  /**
   * 无预览容器样式
   * 居中显示提示信息
   */
  noPreviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  /**
   * 无预览文字样式
   * 灰色文字，居中对齐
   */
  noPreviewText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
}
