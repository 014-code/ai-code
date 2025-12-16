import '@/global.css';
import { Link, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';
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
            router.push('/tabs/ai-app/home');
        } catch (err: any) {
            //提示出错
            alert(err.message || '登录失败');
        }
    };

    return (
        <ImageBackground resizeMode="cover" source={require('@/assets/images/login-bac.png')}>
            <SafeAreaView style={{ height: 900, padding: 20 }}>
                <Animated.Text style={[
                    styles.title,
                    {
                        transform: [{
                            translateY: bounceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0] // 3. 应用动画：从-50到0
                            })
                        }]
                    }
                ]}>欢迎来到ai零代码生成应用</Animated.Text>
                <Animated.View style={[
                    {
                        marginTop: 150, gap: 30,
                        transform: [{
                            translateY: bounceAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [-50, 0] // 3. 应用动画：从-50到0
                            })
                        }]
                    },
                ]}>
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
                </Animated.View>
            </SafeAreaView>
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
    },
});