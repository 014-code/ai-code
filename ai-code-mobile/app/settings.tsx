/**
 * 设置页面
 * 
 * 提供应用设置功能，包括：
 * - 主题色切换：用户可以选择不同的主题颜色
 * - 退出登录：清除用户登录状态并返回登录页面
 * 
 * 使用主题管理钩子实现主题切换功能
 */

import { useTheme } from '@/hooks/useTheme';
import { userLogout } from '@/api/user';
import { removeToken } from '@/utils/cookies';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { THEME_OPTIONS } from '@/constants/theme';
import styles from './settings.less';

export default function Settings() {
    /**
     * 路由导航钩子
     * 用于在应用中进行页面跳转
     */
    const router = useRouter();
    
    /**
     * 主题管理钩子
     * 获取当前主题色和设置主题的方法
     */
    const { themeColor, setTheme } = useTheme();

    /**
     * 处理退出登录操作
     * 
     * 显示确认对话框，用户确认后执行以下操作：
     * 1. 调用退出登录API
     * 2. 清除本地存储的token
     * 3. 跳转到登录页面
     */
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
                            /**
                             * 调用退出登录API
                             */
                            await userLogout();
                            
                            /**
                             * 清除本地存储的token
                             */
                            await removeToken();
                            
                            /**
                             * 跳转到登录页面
                             * 使用replace方法替换当前页面，避免用户返回到设置页
                             */
                            router.replace('/user/login');
                        } catch (err: any) {
                            /**
                             * 退出登录失败，显示错误提示
                             */
                            Alert.alert('退出失败', err.message || '请稍后重试');
                        }
                    },
                    style: 'destructive'
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/**
             * 页面头部
             * 包含返回按钮、标题和占位元素
             */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Icon name="arrow-back" type="material" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>设置</Text>
                <View style={{ width: 24 }} />
            </View>

            {/**
             * 页面内容区域
             * 使用ScrollView支持内容滚动
             */}
            <ScrollView style={styles.content}>
                {/**
                 * 主题设置区域
                 * 显示所有可选的主题色选项
                 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>主题设置</Text>
                    <View style={styles.colorGrid}>
                        {/**
                         * 遍历主题选项列表，渲染每个主题色选项
                         */}
                        {THEME_OPTIONS.map((color) => (
                            <TouchableOpacity
                                key={color.key}
                                style={[
                                    styles.colorItem,
                                    themeColor === color.value && styles.colorItemSelected
                                ]}
                                onPress={() => setTheme(color.key)}
                            >
                                {/**
                                 * 主题色预览圆点
                                 */}
                                <View
                                    style={[
                                        styles.colorPreview,
                                        { backgroundColor: color.value }
                                    ]}
                                />
                                {/**
                                 * 主题名称
                                 */}
                                <Text
                                    style={[
                                        styles.colorName,
                                        themeColor === color.value && styles.colorNameSelected
                                    ]}
                                >
                                    {color.name}
                                </Text>
                                {/**
                                 * 选中状态指示图标
                                 * 仅在当前主题被选中时显示
                                 */}
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

                {/**
                 * 退出登录区域
                 * 显示退出登录按钮
                 */}
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Icon name="logout" type="material" size={24} color="#ff4d4f" />
                        <Text style={styles.logoutButtonText}>退出登录</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}
