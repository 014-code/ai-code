/**
 * 404未找到页面
 * 
 * 当用户访问不存在的路由时显示此页面
 * 提供友好的错误提示和返回首页的链接
 */

import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import styles from '@/styles/+not-found.less';

export default function NotFoundScreen() {
    return (
        <>
            {/**
             * 设置页面标题
             * 显示在导航栏上的标题文字
             */}
            <Stack.Screen options={{ title: "哇偶😭，页面走丢了!" }} />
            
            {/**
             * 页面内容容器
             * 居中显示错误提示和返回链接
             */}
            <View style={styles.container}>
                <Link href="/">哇偶😭，页面走丢了，点击返回首页!</Link>
            </View>
        </>
    );
}
