import { AppVO } from '@/api/vo/app'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
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
    const createTime = app?.createTime ? new Date(app.createTime).toLocaleDateString() : ''
    
    const [isExpand, setIsExpand] = useState<boolean>(false)

    return (
        <View style={styles.cardContainer}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Avatar
                        rounded
                        icon={{ name: 'folder', type: 'material' }}
                        size="medium"
                        source={appAvt ? { uri: appAvt } : undefined}
                        containerStyle={styles.avatar}
                    />
                    <View style={styles.avatarBadge}>
                        <Icon name="check-circle" type="material" size={16} color="#4CAF50" />
                    </View>
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.appName}>{appName}</Text>
                    <View style={styles.metaContainer}>
                        <Icon name="person" type="material" size={14} color="#963b3bff" />
                        <Text style={styles.metaText}>{userName}</Text>
                        {createTime && (
                            <>
                                <Icon name="schedule" type="material" size={14} color="#00c94dff" />
                                <Text style={styles.metaText}>{createTime}</Text>
                            </>
                        )}
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.expandButton}
                    onPress={() => setIsExpand(!isExpand)}
                >
                    <Icon
                        name={isExpand ? 'expand-less' : 'expand-more'}
                        type="material"
                        size={28}
                        color="#667eea"
                    />
                </TouchableOpacity>
            </View>
            
            <TouchableOpacity onPress={onPressCover} activeOpacity={0.8}>
                <Image source={{ uri: coverImage }} style={styles.coverImage} />
                <View style={styles.imageOverlay}>
                    <Icon name="visibility" type="material" size={24} color="#00e5f1ff" />
                </View>
            </TouchableOpacity>
            
            {isExpand && (
                <View style={styles.actionContainer}>
                    <View style={styles.actionButtons}>
                        <Button
                            title="查看对话"
                            icon={<Icon name="chat" type="material" size={20} color="#ffffffff" />}
                            iconContainerStyle={{ marginRight: 8 }}
                            buttonStyle={styles.chatButton}
                            containerStyle={styles.buttonContainer}
                            onPress={() => {
                                console.log("点击查看对话");
                                onViewConversation();
                            }}
                        />
                        <Button
                            title="查看应用"
                            icon={<Icon name="play-arrow" type="material" size={20} color="#ffffffff" />}
                            iconContainerStyle={{ marginRight: 8 }}
                            buttonStyle={styles.appButton}
                            containerStyle={styles.buttonContainer}
                            onPress={() => {
                                console.log("点击查看应用");
                                onViewApp();
                            }}
                        />
                    </View>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        borderWidth: 2,
        borderColor: '#667eea',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 2,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 12,
    },
    appName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaText: {
        fontSize: 13,
        color: '#999',
    },
    expandButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
    },
    coverImage: {
        width: '100%',
        height: 220,
        resizeMode: 'cover',
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: 0,
    },
    actionContainer: {
        padding: 16,
        backgroundColor: '#f8f9fa',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    buttonContainer: {
        flex: 1,
        backgroundColor: '#009ff4ff',
    },
    chatButton: {
        backgroundColor: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 25,
        paddingVertical: 12,
    },
    appButton: {
        backgroundColor: 'linear-gradient(90deg, #f093fb 0%, #f5576c 100%)',
        borderRadius: 25,
        paddingVertical: 12,
    },
})