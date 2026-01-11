import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { View } from 'react-native'
import styles from './HomeBackground.less'

/**
 * 首页背景组件属性
 */
interface HomeBackgroundProps {
  /**
   * 子组件内容
   */
  children: React.ReactNode
}

/**
 * 首页背景组件
 * 提供渐变色背景，用于美化首页视觉效果
 * 使用 LinearGradient 实现从左上到右下的渐变效果
 *
 * @param props - 组件属性
 * @returns 背景组件
 *
 * @example
 * ```tsx
 * <HomeBackground>
 *   <Text>首页内容</Text>
 * </HomeBackground>
 * ```
 */
export default function HomeBackground({ children }: HomeBackgroundProps) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#66c9ffff', '#45e2edff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      />
      <View style={styles.content}>{children}</View>
    </View>
  )
}
