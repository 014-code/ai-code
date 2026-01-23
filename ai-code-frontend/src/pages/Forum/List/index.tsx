/**
 * 论坛列表页面
 * 显示帖子列表，支持搜索、无限滚动加载和发布帖子功能
 */
import React, {useEffect, useState, useRef, useCallback} from 'react';
import {Card, message, Tag, Avatar, Space, Input, Empty, Spin, Button, Row, Col} from 'antd';
import {EyeOutlined, LikeOutlined, MessageOutlined, PlusOutlined, AppstoreOutlined} from '@ant-design/icons';
import {useNavigate, Link} from 'react-router-dom';
import InteractiveBackground from '@/components/InteractiveBackground';
import HotPosts from './components/HotPosts';
import {listForumPostVOByPage} from '@/services/backend/forumPostController';
import styles from './index.module.less';

const {Search} = Input;

// 常量定义
const PAGE_SIZE = 20;  // 每页显示条数
const INTERSECTION_THRESHOLD = 0.1;  // 交叉观察器阈值

/**
 * 论坛列表组件
 */
const ForumList: React.FC = () => {
    const navigate = useNavigate();

    // 状态管理
    const [loading, setLoading] = useState(false);  // 初始加载状态
    const [loadingMore, setLoadingMore] = useState(false);  // 加载更多状态
    const [posts, setPosts] = useState<API.ForumPostVO[]>([]);  // 帖子列表
    const [searchKey, setSearchKey] = useState<string>('');  // 搜索关键词
    const [pageNum, setPageNum] = useState(1);  // 当前页码
    const [hasMore, setHasMore] = useState(true);  // 是否有更多数据
    const [total, setTotal] = useState(0);  // 总数据量

    // 引用管理
    const observerRef = useRef<IntersectionObserver | null>(null);  // 交叉观察器引用
    const loadMoreRef = useRef<HTMLDivElement>(null);  // 加载更多元素引用

    /**
     * 获取帖子列表
     * @param isLoadMore 是否为加载更多
     * @param currentPageNum 当前页码
     */
    const fetchPosts = useCallback((isLoadMore: boolean = false, currentPageNum: number = 1) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        // 构建查询参数
        const params: API.ForumPostQueryRequest = {
            pageNum: currentPageNum,
            pageSize: PAGE_SIZE,
            searchKey: searchKey || undefined,
        };

        // 调用API获取数据
        listForumPostVOByPage(params).then((res) => {
            const newPosts = res.data?.records ?? [];
            const totalCount = res.data?.totalRow ?? 0;

            // 更新帖子列表
            setPosts((prev) => {
                const updatedPosts = isLoadMore ? [...prev, ...newPosts] : newPosts;
                setHasMore(updatedPosts.length < totalCount);
                return updatedPosts;
            });

            setTotal(totalCount);

            // 更新页码
            if (isLoadMore) {
                setPageNum((prev) => prev + 1);
            } else {
                setPageNum(2);  // 首次加载后，下次从第2页开始
            }
        }).catch((error) => {
            message.error(error?.message ?? '加载失败');
        }).finally(() => {
            setLoading(false);
            setLoadingMore(false);
        });
    }, [searchKey]);

    /**
     * 加载更多数据
     */
    const loadMore = useCallback(() => {
        if (!loadingMore && hasMore) {
            fetchPosts(true, pageNum);
        }
    }, [loadingMore, hasMore, fetchPosts, pageNum]);

    /**
     * 处理搜索
     * @param value 搜索关键词
     */
    const handleSearch = (value: string) => {
        setSearchKey(value);
        setPageNum(1);
        setHasMore(true);
        fetchPosts(false, 1);
    };

    /**
     * 处理帖子点击
     * @param postId 帖子ID
     */
    const handlePostClick = (postId: string) => {
        navigate(`/forum/detail/${postId}`);
    };

    /**
     * 处理点赞
     * @param e 鼠标事件
     * @param postId 帖子ID
     */
    const handleLike = (e: React.MouseEvent, postId: string) => {
        e.stopPropagation();
        //点赞逻辑
    };

    // 初始加载数据
    useEffect(() => {
        setPageNum(1);
        setHasMore(true);
        fetchPosts(false, 1);
    }, [fetchPosts]);

    // 设置无限滚动
    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

        // 创建交叉观察器
        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            {threshold: INTERSECTION_THRESHOLD}
        );

        observerRef.current.observe(element);

        // 清理函数
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [loadMore]);

    return (
        <>
            <InteractiveBackground/>
            <div className={styles.forumPageContainer}>
                <div className={styles.mainContent}>
                    {/* 搜索卡片 */}
                    <Card className={styles.searchCard}>
                        <div className={styles.searchContainer}>
                            <Search
                                placeholder="搜索帖子标题或内容"
                                allowClear
                                size="large"
                                onSearch={handleSearch}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchKey(value);
                                    if (!value) {
                                        handleSearch('');
                                    }
                                }}
                            />
                            <Button
                                type="primary"
                                size="large"
                                icon={<PlusOutlined/>}
                                onClick={() => navigate('/forum/publish')}
                            >
                                发布帖子
                            </Button>
                        </div>
                    </Card>

                    {/* 帖子列表卡片 */}
                    <Card loading={loading} className={styles.postsCard}>
                        <Row gutter={[16, 16]}>
                            {posts.map((post) => (
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} key={post.id}>
                                    <Card
                                        className={styles.postCard}
                                        hoverable
                                        onClick={() => handlePostClick(post.id!)}
                                    >
                                        {/* 帖子头部 */}
                                        <div className={styles.postHeader}>
                                            <div className={styles.postTitle}>
                                                {post.isPinned === 1 && (
                                                    <Tag color="red" className={styles.pinnedTag}>置顶</Tag>
                                                )}
                                                <span className={styles.titleText}>{post.title}</span>
                                            </div>
                                        </div>

                                        {/* 应用信息 */}
                                        {post.app && (
                                            <div className={styles.appInfo}>
                                                <Space size="small">
                                                    <AppstoreOutlined/>
                                                    <span className={styles.appName}>{post.app.appName}</span>
                                                    {post.app.appType && (
                                                        <Tag color="blue"
                                                             className={styles.appType}>{post.app.appType}</Tag>
                                                    )}
                                                </Space>
                                            </div>
                                        )}

                                        {/* 帖子内容摘要 */}
                                        <div className={styles.postBody}>
                                            <div className={styles.postExcerpt}>
                                                {post.content?.substring(0, 200)}
                                                {post.content && post.content.length > 200 && '...'}
                                            </div>
                                        </div>

                                        {/* 帖子底部信息 */}
                                        <div className={styles.postFooter}>
                                            <Space size="middle">
                        <span className={styles.metaItem}>
                          <EyeOutlined/> {post.viewCount || 0}
                        </span>
                                                <span className={styles.metaItem}>
                          <LikeOutlined/> {post.likeCount || 0}
                        </span>
                                                <span className={styles.metaItem}>
                          <MessageOutlined/> {post.commentCount || 0}
                        </span>
                                            </Space>
                                            <Space>
                                                <Link
                                                    to={`/user/profile/${post.user?.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    style={{display: 'flex', alignItems: 'center'}}
                                                >
                                                    <Avatar size="small" src={post.user?.userAvatar}
                                                            icon={post.user?.userAvatar ? undefined : 'user'}/>
                                                    <span className={styles.authorName}>{post.user?.userName}</span>
                                                </Link>
                                                <span className={styles.createTime}>{post.createTime}</span>
                                            </Space>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* 空状态 */}
                        {!posts.length && !loading && (
                            <Empty description="暂无帖子，快来发布第一条吧～"/>
                        )}

                        {/* 加载更多 */}
                        {hasMore && posts.length > 0 && (
                            <div ref={loadMoreRef} className={styles.loadMoreContainer}>
                                {loadingMore ? (
                                    <Spin tip="加载中..."/>
                                ) : (
                                    <span className={styles.hintText}>下拉加载更多</span>
                                )}
                            </div>
                        )}

                        {/* 全部加载完成 */}
                        {!hasMore && posts.length > 0 && (
                            <div className={styles.loadMoreContainer}>
                                <span className={styles.allLoadedText}>已加载全部 {total} 条数据</span>
                            </div>
                        )}
                    </Card>
                </div>

                {/* 侧边栏 */}
                <div className={styles.sidebar}>
                    <HotPosts/>
                </div>
            </div>
        </>
    );
};

export default ForumList;
