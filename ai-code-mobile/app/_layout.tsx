import { Stack } from 'expo-router';

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
      }} />
      <Stack.Screen name='user/register' options={{
        title: "注册",
        headerShown: false,
        // 可选：淡入淡出动画
        animation: 'fade',
      }} />
      <Stack.Screen name='tabs/ai-app/home' options={{ title: "主页", headerBackVisible: false, gestureEnabled: false, }} />
    </Stack>
  );
}
