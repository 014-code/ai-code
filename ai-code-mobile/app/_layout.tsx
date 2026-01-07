import { Stack } from 'expo-router';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * 通用布局页面
 * @returns 
 */
export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <Stack>
          <Stack.Screen name='index' options={{ headerShown: false }} />
          <Stack.Screen name='user/login' options={{
            title: '登录',
            headerShown: false,
            animation: 'fade',
          }} />
          <Stack.Screen name='user/register' options={{
            title: "注册",
            headerShown: false,
            animation: 'fade',
          }} />
          <Stack.Screen name='tabs' options={{ headerShown: false }} />
        </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
