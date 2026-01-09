import { myAppList } from '@/api/app'
import { AppQueryParams } from '@/api/params/appParams'
import { getUserInfo, userLogout } from '@/api/user'
import { AppVO } from '@/api/vo/app'
import { LoginUserVO } from '@/api/vo/user'
import AppCard from '@/components/AppCard'
import AppCardSkeleton from '@/components/AppCardSkeleton'
import AppWebView from '@/components/AppWebView'
import MineSkeleton from '@/components/MineSkeleton'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Avatar, Button, Divider, Icon, SearchBar } from 'react-native-elements'
import { useRouter } from 'expo-router'

/**
 * 我的页面组件
 * 展示用户个人信息、用户创建的应用列表
 * 支持应用搜索、下拉刷新、上拉加载更多、应用预览和对话查看
 */
export default function Mine() {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState<LoginUserVO | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    
    const [appData, setAppData] = useState<AppVO[]>([])
    const [appLoading, setAppLoading] = useState<boolean>(false)
    const [refreshing, setRefreshing] = useState<boolean>(false)
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [showWebView, setShowWebView] = useState<boolean>(false)
    const [webViewUrl, setWebViewUrl] = useState<string>('')

    const [listParams, setListParams] = useState<AppQueryParams>({
        pageNum: 1, 
        pageSize: 10,
        appName: ''
    })

    useEffect(() => {
        loadUserInfo()
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            setHasMore(true)
            setListParams(prev => ({
                ...prev,
                appName: searchKeyword,
                pageNum: 1
            }));
        }, 500);
        
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    useEffect(() => {
        if (userInfo) {
            getAppList();
        }
    }, [listParams, userInfo]);

    /**
     * 加载用户信息
     * 调用API获取当前登录用户的详细信息
     */
    function loadUserInfo() {
        setLoading(true)
        getUserInfo().then((res: any) => {
            setUserInfo(res.data)
        }).catch(err => {
            Alert.alert('错误', err.message || '获取用户信息失败')
        }).finally(() => {
            setLoading(false)
        })
    }

    /**
     * 获取应用列表
     * 根据查询参数获取用户创建的应用列表
     * 支持分页加载和搜索过滤
     */
    function getAppList() {
        setAppLoading(true)
        myAppList(listParams).then((res: any) => {
            const records = res.data?.records || []
            const total = res.data?.total || 0
            
            if (listParams.pageNum === 1) {
                setAppData(records)
            } else {
                setAppData(prev => [...prev, ...records])
            }
            
            setHasMore(appData.length + records.length < total)
        }).catch(err => {
            Alert.alert('错误', err.message || '获取应用列表失败')
        }).finally(() => {
            setAppLoading(false)
            setRefreshing(false)
        })
    }

    /**
     * 处理搜索输入
     * 更新搜索关键词，触发防抖搜索
     * @param text - 搜索关键词
     */
    const handleSearch = (text: string) => {
        setSearchKeyword(text);
    }

    /**
     * 下拉刷新
     * 重置页码并重新加载应用列表
     */
    const onRefresh = () => {
        setRefreshing(true)
        setListParams(prev => ({
            ...prev,
            pageNum: 1
        }));
    }

    /**
     * 加载更多
     * 当滚动到底部时加载下一页数据
     */
    const loadMore = () => {
        if (!appLoading && hasMore && appData.length > 0) {
            setListParams(prev => ({
                ...prev,
                pageNum: prev.pageNum + 1
            }));
        }
    }

    /**
     * 查看应用预览
     * 在WebView中预览应用效果
     * @param app - 应用信息对象
     */
    const handleViewApp = (app: AppVO) => {
        if (app.id && app.codeGenType && app.deployKey) {
            const url = getStaticPreviewUrl(app.codeGenType, app.id.toString(), app.deployKey)
            setWebViewUrl(url)
            setShowWebView(true)
        } else {
            Alert.alert('提示', '应用信息不完整，无法预览')
        }
    }

    /**
     * 查看应用对话
     * 跳转到应用对话页面
     * @param app - 应用信息对象
     */
    const handleViewConversation = (app: AppVO) => {
        if (app.id) {
            router.push({ pathname: '/code/chat', params: { appId: app.id.toString() } })
        } else {
            Alert.alert('提示', '应用ID不存在，无法查看对话')
        }
    }

    /**
     * 处理退出登录
     * 显示确认对话框，确认后调用退出登录API
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
                        userLogout().then(() => {
                            setUserInfo(null)
                            setAppData([])
                        }).catch(err => {
                            Alert.alert('错误', err.message || '退出登录失败')
                        })
                    }
                }
            ]
        )
    }

    /**
     * 渲染应用卡片
     * @param item - 应用数据
     * @param index - 索引
     */
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

    /**
     * 渲染骨架屏列表
     * 在加载时显示占位内容
     */
    const renderSkeletonList = () => {
        const skeletons = Array.from({ length: 3 }, (_, index) => (
            <AppCardSkeleton key={index} />
        ))
        return <View style={styles.listContent}>{skeletons}</View>
    }

    /**
     * 渲染空状态
     * 当没有应用数据时显示提示信息
     */
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

    /**
     * 渲染列表底部加载状态
     * 在加载更多时显示加载指示器
     */
    const renderFooter = () => {
        if (!appLoading || appData.length === 0) return null
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#009dffff" />
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
                        <View style={styles.avatarContainer}>
                            <Avatar
                                rounded
                                size="large"
                                source={userInfo.userAvatar ? { uri: userInfo.userAvatar } : undefined}
                                icon={{ name: 'user', type: 'font-awesome' }}
                                containerStyle={styles.avatar}
                            />
                        </View>
                        <Text style={styles.userName}>{userInfo.userName || '用户'}</Text>
                        <Text style={styles.userAccount}>{userInfo.userAccount || ''}</Text>
                        {userInfo.userProfile && (
                            <Text style={styles.userProfile}>{userInfo.userProfile}</Text>
                        )}
                        <View style={styles.actionButtons}>
                            <Button
                                title="退出登录"
                                buttonStyle={styles.logoutButton}
                                onPress={handleLogout}
                            />
                        </View>
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
                                        colors={['#009dffff']}
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
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileSection: {
        backgroundColor: '#fff',
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        backgroundColor: '#009dffff',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    userAccount: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    userProfile: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    logoutButton: {
        backgroundColor: '#ff4d4f',
        paddingHorizontal: 32,
        borderRadius: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    appsSection: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    searchContainer: {
        backgroundColor: '#f5f5f5',
        borderTopWidth: 0,
        borderBottomWidth: 0,
        paddingHorizontal: 16,
    },
    searchInputContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    footerText: {
        marginLeft: 10,
        color: '#666',
    },
    notLoggedInContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    notLoggedInText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#666',
        marginTop: 16,
        marginBottom: 8,
    },
    notLoggedInHint: {
        fontSize: 14,
        color: '#999',
    },
})