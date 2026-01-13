import React, { useRef, useImperativeHandle, forwardRef, useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Text, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CNRichTextEditor, { CNToolbar, getInitialObject, getDefaultStyles, convertToHtmlString, convertToObject } from 'react-native-cn-richtext-editor';
import { uploadFile } from '../../utils/upload';

/**
 * 富文本编辑器引用接口
 * 定义了父组件可以通过 ref 调用的方法
 */
export interface RichTextEditorRef {
	/**
	 * 获取编辑器当前的 HTML 内容
	 * @returns 返回编辑器内容的 HTML 字符串
	 */
	getContent: () => string;
	
	/**
	 * 设置编辑器的内容
	 * @param content 要设置的 HTML 内容字符串
	 */
	setContent: (content: string) => void;
}

/**
 * 富文本编辑器组件属性接口
 */
interface RichTextEditorProps {
	/**
	 * 编辑器的占位符文本
	 * @default '分享你的想法、经验或问题...'
	 */
	placeholder?: string;
	
	/**
	 * 内容变化时的回调函数
	 * @param content 变化后的 HTML 内容
	 */
	onChange?: (content: string) => void;
	
	/**
	 * 编辑器的初始内容（HTML 格式）
	 */
	initialContent?: string;
	
	/**
	 * 自定义样式
	 */
	style?: any;
}

/**
 * 富文本编辑器组件
 * 基于 react-native-cn-richtext-editor 实现，支持文本格式化、图片插入等功能
 * 
 * 功能特性：
 * - 文本样式：粗体、斜体、下划线、删除线
 * - 标题级别：正文、H1、H2、H3
 * - 列表：无序列表、有序列表
 * - 文本颜色：红色、绿色、蓝色、黑色
 * - 背景高亮：黄色、绿色、粉色、蓝色、橙色、紫色
 * - 图片插入：支持调用系统相机拍照并插入
 * - 内容转换：支持 HTML 与编辑器内部格式之间的双向转换
 * 
 * @param props - 组件属性
 * @param ref - 组件引用
 */
const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
	placeholder = '分享你的想法、经验或问题...',
	onChange,
	initialContent = '',
	style,
}, ref) => {
	/**
	 * 编辑器内部引用
	 * 用于调用编辑器的底层方法，如 insertImage、applyToolbar 等
	 */
	const editorRef = useRef<any>(null);
	
	/**
	 * 获取编辑器的默认样式配置
	 * 包含各种文本格式、标题、列表等的默认样式
	 */
	const defaultStyles = getDefaultStyles();

	/**
	 * 当前选中的标签类型
	 * 用于跟踪当前光标所在位置的文本块类型，如 'body'、'title'、'heading' 等
	 */
	const [selectedTag, setSelectedTag] = useState('body');
	
	/**
	 * 当前选中的文本样式列表
	 * 用于跟踪当前光标所在位置的文本样式，如 ['bold', 'italic'] 等
	 */
	const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
	
	/**
	 * 编辑器的值（编辑器内部格式）
	 * 存储编辑器内容的对象数组格式，用于与 CNRichTextEditor 组件交互
	 */
	const [value, setValue] = useState<any[]>([getInitialObject()]);

	/**
	 * 初始化内容处理
	 * 当组件接收到 initialContent 属性时，将 HTML 内容转换为编辑器内部格式
	 */
	useEffect(() => {
		// 检查是否有初始内容且不为空
		if (initialContent && initialContent.trim()) {
			try {
				// 将 HTML 字符串转换为编辑器内部的对象格式
				const convertedValue = convertToObject(initialContent);
				// 如果转换成功且有内容，则设置值；否则使用初始空对象
				setValue(convertedValue.length > 0 ? convertedValue : [getInitialObject()]);
			} catch (error) {
				// 转换失败时输出错误日志，并使用初始空对象
				console.error('Failed to convert initial HTML to object:', error);
				setValue([getInitialObject()]);
			}
		}
	}, []);

	/**
	 * 图片上传处理
	 * 将图片上传到服务器并返回服务器URL
	 * 
	 * @param imageUrl - 本地图片URI
	 */
	const handleImageUpload = async (imageUrl: string) => {
		try {
			const uploadResult: any = await uploadFile(imageUrl);
			if (uploadResult.code === 0 && uploadResult.data) {
				editorRef.current?.insertImage(uploadResult.data);
			} else {
				Alert.alert('上传失败', uploadResult.message || '图片上传失败');
			}
		} catch (uploadError) {
			console.error('Failed to upload image:', uploadError);
			Alert.alert('上传失败', '图片上传失败，请重试');
		}
	};

	/**
	 * 工具栏按钮点击事件处理
	 * 根据点击的工具类型执行相应的操作
	 * 
	 * @param toolType - 工具类型，如 'image'、'bold'、'italic' 等
	 */
	const onStyleKeyPress = async (toolType: string) => {
		if (toolType === 'image') {
			try {
				const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
				const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
				
				if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
					Alert.alert('需要权限', '请在设置中启用相机和相册权限以使用此功能');
					return;
				}

				const result = await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ['images'],
					allowsEditing: true,
					aspect: [4, 3],
					quality: 1,
				});

				if (!result.canceled && result.assets && result.assets.length > 0) {
					const imageUrl = result.assets[0].uri;
					await handleImageUpload(imageUrl);
				}
			} catch (error) {
				console.error('Failed to launch image library:', error);
				Alert.alert('错误', '无法打开相册');
			}
		} else {
			editorRef.current?.applyToolbar(toolType);
		}
	};

	/**
	 * 图片移除事件处理
	 * 当用户删除编辑器中的图片时触发
	 * 
	 * @param url - 被删除图片的 URL
	 * @param id - 被删除图片的唯一标识
	 */
	const onRemoveImage = (url: string, id: string) => {
		// 输出日志记录图片被删除
		console.log('Image removed:', url, id);
		// TODO: 可以在这里添加清理逻辑，如删除服务器上的图片等
	};

	/**
	 * 选中标签变化事件处理
	 * 当光标移动到不同类型的文本块时触发
	 * 
	 * @param tag - 新选中的标签类型，如 'body'、'title'、'heading' 等
	 */
	const onSelectedTagChanged = (tag: string) => {
		// 更新当前选中的标签状态
		setSelectedTag(tag);
	};

	/**
	 * 选中样式变化事件处理
	 * 当光标移动到不同样式的文本时触发
	 * 
	 * @param styles - 新选中的样式列表，如 ['bold', 'italic'] 等
	 */
	const onSelectedStyleChanged = (styles: string[]) => {
		// 更新当前选中的样式状态
		setSelectedStyles(styles);
	};

	/**
	 * 编辑器内容变化事件处理
	 * 当编辑器内容发生变化时触发
	 * 
	 * @param newValue - 新的编辑器内容（内部格式）
	 */
	const onValueChanged = (newValue: any[]) => {
		// 更新编辑器的值状态
		setValue(newValue);
		// 将编辑器内部格式转换为 HTML 字符串
		const htmlContent = convertToHtmlString(newValue);
		// 如果有 onChange 回调，则调用并传入 HTML 内容
		onChange?.(htmlContent);
	};

	/**
	 * 暴露给父组件的方法
	 * 通过 useImperativeHandle 实现自定义的 ref 方法
	 */
	useImperativeHandle(ref, () => ({
		/**
		 * 获取编辑器当前的 HTML 内容
		 * @returns 返回编辑器内容的 HTML 字符串
		 */
		getContent: () => {
			// 将编辑器内部格式转换为 HTML 字符串并返回
			return convertToHtmlString(value);
		},
		
		/**
		 * 设置编辑器的内容
		 * @param content 要设置的 HTML 内容字符串
		 */
		setContent: (content: string) => {
			// 如果内容不为空
			if (content && content.trim()) {
				try {
					// 将 HTML 字符串转换为编辑器内部的对象格式
					const convertedValue = convertToObject(content);
					// 如果转换成功且有内容，则设置值；否则使用初始空对象
					setValue(convertedValue.length > 0 ? convertedValue : [getInitialObject()]);
				} catch (error) {
					// 转换失败时输出错误日志，并使用初始空对象
					console.error('Failed to convert HTML to object:', error);
					setValue([getInitialObject()]);
				}
			} else {
				// 如果内容为空，则使用初始空对象
				setValue([getInitialObject()]);
			}
		},
	}));

	/**
	 * 渲染组件
	 */
	return (
		<KeyboardAvoidingView
			behavior="padding"
			enabled
			keyboardVerticalOffset={0}
			style={[styles.container, style]}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={{ flex: 1 }}>
					<View style={styles.main}>
						<CNRichTextEditor
							ref={input => editorRef.current = input} // 设置编辑器引用
							onSelectedTagChanged={onSelectedTagChanged} // 选中标签变化回调
							onSelectedStyleChanged={onSelectedStyleChanged} // 选中样式变化回调
							value={value} // 编辑器内容值
							style={{ backgroundColor: '#fff' }} // 编辑器样式
							styleList={defaultStyles} // 编辑器样式列表
							onValueChanged={onValueChanged} // 内容变化回调
							placeholder={placeholder} // 占位符文本
							onRemoveImage={onRemoveImage} // 图片移除回调
						/>
					</View>

					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbarContainer}>
				<CNToolbar
					style={styles.toolbar}
					iconSetContainerStyle={styles.iconSetContainer}
					size={30}
					iconSet={[
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'image',
								iconComponent: <Text style={styles.toolbarButton}>📷</Text>
							}]
						},
						{
							type: 'seperator'
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'bold',
								buttonTypes: 'style',
								iconComponent: <Text style={styles.toolbarButton}>B</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'italic',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.italicButton]}>I</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'underline',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.underlineButton]}>U</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'lineThrough',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.lineThroughButton]}>S</Text>
							}]
						},
						{
							type: 'seperator'
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'body',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>正文</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'title',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>H1</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'heading',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>H2</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'subheading',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>H3</Text>
							}]
						},
						{
							type: 'seperator'
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'ul',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>•</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'ol',
								buttonTypes: 'tag',
								iconComponent: <Text style={styles.toolbarButton}>1.</Text>
							}]
						},
						{
							type: 'seperator'
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'red',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.redButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'green',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.greenButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'blue',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.blueButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'black',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.blackButton]}>A</Text>
							}]
						},
						{
							type: 'seperator'
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'yellow_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.yellowHighlightButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'green_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.greenHighlightButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'pink_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.pinkHighlightButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'blue_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.blueHighlightButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'orange_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.orangeHighlightButton]}>A</Text>
							}]
						},
						{
							type: 'tool',
							iconArray: [{
								toolTypeText: 'purple_hl',
								buttonTypes: 'style',
								iconComponent: <Text style={[styles.toolbarButton, styles.purpleHighlightButton]}>A</Text>
							}]
						},
					]}
					selectedTag={selectedTag}
					selectedStyles={selectedStyles}
					onStyleKeyPress={onStyleKeyPress}
				/>
				</ScrollView>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
});

/**
 * 设置组件的显示名称
 * 用于调试和错误信息
 */
RichTextEditor.displayName = 'RichTextEditor';

/**
 * 组件样式定义
 */
const styles = StyleSheet.create({
	/**
	 * 容器样式
	 * 整个富文本编辑器的外层容器
	 */
	container: {
		borderWidth: 1, // 边框宽度
		borderColor: '#e0e0e0', // 边框颜色
		borderRadius: 8, // 边框圆角
		backgroundColor: '#fff', // 背景颜色
		overflow: 'hidden', // 隐藏溢出内容
		minHeight: 300, // 最小高度
		flexDirection: 'column', // 纵向布局
		justifyContent: 'flex-end', // 内容对齐到底部
	},
	
	/**
	 * 主内容区域样式
	 * 包含富文本编辑器的主体部分
	 */
	main: {
		flex: 1, // 占据剩余空间
		paddingTop: 10, // 顶部内边距
		paddingLeft: 15, // 左侧内边距
		paddingRight: 15, // 右侧内边距
		paddingBottom: 5, // 底部内边距
		alignItems: 'stretch', // 子元素拉伸填充宽度
	},
	
	/**
	 * 工具栏容器样式
	 * 包含工具栏的可滚动容器
	 */
	toolbarContainer: {
		height: 70, // 固定高度
		borderTopWidth: 1, // 顶部边框宽度
		borderTopColor: '#e0e0e0', // 顶部边框颜色
	},
	
	/**
	 * 工具栏样式
	 * 工具栏本身的样式
	 */
	toolbar: {
		height: 70, // 固定高度
		minWidth: '100%', // 最小宽度为 100%
		backgroundColor: 'transparent', // 背景透明
	},
	
	/**
	 * 图标容器样式
	 * 包含所有工具按钮的容器
	 */
	iconSetContainer: {
		flexDirection: 'row', // 横向排列
		alignItems: 'center', // 垂直居中
		paddingHorizontal: 10, // 水平内边距
	},
	
	/**
	 * 工具栏按钮基础样式
	 * 所有工具按钮的通用样式
	 */
	toolbarButton: {
		fontSize: 18, // 字体大小
		width: 28, // 按钮宽度
		height: 28, // 按钮高度
		textAlign: 'center', // 文本居中
		color: '#333', // 文本颜色
	},
	
	/**
	 * 斜体按钮样式
	 * 在基础样式上添加斜体效果
	 */
	italicButton: {
		fontStyle: 'italic', // 斜体样式
	},
	
	/**
	 * 下划线按钮样式
	 * 在基础样式上添加下划线效果
	 */
	underlineButton: {
		textDecorationLine: 'underline', // 下划线样式
	},
	
	/**
	 * 删除线按钮样式
	 * 在基础样式上添加删除线效果
	 */
	lineThroughButton: {
		textDecorationLine: 'line-through', // 删除线样式
	},
	
	/**
	 * 红色按钮样式
	 * 在基础样式上设置文本颜色为红色
	 */
	redButton: {
		color: '#d23431', // 红色
	},
	
	/**
	 * 绿色按钮样式
	 * 在基础样式上设置文本颜色为绿色
	 */
	greenButton: {
		color: '#4a924d', // 绿色
	},
	
	/**
	 * 蓝色按钮样式
	 * 在基础样式上设置文本颜色为蓝色
	 */
	blueButton: {
		color: '#0560ab', // 蓝色
	},
	
	/**
	 * 黑色按钮样式
	 * 在基础样式上设置文本颜色为黑色
	 */
	blackButton: {
		color: '#000000', // 黑色
	},
	
	/**
	 * 黄色高亮按钮样式
	 * 在基础样式上添加黄色背景
	 */
	yellowHighlightButton: {
		backgroundColor: '#f6e408', // 黄色背景
		paddingHorizontal: 4, // 水平内边距
	},
	
	/**
	 * 绿色高亮按钮样式
	 * 在基础样式上添加绿色背景
	 */
	greenHighlightButton: {
		backgroundColor: '#2df149', // 绿色背景
		paddingHorizontal: 4, // 水平内边距
	},
	
	/**
	 * 粉色高亮按钮样式
	 * 在基础样式上添加粉色背景
	 */
	pinkHighlightButton: {
		backgroundColor: '#f53ba7', // 粉色背景
		paddingHorizontal: 4, // 水平内边距
	},
	
	/**
	 * 蓝色高亮按钮样式
	 * 在基础样式上添加蓝色背景
	 */
	blueHighlightButton: {
		backgroundColor: '#34f3f4', // 蓝色背景
		paddingHorizontal: 4, // 水平内边距
	},
	
	/**
	 * 橙色高亮按钮样式
	 * 在基础样式上添加橙色背景
	 */
	orangeHighlightButton: {
		backgroundColor: '#ff9500', // 橙色背景
		paddingHorizontal: 4, // 水平内边距
	},
	
	/**
	 * 紫色高亮按钮样式
	 * 在基础样式上添加紫色背景
	 */
	purpleHighlightButton: {
		backgroundColor: '#af52de', // 紫色背景
		paddingHorizontal: 4, // 水平内边距
	},
});

/**
 * 导出组件
 */
export default RichTextEditor;
