import { Stack } from 'expo-router';
import { Platform } from 'react-native';

/**
 * 通用布局页面
 * @returns 
 */
export default function RootLayout() {

  return (
    <Stack>
      <Stack.Screen name='index' options={{ headerShown: false }} />
      <Stack.Screen name='user/login' options={{
        title: '登录',
        headerShown: false,
        // 可选：淡入淡出动画
        animation: 'fade',
        // 完全自定义内容容器
        contentStyle: {
          flex: 1,
          backgroundColor: '#fff',
          paddingTop: Platform.OS === 'ios' ? 44 : 0, // 手动设置顶部
          paddingBottom: Platform.OS === 'ios' ? 20 : 0, // 手动设置底部
        }
      }} />
      <Stack.Screen name='user/register' options={{
        title: "注册",
        headerShown: false,
        // 可选：淡入淡出动画
        animation: 'fade',
        // 完全自定义内容容器
        contentStyle: {
          flex: 1,
          backgroundColor: '#fff',
          paddingTop: Platform.OS === 'ios' ? 44 : 0, // 手动设置顶部
          paddingBottom: Platform.OS === 'ios' ? 20 : 0, // 手动设置底部
        }
      }} />
      <Stack.Screen name='ai-app/home' options={{ title: "主页", headerBackVisible: false, gestureEnabled: false, }} />
    </Stack>
  );
}
