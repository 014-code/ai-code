import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * 使用弹跳动画钩子
 */
interface UseBounceAnimationOptions {
  friction?: number;
  tension?: number;
  delay?: number;
}

export function useBounceAnimation(options: UseBounceAnimationOptions = {}) {
  const { friction = 3, tension = 40, delay = 0 } = options;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.spring(bounceAnim, {
      toValue: 1,
      friction,
      tension,
      useNativeDriver: true,
    });

    if (delay > 0) {
      const timeout = setTimeout(() => {
        animation.start();
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      animation.start();
    }

    return () => animation.stop();
  }, [bounceAnim, friction, tension, delay]);

  return bounceAnim;
}
