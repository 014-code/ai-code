import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

/**
 * 404未找到的路由页面
 * @returns 
 */
export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "哇偶😭，页面走丢了!" }} />
            <View style={styles.container}>
                <Link href="/">哇偶😭，页面走丢了，点击返回首页!</Link>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
