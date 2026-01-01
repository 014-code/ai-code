import { featuredList } from '@/api/app'
import { AppQueryParams } from '@/api/params/appParams'
import { AppVO } from '@/api/vo/app'
import AppCard from '@/components/AppCard'
import AppWebView from '@/components/AppWebView'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { SearchBar } from 'react-native-elements'

/**
 * 全部应用页
 */
export default function List() {
    // 精选应用数据
    const [appData, setAppData] = useState<AppVO[]>([])
    // 加载状态
    const [loading, setLoading] = useState<boolean>(false)
    // 刷新状态
    const [refreshing, setRefreshing] = useState<boolean>(false)
    // 搜索关键字
    const [searchKeyword, setSearchKeyword] = useState<string>('')
    // 是否还有更多数据
    const [hasMore, setHasMore] = useState<boolean>(true)
    // WebView显示状态
    const [showWebView, setShowWebView] = useState<boolean>(false)
    // WebView URL
    const [webViewUrl, setWebViewUrl] = useState<string>('')

    // 查询参数
    const [listParams, setListParams] = useState<AppQueryParams>({
        pageNum: 1, 
        pageSize: 10,
        appName: '',
        codeGenType: ''
    })

    // 监听搜索关键词变化
    useEffect(() => {
        // 设置防抖，避免频繁请求
        const timer = setTimeout(() => {
            setHasMore(true)
            setListParams(prev => ({
                ...prev,
                appName: searchKeyword,
                pageNum: 1 // 重置页码
            }));
        }, 500); // 500ms 防抖
        
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    // 监听查询参数变化，发起请求
    useEffect(() => {
        getAppList();
    }, [listParams]);

    /**
     * 获取精选应用列表
     */
    function getAppList() {
        setLoading(true)
        featuredList(listParams).then((res: any) => {
            const records = res.data?.records || []
            const total = res.data?.total || 0
            
            if (listParams.pageNum === 1) {
                // 第一页，直接设置数据
                setAppData(records)
            } else {
                // 加载更多，追加数据
                setAppData(prev => [...prev, ...records])
            }
            
            // 判断是否还有更多数据
            setHasMore(appData.length + records.length < total)
        }).catch(err => {
            alert(err.message || '获取数据失败')
        }).finally(() => {
            setLoading(false)
            setRefreshing(false)
        })
    }

    /**
     * 搜索处理函数
     */
    const handleSearch = (text: string) => {
        setSearchKeyword(text);
    }
    /**
     * 下拉刷新
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
     */
    const loadMore = () => {
        if (!loading && hasMore && appData.length > 0) {
            setListParams(prev => ({
                ...prev,
                pageNum: prev.pageNum + 1
            }));
        }
    }

    /**
     * 查看应用
     */
    const handleViewApp = (app: AppVO) => {
        console.log("点击查看应用，应用数据:", app);
        console.log("app.id:", app.id);
        console.log("app.codeGenType:", app.codeGenType);
        console.log("app.deployKey:", app.deployKey);
        
        if (app.id && app.codeGenType && app.deployKey) {
            const url = getStaticPreviewUrl(app.codeGenType, app.id.toString(), app.deployKey)
            console.log("生成的URL:", url);
            console.log("设置showWebView为true");
            setWebViewUrl(url)
            setShowWebView(true)
            console.log("showWebView状态:", showWebView);
        } else {
            alert('应用信息不完整，无法预览')
        }
    }

    /**
     * 渲染应用卡片
     */
    const renderAppCard = ({ item, index }: { item: AppVO, index: number }) => {
        return (
            <AppCard 
                app={item} 
                key={index} 
                onViewApp={() => handleViewApp(item)}
            />
        )
    }

    /**
     * 渲染空状态
     */
    const renderEmpty = () => {
        if (loading) return null
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {searchKeyword ? '暂无搜索结果' : '暂无数据'}
                </Text>
            </View>
        )
    }

    /**
     * 渲染列表底部
     */
    const renderFooter = () => {
        if (!loading || appData.length === 0) return null
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color="#009dffff" />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* 搜索框 */}
            <SearchBar
                placeholder="搜索应用名称"
                onChangeText={handleSearch}
                value={searchKeyword}
                platform="default"
                lightTheme={true}
                showLoading={loading}
                onClear={() => {
                    setSearchKeyword('')
                }}
                onSubmitEditing={() => {
                    getAppList();
                }}
            />
            
            {/* 应用列表 */}
            {loading && appData.length === 0 ? (
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

            {/* WebView */}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
})