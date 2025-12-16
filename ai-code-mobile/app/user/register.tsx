import { Link } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Icon, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../../api/user';

type RegisterParam = {
    userAccount: '',
    userPassword: '',
    checkPassword: '',
}

/**
 * 注册页面
 */
export default function Register() {
    const [loginForm, setLoginForm] = useState({
        userAccount: '',
        userPassword: '',
        checkPassword: '',
    })

    const [errors, setErrors] = useState({
        userAccount: '',
        userPassword: '',
        checkPassword: ''
    });

    //弹跳动画
    const bounceAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(bounceAnim, {
            toValue: 1,
            friction: 3,  // 弹跳次数，值越小弹跳越多
            tension: 40,  // 弹跳力度
            useNativeDriver: true,
        }).start();
    }, []);

    // 校验规则
    const validate = () => {
        let valid = true;
        const newErrors: RegisterParam = { userAccount: '', userPassword: '', checkPassword: '' };

        // 账号校验
        if (!loginForm.userAccount || loginForm.userAccount.length < 3) {
            errors.userAccount = '账号至少需要3位字符';
            valid = false;
        }

        // 密码校验
        if (!loginForm.userPassword || loginForm.userPassword.length < 6) {
            errors.userPassword = '密码至少需要6位字符';
            valid = false;
        }

        // 确认密码校验
        if (loginForm.checkPassword !== loginForm.checkPassword) {
            errors.checkPassword = '两次输入的密码不一致';
            valid = false;
        }
        setErrors(newErrors);
        return valid;
    };

    /**
     * 注册
     */
    const handleSubmit = () => {
        if (validate()) {
            register({ ...loginForm })
        }
    };

    return (
        <ImageBackground source={require('@/assets/images/login-bac.png')} resizeMode="cover">
            <SafeAreaView style={{ height: 900, padding: 20 }}>
                <Animated.View style={{
                    marginTop: 150, gap: 30,
                    transform: [{
                        translateY: bounceAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, 0] // 3. 应用动画：从-50到0
                        })
                    }]
                }}>
                    {/* 下方输入表单 */}
                    <TextInput
                        label="账号"
                        placeholder='请输入你的账号'
                        value={loginForm.userAccount}
                        left={<Icon source="person" size={24} />}
                        onChangeText={(text) => setLoginForm({ ...loginForm, userAccount: text })}
                    />
                    <TextInput
                        value={loginForm.userPassword}
                        label="密码"
                        placeholder='请输入你的密码'
                        secureTextEntry
                        onChangeText={(text) => setLoginForm({ ...loginForm, userPassword: text })}
                        right={<TextInput.Icon icon="eye" />}
                    />
                    <TextInput
                        value={loginForm.checkPassword}
                        label="确认密码"
                        placeholder='请再次输入你的密码'
                        secureTextEntry
                        onChangeText={(text) => setLoginForm({ ...loginForm, checkPassword: text })}
                        right={<TextInput.Icon icon="eye" />}
                    />
                    <Button mode='elevated' onPress={handleSubmit}>注册</Button>
                    <View style={{ margin: 'auto' }}>
                        <Link href={'/user/login'} style={{ color: 'blue' }}>已有账号，去登录</Link>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </ImageBackground >
    )
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 30,
    },
    input: {
        height: 50,
        width: 200,
        borderColor: 'blue',
        borderWidth: 0.5,
        marginBottom: 5,
        padding: 5,
        borderRadius: 20,
        // flex: 0.5
    },
    tinyLogo: {
        width: 50,
        height: 50,
        marginBottom: 20,
    },
});