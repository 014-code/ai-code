import { getUserInfo, userLogout } from '@/api/user'
import { myAppList } from '@/api/app'
import { AppQueryParams } from '@/api/params/appParams'
import { AppVO } from '@/api/vo/app'
import { LoginUserVO } from '@/api/vo/user'
import AppCard from '@/components/AppCard'
import AppWebView from '@/components/AppWebView'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Avatar, Button, Divider, Icon, SearchBar } from 'react-native-elements'

export default function Mine() {
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

    const handleSearch = (text: string) => {
        setSearchKeyword(text);
    }

    const onRefresh = () => {
        setRefreshing(true)
        setListParams(prev => ({
            ...prev,
            pageNum: 1
        }));
    }

    const loadMore = () => {
        if (!appLoading && hasMore && appData.length > 0) {
            setListParams(prev => ({
                ...prev,
                pageNum: prev.pageNum + 1
            }));
        }
    }

    const handleViewApp = (app: AppVO) => {
        if (app.id && app.codeGenType && app.deployKey) {
            const url = getStaticPreviewUrl(app.codeGenType, app.id.toString(), app.deployKey)
            setWebViewUrl(url)
            setShowWebView(true)
        } else {
            Alert.alert('提示', '应用信息不完整，无法预览')
        }
    }

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

    const renderAppCard = ({ item, index }: { item: AppVO, index: number }) => {
        return (
            <AppCard 
                app={item} 
                key={index} 
                onViewApp={() => handleViewApp(item)}
            />
        )
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
                <ActivityIndicator size="small" color="#009dffff" />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#009dffff" />
                </View>
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
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#009dffff" />
                            </View>
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
                        name="user-circle"
                        type="font-awesome"
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