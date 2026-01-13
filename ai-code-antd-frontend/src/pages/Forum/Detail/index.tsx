import React, { useEffect, useState, useCallback } from 'react';
import { Card, message, Avatar, Space, Button, Tag, Divider } from 'antd';
import { useParams, history } from '@umijs/max';
import { EyeOutlined, LikeOutlined, MessageOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getForumPostVOById, likeForumPost, unlikeForumPost } from '@/services/backend/forumPostController';
import InteractiveBackground from '@/components/InteractiveBackground';
import AppCard from '@/pages/Code/Home/components/AppCard';
import CommentSection from '@/components/CommentSection';
import styles from './index.less';

/**
 * 论坛帖子详情页面
 * 提供帖子详情展示、点赞、评论等功能
 */
const ForumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [postLoading, setPostLoading] = useState(false);
  const [post, setPost] = useState<API.ForumPostVO | null>(null);

  const fetchPost = useCallback(() => {
    setPostLoading(true);
    getForumPostVOById(id).then((res) => {
      if (res.code === 0) {
        setPost(res.data);
      } else {
        message.error(res.message ?? '加载帖子失败');
      }
    }).catch((error: any) => {
      message.error(error?.message ?? '加载帖子失败');
    }).finally(() => {
      setPostLoading(false);
    });
  }, [id]);

  const handleLike = () => {
    if (!post) return;
    const params: API.ForumPostUpdateRequest = {
      id: post.id,
    };
    if (post.isLiked) {
      unlikeForumPost(params).then((res) => {
        if (res.code === 0) {
          setPost((prev) => prev ? { ...prev, likeCount: (prev.likeCount || 0) - 1, isLiked: false } : null);
        } else {
          message.error(res.message ?? '操作失败');
        }
      }).catch((error: any) => {
        message.error(error?.message ?? '操作失败');
      });
    } else {
      likeForumPost(params).then((res) => {
        if (res.code === 0) {
          setPost((prev) => prev ? { ...prev, likeCount: (prev.likeCount || 0) + 1, isLiked: true } : null);
        } else {
          message.error(res.message ?? '操作失败');
        }
      }).catch((error: any) => {
        message.error(error?.message ?? '操作失败');
      });
    }
  };

  const handleCommentCountChange = (count: number) => {
    setPost((prev) => prev ? { ...prev, commentCount: count } : null);
  };

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return (
    <>
      <InteractiveBackground />
      <div className={styles.forumDetailContainer}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/forum')}
          className={styles.backButton}
        >
          返回列表
        </Button>

        {post?.app && (
          <Card className={styles.appCard} onClick={(e) => e.stopPropagation()}>
            <AppCard
              app={{
                id: Number(post.app.id),
                appName: post.app.appName || '',
                appDesc: post.app.appDesc || '',
                appType: post.app.appType || '',
                cover: post.app.cover || post.app.appCover || '',
                pageViews: post.app.pageViews || 0,
                initPrompt: post.app.initPrompt || '',
                deployKey: post.app.deployKey || '',
                codeGenType: post.app.codeGenType || '',
                user: post.app.user ? {
                  userAvatar: post.app.user.userAvatar || '',
                  userName: post.app.user.userName || ''
                } : undefined
              }}
              onCopy={(text) => {}}
            />
          </Card>
        )}

        <Card loading={postLoading} className={styles.postCard}>
          {post && (
            <>
              <div className={styles.postHeader}>
                <div className={styles.postTitle}>
                  {post.isPinned === 1 && (
                    <Tag color="red" className={styles.pinnedTag}>置顶</Tag>
                  )}
                  {post.title}
                </div>
                <div className={styles.postMeta}>
                  <Space size="large">
                    <span className={styles.metaItem}>
                      <EyeOutlined /> {post.viewCount || 0}
                    </span>
                    <span
                      className={`${styles.metaItem} ${post.isLiked ? styles.liked : ''}`}
                      onClick={handleLike}
                      style={{ cursor: 'pointer' }}
                    >
                      <LikeOutlined /> {post.likeCount || 0}
                    </span>
                    <span className={styles.metaItem}>
                      <MessageOutlined /> {post.commentCount || 0}
                    </span>
                  </Space>
                </div>
              </div>

              <Divider />

              <div className={styles.postAuthor}>
                <Space>
                  <Avatar size="small" src={post.user?.userAvatar} icon={post.user?.userAvatar ? undefined : <UserOutlined />} />
                  <span className={styles.authorName}>{post.user?.userName}</span>
                  <span className={styles.createTime}>{post.createTime}</span>
                </Space>
              </div>

              <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </>
          )}
        </Card>

        <CommentSection
          appId={id}
          commentType="forum"
          onCommentCountChange={handleCommentCountChange}
        />
      </div>
    </>
  );
};

export default ForumDetail;
