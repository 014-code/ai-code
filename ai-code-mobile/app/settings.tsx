import { useTheme } from '@/hooks/useTheme'
import { userLogout } from '@/api/user'
import { removeToken } from '@/utils/cookies'
import { useRouter } from 'expo-router'
import React from 'react'
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { THEME_OPTIONS } from '@/constants/theme'

/**
 * 设置页面
 * 提供主题色切换和退出登录功能
 */
export default function Settings() {
    const router = useRouter()
    const { themeColor, setTheme } = useTheme()

    const handleLogout = () => {
        Alert.alert(
            '退出登录',
            '确定要退出登录吗？',
            [
                {
                    text: '取消',
                    style: 'cancel'
                },
                {
                    text: '确定',
                    onPress: async () => {
                        try {
                            await userLogout()
                            await removeToken()
                            router.replace('/user/login')
                        } catch (err: any) {
                            Alert.alert('退出失败', err.message || '请稍后重试')
                        }
                    },
                    style: 'destructive'
                }
            ]
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="arrow-back" type="material" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>设置</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>主题设置</Text>
                    <View style={styles.colorGrid}>
                        {THEME_OPTIONS.map((color) => (
                            <TouchableOpacity
                                key={color.key}
                                style={[
                                    styles.colorItem,
                                    themeColor === color.value && styles.colorItemSelected
                                ]}
                                onPress={() => setTheme(color.key)}
                            >
                                <View
                                    style={[
                                        styles.colorPreview,
                                        { backgroundColor: color.value }
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.colorName,
                                        themeColor === color.value && styles.colorNameSelected
                                    ]}
                                >
                                    {color.name}
                                </Text>
                                {themeColor === color.value && (
                                    <Icon
                                        name="check-circle"
                                        type="material"
                                        size={20}
                                        color={color.value}
                                        style={styles.checkIcon}
                                    />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" type="material" size={24} color="#ff4d4f" />
                        <Text style={styles.logoutButtonText}>退出登录</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: '#fff',
        marginTop: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    colorItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        margin: 6,
    },
    colorItemSelected: {
        borderColor: '#667eea',
        backgroundColor: '#f0f3ff',
    },
    colorPreview: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    colorName: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 12,
    },
    colorNameSelected: {
        fontWeight: 'bold',
    },
    checkIcon: {
        marginLeft: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff4d4f',
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#ff4d4f',
        fontWeight: 'bold',
        marginLeft: 8,
    },
})
