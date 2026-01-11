/**
 * 注册页面
 * 
 * 提供用户注册功能，包含账号、密码和确认密码的输入
 * 使用表单验证确保输入的有效性
 * 包含弹跳动画效果和星空背景，提供良好的用户体验
 * 注册成功后跳转到登录页面
 */

import { AnimatedBounceView } from '@/components/ui/AnimatedBounceView';
import { StarryBackground } from '@/components/background/StarryBackground';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { register } from '../../api/user';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/components/ui/Logo';
import styles from './register.less';

/**
 * 注册表单参数类型
 * 定义注册表单中各个字段的类型
 */
type RegisterParam = {
    userAccount: string;
    userPassword: string;
    checkPassword: string;
}

export default function Register() {
    const { themeColor } = useTheme()
    
    /**
     * 注册表单状态
     * 存储用户输入的账号、密码和确认密码
     */
    const [loginForm, setLoginForm] = useState({
        userAccount: '',
        userPassword: '',
        checkPassword: '',
    })

    /**
     * 表单错误状态
     * 存储各个字段的验证错误信息
     */
    const [errors, setErrors] = useState({
        userAccount: '',
        userPassword: '',
        checkPassword: ''
    });

    /**
     * 表单验证函数
     * 验证用户输入的账号、密码和确认密码是否符合要求
     * 
     * @returns 验证是否通过，true表示验证通过，false表示验证失败
     */
    const validate = () => {
        let valid = true;
        const newErrors: RegisterParam = { userAccount: '', userPassword: '', checkPassword: '' };

        // 账号校验：至少需要3位字符
        if (!loginForm.userAccount || loginForm.userAccount.length < 3) {
            newErrors.userAccount = '账号至少需要3位字符';
            valid = false;
        }

        // 密码校验：至少需要6位字符
        if (!loginForm.userPassword || loginForm.userPassword.length < 6) {
            newErrors.userPassword = '密码至少需要6位字符';
            valid = false;
        }

        // 确认密码校验：两次输入的密码必须一致
        if (loginForm.checkPassword !== loginForm.userPassword) {
            newErrors.checkPassword = '两次输入的密码不一致';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    /**
     * 提交注册表单
     * 先进行表单验证，验证通过后调用注册API
     */
    const handleSubmit = () => {
        if (validate()) {
            register({ ...loginForm })
        }
    };

    return (
        <View style={styles.container}>
            <StarryBackground>
                {/**
                 * 顶部区域
                 * 包含标题和Logo，使用弹跳动画效果
                 */}
                <View style={styles.imageContainer}>
                    <View style={styles.titleOverlay}>
                        <AnimatedBounceView containerStyle={styles.titleContainer}>
                            <Text style={styles.title}>注册新账号</Text>
                        </AnimatedBounceView>
                        <View style={styles.logoContainer}>
                            <Logo size={80} />
                        </View>
                    </View>
                </View>
                
                {/**
                 * 表单区域
                 * 包含账号、密码、确认密码输入框和注册按钮
                 * 使用ScrollView支持内容滚动
                 */}
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <AnimatedBounceView containerStyle={styles.formContent}>
                            {/**
                             * 账号输入框
                             * 用户输入注册账号，最少3位字符
                             */}
                            <Input
                                label="账号"
                                placeholder='请输入你的账号'
                                value={loginForm.userAccount}
                                leftIcon={<Icon name="person" type="material" size={24} />}
                                onChangeText={(text) => setLoginForm({ ...loginForm, userAccount: text })}
                                containerStyle={styles.inputContainer}
                            />
                            
                            {/**
                             * 密码输入框
                             * 用户输入注册密码，最少6位字符，使用secureTextEntry隐藏输入内容
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
                             * 确认密码输入框
                             * 用户再次输入密码进行确认，必须与密码一致
                             */}
                            <Input
                                value={loginForm.checkPassword}
                                label="确认密码"
                                placeholder='请再次输入你的密码'
                                secureTextEntry
                                onChangeText={(text) => setLoginForm({ ...loginForm, checkPassword: text })}
                                rightIcon={<Icon name="visibility" type="material" size={24} />}
                                containerStyle={styles.inputContainer}
                            />
                            
                            {/**
                             * 注册按钮
                             * 点击后提交注册表单
                             */}
                            <Button title="注册" onPress={handleSubmit} />
                            
                            {/**
                             * 登录链接
                             * 已有账号的用户点击跳转到登录页面
                             */}
                            <View style={{ margin: 'auto' }}>
                                <Link href={'/user/login'} style={{ color: themeColor }}>已有账号，去登录</Link>
                            </View>
                        </AnimatedBounceView>
                    </ScrollView>
                </View>
            </StarryBackground>
        </View>
    )
}