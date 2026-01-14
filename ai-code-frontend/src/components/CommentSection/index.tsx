import React, { useState, useEffect, useRef } from 'react';
import { List, Avatar, Input, Button, message, Space, Typography, Empty, Spin } from 'antd';
import { UserOutlined, LikeOutlined, MessageOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { addComment, replyComment, deleteComment, listAppCommentsByPage } from '@/services/backend/commentController';
import { addForumComment, replyForumComment, listForumPostCommentsByPage, likeForumComment, unlikeForumComment, deleteForumComment } from '@/services/backend/forumPostController';
import { getLoginUser } from '@/services/backend/userController';
import styles from './index.module.less';

const { TextArea } = Input;
const { Text } = Typography;

interface CommentSectionProps {
  appId: string;
  commentType?: 'app' | 'forum';
  onCommentCountChange?: (count: number) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ appId, commentType = 'app', onCommentCountChange }) => {
  const [comments, setComments] = useState<API.CommentVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [mainCommentContent, setMainCommentContent] = useState('');
  const [loginUser, setLoginUser] = useState<API.LoginUserVO>();
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
    loadUserInfo();
  }, [appId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreComments();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading]);

  const loadUserInfo = () => {
    getLoginUser().then(res => {
      setLoginUser(res.data);
    }).catch(error => {
      console.error('获取用户信息失败：', error);
    });
  };

  const loadComments = () => {
    setLoading(true);
    const loadPromise = commentType === 'forum'
      ? listForumPostCommentsByPage({
          appId,
          pageNum:1,
          pageSize,
          commentType:1,
        })
      : listAppCommentsByPage({
          appId,
          pageNum:1,
          pageSize,
          sortField: 'createTime',
          sortOrder: 'desc'
        });

    loadPromise.then(res => {
      setComments(res.data.records || []);
      setHasMore((res.data.records?.length || 0) >= pageSize);
      setPageNum(1);
      setTotal(res.data.totalRow || 0);
      onCommentCountChange?.(res.data.totalRow || 0);
    }).catch(error => {
      message.error('加载评论失败：' + error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const loadMoreComments = () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = pageNum + 1;

    const loadPromise = commentType === 'forum'
      ? listForumPostCommentsByPage({
          appId,
          pageNum: nextPage,
          pageSize,
          commentType:1,
        })
      : listAppCommentsByPage({
          appId,
          pageNum: nextPage,
          pageSize,
          sortField: 'createTime',
          sortOrder: 'desc'
        });

    loadPromise.then(res => {
      const newComments = res.data.records || [];
      setComments(prev => [...prev, ...newComments]);
      setHasMore(newComments.length >= pageSize);
      setPageNum(nextPage);
    }).catch(error => {
      message.error('加载更多评论失败：' + error.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleAddComment = () => {
    if (!mainCommentContent.trim()) {
      message.warning('请输入评论内容');
      return;
    }

    setSubmitting(true);
    const addPromise = commentType === 'forum'
      ? addForumComment({
          appId,
          content: mainCommentContent.trim(),
          commentType:1,
        })
      : addComment({
          appId,
          content: mainCommentContent.trim()
        });

    addPromise.then(res => {
      message.success('评论成功');
      setMainCommentContent('');
      loadComments();
    }).catch(error => {
      message.error('评论失败：' + error.message);
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const handleReply = (parentId: string) => {
    if (!replyContent.trim()) {
      message.warning('请输入回复内容');
      return;
    }

    setSubmitting(true);
    const replyPromise = commentType === 'forum'
      ? replyForumComment({
          parentId,
          content: replyContent.trim()
        })
      : replyComment({
          parentId,
          content: replyContent.trim()
        });

    replyPromise.then(res => {
      message.success('回复成功');
      setReplyContent('');
      setReplyingTo(null);
      loadComments();
    }).catch(error => {
      message.error('回复失败：' + error.message);
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const handleDelete = (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    const deletePromise = commentType === 'forum'
      ? deleteForumComment(commentId)
      : deleteComment({ id: Number(commentId) });

    deletePromise.then(res => {
      message.success('删除成功');
      loadComments();
    }).catch(error => {
      message.error('删除失败：' + error.message);
    });
  };

  const handleLike = (commentId: string, isLiked: boolean) => {
    if (commentType === 'forum') {
      const likePromise = isLiked
        ? unlikeForumComment(commentId)
        : likeForumComment(commentId);
      
      likePromise.then(res => {
        setComments(prev => prev.map(comment =>
          comment.id === commentId
            ? { ...comment, likeCount: (comment.likeCount || 0) + (isLiked ? -1 : 1), isLiked: !isLiked }
            : comment
        ));
      }).catch(error => {
        message.error('操作失败：' + error.message);
      });
    } else {
      message.info('点赞功能开发中');
    }
  };

  const renderCommentItem = (comment: API.CommentVO) => {
    const isMainComment = !comment.parentId;
    const canDelete = loginUser && comment.userId === loginUser.id;

    return (
      <div key={comment.id} className={isMainComment ? styles.mainComment : styles.replyComment}>
        <div className={styles.commentHeader}>
          <Avatar
            src={comment.user?.userAvatar}
            icon={!comment.user?.userAvatar && <UserOutlined />}
            size={isMainComment ? 40 : 32}
          />
          <div className={styles.commentUserInfo}>
            <Text strong>{comment.user?.userName || '匿名用户'}</Text>
            <Text type="secondary" className={styles.commentTime}>
              {comment.createTime}
            </Text>
          </div>
          {canDelete && (
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              size="small"
              onClick={() => comment.id && handleDelete(comment.id)}
            >
              删除
            </Button>
          )}
        </div>
        <div className={styles.commentContent}>
          <Text>{comment.content}</Text>
        </div>
        <div className={styles.commentActions}>
          <Space size="large">
            <Button
              type="text"
              icon={<LikeOutlined />}
              size="small"
              onClick={() => comment.id && handleLike(comment.id, comment.isLiked || false)}
            >
              {comment.likeCount || 0}
            </Button>
            {isMainComment && (
              <Button
                type="text"
                icon={<MessageOutlined />}
                size="small"
                onClick={() => setReplyingTo(comment.id || null)}
              >
                回复 {comment.replyCount || 0}
              </Button>
            )}
          </Space>
        </div>
        {replyingTo === comment.id && (
          <div className={styles.replyInput}>
            <TextArea
              rows={2}
              placeholder="输入回复内容..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onPressEnter={(e) => {
                if (e.shiftKey) return;
                e.preventDefault();
                comment.id && handleReply(comment.id);
              }}
            />
            <div className={styles.replyActions}>
              <Space>
                <Button size="small" onClick={() => setReplyingTo(null)}>
                  取消
                </Button>
                <Button
                  type="primary"
                  size="small"
                  icon={<SendOutlined />}
                  loading={submitting}
                  onClick={() => comment.id && handleReply(comment.id)}
                >
                  发送
                </Button>
              </Space>
            </div>
          </div>
        )}
      </div>
    );
  };

  const mainComments = comments.filter(c => !c.parentId);
  const replyComments = comments.filter(c => c.parentId);

  return (
    <div className={styles.commentSection}>
      <div className={styles.commentHeader}>
        <h3>评论 ({total})</h3>
      </div>

      <div className={styles.addComment}>
        <div className={styles.addCommentHeader}>
          <Avatar
            src={loginUser?.userAvatar}
            icon={!loginUser?.userAvatar && <UserOutlined />}
            size={40}
          />
          <TextArea
            rows={3}
            placeholder="发表你的评论..."
            value={mainCommentContent}
            onChange={(e) => setMainCommentContent(e.target.value)}
            onPressEnter={(e) => {
              if (e.shiftKey) return;
              e.preventDefault();
              handleAddComment();
            }}
          />
        </div>
        <div className={styles.addCommentActions}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            loading={submitting}
            onClick={handleAddComment}
          >
            发表评论
          </Button>
        </div>
      </div>

      {loading && comments.length === 0 ? (
        <div className={styles.loadingContainer}>
          <Spin />
          <div className={styles.loadingText}>加载中...</div>
        </div>
      ) : comments.length === 0 ? (
        <Empty description="暂无评论，快来抢沙发吧！" />
      ) : (
        <List
          dataSource={mainComments}
          renderItem={(mainComment) => {
            const replies = replyComments.filter(r => r.parentId === mainComment.id);
            return (
              <div key={mainComment.id} className={styles.commentThread}>
                {renderCommentItem(mainComment)}
                {replies.length > 0 && (
                  <div className={styles.repliesContainer}>
                    {replies.map(reply => renderCommentItem(reply))}
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      {hasMore && (
        <div ref={loadMoreRef} className={styles.loadMore}>
          <Spin />
          <div className={styles.loadingText}>加载更多...</div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
