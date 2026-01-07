import React from 'react'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { WebView } from 'react-native-webview'

/**
 * webView组件
 */
interface AppWebViewProps {
  /**
   * webView 地址
   */
  uri: string
  /**
   * 关闭回调
   */
  onClose: () => void
}

export default function AppWebView({ uri, onClose }: AppWebViewProps) {
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  webview: {
    flex: 1,
  },
})
