import { useEffect, useRef } from 'react'
import { Animated } from 'react-native'

/**
 * 弹跳动画 Hook 的配置选项接口
 */
interface UseBounceAnimationOptions {
  /**
   * 摩擦力系数，控制动画的阻尼效果
   * 值越大，动画停止得越快
   * 默认值为 3
   */
  friction?: number
  /**
   * 张力系数，控制动画的弹性
   * 值越大，动画越有弹性
   * 默认值为 40
   */
  tension?: number
  /**
   * 动画延迟时间（毫秒）
   * 0 表示立即开始
   * 默认值为 0
   */
  delay?: number
}

/**
 * 弹跳动画 Hook
 * 用于创建一个带有弹跳效果的动画值
 *
 * @param options - 动画配置选项
 * @returns 动画值对象，可以绑定到组件的样式属性上
 *
 * @example
 * ```tsx
 * const bounceAnim = useBounceAnimation({
 *   friction: 3,
 *   tension: 40,
 *   delay: 100
 * })
 *
 * <Animated.View
 *   style={{
 *     transform: [{ scale: bounceAnim }]
 *   }}
 * >
 *   <Text>弹跳动画</Text>
 * </Animated.View>
 * ```
 */
export function useBounceAnimation(options: UseBounceAnimationOptions = {}) {
  /**
   * 从配置选项中解构参数，并设置默认值
   */
  const { friction = 3, tension = 40, delay = 0 } = options
  /**
   * 创建动画值对象
   * 初始值为 0，动画过程中会从 0 变化到 1
   */
  const bounceAnim = useRef(new Animated.Value(0)).current

  /**
   * 组件挂载时启动弹跳动画
   */
  useEffect(() => {
    /**
     * 创建弹簧动画配置
     * spring 动画模拟物理弹簧的运动效果
     */
    const animation = Animated.spring(bounceAnim, {
      /**
       * 动画目标值
       * 从 0 弹跳到 1
       */
      toValue: 1,
      /**
       * 摩擦力系数
       * 控制动画的阻尼效果
       */
      friction,
      /**
       * 张力系数
       * 控制动画的弹性
       */
      tension,
      /**
       * 使用原生驱动
       * 提高动画性能，减少 JS 线程负担
       */
      useNativeDriver: true,
    })

    /**
     * 如果设置了延迟，则延迟启动动画
     */
    if (delay > 0) {
      /**
       * 创建定时器，延迟启动动画
       */
      const timeout = setTimeout(() => {
        /**
         * 启动动画
         */
        animation.start()
      }, delay)
      /**
       * 清理函数：组件卸载时清除定时器
       */
      return () => clearTimeout(timeout)
    } else {
      /**
       * 立即启动动画
       */
      animation.start()
    }

    /**
     * 清理函数：组件卸载时停止动画
     */
    return () => animation.stop()
  }, [bounceAnim, friction, tension, delay])

  /**
   * 返回动画值对象
   * 可以通过插值（interpolate）方法将其映射到不同的属性
   */
  return bounceAnim
}
