import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import styles from './StarryBackground.less';

/**
 * 星空背景组件属性
 */
interface StarryBackgroundProps {
  /**
   * 子组件内容
   */
  children: React.ReactNode;
}

/**
 * 星空背景组件
 * 创建一个带有闪烁星星动画的深色背景
 * 使用 Animated API 实现星星的闪烁效果
 *
 * @param props - 组件属性
 * @returns 星空背景组件
 *
 * @example
 * ```tsx
 * <StarryBackground>
 *   <Text>内容</Text>
 * </StarryBackground>
 * ```
 */
export function StarryBackground({ children }: StarryBackgroundProps) {
  /**
   * 星星数据数组
   * 使用 useRef 保持引用稳定，避免重新创建
   * 每个星星包含位置、大小、透明度和闪烁速度
   */
  const stars = useRef(
    Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.01,
    }))
  ).current;

  /**
   * 星星透明度动画数组
   * 每个星星都有独立的动画值，实现不同步的闪烁效果
   */
  const opacityAnims = useRef(
    stars.map(() => new Animated.Value(stars[Math.floor(Math.random() * stars.length)].opacity))
  ).current;

  useEffect(() => {
    /**
     * 创建闪烁动画序列
     * 每个星星的动画包含淡入和淡出两个阶段
     * 使用 Animated.loop 实现循环播放
     */
    const animations = opacityAnims.map((anim) =>
      Animated.loop(
        Animated.sequence([
          /**
           * 淡入动画
           * 随机持续时间 1000-3000ms
           */
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
          /**
           * 淡出动画
           * 随机持续时间 1000-3000ms
           */
          Animated.timing(anim, {
            toValue: 0.3,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    /**
     * 启动所有星星的动画
     */
    animations.forEach((anim) => anim.start());

    /**
     * 清理函数
     * 组件卸载时停止所有动画，避免内存泄漏
     */
    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [opacityAnims]);

  /**
   * 获取屏幕尺寸
   * 用于计算星星的绝对位置
   */
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  return (
    <View style={styles.container}>
      {stars.map((star, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            {
              left: star.x * screenWidth,
              top: star.y * screenHeight,
              width: star.size,
              height: star.size,
              opacity: opacityAnims[index],
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
}
