import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, message, List, Tag, Avatar, Space, Input, Empty, Spin, Button } from 'antd';
import { listForumPostVOByPage } from '@/services/backend/forumPostController';
import { EyeOutlined, LikeOutlined, MessageOutlined, PlusOutlined, AppstoreOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import InteractiveBackground from '@/components/InteractiveBackground';
import HotPosts from './components/HotPosts';
import styles from './index.less';

const { Search } = Input;

const PAGE_SIZE = 20;
const INTERSECTION_THRESHOLD = 0.1;

/**
 * 论坛列表页面
 * 提供帖子列表展示、搜索、发布、无限滚动加载等功能
 */
const ForumList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState<API.ForumPostVO[]>([]);
  const [searchKey, setSearchKey] = useState<string>('');
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchPosts = useCallback((isLoadMore: boolean = false, currentPageNum: number = 1) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    const params: API.ForumPostQueryRequest = {
      pageNum: currentPageNum,
      pageSize: PAGE_SIZE,
      searchKey: searchKey || undefined,
    };
    listForumPostVOByPage(params).then((res) => {
      if (res.code === 0) {
        const newPosts = res.data?.records ?? [];
        const totalCount = res.data?.totalRow ?? 0;

        setPosts((prev) => {
          const updatedPosts = isLoadMore ? [...prev, ...newPosts] : newPosts;
          setHasMore(updatedPosts.length < totalCount);
          return updatedPosts;
        });

        setTotal(totalCount);
        if (isLoadMore) {
          setPageNum((prev) => prev + 1);
        } else {
          setPageNum(2);
        }
      } else {
        message.error(res.message ?? '加载失败');
      }
    }).catch((error: any) => {
      message.error(error?.message ?? '加载失败');
    }).finally(() => {
      setLoading(false);
      setLoadingMore(false);
    });
  }, [searchKey]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchPosts(true, pageNum);
    }
  }, [loadingMore, hasMore, fetchPosts, pageNum]);

  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPageNum(1);
    setHasMore(true);
    fetchPosts(false, 1);
  };

  const handlePostClick = (postId: string) => {
    history.push(`/forum/detail/${postId}`);
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
  };

  useEffect(() => {
    setPageNum(1);
    setHasMore(true);
    fetchPosts(false, 1);
  }, [fetchPosts]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  return (
    <>
      <InteractiveBackground />
      <div className={styles.forumPageContainer}>
        <div className={styles.mainContent}>
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
                icon={<PlusOutlined />}
                onClick={() => history.push('/forum/publish')}
              >
                发布帖子
              </Button>
            </div>
          </Card>

          <Card loading={loading} className={styles.postsCard}>
            <List
              dataSource={posts}
              renderItem={(post) => (
                <List.Item
                  key={post.id}
                  className={styles.postItem}
                  onClick={() => handlePostClick(post.id!)}
                >
                  <div className={styles.postContent}>
                    <div className={styles.postHeader}>
                      <div className={styles.postTitle}>
                        {post.isPinned === 1 && (
                          <Tag color="red" className={styles.pinnedTag}>置顶</Tag>
                        )}
                        <span className={styles.titleText}>{post.title}</span>
                      </div>
                      <div className={styles.postMeta}>
                        <Space size="large">
                          <span className={styles.metaItem}>
                            <EyeOutlined /> {post.viewCount || 0}
                          </span>
                          <span className={styles.metaItem}>
                            <LikeOutlined /> {post.likeCount || 0}
                          </span>
                          <span className={styles.metaItem}>
                            <MessageOutlined /> {post.commentCount || 0}
                          </span>
                        </Space>
                      </div>
                    </div>
                    {post.app && (
                      <div className={styles.appInfo}>
                        <Space size="small">
                          <AppstoreOutlined />
                          <span className={styles.appName}>{post.app.appName}</span>
                          {post.app.appType && (
                            <Tag color="blue" className={styles.appType}>{post.app.appType}</Tag>
                          )}
                        </Space>
                      </div>
                    )}
                    <div className={styles.postBody}>
                      <div className={styles.postExcerpt}>
                        {post.content?.substring(0, 200)}
                        {post.content && post.content.length > 200 && '...'}
                      </div>
                    </div>
                    <div className={styles.postFooter}>
                      <Space>
                        <Avatar size="small" src={post.user?.userAvatar} icon={post.user?.userAvatar ? undefined : 'user'} />
                        <span className={styles.authorName}>{post.user?.userName}</span>
                        <span className={styles.createTime}>{post.createTime}</span>
                      </Space>
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {!posts.length && !loading && (
              <Empty description="暂无帖子，快来发布第一条吧～" />
            )}
            {hasMore && posts.length > 0 && (
              <div ref={loadMoreRef} className={styles.loadMoreContainer}>
                {loadingMore ? (
                  <Spin tip="加载中..." />
                ) : (
                  <span className={styles.hintText}>下拉加载更多</span>
                )}
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className={styles.loadMoreContainer}>
                <span className={styles.allLoadedText}>已加载全部 {total} 条数据</span>
              </div>
            )}
          </Card>
        </div>

        <div className={styles.sidebar}>
          <HotPosts />
        </div>
      </div>
    </>
  );
};

export default ForumList;
