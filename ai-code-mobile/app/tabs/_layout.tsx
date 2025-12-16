import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

/**
 * 底部栏布局组件
 * @returns 
 */
export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#007AFF',
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
            <Tabs.Screen
                name="ai-app/home"
                options={{
                    title: "对话",
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons 
                            name="list" 
                            size={24} 
                            color={color} 
                        />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="ai-app/list"
                options={{
                    title: "应用市场",
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons 
                            name="history" 
                            size={24} 
                            color={color} 
                        />
                    ),
                    headerShown: false,
                }}
            />
            <Tabs.Screen
                name="ai-app/mine"
                options={{
                    title: "我的",
                    tabBarIcon: ({ color, focused }) => (
                        <MaterialIcons 
                            name="user" 
                            size={24} 
                            color={color} 
                        />
                    ),
                    headerShown: false,
                }}
            />
        </Tabs>
    );
}
