/**
 * 论坛详情页面
 * 显示帖子详细内容，支持点赞、评论和应用展示功能
 */
import React, { useEffect, useState, useCallback } from 'react';
import { Card, message, Avatar, Space, Button, Tag, Divider } from 'antd';
import { useParams, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { EyeOutlined, LikeOutlined, MessageOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getForumPostVOById, likeForumPost, unlikeForumPost } from '@/services/backend/forumPostController';
import InteractiveBackground from '@/components/InteractiveBackground';
import AppCard from '@/pages/Code/Home/components/AppCard';
import CommentSection from '@/components/CommentSection';
import styles from './index.module.less';

/**
 * 论坛详情组件
 */
const ForumDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // 从URL参数获取帖子ID
  const navigate = useNavigate();
  
  // 状态管理
  const [postLoading, setPostLoading] = useState(false);  // 帖子加载状态
  const [post, setPost] = useState<API.ForumPostVO | null>(null);  // 帖子数据

  /**
   * 获取帖子详情
   */
  const fetchPost = useCallback(() => {
    setPostLoading(true);
    getForumPostVOById(id).then((res) => {
      setPost(res.data);
    }).catch((error: any) => {
      message.error(error?.message ?? '加载帖子失败');
    }).finally(() => {
      setPostLoading(false);
    });
  }, [id]);

  /**
   * 处理点赞/取消点赞
   */
  const handleLike = () => {
    if (!post) return;
    
    const params: API.ForumPostUpdateRequest = {
      id: post.id,
    };
    
    if (post.isLiked) {
      // 取消点赞
      unlikeForumPost(params).then(() => {
        setPost((prev) => prev ? { ...prev, likeCount: (prev.likeCount || 0) - 1, isLiked: false } : null);
      }).catch((error) => {
        message.error(error?.message ?? '操作失败');
      });
    } else {
      // 点赞
      likeForumPost(params).then(() => {
        setPost((prev) => prev ? { ...prev, likeCount: (prev.likeCount || 0) + 1, isLiked: true } : null);
      }).catch((error) => {
        message.error(error?.message ?? '操作失败');
      });
    }
  };

  /**
   * 处理评论数量变化
   * @param count 新的评论数量
   */
  const handleCommentCountChange = (count: number) => {
    setPost((prev) => prev ? { ...prev, commentCount: count } : null);
  };

  // 初始加载帖子数据
  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  return (
    <>
      <InteractiveBackground />
      <div className={styles.forumDetailContainer}>
        {/* 返回按钮 */}
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/forum')}
          className={styles.backButton}
        >
          返回列表
        </Button>

        {/* 应用卡片 */}
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

        {/* 帖子卡片 */}
        <Card loading={postLoading} className={styles.postCard}>
          {post && (
            <>
              {/* 帖子头部 */}
              <div className={styles.postHeader}>
                <div className={styles.postTitle}>
                  {/* 置顶标签 */}
                  {post.isPinned === 1 && (
                    <Tag color="red" className={styles.pinnedTag}>置顶</Tag>
                  )}
                  {post.title}
                </div>
                {/* 帖子元数据 */}
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

              {/* 作者信息 */}
              <div className={styles.postAuthor}>
                <Space>
                  <Link 
                    to={`/user/profile/${post.user?.id}`}
                    style={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Avatar size="small" src={post.user?.userAvatar} icon={post.user?.userAvatar ? undefined : <UserOutlined />} />
                    <span className={styles.authorName}>{post.user?.userName}</span>
                  </Link>
                  <span className={styles.createTime}>{post.createTime}</span>
                </Space>
              </div>

              {/* 帖子内容 */}
              <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content || '' }} />
            </>
          )}
        </Card>

        {/* 评论区 */}
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