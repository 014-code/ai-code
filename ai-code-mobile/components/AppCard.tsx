import React, { useState } from 'react'
import { View } from 'react-native'
import { Avatar, Button, Card, IconButton } from 'react-native-paper'

// 用户信息接口
interface UserInfo {
    id: number
    userAccount: string
    userName: string
    userAvatar: string
    userProfile: string
    userRole: string
    createTime: string
}

// 应用卡片属性接口
interface AppCardProps {
    /**
     * 应用ID
     */
    id?: number
    /**
     * 应用名称
     */
    appName?: string
    /**
     * 应用类型
     */
    appType?: string

    /**
     * 应用描述
     */
    appDesc?: string

    /**
     * 页面浏览量
     */
    pageViews?: number

    /**
     * 应用图标
     */
    appIcon?: string

    /**
     * 应用封面
     */
    appCover?: string

    /**
     * 初始化提示
     */
    initPrompt?: string

    /**
     * 代码生成类型
     */
    codeGenType?: string

    /**
     * 用户ID
     */
    userId?: number

    /**
     * 用户信息
     */
    user?: UserInfo

    /**
     * 封面图片
     */
    cover?: string

    /**
     * 部署密钥
     */
    deployKey?: string

    /**
     * 优先级
     */
    priority?: number

    /**
     * 是否推荐
     */
    isFeatured?: number

    /**
     * 编辑时间
     */
    editTime?: string

    /**
     * 创建时间
     */
    createTime?: string

    /**
     * 更新时间
     */
    updateTime?: string

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
    appName,
    appDesc = '',
    appCover = '',
    cover = '',
    user,
    pageViews = 0,
    isFeatured = 0,
    createTime = '',
    onViewConversation = () => { },
    onViewApp = () => { },
    onPressCover = () => { },
    ...restProps
}: AppCardProps) {
    //卡片展开状态
    const [isExpand, setIsExpand] = useState<boolean>(false)

    return (
        <View>
            <Card>
                {/* 卡片标题 */}
                <Card.Title
                    title="测试应用1"
                    subtitle="作者：大哥"
                    left={(props) => <Avatar.Icon {...props} icon="folder" />}
                    right={(props) => (
                        <IconButton
                            {...props}
                            icon={isExpand ? 'chevron-up' : 'chevron-down'}
                            onPress={() => setIsExpand(!isExpand)}
                        />
                    )}
                />
                <Card.Cover source={{ uri: 'https://picsum.photos/700' }} />
                {/* 点击展开卡片时再显示 */}
                {isExpand && (
                    <Card.Actions>
                        <Button onPress={() => { }}>查看对话</Button>
                        <Button onPress={() => { }}>查看应用</Button>
                    </Card.Actions>
                )}

            </Card>
        </View>
    )
}