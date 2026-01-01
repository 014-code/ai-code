import React from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useBounceAnimation } from '../hooks/useBounceAnimation';

/**
 * 弹跳动画容器
 */
interface AnimatedBounceViewProps {
  //子组件-插槽
  children: React.ReactNode;
  /**
   *  translateY 范围
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

export function AnimatedBounceView({
  //默认值
  children,
  translateYRange = [-50, 0],
  style,
  containerStyle,
}: AnimatedBounceViewProps) {
  // 弹跳动画钩子
  const bounceAnim = useBounceAnimation();

  //动画样式对象
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});
