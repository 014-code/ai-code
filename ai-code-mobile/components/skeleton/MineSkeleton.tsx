import React from 'react'
import { View } from 'react-native'
import styles from './MineSkeleton.less'

/**
 * 个人页骨架屏组件
 * 用于在个人页数据加载时显示占位效果
 * 提供视觉反馈，提升用户体验
 *
 * @returns 骨架屏组件
 *
 * @example
 * ```tsx
 * <MineSkeleton />
 * ```
 */
export default function MineSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar} />
          </View>
          <View style={styles.userName} />
          <View style={styles.userAccount} />
          <View style={styles.userProfile} />
          <View style={styles.actionButtons}>
            <View style={styles.logoutButton} />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.appsSection}>
          <View style={styles.sectionTitle} />
          <View style={styles.searchBar} />

          <View style={styles.listContent}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
          </View>
        </View>
      </View>
    </View>
  )
}
