import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * 个人页骨架屏组件
 * 用于在个人页数据加载时显示占位效果
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        flex: 1,
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
    },
    userName: {
        width: 120,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 8,
    },
    userAccount: {
        width: 100,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 8,
    },
    userProfile: {
        width: 150,
        height: 14,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    logoutButton: {
        width: 120,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    appsSection: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
        width: 100,
        height: 18,
        borderRadius: 4,
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 12,
        marginBottom: 8,
    },
    searchBar: {
        height: 48,
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    skeletonCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
})
