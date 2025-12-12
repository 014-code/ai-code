import AppCard from '@/components/AppCard';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { login } from '../../api/user';
import { setToken } from '../../utils/cookies';

/**
 * 登录页面
 */
export default function Login() {
    //登录表单
    const [loginForm, setLoginForm] = useState({
        userAccount: '',
        userPassword: ''
    })

    const router = useRouter();

    //背景图
    const image = { uri: 'https://legacy.reactjs.org/logo-og.png' };

    /**
    * 登录
    */
    const handleSubmit = async () => {
        try {
            const res: any = await login({ ...loginForm });
            // 保存 token
            if (res.data) {
                //这边将整个用户信息对象存储进token
                await setToken(res.data);
            }
            //执行跳转
            router.push('/ai-app/home');
        } catch (err: any) {
            //提示出错
            alert(err.msg || '登录失败');
        }
    };

    return (
        <ImageBackground source={image} resizeMode="cover">
            <SafeAreaView style={styles.container}>
                <AppCard></AppCard>
                {/* 下方输入表单 */}
                <TextInput
                    placeholder='请输入你的账号'
                    style={styles.input}
                    value={loginForm.userAccount}
                    onChangeText={(text) => setLoginForm({ ...loginForm, userAccount: text })}
                />
                <TextInput
                    placeholder='请输入你的密码'
                    style={styles.input}
                    value={loginForm.userPassword}
                    onChangeText={(text) => setLoginForm({ ...loginForm, userPassword: text })}
                    secureTextEntry={true}
                />
                <View style={{ flex: 3 }}>
                    <Button mode='elevated' onPress={handleSubmit}>登录</Button>
                </View>
                <View>
                    <Link href={'/user/register'} style={{ color: 'blue' }}>还没账号？去注册</Link>
                </View>

            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 900,
        // resizeMode: 'contain',
        // flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // margin: 30,
    },
    input: {
        height: 50,
        width: 200,
        borderColor: 'blue',
        borderWidth: 1,
        marginBottom: 5,
        padding: 5,
        borderRadius: 20,
        // flex: 0.5
    },
});