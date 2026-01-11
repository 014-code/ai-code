/**
 * 应用入口页面
 * 
 * 作为应用的启动页面，负责检查用户认证状态并进行相应的路由跳转
 * 如果用户已登录（有有效token），跳转到主页面
 * 如果用户未登录，跳转到登录页面
 * 在跳转过程中显示加载指示器
 */

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { hasToken } from '../utils/cookies';
import { setNavigationRef } from '../utils/navigationManager';
import styles from './index.less';

export default function IndexPage() {
    /**
     * 路由导航钩子
     * 用于在应用中进行页面跳转
     */
    const router = useRouter();

    useEffect(() => {
        /**
         * 设置全局导航引用
         * 将路由实例保存到全局变量中，以便在非组件环境中使用导航功能
         */
        setNavigationRef(router);

        /**
         * 检查认证状态并重定向到相应页面
         * 
         * 根据用户是否拥有有效的token决定跳转目标：
         * - 有token：跳转到主页面（/tabs/ai-app/home）
         * - 无token：跳转到登录页面（/user/login）
         * - 出错时：默认跳转到登录页面
         */
        const checkAuthAndRedirect = async () => {
            try {
                /**
                 * 检查本地是否存在有效的token
                 */
                const hasValidToken = await hasToken();
                
                if (hasValidToken) {
                    /**
                     * 用户已登录，跳转到主页面
                     * 使用replace方法替换当前页面，避免用户返回到入口页
                     */
                    router.replace('/tabs/ai-app/home');
                } else {
                    /**
                     * 用户未登录，跳转到登录页面
                     * 使用replace方法替换当前页面
                     */
                    router.replace('/user/login');
                }
            } catch (error) {
                /**
                 * 检查认证状态失败，记录错误并跳转到登录页面
                 */
                console.error('检查认证状态失败:', error);
                router.replace('/user/login');
            }
        };

        /**
         * 执行认证检查和页面跳转
         */
        checkAuthAndRedirect();
    }, []);

    return (
        /**
         * 加载容器
         * 显示加载指示器，等待认证检查完成
         */
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007AFF" />
        </View>
    );
}
