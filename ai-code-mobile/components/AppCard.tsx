import { AppVO } from '@/api/vo/app'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { Avatar, Button, Icon } from 'react-native-elements'

// 应用卡片属性接口
interface AppCardProps {
    app?: AppVO
    /**
     * 点击查看对话的回调
     */
    onViewConversation?: () => void
    /**
     * 点击查看应用的回调
     */
    onViewApp?: () => void
    /**
     * 点击封面的回调
     */
    onPressCover?: () => void
}

/**
 * 应用卡片组件
 */
export default function AppCard({
    app,
    onViewConversation = () => { },
    onViewApp = () => { },
    onPressCover = () => { },
}: AppCardProps) {
    const appName = app?.appName || '测试应用1'
    const userName = app?.user?.userName || '未知作者'
    const coverImage = app?.cover || app?.appCover || 'https://picsum.photos/700'
    const appAvt = app?.userAvatar
    
    const [isExpand, setIsExpand] = useState<boolean>(false)

    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 8, marginBottom: 16, overflow: 'hidden' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
                <Avatar
                    rounded
                    icon={{ name: 'folder', type: 'font-awesome' }}
                    size="medium"
                    source={appAvt ? { uri: appAvt } : undefined}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{appName}</Text>
                    <Text style={{ fontSize: 14, color: '#666' }}>作者：{userName}</Text>
                </View>
                <TouchableOpacity onPress={() => setIsExpand(!isExpand)}>
                    <Icon
                        name={isExpand ? 'chevron-up' : 'chevron-down'}
                        type="font-awesome"
                        size={24}
                    />
                </TouchableOpacity>
            </View>
            <Image source={{ uri: coverImage }} style={{ width: '100%', height: 200 }} />
            {isExpand && (
                <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
                    <Button title="查看对话" onPress={() => {
                        console.log("点击查看对话");
                        onViewConversation();
                    }} />
                    <Button title="查看应用" onPress={() => {
                        console.log("点击查看应用");
                        onViewApp();
                    }} />
                </View>
            )}
        </View>
    )
}