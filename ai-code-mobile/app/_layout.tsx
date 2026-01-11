/**
 * 根布局组件
 * 
 * 应用的根布局文件，配置全局的导航结构和安全区域
 * 使用SafeAreaProvider和SafeAreaView确保内容在安全区域内显示
 * 使用Stack导航器管理应用的所有页面路由
 */

import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    /**
     * SafeAreaProvider
     * 提供安全区域上下文，使所有子组件都能访问安全区域信息
     */
    <SafeAreaProvider>
      {/**
       * SafeAreaView
       * 确保内容在设备的安全区域内显示（如刘海屏、圆角屏等）
       * edges={['top']} 只处理顶部安全区域，底部由子组件自行处理
       */}
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/**
         * Stack导航器
         * 管理应用的所有页面路由，支持页面堆栈导航
         */}
        <Stack>
          {/**
           * 应用入口页面
           * headerShown: false - 隐藏导航栏
           */}
          <Stack.Screen name='index' options={{ headerShown: false }} />
          
          {/**
           * 登录页面
           * title: '登录' - 页面标题
           * headerShown: false - 隐藏导航栏
           * animation: 'fade' - 使用淡入淡出动画
           */}
          <Stack.Screen name='user/login' options={{
            title: '登录',
            headerShown: false,
            animation: 'fade',
          }} />
          
          {/**
           * 注册页面
           * title: "注册" - 页面标题
           * headerShown: false - 隐藏导航栏
           * animation: 'fade' - 使用淡入淡出动画
           */}
          <Stack.Screen name='user/register' options={{
            title: "注册",
            headerShown: false,
            animation: 'fade',
          }} />
          
          {/**
           * 设置页面
           * title: "设置" - 页面标题
           * headerShown: false - 隐藏导航栏
           * animation: 'fade' - 使用淡入淡出动画
           */}
          <Stack.Screen name='settings' options={{
            title: "设置",
            headerShown: false,
            animation: 'fade',
          }} />
          
          {/**
           * 标签页导航
           * 包含首页、列表页、个人页等底部标签页
           * headerShown: false - 隐藏导航栏
           */}
          <Stack.Screen name='tabs' options={{ headerShown: false }} />
          
          {/**
           * 代码对话页面
           * 用于与AI对话生成代码
           * headerShown: false - 隐藏导航栏
           */}
          <Stack.Screen name='code/chat' options={{ headerShown: false }} />
          
          {/**
           * 网页预览页面
           * 用于在WebView中预览生成的应用
           * headerShown: false - 隐藏导航栏
           */}
          <Stack.Screen name='code/webview' options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
