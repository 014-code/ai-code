import React from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { WebView } from 'react-native-webview'
import styles from './AppWebView.less'

/**
 * WebView 组件属性
 */
interface AppWebViewProps {
  /**
   * WebView 加载的 URI 地址
   */
  uri: string
  /**
   * 关闭 WebView 的回调函数
   */
  onClose: () => void
}

/**
 * WebView 组件
 * 用于在应用内显示网页内容
 * 支持加载状态显示、错误处理和导航控制
 *
 * @param props - 组件属性
 * @returns WebView 组件
 *
 * @example
 * ```tsx
 * <AppWebView
 *   uri="https://example.com"
 *   onClose={() => navigation.goBack()}
 * />
 * ```
 */
export default function AppWebView({ uri, onClose }: AppWebViewProps) {
  /**
   * 加载状态
   * true: 正在加载
   * false: 加载完成或未开始
   */
  const [loading, setLoading] = React.useState(true)

  console.log("AppWebView 渲染，URI:", uri);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="arrow-back" type="material" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>应用预览</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#009dffff" />
        </View>
      )}

      <WebView
        source={{ uri }}
        style={styles.webview}
        onLoadStart={() => {
          console.log("WebView 开始加载");
          setLoading(true);
        }}
        onLoadEnd={() => {
          console.log("WebView 加载完成");
          setLoading(false);
        }}
        onError={(event) => {
          console.log("WebView 加载错误:", event.nativeEvent);
        }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </View>
  )
}
