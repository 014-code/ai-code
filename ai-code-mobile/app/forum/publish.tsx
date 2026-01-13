/**
 * 论坛帖子发布页面
 * 
 * 功能：
 * - 用户可以发布新的论坛帖子
 * - 支持设置帖子标题和富文本内容
 * - 可选择关联应用（精选应用或个人应用）
 * - 支持应用类型切换和分页加载
 * - 使用富文本编辑器进行内容编辑
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Icon, Overlay, Button, ListItem } from 'react-native-elements';
import { router } from 'expo-router';
import { addForumPost } from '@/api/forum';
import { myAppList, featuredList, AppVO } from '@/api/app';
import { useTheme } from '@/hooks/useTheme';
import RichTextEditor, { RichTextEditorRef } from '@/components/ui/RichTextEditor';

export default function ForumPublish() {
	const { themeColor } = useTheme();
	
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [selectedApp, setSelectedApp] = useState<AppVO | null>(null);
	const [featuredApps, setFeaturedApps] = useState<AppVO[]>([]);
	const [myApps, setMyApps] = useState<AppVO[]>([]);
	const [appType, setAppType] = useState<'featured' | 'my'>('featured');
	const [showAppPicker, setShowAppPicker] = useState(false);
	const [loading, setLoading] = useState(false);
	const [appsLoading, setAppsLoading] = useState(false);
	const [featuredPageNum, setFeaturedPageNum] = useState(1);
	const [myPageNum, setMyPageNum] = useState(1);
	const [hasMoreFeaturedApps, setHasMoreFeaturedApps] = useState(true);
	const [hasMoreMyApps, setHasMoreMyApps] = useState(true);
	const [loadingMoreApps, setLoadingMoreApps] = useState(false);
	const editorRef = useRef<RichTextEditorRef>(null);

	/**
	 * 加载应用列表
	 * 同时加载精选应用和个人应用的第一页数据
	 */
	const loadApps = async () => {
		setAppsLoading(true);
		try {
			const [featuredRes, myRes] = await Promise.all([
				featuredList({ current: 1, pageSize: 20 }),
				myAppList({ current: 1, pageSize: 20 }),
			]);

			if (featuredRes.data?.records) {
				setFeaturedApps(featuredRes.data.records);
				setHasMoreFeaturedApps(featuredRes.data.records.length < (featuredRes.data.total || 0));
				setFeaturedPageNum(2);
			}

			if (myRes.data?.records) {
				setMyApps(myRes.data.records);
				setHasMoreMyApps(myRes.data.records.length < (myRes.data.total || 0));
				setMyPageNum(2);
			}
		} catch (error) {
			console.error('加载应用列表失败:', error);
		} finally {
			setAppsLoading(false);
		}
	};

	/**
	 * 加载更多应用
	 * 根据当前应用类型加载下一页数据
	 */
	const loadMoreApps = async () => {
		if (loadingMoreApps) return;

		const isFeatured = appType === 'featured';
		const hasMore = isFeatured ? hasMoreFeaturedApps : hasMoreMyApps;
		const pageNum = isFeatured ? featuredPageNum : myPageNum;

		if (!hasMore) return;

		setLoadingMoreApps(true);
		try {
			const apiCall = isFeatured ? featuredList : myAppList;
			const res = await apiCall({ current: pageNum, pageSize: 20 });

			if (res.data?.records) {
				const newApps = res.data.records;
				const totalCount = res.data.total || 0;

				if (isFeatured) {
					setFeaturedApps((prev) => [...prev, ...newApps]);
					setHasMoreFeaturedApps(featuredApps.length + newApps.length < totalCount);
					setFeaturedPageNum((prev) => prev + 1);
				} else {
					setMyApps((prev) => [...prev, ...newApps]);
					setHasMoreMyApps(myApps.length + newApps.length < totalCount);
					setMyPageNum((prev) => prev + 1);
				}
			}
		} catch (error) {
			console.error('加载更多应用失败:', error);
		} finally {
			setLoadingMoreApps(false);
		}
	};

	/**
	 * 组件挂载时加载应用列表
	 */
	useEffect(() => {
		loadApps();
	}, []);

	/**
	 * 处理发布帖子
	 * 验证输入并调用API发布帖子
	 */
	const handlePublish = async () => {
		if (!title.trim()) {
			Alert.alert('提示', '请输入帖子标题');
			return;
		}

		if (!content.trim()) {
			Alert.alert('提示', '请输入帖子内容');
			return;
		}

		setLoading(true);
		try {
			await addForumPost({
				title: title.trim(),
				content: content.trim(),
				appId: selectedApp?.id || '',
			});

			Alert.alert('发布成功', '', [
				{
					text: '确定',
					onPress: () => router.back(),
				},
			]);
		} catch (error: any) {
			Alert.alert('发布失败', error.message || '未知错误');
		} finally {
			setLoading(false);
		}
	};

	/**
	 * 处理选择应用
	 * 设置选中的应用并关闭选择器
	 */
	const handleSelectApp = (app: AppVO) => {
		setSelectedApp(app);
		setShowAppPicker(false);
	};

	/**
	 * 处理应用类型切换
	 * 切换精选应用/个人应用并清空已选应用
	 */
	const handleAppTypeChange = (type: 'featured' | 'my') => {
		setAppType(type);
		setSelectedApp(null);
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
		>
			<ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
				<View style={styles.inputContainer}>
					<TextInput
						style={styles.titleInput}
						placeholder="请输入帖子标题"
						value={title}
						onChangeText={setTitle}
						maxLength={100}
					/>
					<Text style={styles.titleCount}>{title.length}/100</Text>
				</View>

				<TouchableOpacity style={styles.appSelector} onPress={() => setShowAppPicker(true)}>
					<View style={styles.appSelectorContent}>
						<Icon name="apps" type="material" size={20} color="#999" />
						<Text style={styles.appSelectorText}>
							{selectedApp ? selectedApp.appName : '选择关联应用（可选）'}
						</Text>
					</View>
					<Icon name="chevron-right" type="material" size={24} color="#999" />
				</TouchableOpacity>

				<RichTextEditor
					ref={editorRef}
					placeholder="分享你的想法、经验或问题..."
					onChange={setContent}
					initialContent={content}
				/>
			</ScrollView>

			<View style={styles.footer}>
				<Button
					title="发布"
					onPress={handlePublish}
					loading={loading}
					disabled={loading || !title.trim() || !content.trim()}
					buttonStyle={[styles.publishButton, { backgroundColor: themeColor }]}
					titleStyle={styles.publishButtonText}
				/>
			</View>

			<Overlay
				isVisible={showAppPicker}
				onBackdropPress={() => setShowAppPicker(false)}
				overlayStyle={styles.overlay}
			>
				<View style={styles.overlayHeader}>
					<Text style={styles.overlayTitle}>选择应用</Text>
					<TouchableOpacity onPress={() => setShowAppPicker(false)}>
						<Icon name="close" type="material" size={24} color="#999" />
					</TouchableOpacity>
				</View>

				<View style={styles.appTypeSelector}>
					<TouchableOpacity
						style={[styles.appTypeButton, appType === 'featured' && styles.appTypeButtonActive]}
						onPress={() => handleAppTypeChange('featured')}
					>
						<Text style={[styles.appTypeText, appType === 'featured' && styles.appTypeTextActive]}>精选应用</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.appTypeButton, appType === 'my' && styles.appTypeButtonActive]}
						onPress={() => handleAppTypeChange('my')}
					>
						<Text style={[styles.appTypeText, appType === 'my' && styles.appTypeTextActive]}>个人应用</Text>
					</TouchableOpacity>
				</View>

				{appsLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color={themeColor} />
					</View>
				) : (
					<ScrollView style={styles.appList}>
						<ListItem
							containerStyle={styles.appListItem}
							onPress={() => setSelectedApp(null) || setShowAppPicker(false)}
						>
							<Icon name="block" type="material" size={24} color="#999" />
							<ListItem.Content>
								<ListItem.Title style={styles.appListItemTitle}>不关联应用</ListItem.Title>
							</ListItem.Content>
							{!selectedApp && <Icon name="check" type="material" size={24} color={themeColor} />}
						</ListItem>
						{(appType === 'featured' ? featuredApps : myApps).map((app) => (
							<ListItem
								key={app.id}
								containerStyle={styles.appListItem}
								onPress={() => handleSelectApp(app)}
							>
								<Icon name="apps" type="material" size={24} color={themeColor} />
								<ListItem.Content>
									<ListItem.Title style={styles.appListItemTitle}>{app.appName}</ListItem.Title>
									<ListItem.Subtitle style={styles.appListItemSubtitle}>{app.appDesc || '暂无描述'}</ListItem.Subtitle>
								</ListItem.Content>
								{selectedApp?.id === app.id && <Icon name="check" type="material" size={24} color={themeColor} />}
							</ListItem>
						))}
						{(appType === 'featured' ? hasMoreFeaturedApps : hasMoreMyApps) && (
							<TouchableOpacity style={styles.loadMoreButton} onPress={loadMoreApps}>
								{loadingMoreApps ? (
									<ActivityIndicator size="small" color={themeColor} />
								) : (
									<Text style={styles.loadMoreText}>加载更多</Text>
								)}
							</TouchableOpacity>
						)}
					</ScrollView>
				)}
			</Overlay>
		</KeyboardAvoidingView>
	);
}

/**
 * 页面样式定义
 */
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5',
	},
	scrollView: {
		flex: 1,
	},
	inputContainer: {
		backgroundColor: '#fff',
		padding: 16,
		marginBottom: 8,
	},
	titleInput: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
		minHeight: 50,
	},
	titleCount: {
		fontSize: 12,
		color: '#999',
		textAlign: 'right',
		marginTop: 8,
	},
	appSelector: {
		backgroundColor: '#fff',
		padding: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 8,
	},
	appSelectorContent: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	appSelectorText: {
		fontSize: 15,
		color: '#333',
		marginLeft: 12,
	},
	footer: {
		backgroundColor: '#fff',
		padding: 16,
		borderTopWidth: 1,
		borderTopColor: '#f0f0f0',
	},
	publishButton: {
		height: 48,
		borderRadius: 24,
	},
	publishButtonText: {
		fontSize: 16,
		fontWeight: '600',
	},
	overlay: {
		width: '90%',
		maxHeight: '80%',
		borderRadius: 12,
	},
	overlayHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingBottom: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
		marginBottom: 8,
	},
	overlayTitle: {
		fontSize: 18,
		fontWeight: '600',
		color: '#333',
	},
	appTypeSelector: {
		flexDirection: 'row',
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
		gap: 8,
	},
	appTypeButton: {
		flex: 1,
		paddingVertical: 8,
		borderRadius: 6,
		alignItems: 'center',
		backgroundColor: '#f5f5f5',
	},
	appTypeButtonActive: {
		backgroundColor: '#e3f2fd',
	},
	appTypeText: {
		fontSize: 14,
		color: '#666',
	},
	appTypeTextActive: {
		color: '#1976d2',
		fontWeight: 'bold',
	},
	loadingContainer: {
		paddingVertical: 40,
		justifyContent: 'center',
		alignItems: 'center',
	},
	appList: {
		maxHeight: 400,
	},
	appListItem: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: '#f0f0f0',
	},
	appListItemTitle: {
		fontSize: 15,
		color: '#333',
		fontWeight: '500',
	},
	appListItemSubtitle: {
		fontSize: 13,
		color: '#999',
		marginTop: 4,
	},
	loadMoreButton: {
		padding: 16,
		alignItems: 'center',
	},
	loadMoreText: {
		color: '#666',
		fontSize: 14,
	},
});
