import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { Icon } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/hooks/useTheme'

/**
 * WebView页面组件
 * 用于在应用内预览生成的应用效果
 * 支持加载状态显示、错误处理和返回导航
 * 使用react-native-webview组件嵌入Web内容
 * @returns JSX.Element - 返回包含WebView和导航控件的页面组件
 */
export default function WebViewPage() {
  /**
   * 路由实例
   * 用于页面导航，如返回上一页
   */
  const router = useRouter()
  /**
   * 获取路由参数
   * 从URL参数中获取预览地址
   */
  const { url } = useLocalSearchParams<{ url: string }>()
  /**
   * 获取安全区域边距
   * 用于适配不同设备的安全区域（如刘海屏、圆角屏等）
   */
  const insets = useSafeAreaInsets()
  /**
   * 获取主题颜色
   * 用于动态设置按钮颜色，确保与整体UI风格一致
   */
  const { themeColor } = useTheme()
  /**
   * 加载状态
   * 控制加载指示器的显示和隐藏
   * true: 显示加载指示器
   * false: 隐藏加载指示器
   */
  const [loading, setLoading] = React.useState(true)
  /**
   * 错误状态
   * 控制错误提示的显示和隐藏
   * true: 显示错误提示和重试按钮
   * false: 隐藏错误提示
   */
  const [error, setError] = React.useState(false)

  /**
   * 验证预览地址是否存在
   * 如果不存在，显示错误提示和返回按钮
   */
  if (!url) {
    return (
      /**
       * 错误容器
       * 居中显示错误信息和返回按钮
       */
      <View style={styles.container}>
        {/**
         * 错误文字
         * 提示用户预览地址不存在
         */}
        <Text style={styles.errorText}>预览地址不存在</Text>
        {/**
         * 返回按钮
         * 点击返回上一页
         * 使用主题色作为背景色
         */}
        <TouchableOpacity style={[styles.backButton, { backgroundColor: themeColor }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    /**
     * 页面容器
     * 占据整个屏幕，白色背景
     */
    <View style={styles.container}>
      {/**
       * 页面头部
       * 包含返回按钮、标题和占位元素
       * 使用安全区域边距适配不同设备
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
         * 页面标题
         * 显示"应用预览"文字
         */}
        <Text style={styles.headerTitle}>应用预览</Text>
        {/**
         * 占位元素
         * 用于保持标题居中，与返回按钮宽度相同
         */}
        <View style={{ width: 24 }} />
      </View>

      {/**
       * WebView组件
       * 用于加载和显示Web内容
       * 支持加载状态、错误处理和自定义加载视图
       */}
      <WebView
        /**
         * WebView数据源
         * 从路由参数中获取URL
         */
        source={{ uri: url }}
        /**
         * WebView样式
         * 占据剩余空间
         */
        style={styles.webview}
        /**
         * 加载开始事件
         * 开始加载时显示加载指示器
         */
        onLoadStart={() => setLoading(true)}
        /**
         * 加载结束事件
         * 加载完成时隐藏加载指示器
         */
        onLoadEnd={() => setLoading(false)}
        /**
         * 错误事件
         * 加载失败时隐藏加载指示器并显示错误提示
         */
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        /**
         * 初始加载状态
         * 启动时显示加载指示器
         */
        startInLoadingState
        /**
         * 自定义加载视图
         * 显示加载指示器和加载文字
         */
        renderLoading={() => (
          /**
           * 加载容器
           * 绝对定位，覆盖整个WebView区域
           * 居中显示加载指示器和文字
           */
          <View style={styles.loadingContainer}>
            {/**
             * 加载指示器
             * 大号加载动画，使用主题色
             */}
            <ActivityIndicator size="large" color={themeColor} />
            {/**
             * 加载文字
             * 提示用户正在加载
             */}
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        )}
      />

      {/**
       * 错误提示
       * 当加载失败时显示
       * 包含错误信息和重试按钮
       */}
      {error && (
        /**
         * 错误容器
         * 绝对定位，覆盖整个WebView区域
         * 居中显示错误信息和重试按钮
         */
        <View style={styles.errorContainer}>
          {/**
           * 错误文字
           * 提示用户加载失败
           */}
          <Text style={styles.errorText}>加载失败，请稍后重试</Text>
          {/**
           * 重试按钮
           * 点击重试加载
           * 使用主题色作为背景色
           */}
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: themeColor }]} onPress={() => setError(false)}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

/**
 * 页面样式对象
 * 定义所有UI组件的样式属性
 */
const styles = {
  /**
   * 容器样式
   * 占据整个屏幕，白色背景
   */
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
   * WebView样式
   * 占据剩余空间
   */
  webview: {
    flex: 1,
  },
  /**
   * 加载容器样式
   * 绝对定位，覆盖整个区域
   * 居中显示内容，白色背景
   */
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  /**
   * 加载文字样式
   * 灰色文字，设置上边距
   */
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999',
  },
  /**
   * 错误容器样式
   * 绝对定位，覆盖整个区域
   * 居中显示内容，白色背景
   */
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  /**
   * 错误文字样式
   * 中号灰色文字，设置下边距
   */
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  /**
   * 重试按钮样式
   * 圆角按钮，设置内边距
   */
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  /**
   * 重试按钮文字样式
   * 白色粗体文字
   */
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  /**
   * 返回按钮样式
   * 圆角按钮，设置内边距和上边距
   */
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  /**
   * 返回按钮文字样式
   * 白色粗体文字
   */
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}
