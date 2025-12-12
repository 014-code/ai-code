import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Button, ImageBackground, StyleSheet, TextInput, View } from 'react-native';
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

    //背景图
    const image = { uri: 'https://legacy.reactjs.org/logo-og.png' };

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
        <ImageBackground source={image} resizeMode="cover">
            <SafeAreaView style={styles.container}>

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
                <TextInput
                    placeholder='请再次输入你的密码'
                    style={styles.input}
                    value={loginForm.checkPassword}
                    onChangeText={(text) => setLoginForm({ ...loginForm, checkPassword: text })}
                    secureTextEntry={true}
                />
                <View style={{ flex: 3 }}>
                    <Button title='注册' onPress={handleSubmit}></Button>
                </View>
                <View>
                    <Link href={'/user/login'} style={{ color: 'blue' }}>已有账号，去登录</Link>
                </View>

            </SafeAreaView>
        </ImageBackground>
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