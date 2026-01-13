import React from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useBounceAnimation } from '../../hooks/useBounceAnimation';
import styles from '@/styles/ui/AnimatedBounceView.less';

/**
 * 弹跳动画容器属性
 */
interface AnimatedBounceViewProps {
  /**
   * 子组件内容
   */
  children: React.ReactNode;
  /**
   * Y 轴平移范围
   * 默认值: [-50, 0]，表示从上方 50px 处弹跳到原位
   */
  translateYRange?: [number, number];
  /**
   * 子组件样式
   */
  style?: ViewStyle;
  /**
   * 容器样式
   */
  containerStyle?: ViewStyle;
}

/**
 * 弹跳动画容器组件
 * 为子组件提供弹跳动画效果
 * 使用 useBounceAnimation hook 实现动画逻辑
 *
 * @param props - 组件属性
 * @returns 带弹跳动画的容器组件
 *
 * @example
 * ```tsx
 * <AnimatedBounceView
 *   translateYRange={[-100, 0]}
 *   style={{ padding: 20 }}
 * >
 *   <Text>带弹跳动画的内容</Text>
 * </AnimatedBounceView>
 * ```
 */
export function AnimatedBounceView({
  children,
  translateYRange = [-50, 0],
  style,
  containerStyle,
}: AnimatedBounceViewProps) {
  /**
   * 获取弹跳动画值
   * 从 useBounceAnimation hook 获取动画状态
   */
  const bounceAnim = useBounceAnimation();

  /**
   * 动画样式对象
   * 将动画值映射到 Y 轴平移
   * 使用 interpolate 方法将动画进度 (0-1) 映射到指定的平移范围
   */
  const animatedStyle = {
    transform: [
      {
        translateY: bounceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: translateYRange,
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.container, containerStyle, animatedStyle]}>
      <View style={style}>{children}</View>
    </Animated.View>
  );
}
