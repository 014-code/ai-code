import { featuredList } from '@/api/app'
import { AppQueryParams } from '@/api/params/appParams'
import { AppVO } from '@/api/vo/app'
import AppCard from '@/components/AppCard'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { Searchbar } from 'react-native-paper'

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
            if (listParams.pageNum === 0) {
                // 第一页，直接设置数据
                setAppData(res.data?.records || [])
            } else {
                // 加载更多，追加数据
                setAppData(prev => [...prev, ...(res.data?.records || [])])
            }
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

    // /**
    //  * 下拉刷新
    //  */
    // const onRefresh = () => {
    //     setRefreshing(true)
    //     setListParams(prev => ({
    //         ...prev,
    //         pageNum: 1
    //     }));
    // }

    /**
     * 加载更多
     */
    const loadMore = () => {
        if (!loading && appData.length > 0) {
            setListParams(prev => ({
                ...prev,
                pageNum: prev.pageNum + 1
            }));
        }
    }

    /**
     * 渲染应用卡片
     */
    const renderAppCard = ({ item, index }: { item: AppVO, index: number }) => {
        return <AppCard app={item} key={index} />
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
                <ActivityIndicator size="small" color="#0000ff" />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* 搜索框 */}
            <Searchbar
                placeholder="搜索应用名称"
                onChangeText={handleSearch}
                value={searchKeyword}
                style={styles.searchBar}
                loading={loading}
                onClearIconPress={() => {
                    setSearchKeyword('')
                }}
                onSubmitEditing={() => {
                    getAppList();
                }}
            />
            
            {/* 应用列表 */}
            {loading && appData.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
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
                            // onRefresh={onRefresh}
                            colors={['#0000ff']}
                        />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
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
    searchBar: {
        margin: 16,
        marginBottom: 8,
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