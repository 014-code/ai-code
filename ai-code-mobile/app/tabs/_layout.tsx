/**
 * 底部标签栏布局组件
 * 
 * 定义应用的底部标签栏导航结构，包含三个主要标签页：
 * - 对话：AI对话生成代码
 * - 应用市场：浏览和搜索应用
 * - 我的：个人中心和应用管理
 * 
 * 使用Tabs导航器管理底部标签栏，每个标签页都有对应的图标和标题
 * 标签栏样式使用主题色进行动态配置
 * 
 * @returns 底部标签栏导航组件
 */

import { useTheme } from '@/hooks/useTheme';
import { Stack, Tabs } from "expo-router";
import { Icon } from 'react-native-elements';

export default function TabLayout() {
    const { themeColor } = useTheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: themeColor,
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0.5,
                    borderTopColor: '#E5E5EA',
                    height: 70,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            {/**
             * 对话标签页
             * 用于与AI对话生成代码
             * 图标：聊天图标
             */}
            <Tabs.Screen
                name="ai-app/home"
                options={{
                    title: "对话",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="chat"
                            type="material"
                            size={24}
                            color={color}
                        />
                    ),
                    headerShown: false,
                }}
            />
            
            {/**
             * 应用市场标签页
             * 用于浏览和搜索应用
             * 图标：应用图标
             */}
            <Tabs.Screen
                name="ai-app/list"
                options={{
                    title: "应用市场",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="apps"
                            type="material"
                            size={24}
                            color={color}
                        />
                    ),
                    headerShown: false,
                }}
            />
            
            {/**
             * 社区标签页
             * 用于浏览和发布社区帖子
             * 图标：社区图标
             */}
            <Tabs.Screen
                name="forum/list"
                options={{
                    title: "社区",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="forum"
                            type="material"
                            size={24}
                            color={color}
                        />
                    ),
                    headerShown: false,
                }}
            />
            
            {/**
             * 我的标签页
             * 用于个人中心和应用管理
             * 图标：个人图标
             */}
            <Tabs.Screen
                name="ai-app/mine"
                options={{
                    title: "我的",
                    tabBarIcon: ({ color, focused }) => (
                        <Icon
                            name="person"
                            type="material"
                            size={24}
                            color={color}
                        />
                    ),
                    headerShown: false,
                }}
            />
            
            {/**
             * 堆栈导航器
             * 用于管理代码对话和网页预览页面
             * 这些页面不显示在底部标签栏中
             */}
            <Stack>
                <Stack.Screen
                    name="chat"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="webview"
                    options={{
                        headerShown: false,
                    }}
                />
            </Stack>
        </Tabs>
    );
}
