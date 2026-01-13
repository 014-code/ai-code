import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { router, useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { getForumPost, ForumPostVO, likeForumPost, unlikeForumPost } from '@/api/forum';
import { useTheme } from '@/hooks/useTheme';
import CommentSection from '@/components/ui/CommentSection';
import { getStaticPreviewUrl } from '@/utils/deployUrl';

/**
 * 论坛详情页组件
 * 用于展示论坛帖子的详细内容
 * 支持查看帖子内容、点赞、评论等功能
 * 
 * @returns 论坛详情页组件
 */
export default function ForumDetail() {
	/**
	 * 获取路由参数中的帖子ID
	 */
	const { id } = useLocalSearchParams<{ id: string }>();
	/**
	 * 获取主题颜色
	 * 用于动态设置UI元素颜色
	 */
	const { themeColor } = useTheme();
	/**
	 * 获取窗口宽度
	 * 用于响应式布局
	 */
	const { width } = useWindowDimensions();
	/**
	 * 帖子数据状态
	 */
	const [post, setPost] = useState<ForumPostVO | null>(null);
	/**
	 * 加载状态
	 */
	const [loading, setLoading] = useState(true);

	/**
	 * 生成HTML内容
	 * 用于在WebView中渲染富文本内容
	 * @param content - 帖子内容（HTML格式）
	 * @returns 完整的HTML文档
	 */
	const generateHtml = (content: string) => {
		return `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
				<style>
					* {
						margin: 0;
						padding: 0;
						box-sizing: border-box;
					}
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
						font-size: 15px;
						line-height: 1.6;
						color: #333;
						padding: 0;
						background-color: transparent;
					}
					h1 {
						font-size: 22px;
						font-weight: bold;
						margin: 10px 0;
						color: #333;
					}
					h2 {
						font-size: 20px;
						font-weight: bold;
						margin: 8px 0;
						color: #333;
					}
					h3 {
						font-size: 18px;
						font-weight: bold;
						margin: 6px 0;
						color: #333;
					}
					h4 {
						font-size: 16px;
						font-weight: bold;
						margin: 4px 0;
						color: #333;
					}
					p {
						margin-bottom: 8px;
					}
					strong, b {
						font-weight: bold;
						color: #333;
					}
					em, i {
						font-style: italic;
						color: #333;
					}
					a {
						color: ${themeColor};
						text-decoration: underline;
					}
					code {
						background-color: #f5f5f5;
						padding: 2px 4px;
						border-radius: 3px;
						font-family: 'Courier New', monospace;
						font-size: 14px;
					}
					pre {
						background-color: #f5f5f5;
						padding: 12px;
						border-radius: 6px;
						margin: 8px 0;
						overflow-x: auto;
					}
					pre code {
						background-color: transparent;
						padding: 0;
					}
					blockquote {
						border-left: 4px solid ${themeColor};
						padding-left: 12px;
						margin: 8px 0;
						color: #666;
						font-style: italic;
					}
					ul, ol {
						margin: 8px 0;
						padding-left: 20px;
					}
					li {
						margin-bottom: 4px;
					}
					hr {
						margin: 12px 0;
						height: 1px;
						background-color: #e0e0e0;
						border: none;
					}
					img {
						max-width: 100%;
						height: auto;
						display: block;
						margin: 8px 0;
					}
					table {
						width: 100%;
						border-collapse: collapse;
						margin: 8px 0;
					}
					th, td {
						border: 1px solid #e0e0e0;
						padding: 8px;
						text-align: left;
					}
					th {
						background-color: #f5f5f5;
						font-weight: bold;
					}
				</style>
			</head>
			<body>
				${content}
			</body>
			</html>
		`;
	};

	/**
	 * 加载帖子详情
	 * 从服务器获取帖子数据并更新状态
	 */
	const loadPost = useCallback(async () => {
		if (!id) return;

		setLoading(true);
		try {
			const res = await getForumPost(id);
			if (res.data) {
				setPost(res.data);
			}
		} catch (error) {
			console.error('加载帖子失败:', error);
		} finally {
			setLoading(false);
		}
	}, [id]);

	/**
	 * 组件挂载时加载帖子
	 */
	useEffect(() => {
		loadPost();
	}, [id]);

	/**
	 * 处理点赞/取消点赞帖子
	 * 根据当前点赞状态切换点赞状态
	 */
	const handleLikePost = async () => {
		if (!post) return;

		try {
			if (post.likeCount && post.likeCount > 0) {
				await unlikeForumPost(post.id);
				setPost({ ...post, likeCount: (post.likeCount || 0) - 1 });
			} else {
				await likeForumPost(post.id);
				setPost({ ...post, likeCount: (post.likeCount || 0) + 1 });
			}
		} catch (error) {
			console.error('点赞失败:', error);
		}
	};

	/**
	 * 处理评论数量变化
	 * 当评论数量变化时更新帖子数据
	 * @param count - 新的评论数量
	 */
	const handleCommentCountChange = (count: number) => {
		if (post) {
			setPost({ ...post, commentCount: count });
		}
	};

	/**
	 * 处理应用标签点击
	 * 跳转到应用预览页面
	 */
	const handleAppTagPress = () => {
		if (post?.app?.id && post?.app?.codeGenType && post?.app?.deployKey) {
			const url = getStaticPreviewUrl(post.app.codeGenType, post.app.id, post.app.deployKey);
			router.push({ pathname: '/code/webview', params: { url } });
		}
	};

	/**
	 * 加载状态显示
	 */
	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={themeColor} />
			</View>
		);
	}

	/**
	 * 错误状态显示
	 */
	if (!post) {
		return (
			<View style={styles.errorContainer}>
				<Icon name="error-outline" type="material" size={60} color="#ccc" />
				<Text style={styles.errorText}>帖子不存在</Text>
			</View>
		);
	}

	/**
	 * 正常内容显示
	 */
	return (
		<View style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.postContainer}>
					<View style={styles.postHeader}>
						<Image source={{ uri: post.user?.userAvatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
						<View style={styles.userInfo}>
							<Text style={styles.userName}>{post.user?.userName || '匿名用户'}</Text>
							<Text style={styles.postTime}>{post.createTime || ''}</Text>
						</View>
					</View>
					<Text style={styles.postTitle}>{post.title}</Text>
					<WebView
						source={{ html: generateHtml(post.content || '') }}
						style={styles.webView}
						scrollEnabled={false}
						originWhitelist={['*']}
						scalesPageToFit={false}
						javaScriptEnabled={false}
						domStorageEnabled={false}
						startInLoadingState={false}
					/>
					{post.app?.appName && (
						<TouchableOpacity style={styles.appTag} onPress={handleAppTagPress}>
							<Icon name="apps" type="material" size={14} color={themeColor} />
							<Text style={[styles.appName, { color: themeColor }]}>{post.app.appName}</Text>
						</TouchableOpacity>
					)}
					<View style={styles.postStats}>
						<TouchableOpacity style={styles.statButton} onPress={handleLikePost}>
							<Icon name="thumb-up" type="material" size={20} color="#999" />
							<Text style={styles.statText}>{post.likeCount || 0}</Text>
						</TouchableOpacity>
						<View style={styles.statButton}>
							<Icon name="comment" type="material" size={20} color="#999" />
							<Text style={styles.statText}>{post.commentCount || 0}</Text>
						</View>
					</View>
				</View>

				{id ? <CommentSection id={id} type="forum" onCommentCountChange={handleCommentCountChange} /> : null}
			</ScrollView>
		</View>
	);
}

/**
 * 页面样式对象
 * 定义所有UI组件的样式属性
 */
const styles = StyleSheet.create({
	/**
	 * 容器样式
	 * 占据整个屏幕，灰色背景
	 */
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	/**
	 * 加载容器样式
	 * 居中显示加载指示器
	 */
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	/**
	 * 错误容器样式
	 * 居中显示错误提示
	 */
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	/**
	 * 错误文字样式
	 * 中号灰色文字，设置上边距
	 */
	errorText: {
		fontSize: 16,
		color: '#999',
		marginTop: 16,
	},
	/**
	 * 滚动视图样式
	 * 占据剩余空间
	 */
	scrollView: {
		flex: 1,
	},
	/**
	 * 帖子容器样式
	 * 白色背景，设置内边距和下边距
	 */
	postContainer: {
		backgroundColor: '#fff',
		padding: 16,
		marginBottom: 8,
	},
	/**
	 * 帖子头部样式
	 * 水平布局，设置下边距
	 */
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	/**
	 * 头像样式
	 * 圆形头像，设置宽高和右边距
	 */
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	/**
	 * 用户信息容器样式
	 * 占据剩余空间
	 */
	userInfo: {
		flex: 1,
	},
	/**
	 * 用户名样式
	 * 中号粗体文字，设置下边距
	 */
	userName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	/**
	 * 发布时间样式
	 * 小号灰色文字
	 */
	postTime: {
		fontSize: 12,
		color: '#999',
	},
	/**
	 * 帖子标题样式
	 * 大号粗体文字，设置下边距和行高
	 */
	postTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		marginBottom: 12,
		lineHeight: 26,
	},
	/**
	 * 帖子内容样式
	 * 中号文字，设置下边距和行高
	 */
	postContent: {
		fontSize: 15,
		color: '#333',
		lineHeight: 24,
		marginBottom: 12,
	},
	/**
	 * 应用标签样式
	 * 水平布局，圆角背景，设置内边距和下边距
	 */
	appTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 12,
		alignSelf: 'flex-start',
		marginBottom: 12,
	},
	/**
	 * 应用名称样式
	 * 小号文字，设置左边距
	 */
	appName: {
		fontSize: 13,
		marginLeft: 4,
	},
	/**
	 * 帖子统计样式
	 * 水平布局，设置上边距和上边框
	 */
	postStats: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
	},
	/**
	 * 统计按钮样式
	 * 水平布局，设置右边距
	 */
	statButton: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 24,
	},
	/**
	 * 统计文字样式
	 * 中号灰色文字，设置左边距
	 */
	statText: {
		fontSize: 14,
		marginLeft: 6,
	},
	/**
	 * WebView样式
	 * 透明背景，设置最小高度
	 */
	webView: {
		backgroundColor: 'transparent',
		minHeight: 100,
	},
});
