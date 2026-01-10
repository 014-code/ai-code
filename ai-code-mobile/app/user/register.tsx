import { AnimatedBounceView } from '@/components/AnimatedBounceView';
import { StarryBackground } from '@/components/StarryBackground';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Icon, Input } from 'react-native-elements';
import { register } from '../../api/user';
import { useTheme } from '@/hooks/useTheme';
import Logo from '@/components/Logo';

type RegisterParam = {
    userAccount: '',
    userPassword: '',
    checkPassword: '',
}

/**
 * 注册页面
 */
export default function Register() {
    const { themeColor } = useTheme()
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

    // 校验规则
    const validate = () => {
        let valid = true;
        const newErrors: RegisterParam = { userAccount: '', userPassword: '', checkPassword: '' };

        // 账号校验
        if (!loginForm.userAccount || loginForm.userAccount.length < 3) {
            newErrors.userAccount = '账号至少需要3位字符';
            valid = false;
        }

        // 密码校验
        if (!loginForm.userPassword || loginForm.userPassword.length < 6) {
            newErrors.userPassword = '密码至少需要6位字符';
            valid = false;
        }

        // 确认密码校验
        if (loginForm.checkPassword !== loginForm.userPassword) {
            newErrors.checkPassword = '两次输入的密码不一致';
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
        <View style={styles.container}>
            <StarryBackground>
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
                <View style={styles.formContainer}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <AnimatedBounceView containerStyle={styles.formContent}>
                            <Input
                                label="账号"
                                placeholder='请输入你的账号'
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
                            <Input
                                value={loginForm.checkPassword}
                                label="确认密码"
                                placeholder='请再次输入你的密码'
                                secureTextEntry
                                onChangeText={(text) => setLoginForm({ ...loginForm, checkPassword: text })}
                                rightIcon={<Icon name="visibility" type="material" size={24} />}
                                containerStyle={styles.inputContainer}
                            />
                            <Button title="注册" onPress={handleSubmit} />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    imageContainer: {
        height: '35%',
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
        height: '100%',
        backgroundColor: '#ffffff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
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
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    formContent: {
        gap: 20,
    },
});