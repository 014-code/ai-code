import { addApp } from '@/api/app'
import HomeBackground from '@/components/HomeBackground'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'

export default function Home() {
  const router = useRouter()
  const [inputText, setInputText] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [loading, setLoading] = useState(false)

  const presetTags = [
    '待办事项应用',
    '天气查询应用',
    '计算器应用',
    '记事本应用',
    '闹钟应用',
    '日历应用',
  ]

  /**
   * 处理标签点击
   * 将标签内容填充到输入框
   */
  const handleTagPress = (tag: string) => {
    setSelectedTag(tag)
    setInputText(`请帮我生成一个${tag}`)
  }

  /**
   * 处理创建应用
   * 调用API创建应用并跳转到对话页面
   */
  const handleCreateApp = () => {
    const text = inputText.trim()
    if (!text) {
      alert('请输入提示词')
      return
    }

    setLoading(true)

    addApp({
      appName: text,
      initPrompt: text,
    }).then(res => {
      const appId = res.data
      console.log('应用ID：', appId, '类型：', typeof appId)
      router.push({ pathname: '/code/chat', params: { appId: appId } })
    }).catch(err => {
      console.error('创建应用失败：', err)
      alert('创建应用失败')
    }).finally(() => {
      setLoading(false)
    })
  }

  return (
    <HomeBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>AI 应用生成平台</Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.iconContainer}>
              <Icon
                name="edit"
                type="material"
                size={24}
                color="#666"
              />
            </View>
            <ScrollView style={styles.scrollView}>
              <TextInput
                style={styles.textInput}
                placeholder="输入提示词生成应用..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
              />
            </ScrollView>
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

        <View style={styles.tagsContainer}>
          <Text style={styles.tagsTitle}>预设提示词</Text>
          <View style={styles.tagsWrapper}>
            {presetTags.map((tag, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.tag,
                  selectedTag === tag && styles.tagSelected,
                ]}
                onPress={() => handleTagPress(tag)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTag === tag && styles.tagTextSelected,
                  ]}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateApp}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#667eea" size="small" />
          ) : (
            <Icon name="rocket-launch" type="material" size={24} color="#fff" />
          )}
          <Text style={styles.createButtonText}>
            {loading ? '创建中...' : '创建应用'}
          </Text>
        </TouchableOpacity>
      </View>
    </HomeBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    width: '100%',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 200,
    flexDirection: 'row',
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    paddingLeft: 50,
    paddingRight: 40,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingTop: 15,
    paddingBottom: 15,
  },
  clearIconContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
  },
  tagsContainer: {
    marginTop: 30,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  tagSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderColor: '#fff',
  },
  tagText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextSelected: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  createButton: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: 'bold',
  },
})