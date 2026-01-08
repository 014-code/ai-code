import { AnimatedBounceView } from '@/components/AnimatedBounceView';
import { StarryBackground } from '@/components/StarryBackground';
import '@/global.css';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { login } from '../../api/user';
import { setToken } from '../../utils/cookies';

/**
 * 登录页面
 */
export default function Login() {
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
            //执行跳转，使用replace防止左划返回登录页
            router.replace('/tabs/ai-app/home');
        } catch (err: any) {
            //提示出错
            alert(err.message || '登录失败');
        }
    };

    return (
        <View style={styles.container}>
            <StarryBackground>
                <View style={styles.imageContainer}>
                    <View style={styles.titleOverlay}>
                        <AnimatedBounceView containerStyle={styles.titleContainer}>
                            <Text style={styles.title}>欢迎来到ai零代码生成应用</Text>
                        </AnimatedBounceView>
                    </View>
                </View>
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <AnimatedBounceView>
                            <Input
                                placeholder='请输入你的账号'
                                label="账号"
                                value={loginForm.userAccount}
                                leftIcon={<Icon name="person" type="material" size={24} />}
                                onChangeText={(text) => setLoginForm({ ...loginForm, userAccount: text })}
                                containerStyle={styles.inputContainer}
                            />
                            <Input
                                value={loginForm.userPassword}
                                label="密码"
                                placeholder='请输入你的密码'
                                secureTextEntry
                                onChangeText={(text) => setLoginForm({ ...loginForm, userPassword: text })}
                                rightIcon={<Icon name="visibility" type="material" size={24} />}
                                containerStyle={styles.inputContainer}
                            />
                            <Button title="登录" onPress={handleSubmit} />
                            <View>
                                <Link href={'/user/register'} style={{ margin: 'auto', color: '#87CEEB' }}>还没账号？去注册</Link>
                            </View>
                        </AnimatedBounceView>
                    </ScrollView>
                </View>
            </StarryBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    imageContainer: {
        height: '45%',
        width: '100%',
        position: 'relative',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
    },
    titleOverlay: {
        alignItems: 'center',
    },
    formContainer: {
        paddingTop: 50,
        height: '80%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        // paddingHorizontal: 20,
        width: '100%'
    },
    // 输入框
    inputContainer: {
        width: 300,
    },
    titleContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
        marginTop: 50
    },
    formContent: {
        gap: 20,
    },
});