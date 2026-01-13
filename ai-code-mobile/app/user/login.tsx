/**
 * 登录页面
 * 
 * 提供用户登录功能，包括：
 * - 账号密码输入
 * - 表单验证
 * - 登录状态保存
 * - 登录成功后跳转到主页面
 * 
 * 使用星空背景和弹跳动画增强视觉效果
 */

import { AnimatedBounceView } from '@/components/ui/AnimatedBounceView';
import { StarryBackground } from '@/components/background/StarryBackground';
import '@/global.css';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { login } from '../../api/user';
import { setToken } from '../../utils/cookies';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/components/ui/Logo';
import styles from '@/styles/login.less';

export default function Login() {
    /**
     * 主题管理钩子
     * 获取当前主题色
     */
    const { themeColor } = useTheme();
    
    /**
     * 登录表单状态
     * 包含用户账号和密码两个字段
     */
    const [loginForm, setLoginForm] = useState({
        userAccount: '',
        userPassword: ''
    });

    /**
     * 路由导航钩子
     * 用于在应用中进行页面跳转
     */
    const router = useRouter();

    /**
     * 处理登录提交
     * 
     * 执行以下操作：
     * 1. 调用登录API
     * 2. 保存返回的token到本地存储
     * 3. 跳转到主页面
     * 
     * 如果登录失败，显示错误提示
     */
    const handleSubmit = async () => {
        try {
            /**
             * 调用登录API，传入账号和密码
             */
            const res: any = await login({ ...loginForm });
            
            /**
             * 保存token到本地存储
             * 将整个用户信息对象存储进token
             */
            if (res.data) {
                await setToken(res.data);
            }
            
            /**
             * 跳转到主页面
             * 使用replace方法替换当前页面，防止用户返回到登录页
             */
            router.replace('/tabs/ai-app/home');
        } catch (err: any) {
            /**
             * 登录失败，显示错误提示
             */
            alert(err.message || '登录失败');
        }
    };

    return (
        <View style={styles.container}>
            {/**
             * 星空背景组件
             * 提供动态的星空背景效果
             */}
            <StarryBackground>
                {/**
                 * 顶部图片区域
                 * 包含标题和Logo
                 */}
                <View style={styles.imageContainer}>
                    <View style={styles.titleOverlay}>
                        {/**
                         * 弹跳动画标题
                         * 使用AnimatedBounceView组件实现弹跳效果
                         */}
                        <AnimatedBounceView containerStyle={styles.titleContainer}>
                            <Text style={styles.title}>欢迎来到ai零代码生成应用</Text>
                        </AnimatedBounceView>
                        
                        {/**
                         * Logo容器
                         * 显示应用Logo
                         */}
                        <View style={styles.logoContainer}>
                            <Logo size={80} />
                        </View>
                    </View>
                </View>
                
                {/**
                 * 表单容器
                 * 包含登录表单输入框和按钮
                 */}
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <AnimatedBounceView>
                            {/**
                             * 账号输入框
                             * 包含左侧图标和标签
                             */}
                            <Input
                                placeholder='请输入你的账号'
                                label="账号"
                                value={loginForm.userAccount}
                                leftIcon={<Icon name="person" type="material" size={24} />}
                                onChangeText={(text) => setLoginForm({ ...loginForm, userAccount: text })}
                                containerStyle={styles.inputContainer}
                            />
                            
                            {/**
                             * 密码输入框
                             * 包含右侧可见性图标和标签
                             */}
                            <Input
                                value={loginForm.userPassword}
                                label="密码"
                                placeholder='请输入你的密码'
                                secureTextEntry
                                onChangeText={(text) => setLoginForm({ ...loginForm, userPassword: text })}
                                rightIcon={<Icon name="visibility" type="material" size={24} />}
                                containerStyle={styles.inputContainer}
                            />
                            
                            {/**
                             * 登录按钮
                             * 点击触发登录提交
                             */}
                            <Button title="登录" onPress={handleSubmit} />
                            
                            {/**
                             * 注册链接
                             * 点击跳转到注册页面
                             */}
                            <View>
                                <Link href={'/user/register'} style={{ margin: 'auto', color: themeColor }}>还没账号？去注册</Link>
                            </View>
                        </AnimatedBounceView>
                    </ScrollView>
                </View>
            </StarryBackground>
        </View>
    );
}