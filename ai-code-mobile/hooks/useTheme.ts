import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { THEME_COLORS, ThemeColorKey, THEME_OPTIONS } from '@/constants/theme'

const THEME_STORAGE_KEY = '@app_theme_color'

export function useTheme() {
  const [themeColor, setThemeColor] = useState<string>(THEME_COLORS.info)
  const [themeKey, setThemeKey] = useState<ThemeColorKey>('info')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTheme()
  }, [])

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && THEME_COLORS[savedTheme as ThemeColorKey]) {
        setThemeKey(savedTheme as ThemeColorKey)
        setThemeColor(THEME_COLORS[savedTheme as ThemeColorKey])
      }
    } catch (error) {
      console.error('加载主题色失败：', error)
    } finally {
      setLoading(false)
    }
  }

  const setTheme = async (key: ThemeColorKey) => {
    try {
      console.log('设置主题色：', key, '颜色值：', THEME_COLORS[key])
      const newColor = THEME_COLORS[key]
      setThemeKey(key)
      setThemeColor(newColor)
      console.log('主题色设置完成：', newColor)
      await AsyncStorage.setItem(THEME_STORAGE_KEY, key)
    } catch (error) {
      console.error('保存主题色失败：', error)
    }
  }

  const resetTheme = async () => {
    try {
      setThemeKey('primary')
      setThemeColor(THEME_COLORS.primary)
      await AsyncStorage.removeItem(THEME_STORAGE_KEY)
    } catch (error) {
      console.error('重置主题色失败：', error)
    }
  }

  return {
    themeColor,
    themeKey,
    loading,
    setTheme,
    resetTheme,
    themeOptions: THEME_OPTIONS,
  }
}
