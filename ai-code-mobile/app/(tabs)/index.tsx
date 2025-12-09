import { Image } from 'expo-image';
import { Button, Platform, StyleSheet, useColorScheme } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

/**
 * 主页
 * @returns 
 */
export default function HomeScreen() {

  // ✅ 正确：在组件顶层调用 Hook
  const colorScheme = useColorScheme();

  const handleToggleTheme = () => {
    // 这里可以切换主题的逻辑
    console.log('当前主题:', colorScheme);

    // 如果需要切换主题，通常需要状态管理
    colorScheme = 'dark'
  };


  return (
    // 视差滚动容器-常用于背景放一个大图片这样的
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {/* 主题View容器 */}
      <ThemedView style={styles.titleContainer}>
        {/* 主题Text文本组件 */}
        <ThemedText type="title">欢迎来到ai零代码生成应用!</ThemedText>
        {/* 一个波浪动画组件 */}
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">步骤 1: 哇哈哈hh</ThemedText>
        <ThemedText>
          编辑 <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> 编辑这个组件就可以看到主页变化了
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          上述方式可打开expo调试工具.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        {/* 跳转链接组件 */}
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">步骤 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="弹窗点击" icon="cube" onPress={() => alert('Action 被点击了')} />
            <Link.MenuAction
              title="Share点击"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete点击"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">步骤 3: Get a fresh start</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
          <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
      </ThemedView>
      <ThemedView>
        <Button title={`当前主题: ${colorScheme}`}
          onPress={handleToggleTheme}
        ></Button>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
