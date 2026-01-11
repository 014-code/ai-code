import { addApp, listAllPresetPrompts } from '@/api/app'
import HomeBackground from '@/components/background/HomeBackground'
import HomeSkeleton from '@/components/skeleton/HomeSkeleton'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View, FlatList } from 'react-native'
import { Icon } from 'react-native-elements'
import { useTheme } from '@/hooks/useTheme'
import Logo from '@/components/ui/Logo'
import styles, { getDynamicStyles } from './home.less'

/**
 * 首页组件
 * 提供AI应用生成平台的入口界面，用户可以输入提示词或选择预设标签来创建应用
 */
export default function Home() {
  /**
   * 路由导航钩子
   * 用于在应用中进行页面跳转
   */
  const router = useRouter()
  
  /**
   * 主题管理钩子
   * 获取当前主题色，用于动态设置UI元素颜色
   */
  const { themeColor } = useTheme()
  
  /**
   * 输入框文本状态
   * 存储用户输入的提示词内容
   */
  const [inputText, setInputText] = useState('')
  
  /**
   * 选中的标签状态
   * 存储当前选中的预设标签文本
   */
  const [selectedTag, setSelectedTag] = useState('')
  
  /**
   * 加载状态
   * 控制创建应用时的加载指示器显示
   */
  const [loading, setLoading] = useState(false)
  
  /**
   * 预设提示词列表
   * 存储从后端获取的预设提示词数据
   */
  const [presetPrompts, setPresetPrompts] = useState<any[]>([])
  
  /**
   * 打字动画占位符
   * 存储当前显示的打字动画文本，用于输入框占位符
   */
  const [typingPlaceholder, setTypingPlaceholder] = useState('')

  /**
   * 组件挂载时加载预设提示词
   * 在页面首次渲染时从后端获取预设提示词列表
   */
  useEffect(() => {
    loadPresetPrompts()
  }, [])

  /**
   * 打字动画效果
   * 当预设提示词加载完成后，循环显示每个提示词的打字和删除效果
   * 
   * 动画流程：
   * 1. 打字阶段：逐字显示当前提示词（每150ms一个字符）
   * 2. 停顿阶段：显示完整提示词3秒
   * 3. 删除阶段：逐字删除当前提示词（每80ms一个字符）
   * 4. 切换阶段：切换到下一个提示词，停顿500ms后继续循环
   */
  useEffect(() => {
    /**
     * 如果预设提示词列表为空，不执行动画
     */
    if (presetPrompts.length === 0) return;

    /**
     * 当前字符索引
     * 控制打字和删除的进度
     */
    let charIndex = 0;
    
    /**
     * 是否处于删除状态
     * true表示正在删除，false表示正在打字
     */
    let isDeleting = false;
    
    /**
     * 当前提示词索引
     * 控制循环显示哪个提示词
     */
    let currentIndex = 0;

    /**
     * 打字动画函数
     * 递归调用实现动画效果
     */
    const typeEffect = () => {
      /**
       * 获取当前提示词文本
       */
      const currentPrompt = presetPrompts[currentIndex].prompt || '';
      
      /**
       * 打字阶段
       * 如果未完成打字，逐字显示
       */
      if (!isDeleting && charIndex < currentPrompt.length) {
        setTypingPlaceholder(currentPrompt.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeEffect, 150);
      } 
      /**
       * 打字完成，进入停顿阶段
       * 显示完整提示词3秒后开始删除
       */
      else if (!isDeleting && charIndex >= currentPrompt.length) {
        setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, 3000);
      } 
      /**
       * 删除阶段
       * 逐字删除提示词
       */
      else if (isDeleting && charIndex > 0) {
        setTypingPlaceholder(currentPrompt.substring(0, charIndex - 1));
        charIndex--;
        setTimeout(typeEffect, 80);
      } 
      /**
       * 删除完成，切换到下一个提示词
       * 更新索引并重新开始打字
       */
      else {
        isDeleting = false;
        charIndex = 0;
        currentIndex = (currentIndex + 1) % presetPrompts.length;
        setTimeout(typeEffect, 500);
      }
    };

    /**
     * 启动打字动画
     */
    typeEffect();
  }, [presetPrompts]);

  /**
   * 加载预设提示词
   * 从后端API获取预设提示词列表并更新状态
   * 
   * 调用listAllPresetPrompts接口获取数据
   * 成功时更新presetPrompts状态
   * 失败时显示错误提示
   */
  const loadPresetPrompts = async () => {
    try {
      /**
       * 调用API获取预设提示词列表
       */
      const res = await listAllPresetPrompts()
      console.log('预设提示词数据：', res.data)
      /**
       * 更新预设提示词列表状态
       */
      setPresetPrompts(res.data || [])
    } catch (error) {
      console.error('加载预设提示词失败：', error)
      alert('加载预设提示词失败')
    }
  }

  /**
   * 处理标签点击
   * 将标签内容填充到输入框，方便用户快速输入提示词
   * @param label - 选中的标签文本
   */
  const handleTagPress = (label: string) => {
    /**
     * 更新选中的标签状态
     */
    setSelectedTag(label)
    /**
     * 根据标签查找对应的提示词内容
     * 如果找不到对应的提示词，则使用标签文本本身
     */
    const prompt = presetPrompts.find(p => p.label === label)?.prompt || label
    /**
     * 将提示词填充到输入框
     */
    setInputText(prompt)
  }

  /**
   * 处理创建应用
   * 调用API创建应用并跳转到对话页面
   * 包含输入验证、API调用、错误处理和页面跳转
   */
  const handleCreateApp = () => {
    /**
     * 获取输入框文本并去除首尾空格
     */
    const text = inputText.trim()
    /**
     * 验证输入是否为空
     * 如果为空，显示提示并返回
     */
    if (!text) {
      alert('请输入提示词')
      return
    }

    /**
     * 设置加载状态为true，显示加载指示器
     */
    setLoading(true)

    /**
     * 调用创建应用API
     * 传入应用名称和初始提示词
     */
    addApp({
      appName: text,
      initPrompt: text,
    }).then(res => {
      /**
       * 获取应用ID
       */
      const appId = res.data
      console.log('应用ID：', appId, '类型：', typeof appId)
      /**
       * 跳转到对话页面
       * 传递应用ID和提示词参数
       */
      router.push({ 
        pathname: '/code/chat', 
        params: { 
          appId: appId,
          prompt: text
        } 
      })
    }).catch(err => {
      /**
       * 创建应用失败，记录错误并显示提示
       */
      console.error('创建应用失败：', err)
      alert('创建应用失败')
    }).finally(() => {
      /**
       * 无论成功或失败，都关闭加载状态
       */
      setLoading(false)
    })
  }

  return (
    /**
     * 首页背景组件
     * 提供动态的背景效果
     */
    <HomeBackground>
      <ScrollView>
      <View style={styles.container}>
        {/**
         * 页面头部
         * 包含标题和Logo
         */}
        <View style={styles.header}>
          <Text style={styles.title}>AI 应用生成平台</Text>
          <View style={styles.logoContainer}>
            <Logo size={100} />
          </View>
        </View>

        {/**
         * 输入框容器
         * 包含图标、文本输入框和清除按钮
         */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            {/**
             * 左侧编辑图标
             */}
            <View style={styles.iconContainer}>
              <Icon
                name="edit"
                type="material"
                size={24}
                color="#666"
              />
            </View>
            {/**
             * 可滚动的文本输入区域
             * 支持多行输入
             */}
            <ScrollView style={styles.scrollView}>
              <TextInput
                style={styles.textInput}
                placeholder={typingPlaceholder || "输入提示词生成应用..."}
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>
            {/**
             * 清除按钮
             * 仅在输入框有内容时显示
             */}
            {inputText && (
              <View style={styles.clearIconContainer}>
                <Icon
                  name="times-circle"
                  type="font-awesome"
                  size={24}
                  color="#999"
                  onPress={() => setInputText('')}
                />
              </View>
            )}
          </View>
        </View>

        {/**
         * 预设提示词标签区域
         * 显示所有预设提示词标签
         */}
        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>预设提示词</Text>
          <View style={styles.tagsWrapper}>
            {/**
             * 遍历预设提示词列表，渲染每个标签
             */}
            {presetPrompts.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tag,
                  selectedTag === item.label && styles.tagSelected,
                ]}
                onPress={() => handleTagPress(item.label)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === item.label && getDynamicStyles(themeColor).tagTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/**
         * 创建应用按钮
         * 点击触发创建应用操作
         */}
        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateApp}
          disabled={loading}
        >
          {loading ? (
            /**
             * 加载状态：显示加载指示器
             */
            <ActivityIndicator color={themeColor} size="small" />
          ) : (
            /**
             * 正常状态：显示火箭图标
             */
            <Icon name="rocket-launch" type="material" size={24} color={themeColor} />
          )}
          <Text style={getDynamicStyles(themeColor).createButtonText}>
            {loading ? '创建中...' : '创建应用'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </HomeBackground>
  )
}