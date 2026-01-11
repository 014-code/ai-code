import { featuredList } from '@/api/app'
import { AppQueryParams } from '@/api/params/appParams'
import { AppVO } from '@/api/vo/app'
import AppCard from '@/components/ui/AppCard'
import AppCardSkeleton from '@/components/skeleton/AppCardSkeleton'
import AppWebView from '@/components/ui/AppWebView'
import { getStaticPreviewUrl } from '@/utils/deployUrl'
import { usePagination } from '@/hooks/usePagination'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { useRouter } from 'expo-router'
import { useTheme } from '@/hooks/useTheme'
import styles from './list.less'

/**
 * 全部应用页
 * 展示精选应用列表，支持搜索、下拉刷新、上拉加载更多
 * 用户可以预览应用或查看应用对话
 */
export default function List() {
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
     * 使用统一的分页hook管理应用列表数据
     * 
     * 配置项：
     * - pageSize: 每页显示10条数据
     * - fetchFunction: 使用featuredList接口获取数据
     * - initialParams: 初始查询参数（应用名称和代码生成类型）
     */
    const {
        data: appData,
        loading,
        refreshing,
        hasMore,
        loadMore,
        onRefresh,
        updateParams,
    } = usePagination<AppVO>({
        pageSize: 10,
        fetchFunction: featuredList,
        initialParams: {
            appName: '',
            codeGenType: '',
        },
    })

    /**
     * 搜索防抖处理
     * 当搜索关键词变化时，延迟500ms后更新查询参数
     * 避免频繁触发API请求，提升性能
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            /**
             * 只有在搜索关键词不为空时才更新查询参数
             */
            if (searchKeyword.trim()) {
                updateParams({
                    appName: searchKeyword,
                    codeGenType: '',
                })
            }
        }, 500)

        /**
         * 组件卸载或搜索关键词变化时清除定时器
         */
        return () => clearTimeout(timer)
    }, [searchKeyword, updateParams])

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
        console.log("点击查看应用，应用数据:", app)
        console.log("app.id:", app.id)
        console.log("app.codeGenType:", app.codeGenType)
        console.log("app.deployKey:", app.deployKey)

        /**
         * 验证应用信息是否完整
         * 必须包含应用ID、代码生成类型和部署密钥
         */
        if (app.id && app.codeGenType && app.deployKey) {
            /**
             * 生成应用预览URL
             */
            const url = getStaticPreviewUrl(app.codeGenType, app.id, app.deployKey)
            console.log("生成的URL:", url)
            console.log("设置showWebView为true")
            /**
             * 更新WebView URL和显示状态
             */
            setWebViewUrl(url)
            setShowWebView(true)
            console.log("showWebView状态:", showWebView)
        } else {
            /**
             * 应用信息不完整，显示提示
             */
            alert('应用信息不完整，无法预览')
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
            alert('应用ID不存在，无法查看对话')
        }
    }

    /**
     * 渲染骨架屏列表
     * 在数据加载时显示3个骨架屏占位符
     * @returns 骨架屏列表组件
     */
    const renderSkeletonList = () => {
        /**
         * 创建3个骨架屏组件
         */
        const skeletons = Array.from({ length: 3 }, (_, index) => (
            <AppCardSkeleton key={index} />
        ))
        return <View style={styles.listContent}>{skeletons}</View>
    }

    /**
     * 渲染应用卡片
     * 为每个应用数据渲染一个卡片组件
     * @param item - 应用数据对象
     * @param index - 应用在列表中的索引
     * @returns 应用卡片组件
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
     * 渲染空状态
     * 当列表为空时显示提示信息
     * @returns 空状态组件
     */
    const renderEmpty = () => {
        /**
         * 如果正在加载，不显示空状态
         */
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
     * 显示加载指示器
     * @returns 底部加载组件
     */
    const renderFooter = () => {
        /**
         * 如果不在加载或列表为空，不显示底部
         */
        if (!loading || appData.length === 0) return null
        return (
            <View style={styles.footer}>
                <ActivityIndicator size="small" color={themeColor} />
                <Text style={styles.footerText}>加载中...</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/**
             * 搜索栏
             * 用于搜索应用名称
             */}
            <SearchBar
                placeholder="搜索应用名称"
                onChangeText={handleSearch}
                value={searchKeyword}
                platform="default"
                lightTheme={true}
                showLoading={loading}
                containerStyle={styles.searchContainer}
                inputContainerStyle={styles.searchInputContainer}
                onClear={() => {
                    setSearchKeyword('')
                }}
            />

            {/**
             * 根据加载状态显示不同内容
             * - 首次加载：显示骨架屏
             * - 已有数据：显示应用列表
             */}
            {loading && appData.length === 0 ? (
                renderSkeletonList()
            ) : (
                <FlatList
                    data={appData}
                    renderItem={renderAppCard}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={renderEmpty}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        /**
                         * 下拉刷新控制
                         * 使用主题色作为刷新指示器颜色
                         */
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[themeColor]}
                        />
                    }
                    /**
                     * 上拉加载更多
                     * 当滚动到列表底部时触发
                     */
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.1}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/**
             * 应用预览WebView
             * 当showWebView为true时显示
             */}
            {showWebView && (
                <AppWebView
                    uri={webViewUrl}
                    onClose={() => setShowWebView(false)}
                />
            )}
        </View>
    )
}