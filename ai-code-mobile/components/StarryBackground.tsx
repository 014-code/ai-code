import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

interface StarryBackgroundProps {
  children: React.ReactNode;
}

/**
 * 星空背景组件
 * @param param0 
 * @returns 
 */
export function StarryBackground({ children }: StarryBackgroundProps) {
  const stars = useRef(
    Array.from({ length: 100 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.01,
    }))
  ).current;

  const opacityAnims = useRef(
    stars.map(() => new Animated.Value(stars[Math.floor(Math.random() * stars.length)].opacity))
  ).current;

  useEffect(() => {
    const animations = opacityAnims.map((anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: Math.random() * 2000 + 1000,
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [opacityAnims]);

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    position: 'relative',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderRadius: 999,
  },
});
