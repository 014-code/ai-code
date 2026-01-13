import { AppVO } from '@/api/vo/app'
import React, { useState } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { Avatar, Button, Icon } from 'react-native-elements'
import { useTheme } from '@/hooks/useTheme'
import styles from '@/styles/ui/AppCard.less'

/**
 * 应用卡片组件的属性接口
 */
interface AppCardProps {
  /**
   * 应用数据对象
   * 包含应用名称、作者、封面等信息
   */
  app?: AppVO
  /**
   * 点击查看对话的回调函数
   * 用户点击"查看对话"按钮时触发
   */
  onViewConversation?: () => void
  /**
   * 点击查看应用的回调函数
   * 用户点击"查看应用"按钮时触发
   */
  onViewApp?: () => void
  /**
   * 点击封面的回调函数
   * 用户点击应用封面时触发
   */
  onPressCover?: () => void
}

/**
 * 应用卡片组件
 * 用于展示应用的基本信息，包括应用名称、作者、封面等
 * 支持展开/收起操作，提供查看对话和查看应用的功能
 *
 * @param props - 组件属性
 * @returns 应用卡片组件
 *
 * @example
 * ```tsx
 * <AppCard
 *   app={appData}
 *   onViewConversation={() => navigation.navigate('conversation')}
 *   onViewApp={() => navigation.navigate('app-detail')}
 *   onPressCover={() => console.log('Cover pressed')}
 * />
 * ```
 */
export default function AppCard({
  app,
  onViewConversation = () => { },
  onViewApp = () => { },
  onPressCover = () => { },
}: AppCardProps) {
  /**
   * 获取当前主题颜色
   * 用于动态设置组件颜色
   */
  const { themeColor } = useTheme()
  /**
   * 应用名称
   * 如果应用数据中不存在 appName，则使用默认值 '测试应用1'
   */
  const appName = app?.appName || '测试应用1'
  /**
   * 作者用户名
   * 如果应用数据中不存在用户信息或用户名，则使用默认值 '未知作者'
   */
  const userName = app?.user?.userName || '未知作者'
  /**
   * 封面图片地址
   * 优先使用 cover 字段，如果不存在则使用 appCover 字段
   */
  const coverImage = app?.cover || app?.appCover
  /**
   * 作者头像地址
   */
  const appAvt = app?.userAvatar
  /**
   * 创建时间
   * 将时间戳转换为本地日期字符串格式
   */
  const createTime = app?.createTime ? new Date(app.createTime).toLocaleDateString() : ''

  /**
   * 卡片展开状态
   * true 表示展开，false 表示收起
   */
  const [isExpand, setIsExpand] = useState<boolean>(false)

  return (
    /**
     * 卡片容器
     * 包含头部、封面和操作按钮
     */
    <View style={styles.cardContainer}>
      /**
       * 卡片头部
       * 包含头像、应用名称、作者信息和展开按钮
       */
      <View style={styles.header}>
        /**
         * 头像容器
         * 包含用户头像和认证徽章
         */
        <View style={styles.avatarContainer}>
          /**
           * 用户头像
           * 如果有头像地址则显示头像，否则显示默认文件夹图标
           */
          <Avatar
            rounded
            icon={{ name: 'folder', type: 'material' }}
            size="medium"
            source={appAvt ? { uri: appAvt } : undefined}
            containerStyle={styles.avatar}
          />
          /**
           * 认证徽章
           * 显示绿色对勾图标，表示已认证
           */
          <View style={styles.avatarBadge}>
            <Icon name="check-circle" type="material" size={16} color="#4CAF50" />
          </View>
        </View>
        /**
         * 标题容器
         * 包含应用名称和元数据信息
         */
        <View style={styles.titleContainer}>
          /**
           * 应用名称文本
           */
          <Text style={styles.appName}>{appName}</Text>
          /**
           * 元数据容器
           * 包含作者名称和创建时间
           */
          <View style={styles.metaContainer}>
            /**
             * 作者图标
             */
            <Icon name="person" type="material" size={14} color="#963b3bff" />
            /**
             * 作者名称文本
             */
            <Text style={styles.metaText}>{userName}</Text>
            {
              /**
               * 创建时间
               * 只有当创建时间存在时才显示
               */
              createTime && (
                <>
                  /**
                   * 时间图标
                   */
                  <Icon name="schedule" type="material" size={14} color="#00c94dff" />
                  /**
                   * 创建时间文本
                   */
                  <Text style={styles.metaText}>{createTime}</Text>
                </>
              )
            }
          </View>
        </View>
        /**
         * 展开按钮
         * 点击切换卡片的展开/收起状态
         */
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpand(!isExpand)}
        >
          <Icon
            /**
             * 图标名称
             * 展开时显示 'expand-less'，收起时显示 'expand-more'
             */
            name={isExpand ? 'expand-less' : 'expand-more'}
            type="material"
            size={28}
            color={themeColor}
          />
        </TouchableOpacity>
      </View>

      /**
       * 封面区域
       * 点击可触发 onPressCover 回调
       */
      <TouchableOpacity onPress={onPressCover} activeOpacity={0.8}>
        {
          /**
           * 如果有封面图片且不是默认占位图，则显示图片
           */
          coverImage && coverImage !== 'https://picsum.photos/700' ? (
            <>
              /**
               * 封面图片
               */
              <Image source={{ uri: coverImage }} style={styles.coverImage} />
              /**
               * 图片遮罩层
               * 显示眼睛图标，表示可以查看
               */
              <View style={styles.imageOverlay}>
                <Icon name="visibility" type="material" size={24} color="#00e5f1ff" />
              </View>
            </>
          ) : (
            /**
             * 如果没有封面图片，则显示骨架屏效果
             */
            <View style={styles.skeletonCover}>
              /**
               * 骨架图标
               */
              <View style={styles.skeletonIcon} />
              /**
               * 骨架标题
               */
              <View style={styles.skeletonTitle} />
              /**
               * 骨架副标题
               */
              <View style={styles.skeletonSubtitle} />
            </View>
          )
        }
      </TouchableOpacity>

      {
        /**
         * 操作按钮区域
         * 只有当卡片展开时才显示
         */
        isExpand && (
          <View style={styles.actionContainer}>
            /**
             * 操作按钮容器
             * 包含"查看对话"和"查看应用"两个按钮
             */
            <View style={styles.actionButtons}>
              /**
               * 查看对话按钮
               * 使用主题色作为背景色
               */
              <Button
                title="查看对话"
                icon={<Icon name="chat" type="material" size={20} color="#ffffffff" />}
                iconContainerStyle={{ marginRight: 8 }}
                buttonStyle={[styles.chatButton, { backgroundColor: themeColor }]}
                containerStyle={styles.buttonContainer}
                onPress={() => {
                  console.log("点击查看对话")
                  onViewConversation()
                }}
              />
              /**
               * 查看应用按钮
               * 使用渐变色作为背景色
               */
              <Button
                title="查看应用"
                icon={<Icon name="play-arrow" type="material" size={20} color="#ffffffff" />}
                iconContainerStyle={{ marginRight: 8 }}
                buttonStyle={styles.appButton}
                containerStyle={styles.buttonContainer}
                onPress={() => {
                  console.log("点击查看应用")
                  onViewApp()
                }}
              />
            </View>
          </View>
        )
      }
    </View>
  )
}
