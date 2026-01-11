import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Avatar, Icon } from 'react-native-elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { addComment, replyComment, deleteComment, listAppComments } from '@/api/comment';
import { getUserInfo } from '@/api/user';
import styles from './CommentSection.less';

interface CommentSectionProps {
  appId: string;
}

interface CommentVO {
  id?: number;
  appId?: number;
  userId?: number;
  parentId?: number;
  content?: string;
  likeCount?: number;
  replyCount?: number;
  createTime?: string;
  user?: {
    id?: number;
    userName?: string;
    userAvatar?: string;
  };
}

const CommentSection: React.FC<CommentSectionProps> = ({ appId }) => {
  const insets = useSafeAreaInsets();
  
  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize] = useState(10);
  const [replyingTo, setReplyingTo] = useState<CommentVO | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [loginUser, setLoginUser] = useState<any>();
  const [submitting, setSubmitting] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadComments();
    loadUserInfo();
  }, [appId]);

  const loadUserInfo = () => {
    getUserInfo().then(res => {
      if (res.code === 0) {
        setLoginUser(res.data);
      }
    }).catch(error => {
      console.error('获取用户信息失败：', error);
    });
  };

  const loadComments = () => {
    setLoading(true);
    listAppComments({
      appId: Number(appId),
      pageNum: 1,
      pageSize,
      sortField: 'createTime',
      sortOrder: 'desc'
    }).then(res => {
      if (res.code === 0 && res.data) {
        setComments(res.data.records || []);
        setHasMore((res.data.records?.length || 0) >= pageSize);
        setPageNum(1);
      }
    }).catch(error => {
      console.error('加载评论失败：', error);
      Alert.alert('错误', '加载评论失败');
    }).finally(() => {
      setLoading(false);
    });
  };

  const loadMoreComments = () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const nextPage = pageNum + 1;

    listAppComments({
      appId: Number(appId),
      pageNum: nextPage,
      pageSize,
      sortField: 'createTime',
      sortOrder: 'desc'
    }).then(res => {
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

  const handleAddComment = () => {
    if (!commentContent.trim()) {
      Alert.alert('提示', '请输入评论内容');
      return;
    }

    setSubmitting(true);
    addComment({
      appId: Number(appId),
      content: commentContent.trim()
    }).then(res => {
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
    replyComment({
      parentId: replyingTo.id,
      content: commentContent.trim()
    }).then(res => {
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

  const handleDelete = (commentId: number) => {
    Alert.alert('确认', '确定要删除这条评论吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        style: 'destructive',
        onPress: () => {
          deleteComment({ id: commentId }).then(res => {
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

  const handleLike = (commentId: number) => {
    Alert.alert('提示', '点赞功能开发中');
  };

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

  const mainComments = comments.filter(c => !c.parentId);
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
