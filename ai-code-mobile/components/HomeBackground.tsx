import { LinearGradient } from 'expo-linear-gradient'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface HomeBackgroundProps {
  children: React.ReactNode
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 1,
  },
})
