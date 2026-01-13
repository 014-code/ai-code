import React from 'react'
import { View } from 'react-native'
import styles from '@/styles/skeleton/HomeSkeleton.less'

/**
 * 首页骨架屏组件
 * 用于在首页数据加载时显示占位效果
 * 提供视觉反馈，提升用户体验
 *
 * @returns 骨架屏组件
 *
 * @example
 * ```tsx
 * <HomeSkeleton />
 * ```
 */
export default function HomeSkeleton() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.title} />
            </View>

            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <View style={styles.icon} />
                    <View style={styles.inputLines}>
                        <View style={styles.inputLine} />
                        <View style={styles.inputLine} />
                        <View style={styles.inputLine} />
                        <View style={styles.inputLine} />
                        <View style={styles.inputLine} />
                        <View style={styles.inputLine} />
                    </View>
                </View>
            </View>

            <View style={styles.tagsContainer}>
                <View style={styles.tagsTitle} />
                <View style={styles.tagsWrapper}>
                    <View style={[styles.tag, styles.tag1]} />
                    <View style={[styles.tag, styles.tag2]} />
                    <View style={[styles.tag, styles.tag3]} />
                    <View style={[styles.tag, styles.tag4]} />
                    <View style={[styles.tag, styles.tag5]} />
                    <View style={[styles.tag, styles.tag6]} />
                </View>
            </View>

            <View style={styles.createButton}>
                <View style={styles.buttonIcon} />
                <View style={styles.buttonText} />
            </View>
        </View>
    )
}
