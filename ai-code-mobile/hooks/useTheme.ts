import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { THEME_COLORS, ThemeColorKey, THEME_OPTIONS } from '@/constants/theme'

/**
 * 主题色在本地存储中的键名
 */
const THEME_STORAGE_KEY = '@app_theme_color'

/**
 * 主题管理 Hook
 * 用于管理应用的主题颜色，支持主题切换、持久化存储等功能
 *
 * @returns 主题状态和操作方法
 *
 * @example
 * ```tsx
 * const {
 *   themeColor,
 *   themeKey,
 *   loading,
 *   setTheme,
 *   resetTheme,
 *   themeOptions
 * } = useTheme()
 * ```
 */
export function useTheme() {
  /**
   * 当前主题颜色值
   * 默认为 info 主题的颜色
   */
  const [themeColor, setThemeColor] = useState<string>(THEME_COLORS.info)
  /**
   * 当前主题的键名
   * 默认为 'info'
   */
  const [themeKey, setThemeKey] = useState<ThemeColorKey>('info')
  /**
   * 主题加载状态
   * true 表示正在从本地存储加载主题
   */
  const [loading, setLoading] = useState(true)

  /**
   * 组件挂载时加载保存的主题
   */
  useEffect(() => {
    loadTheme()
  }, [])

  /**
   * 从本地存储加载主题
   * 读取之前保存的主题设置，如果存在则应用
   */
  const loadTheme = async () => {
    try {
      /**
       * 从本地存储读取保存的主题键名
       */
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY)
      /**
       * 如果保存的主题键名有效，则应用该主题
       */
      if (savedTheme && THEME_COLORS[savedTheme as ThemeColorKey]) {
        /**
         * 更新主题键名
         */
        setThemeKey(savedTheme as ThemeColorKey)
        /**
         * 更新主题颜色值
         */
        setThemeColor(THEME_COLORS[savedTheme as ThemeColorKey])
      }
    } catch (error) {
      /**
       * 捕获并打印加载主题时的错误
       */
      console.error('加载主题色失败：', error)
    } finally {
      /**
       * 无论成功还是失败，都设置加载状态为 false
       */
      setLoading(false)
    }
  }

  /**
   * 设置主题
   * 更新当前主题并保存到本地存储
   * @param key - 主题键名
   */
  const setTheme = async (key: ThemeColorKey) => {
    try {
      /**
       * 打印设置主题的日志
       */
      console.log('设置主题色：', key, '颜色值：', THEME_COLORS[key])
      /**
       * 获取新主题的颜色值
       */
      const newColor = THEME_COLORS[key]
      /**
       * 更新主题键名
       */
      setThemeKey(key)
      /**
       * 更新主题颜色值
       */
      setThemeColor(newColor)
      /**
       * 打印主题设置完成的日志
       */
      console.log('主题色设置完成：', newColor)
      /**
       * 将主题键名保存到本地存储
       */
      await AsyncStorage.setItem(THEME_STORAGE_KEY, key)
    } catch (error) {
      /**
       * 捕获并打印保存主题时的错误
       */
      console.error('保存主题色失败：', error)
    }
  }

  /**
   * 重置主题
   * 将主题重置为默认的 primary 主题，并清除本地存储
   */
  const resetTheme = async () => {
    try {
      /**
       * 重置主题键名为 'primary'
       */
      setThemeKey('primary')
      /**
       * 重置主题颜色为 primary 的颜色值
       */
      setThemeColor(THEME_COLORS.primary)
      /**
       * 从本地存储中删除保存的主题
       */
      await AsyncStorage.removeItem(THEME_STORAGE_KEY)
    } catch (error) {
      /**
       * 捕获并打印重置主题时的错误
       */
      console.error('重置主题色失败：', error)
    }
  }

  /**
   * 返回主题状态和操作方法
   */
  return {
    /**
     * 当前主题颜色值
     */
    themeColor,
    /**
     * 当前主题的键名
     */
    themeKey,
    /**
     * 主题加载状态
     */
    loading,
    /**
     * 设置主题的方法
     */
    setTheme,
    /**
     * 重置主题的方法
     */
    resetTheme,
    /**
     * 可用的主题选项列表
     */
    themeOptions: THEME_OPTIONS,
  }
}
