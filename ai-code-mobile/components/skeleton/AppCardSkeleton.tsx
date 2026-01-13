import React from 'react'
import { View } from 'react-native'
import styles from '@/styles/skeleton/AppCardSkeleton.less'

/**
 * 应用卡片骨架屏组件
 * 用于在卡片数据加载时显示占位效果
 * 提供视觉反馈，提升用户体验
 *
 * @returns 骨架屏组件
 *
 * @example
 * ```tsx
 * <AppCardSkeleton />
 * ```
 */
export default function AppCardSkeleton() {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar} />
                    <View style={styles.avatarBadge} />
                </View>
                <View style={styles.titleContainer}>
                    <View style={styles.title} />
                    <View style={styles.meta1} />
                    <View style={styles.meta2} />
                </View>
                <View style={styles.expandButton} />
            </View>

            <View style={styles.coverImage} />

            <View style={styles.actionContainer}>
                <View style={styles.actionButtons}>
                    <View style={[styles.button, styles.buttonLeft]} />
                    <View style={[styles.button, styles.buttonRight]} />
                </View>
            </View>
        </View>
    )
}
