import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { Button, Icon, TextInput } from 'react-native-paper';
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
        <ImageBackground resizeMode="cover">
            <SafeAreaView style={{ height: 900, padding: 20 }}>
                <View style={{ marginTop: 150, gap: 30 }}>
                    {/* 下方输入表单 */}
                    <TextInput
                        placeholder='请输入你的账号'
                        label="账号"
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
                    <Button mode='elevated' onPress={handleSubmit}>登录</Button>
                    <View>
                        <Link href={'/user/register'} style={{ margin: 'auto', color: 'blue' }}>还没账号？去注册</Link>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({

});