import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { hasToken } from '../utils/cookies';
import { setNavigationRef } from '../utils/navigationManager';

/**
 * 应用入口页面
 * 处理认证状态和路由跳转
 */
export default function IndexPage() {
    //路由钩子
    const router = useRouter();

    useEffect(() => {
        // 设置全局导航引用
        setNavigationRef(router);
        const checkAuthAndRedirect = async () => {
            try {
                const hasValidToken = await hasToken();
                if (hasValidToken) {
                    // 有token，跳转到主页面
                    router.replace('/ai-app/home');
                } else {
                    // 没有token，跳转到登录页面
                    router.replace('/user/login');
                }
            } catch (error) {
                console.error('检查认证状态失败:', error);
                // 出错时跳转到登录页面
                router.replace('/user/login');
            }
        };

        checkAuthAndRedirect();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
