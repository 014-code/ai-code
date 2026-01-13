import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import { router } from 'expo-router';
import { listForumPostsSimple, ForumPostSimpleVO } from '@/api/forum';
import { useTheme } from '@/hooks/useTheme';

export default function ForumList() {
	const { themeColor } = useTheme();
	const [posts, setPosts] = useState<ForumPostSimpleVO[]>([]);
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [current, setCurrent] = useState(1);
	const [pageSize] = useState(10);
	const [hasMore, setHasMore] = useState(true);
	const isLoadingRef = useRef(false);

	const loadPosts = useCallback(async (isRefresh = false, page = 1) => {
		if (isLoadingRef.current) return;

		isLoadingRef.current = true;

		if (isRefresh) {
			setCurrent(1);
			setHasMore(true);
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		try {
			const res = await listForumPostsSimple({
				current: page,
				pageSize,
				sortField: 'createTime',
				sortOrder: 'desc',
			});

			if (res.data?.records) {
				const newRecords = res.data.records;
				if (isRefresh) {
					setPosts(newRecords);
				} else {
					setPosts(prev => {
						const existingIds = new Set(prev.map(p => String(p.id)));
						const uniqueRecords = newRecords.filter(r => !existingIds.has(String(r.id)));
						return [...prev, ...uniqueRecords];
					});
				}
				setHasMore(newRecords.length >= pageSize);
			}
		} catch (error) {
			console.error('加载帖子失败:', error);
		} finally {
			setRefreshing(false);
			setLoading(false);
			isLoadingRef.current = false;
		}
	}, [pageSize]);

	useEffect(() => {
		loadPosts(true, 1);
	}, []);

	const handleRefresh = () => {
		loadPosts(true, 1);
	};

	const handleLoadMore = () => {
		if (hasMore && !loading) {
			const nextPage = current + 1;
			setCurrent(nextPage);
			loadPosts(false, nextPage);
		}
	};

	const handlePostPress = (post: ForumPostSimpleVO) => {
		router.push(`/forum/detail?id=${post.id}`);
	};

	const renderPostItem = ({ item, index }: { item: ForumPostSimpleVO; index: number }) => (
		<TouchableOpacity style={styles.postItem} onPress={() => handlePostPress(item)}>
			<View style={styles.postHeader}>
				<Image source={{ uri: item.user?.userAvatar || 'https://via.placeholder.com/40' }} style={styles.avatar} />
				<View style={styles.userInfo}>
					<Text style={styles.userName}>{item.user?.userName || '匿名用户'}</Text>
					<Text style={styles.postTime}>{item.createTime || ''}</Text>
				</View>
			</View>
			<Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
			<View style={styles.postFooter}>
				<View style={styles.statItem}>
					<Icon name="thumb-up" type="material" size={16} color="#999" />
					<Text style={styles.statText}>{item.likeCount || 0}</Text>
				</View>
				<View style={styles.statItem}>
					<Icon name="comment" type="material" size={16} color="#999" />
					<Text style={styles.statText}>{item.commentCount || 0}</Text>
				</View>
				{item.app?.appName && (
					<View style={styles.appTag}>
						<Icon name="apps" type="material" size={12} color={themeColor} />
						<Text style={[styles.appName, { color: themeColor }]}>{item.app.appName}</Text>
					</View>
				)}
			</View>
		</TouchableOpacity>
	);

	const renderFooter = () => {
		if (!loading) return null;
		return (
			<View style={styles.footer}>
				<ActivityIndicator size="small" color={themeColor} />
				<Text style={styles.footerText}>加载中...</Text>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				renderItem={renderPostItem}
				keyExtractor={(item) => String(item.id)}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
						colors={[themeColor]}
						tintColor={themeColor}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.1}
				ListFooterComponent={renderFooter}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Icon name="forum" type="material" size={60} color="#ccc" />
						<Text style={styles.emptyText}>暂无帖子</Text>
					</View>
				}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				updateCellsBatchingPeriod={50}
				initialNumToRender={10}
				windowSize={10}
			/>
			<TouchableOpacity style={[styles.fab, { backgroundColor: themeColor }]} onPress={() => router.push('/forum/publish')}>
				<Icon name="add" type="material" size={28} color="#fff" />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	postItem: {
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
		backgroundColor: '#fff',
	},
	postHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 12,
	},
	userInfo: {
		flex: 1,
	},
	userName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		marginBottom: 4,
	},
	postTime: {
		fontSize: 12,
		color: '#999',
	},
	postTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
		lineHeight: 22,
	},
	postContent: {
		fontSize: 14,
		color: '#666',
		lineHeight: 20,
		marginBottom: 12,
	},
	postFooter: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	statItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginRight: 20,
	},
	statText: {
		fontSize: 12,
		color: '#999',
		marginLeft: 4,
	},
	appTag: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f0f0f0',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	appName: {
		fontSize: 12,
		marginLeft: 4,
	},
	fab: {
		position: 'absolute',
		right: 20,
		bottom: 20,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: 'center',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 20,
	},
	footerText: {
		marginLeft: 8,
		fontSize: 14,
		color: '#999',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 100,
	},
	emptyText: {
		fontSize: 16,
		color: '#999',
		marginTop: 16,
	},
});
