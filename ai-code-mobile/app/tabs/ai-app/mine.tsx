import { myAppList } from '@/api/app'
import { getUserInfo, userLogout } from '@/api/user'
import { AppVO } from '@/api/vo/app'
import { LoginUserVO } from '@/api/vo/user'
import AppCard from '@/components/ui/AppCard'
import AppCardSkeleton from '@/components/skeleton/AppCardSkeleton'
import AppWebView from '@/components/ui/AppWebView'
import MineSkeleton from '@/components/skeleton/MineSkeleton'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import { usePagination } from '@/hooks/usePagination'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, TouchableOpacity, View, Animated, Dimensions, Easing } from 'react-native'
import { Avatar, Button, Divider, Icon, SearchBar } from 'react-native-elements'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import styles from './mine.less'

/**
 * 我的页面组件
 * 展示用户个人信息、用户创建的应用列表
 * 支持应用搜索、下拉刷新、上拉加载更多、应用预览和对话查看
 */
export default function Mine() {
    /**
     * 路由导航钩子
     * 用于在应用中进行页面跳转
     */
    const router = useRouter()
    
    /**
     * 主题管理钩子
     * 获取当前主题色，用于动态设置UI元素颜色
     */
    const { themeColor } = useTheme()
    
    /**
     * 用户信息状态
     * 存储当前登录用户的详细信息
     */
    const [userInfo, setUserInfo] = useState<LoginUserVO | null>(null)
    
    /**
     * 加载状态
     * 控制用户信息加载时的加载指示器显示
     */
    const [loading, setLoading] = useState<boolean>(false)
    
    /**
     * 设置抽屉显示状态
     * 控制设置抽屉的显示/隐藏
     */
    const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false)
    
    /**
     * 抽屉动画值
     * 控制设置抽屉的滑入滑出动画
     */
    const drawerTranslateX = useState(new Animated.Value(Dimensions.get('window').width))[0]
    
    /**
     * 搜索关键词状态
     * 存储用户输入的搜索关键词
     */
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    
    /**
     * WebView显示状态
     * 控制是否显示应用预览的WebView
     */
    const [showWebView, setShowWebView] = useState<boolean>(false)
    
    /**
     * WebView URL状态
     * 存储当前预览的应用URL
     */
    const [webViewUrl, setWebViewUrl] = useState<string>('')

    /**
     * 分页数据管理
     * 使用统一的分页hook管理我的应用列表数据
     * 
     * 配置项：
     * - pageSize: 每页显示10条数据
     * - fetchFunction: 使用myAppList接口获取数据
     * - initialParams: 初始查询参数（应用名称）
     * - autoLoad: false - 不自动加载数据，等待用户信息加载完成后再加载
     */
    const {
        data: appData,
        loading: appLoading,
        refreshing,
        hasMore,
        loadMore,
        onRefresh,
        updateParams,
        loadData,
    } = usePagination<AppVO>({
        pageSize: 10,
        fetchFunction: myAppList,
        initialParams: {
            appName: '',
        },
        autoLoad: false,
    })

    /**
     * 组件挂载时加载用户信息
     * 在页面首次渲染时从后端获取用户信息
     */
    useEffect(() => {
        loadUserInfo()
    }, [])

    /**
     * 用户信息加载完成后加载应用列表
     * 确保用户信息可用后再加载应用数据
     */
    useEffect(() => {
        if (userInfo) {
            loadData(true)
        }
    }, [userInfo, loadData])

    /**
     * 搜索防抖处理
     * 当搜索关键词变化时，延迟500ms后更新查询参数
     * 避免频繁触发API请求，提升性能
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            updateParams({
                appName: searchKeyword,
            })
        }, 500)

        /**
         * 组件卸载或搜索关键词变化时清除定时器
         */
        return () => clearTimeout(timer)
    }, [searchKeyword])

    /**
     * 加载用户信息
     * 从后端API获取当前登录用户的详细信息
     * 成功时更新userInfo状态
     * 失败时显示错误提示
     */
    function loadUserInfo() {
        setLoading(true)
        getUserInfo().then((res: any) => {
            /**
             * 更新用户信息状态
             */
            setUserInfo(res.data)
        }).catch(err => {
            /**
             * 获取用户信息失败，显示错误提示
             */
            Alert.alert('错误', err.message || '获取用户信息失败')
        }).finally(() => {
            /**
             * 无论成功或失败，都关闭加载状态
             */
            setLoading(false)
        })
    }

    /**
     * 处理搜索输入
     * 更新搜索关键词状态
     * @param text - 用户输入的搜索文本
     */
    const handleSearch = (text: string) => {
        setSearchKeyword(text)
    }

    /**
     * 处理查看应用
     * 在WebView中预览应用
     * @param app - 应用数据对象
     */
    const handleViewApp = (app: AppVO) => {
        /**
         * 验证应用信息是否完整
         * 必须包含应用ID、代码生成类型和部署密钥
         */
        if (app.id && app.codeGenType && app.deployKey) {
            /**
             * 生成应用预览URL
             */
            const url = getStaticPreviewUrl(app.codeGenType, app.id.toString(), app.deployKey)
            setWebViewUrl(url)
            setShowWebView(true)
        } else {
            /**
             * 应用信息不完整，显示提示
             */
            Alert.alert('提示', '应用信息不完整，无法预览')
        }
    }

    /**
     * 处理查看对话
     * 跳转到对话页面查看应用对话历史
     * @param app - 应用数据对象
     */
    const handleViewConversation = (app: AppVO) => {
        /**
         * 验证应用ID是否存在
         */
        if (app.id) {
            /**
             * 跳转到对话页面，传递应用ID参数
             */
            router.push({ pathname: '/code/chat', params: { appId: app.id.toString() } })
        } else {
            /**
             * 应用ID不存在，显示提示
             */
            Alert.alert('提示', '应用ID不存在，无法查看对话')
        }
    }

    /**
     * 处理退出登录
     * 显示确认对话框，用户确认后执行退出操作
     * 清除用户信息并调用退出登录API
     */
    const handleLogout = () => {
        Alert.alert(
            '退出登录',
            '确定要退出登录吗？',
            [
                { text: '取消', style: 'cancel' },
                { 
                    text: '确定', 
                    onPress: () => {
                        /**
                         * 调用退出登录API
                         */
                        userLogout().then(() => {
                            /**
                             * 清除用户信息状态
                             */
                            setUserInfo(null)
                        }).catch(err => {
                            /**
                             * 退出登录失败，显示错误提示
                             */
                            Alert.alert('错误', err.message || '退出登录失败')
                        })
                    }
                }
            ]
        )
    }

    /**
     * 打开设置抽屉
     * 使用动画将抽屉从右侧滑入
     */
    const openDrawer = () => {
        setShowSettingsDrawer(true)
        Animated.timing(drawerTranslateX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start()
    }

    /**
     * 关闭设置抽屉
     * 使用动画将抽屉滑出到屏幕右侧
     * 动画完成后隐藏抽屉
     */
    const closeDrawer = () => {
        Animated.timing(drawerTranslateX, {
            toValue: Dimensions.get('window').width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowSettingsDrawer(false)
        })
    }

    /**
     * 处理设置按钮点击
     * 关闭抽屉并跳转到设置页面
     */
    const handleSettingsClick = () => {
        closeDrawer()
        router.push('/settings')
    }

    const renderAppCard = ({ item, index }: { item: AppVO, index: number }) => {
        return (
            <AppCard 
                app={item} 
                key={index} 
                onViewApp={() => handleViewApp(item)}
                onViewConversation={() => handleViewConversation(item)}
            />
        )
    }

    const renderSkeletonList = () => {
        const skeletons = Array.from({ length: 3 }, (_, index) => (
            <AppCardSkeleton key={index} />
        ))
        return <View style={styles.listContent}>{skeletons}</View>
    }

    const renderEmpty = () => {
        if (appLoading) return null
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {searchKeyword ? '暂无搜索结果' : '暂无应用'}
                </Text>
            </View>
        )
    }

    const renderFooter = () => {
        if (!appLoading || appData.length === 0) return null
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={themeColor} />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <MineSkeleton />
            ) : userInfo ? (
                <View style={styles.contentContainer}>
                    <View style={styles.profileSection}>
                        <TouchableOpacity 
                            style={styles.settingsIcon}
                            onPress={openDrawer}
                        >
                            <Icon name="settings" type="material" size={28} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.avatarContainer}>
                            <Avatar
                                rounded
                                size="large"
                                source={userInfo.userAvatar ? { uri: userInfo.userAvatar } : undefined}
                                icon={{ name: 'user', type: 'font-awesome' }}
                                containerStyle={[styles.avatar, { backgroundColor: themeColor }]}
                            />
                        </View>
                        <Text style={styles.userName}>{userInfo.userName || '用户'}</Text>
                        <Text style={styles.userAccount}>{userInfo.userAccount || ''}</Text>
                        {userInfo.userProfile && (
                            <Text style={styles.userProfile}>{userInfo.userProfile}</Text>
                        )}
                    </View>

                    <Divider style={styles.divider} />

                    <View style={styles.appsSection}>
                        <Text style={styles.sectionTitle}>我的应用</Text>
                        
                        <SearchBar
                            placeholder="搜索应用名称"
                            onChangeText={handleSearch}
                            value={searchKeyword}
                            platform="default"
                            lightTheme={true}
                            showLoading={appLoading}
                            onClear={() => {
                                setSearchKeyword('')
                            }}
                            containerStyle={styles.searchContainer}
                            inputContainerStyle={styles.searchInputContainer}
                        />

                        {appLoading && appData.length === 0 ? (
                            renderSkeletonList()
                        ) : (
                            <FlatList
                                data={appData}
                                renderItem={renderAppCard}
                                keyExtractor={(item, index) => index.toString()}
                                ListEmptyComponent={renderEmpty}
                                ListFooterComponent={renderFooter}
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                        colors={[themeColor]}
                                    />
                                }
                                onEndReached={loadMore}
                                onEndReachedThreshold={0.1}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </View>
            ) : (
                <View style={styles.notLoggedInContainer}>
                    <Icon
                        name="account-circle"
                        type="material"
                        size={80}
                        color="#ccc"
                    />
                    <Text style={styles.notLoggedInText}>未登录</Text>
                    <Text style={styles.notLoggedInHint}>请先登录后查看个人信息</Text>
                </View>
            )}

            {showWebView && (
                <AppWebView 
                    uri={webViewUrl} 
                    onClose={() => setShowWebView(false)} 
                />
            )}

            {showSettingsDrawer && (
                <>
                    <TouchableOpacity 
                        style={styles.drawerOverlay}
                        activeOpacity={1}
                        onPress={closeDrawer}
                    />
                    <Animated.View 
                        style={[
                            styles.drawerContainer,
                            {
                                transform: [{ translateX: drawerTranslateX }]
                            }
                        ]}
                    >
                        <View style={styles.drawerHeader}>
                            <Text style={styles.drawerTitle}>设置</Text>
                            <TouchableOpacity onPress={closeDrawer}>
                                <Icon name="close" type="material" size={28} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            style={styles.drawerItem}
                            onPress={handleSettingsClick}
                        >
                            <Icon name="tune" type="material" size={24} color="#666" />
                            <Text style={styles.drawerItemText}>通用设置</Text>
                            <Icon name="chevron-right" type="material" size={24} color="#ccc" />
                        </TouchableOpacity>
                    </Animated.View>
                </>
            )}
        </View>
    )
}