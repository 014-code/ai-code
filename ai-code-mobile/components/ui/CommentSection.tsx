import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addComment, replyComment, deleteComment, listAppComments } from '@/api/comment';
import { addForumComment, replyForumComment, deleteForumComment, listForumComments } from '@/api/forum';
import { getUserInfo } from '@/api/user';
import styles from '@/styles/ui/CommentSection.less';

/**
 * 评论组件属性接口
 */
interface CommentSectionProps {
  /**
   * 应用ID或帖子ID
   */
  id: string;
  /**
   * 评论类型
   * - app: 应用评论
   * - forum: 论坛评论
   */
  type: 'app' | 'forum';
  /**
   * 评论数量变化回调函数
   * @param count - 当前的评论总数
   */
  onCommentCountChange?: (count: number) => void;
}

/**
 * 评论数据接口
 */
interface CommentVO {
  /**
   * 评论ID
   */
  id?: number | string;
  /**
   * 应用ID
   */
  appId?: number | string;
  /**
   * 帖子ID（论坛评论专用）
   */
  postId?: string;
  /**
   * 用户ID
   */
  userId?: number | string;
  /**
   * 父评论ID（用于回复）
   */
  parentId?: number | string;
  /**
   * 评论内容
   */
  content?: string;
  /**
   * 点赞数量
   */
  likeCount?: number;
  /**
   * 回复数量
   */
  replyCount?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 是否为主评论
   */
  mainComment?: boolean;
  /**
   * 用户信息
   */
  user?: {
    /**
     * 用户ID
     */
    id?: number | string;
    /**
     * 用户名
     */
    userName?: string;
    /**
     * 用户头像
     */
    userAvatar?: string;
  };
}

/**
 * 评论组件
 * 用于显示应用或论坛帖子的评论列表
 * 支持评论发布、回复、删除、加载更多等功能
 * 
 * @param props - 组件属性
 * @returns 评论组件
 * 
 * @example
 * ```tsx
 * <CommentSection
 *   id="123"
 *   type="app"
 *   onCommentCountChange={(count) => console.log(count)}
 * />
 * ```
 */
const CommentSection: React.FC<CommentSectionProps> = ({ id, type, onCommentCountChange }) => {
  /**
   * 获取安全区域边距
   * 用于适配不同设备的安全区域（如刘海屏、圆角屏等）
   */
  const insets = useSafeAreaInsets();
  
  /**
   * 评论列表数据
   */
  const [comments, setComments] = useState<CommentVO[]>([]);
  /**
   * 加载状态
   */
  const [loading, setLoading] = useState(false);
  /**
   * 是否还有更多数据
   */
  const [hasMore, setHasMore] = useState(true);
  /**
   * 当前页码
   */
  const [pageNum, setPageNum] = useState(1);
  /**
   * 每页显示数量
   */
  const [pageSize] = useState(10);
  /**
   * 正在回复的评论对象
   */
  const [replyingTo, setReplyingTo] = useState<CommentVO | null>(null);
  /**
   * 评论输入框内容
   */
  const [commentContent, setCommentContent] = useState('');
  /**
   * 当前登录用户信息
   */
  const [loginUser, setLoginUser] = useState<any>();
  /**
   * 提交状态
   */
  const [submitting, setSubmitting] = useState(false);

  /**
   * ScrollView引用
   */
  const scrollViewRef = useRef<ScrollView>(null);
  /**
   * 加载状态引用
   * 用于防止重复加载
   */
  const loadingRef = useRef(false);

  /**
   * 组件挂载时加载评论和用户信息
   */
  useEffect(() => {
    loadComments();
    loadUserInfo();
  }, [id, type]);

  /**
   * 加载当前登录用户信息
   */
  const loadUserInfo = () => {
    getUserInfo().then(res => {
      if (res.code === 0) {
        setLoginUser(res.data);
      }
    }).catch(error => {
      console.error('获取用户信息失败：', error);
    });
  };

  /**
   * 加载评论列表
   * 根据type参数调用不同的API接口
   */
  const loadComments = () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    const apiCall = type === 'app' 
      ? listAppComments({
          appId: Number(id),
          pageNum: 1,
          pageSize,
          sortField: 'createTime',
          sortOrder: 'desc'
        })
      : listForumComments({
          appId: id,
          pageNum: 1,
          pageSize,
          commentType: 1,
        });

    apiCall.then(res => {
      if (res.code === 0 && res.data) {
        const records = res.data.records || [];
        setComments(records);
        setHasMore(records.length >= pageSize);
        setPageNum(1);
        onCommentCountChange?.(records.length);
      }
    }).catch(error => {
      console.error('加载评论失败：', error);
      Alert.alert('错误', '加载评论失败');
    }).finally(() => {
      setLoading(false);
      loadingRef.current = false;
    });
  };

  /**
   * 加载更多评论
   * 当用户滚动到底部时触发
   */
  const loadMoreComments = () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = pageNum + 1;

    const apiCall = type === 'app'
      ? listAppComments({
          appId: Number(id),
          pageNum: nextPage,
          pageSize,
          sortField: 'createTime',
          sortOrder: 'desc'
        })
      : listForumComments({
          appId: id,
          pageNum: nextPage,
          pageSize,
          commentType: 1,
        });

    apiCall.then(res => {
      if (res.code === 0 && res.data) {
        const newComments = res.data.records || [];
        setComments(prev => [...prev, ...newComments]);
        setHasMore(newComments.length >= pageSize);
        setPageNum(nextPage);
      }
    }).catch(error => {
      console.error('加载更多评论失败：', error);
      Alert.alert('错误', '加载更多评论失败');
    }).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 添加评论
   */
  const handleAddComment = () => {
    if (!commentContent.trim()) {
      Alert.alert('提示', '请输入评论内容');
      return;
    }

    setSubmitting(true);
    const apiCall = type === 'app'
      ? addComment({
          appId: Number(id),
          content: commentContent.trim()
        })
      : addForumComment({
          appId: id,
          content: commentContent.trim(),
          commentType: 1,
        });

    apiCall.then(res => {
      if (res.code === 0) {
        setCommentContent('');
        loadComments();
      } else {
        Alert.alert('失败', res.message || '评论失败');
      }
    }).catch(error => {
      Alert.alert('失败', '评论失败');
      console.error('评论失败：', error);
    }).finally(() => {
      setSubmitting(false);
    });
  };

  /**
   * 回复评论
   */
  const handleReply = () => {
    if (!commentContent.trim()) {
      Alert.alert('提示', '请输入回复内容');
      return;
    }

    if (!replyingTo?.id) {
      Alert.alert('提示', '请选择要回复的评论');
      return;
    }

    setSubmitting(true);
    const apiCall = type === 'app'
      ? replyComment({
          parentId: Number(replyingTo.id),
          content: commentContent.trim()
        })
      : replyForumComment({
          parentId: String(replyingTo.id),
          content: commentContent.trim()
        });

    apiCall.then(res => {
      if (res.code === 0) {
        setCommentContent('');
        setReplyingTo(null);
        loadComments();
      } else {
        Alert.alert('失败', res.message || '回复失败');
      }
    }).catch(error => {
      Alert.alert('失败', '回复失败');
      console.error('回复失败：', error);
    }).finally(() => {
      setSubmitting(false);
    });
  };

  /**
   * 删除评论
   * @param commentId - 要删除的评论ID
   */
  const handleDelete = (commentId: number | string) => {
    Alert.alert('确认', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => {
          const apiCall = type === 'app'
            ? deleteComment(Number(commentId))
            : deleteForumComment(String(commentId));

          apiCall.then(res => {
            if (res.code === 0) {
              Alert.alert('成功', '删除成功');
              loadComments();
            } else {
              Alert.alert('失败', res.message || '删除失败');
            }
          }).catch(error => {
            Alert.alert('失败', '删除失败');
            console.error('删除失败：', error);
          });
        }
      }
    ]);
  };

  /**
   * 点赞评论
   * @param commentId - 要点赞的评论ID
   */
  const handleLike = (commentId: number) => {
    Alert.alert('提示', '点赞功能开发中');
  };

  /**
   * 渲染单个评论项
   * @param comment - 评论数据对象
   * @returns 评论项组件
   */
  const renderCommentItem = (comment: CommentVO) => {
    const isMainComment = !comment.parentId;
    const canDelete = loginUser && comment.userId === loginUser.id;

    return (
      <View key={comment.id} style={[isMainComment ? styles.mainComment : styles.replyComment, isMainComment && { marginBottom: 16 }]}>
        <View style={styles.commentHeader}>
          <Avatar
            rounded
            source={comment.user?.userAvatar ? { uri: comment.user.userAvatar } : undefined}
            icon={{ name: 'user', type: 'font-awesome' }}
            size={isMainComment ? 40 : 32}
            containerStyle={styles.commentAvatar}
          />
          <View style={styles.commentUserInfo}>
            <Text style={styles.commentUserName}>{comment.user?.userName || '匿名用户'}</Text>
            <Text style={styles.commentTime}>{comment.createTime || ''}</Text>
          </View>
          {canDelete && (
            <TouchableOpacity onPress={() => comment.id && handleDelete(comment.id)}>
              <Icon name="delete" type="material" size={20} color="#ff4d4f" />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.commentContent}>
          <Text style={styles.commentText}>{comment.content || ''}</Text>
        </View>
        <View style={styles.commentActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => comment.id && handleLike(comment.id)}>
            <Icon name="thumb-up" type="material" size={16} color="#666" />
            <Text style={styles.actionText}>{comment.likeCount || 0}</Text>
          </TouchableOpacity>
          {isMainComment && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setReplyingTo(comment)}>
              <Icon name="comment" type="material" size={16} color="#666" />
              <Text style={styles.actionText}>回复 {comment.replyCount || 0}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  /**
   * 过滤出主评论（没有parentId的评论）
   */
  const mainComments = comments.filter(c => !c.parentId);
  /**
   * 过滤出回复评论（有parentId的评论）
   */
  const replyComments = comments.filter(c => c.parentId);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <View style={styles.commentHeader}>
        <Text style={styles.commentHeaderTitle}>评论 ({comments.length})</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.commentsList}
        contentContainerStyle={styles.commentsContent}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
          if (isCloseToBottom && hasMore && !loading) {
            loadMoreComments();
          }
        }}
        scrollEventThrottle={400}
      >
        {loading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1890ff" />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="comments" type="material" size={48} color="#ccc" />
            <Text style={styles.emptyText}>暂无评论，快来抢沙发吧！</Text>
          </View>
        ) : (
          mainComments.map((mainComment) => {
            const replies = replyComments.filter(r => r.parentId === mainComment.id);
            return (
              <View key={mainComment.id} style={styles.commentThread}>
                {renderCommentItem(mainComment)}
                {replies.length > 0 && (
                  <View style={styles.repliesContainer}>
                    {replies.map(reply => renderCommentItem(reply))}
                  </View>
                )}
              </View>
            );
          })
        )}
        {hasMore && comments.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color="#1890ff" />
            <Text style={styles.loadMoreText}>加载更多...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.addComment, { paddingBottom: insets.bottom }]}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <View style={styles.replyingToContent}>
              <Text style={styles.replyingToText}>正在回复 {replyingTo.user?.userName || '匿名用户'}</Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Icon name="close" type="material" size={20} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.addCommentHeader}>
          <Avatar
            rounded
            source={loginUser?.userAvatar ? { uri: loginUser.userAvatar } : undefined}
            icon={{ name: 'user', type: 'font-awesome' }}
            size={40}
            containerStyle={styles.addCommentAvatar}
          />
          <View style={styles.addCommentInputContainer}>
            <TextInput
              style={styles.addCommentInput}
              placeholder={replyingTo ? `回复 ${replyingTo.user?.userName || '匿名用户'}...` : '发表你的评论...'}
              placeholderTextColor="#999"
              value={commentContent}
              onChangeText={setCommentContent}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: '#1890ff' }, (!commentContent.trim() || submitting) && styles.sendButtonDisabled]}
              onPress={replyingTo ? handleReply : handleAddComment}
              disabled={!commentContent.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Icon name="send" type="material" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentSection;
