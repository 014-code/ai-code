import React, { useState } from 'react'
import { View } from 'react-native'
import { Avatar, Button, Card, IconButton } from 'react-native-paper'

/**
 * 应用卡片组件
 */
export default function AppCard() {
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