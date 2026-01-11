import React from 'react'
import { View } from 'react-native'
import Svg, { Defs, LinearGradient, Stop, Path, Circle, G, Polygon, Filter, FeGaussianBlur, FeMerge, FeMergeNode, Line } from 'react-native-svg'
import styles from './Logo.less'

/**
 * Logo 组件的属性接口
 */
interface LogoProps {
  /**
   * Logo 的尺寸（宽度和高度）
   * 默认为 32
   */
  size?: number
}

/**
 * Logo 组件
 * 使用 SVG 绘制一个具有科技感的六边形 Logo
 * 包含多层渐变、发光效果和装饰性元素
 *
 * @param props - 组件属性
 * @returns Logo 组件
 *
 * @example
 * ```tsx
 * <Logo size={48} />
 * ```
 */
const Logo: React.FC<LogoProps> = ({ size = 32 }) => {
  return (
    /**
     * Logo 容器
     * 使用 flex 布局使 SVG 居中显示
     */
    <View style={[styles.container, { width: size, height: size }]}>
      /**
       * SVG 画布
       * viewBox 定义了 SVG 的坐标系，范围为 0 0 200 200
       */
      <Svg width={size} height={size} viewBox="0 0 200 200">
        /**
         * 定义渐变和滤镜
         * 在这里定义可以在整个 SVG 中重复使用的资源
         */
        <Defs>
          /**
           * 顶部第一层渐变
           * 从浅蓝色 (#00d4ff) 到深蓝色 (#0099ff)
           */
          <LinearGradient id="gradTop1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00d4ff" />
            <Stop offset="100%" stopColor="#0099ff" />
          </LinearGradient>
          /**
           * 顶部第二层渐变
           * 从中蓝色 (#00b4ff) 到深蓝色 (#0077ff)
           */
          <LinearGradient id="gradTop2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00b4ff" />
            <Stop offset="100%" stopColor="#0077ff" />
          </LinearGradient>
          /**
           * 顶部第三层渐变
           * 从深蓝色 (#0094ff) 到更深的蓝色 (#0055ff)
           */
          <LinearGradient id="gradTop3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0094ff" />
            <Stop offset="100%" stopColor="#0055ff" />
          </LinearGradient>
          /**
           * 左侧第一层渐变
           * 从蓝色 (#0066ff) 到深蓝色 (#0033cc)
           */
          <LinearGradient id="gradLeft1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0066ff" />
            <Stop offset="100%" stopColor="#0033cc" />
          </LinearGradient>
          /**
           * 左侧第二层渐变
           * 从蓝色 (#0055ff) 到深蓝色 (#0022aa)
           */
          <LinearGradient id="gradLeft2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0055ff" />
            <Stop offset="100%" stopColor="#0022aa" />
          </LinearGradient>
          /**
           * 左侧第三层渐变
           * 从蓝色 (#0044ff) 到深蓝色 (#001188)
           */
          <LinearGradient id="gradLeft3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0044ff" />
            <Stop offset="100%" stopColor="#001188" />
          </LinearGradient>
          /**
           * 右侧第一层渐变
           * 从蓝色 (#0088ff) 到深蓝色 (#0044dd)
           */
          <LinearGradient id="gradRight1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0088ff" />
            <Stop offset="100%" stopColor="#0044dd" />
          </LinearGradient>
          /**
           * 右侧第二层渐变
           * 从蓝色 (#0077ff) 到深蓝色 (#0033bb)
           */
          <LinearGradient id="gradRight2" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0077ff" />
            <Stop offset="100%" stopColor="#0033bb" />
          </LinearGradient>
          /**
           * 右侧第三层渐变
           * 从蓝色 (#0066ff) 到深蓝色 (#002299)
           */
          <LinearGradient id="gradRight3" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0066ff" />
            <Stop offset="100%" stopColor="#002299" />
          </LinearGradient>
          /**
           * 发光效果渐变
           * 从青色 (#00ffff) 到蓝色 (#0088ff)
           */
          <LinearGradient id="gradGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#00ffff" />
            <Stop offset="100%" stopColor="#0088ff" />
          </LinearGradient>
          /**
           * 外发光滤镜
           * 使用高斯模糊创建发光效果
           */
          <Filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            /**
             * 高斯模糊
             * stdDeviation 控制模糊程度，值越大模糊越明显
             */
            <FeGaussianBlur stdDeviation="3" result="coloredBlur" />
            /**
             * 合并模糊效果和原始图形
             */
            <FeMerge>
              <FeMergeNode in="coloredBlur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
          /**
           * 内发光滤镜
           * 使用较小的高斯模糊创建内部发光效果
           */
          <Filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            /**
             * 高斯模糊
             * stdDeviation 较小，用于内部发光
             */
            <FeGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            /**
             * 合并模糊效果和原始图形
             */
            <FeMerge>
              <FeMergeNode in="coloredBlur" />
              <FeMergeNode in="SourceGraphic" />
            </FeMerge>
          </Filter>
        </Defs>

        /**
         * 主图形组
         */
        <G>
          /**
           * 应用外发光滤镜的图形组
           */
          <G filter="url(#glow)">
            /**
             * 外轮廓六边形
             * 使用发光渐变色，透明度为 0.3
             */
            <Polygon points="100,20 160,55 160,125 100,160 40,125 40,55" fill="none" stroke="url(#gradGlow)" strokeWidth="2" opacity="0.3" />

            /**
             * 顶部六边形层
             */
            <G>
              /**
               * 顶部第一层六边形
               * 使用渐变填充，透明度为 0.9
               */
              <Polygon points="100,25 155,57 155,122 100,154 45,122 45,57" fill="url(#gradTop1)" opacity="0.9" />
              /**
               * 顶部第一层六边形边框
               * 白色半透明边框
               */
              <Polygon points="100,25 155,57 155,122 100,154 45,122 45,57" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

              /**
               * 顶部第二层六边形
               * 使用渐变填充，透明度为 0.85
               */
              <Polygon points="100,40 142,64 142,115 100,139 58,115 58,64" fill="url(#gradTop2)" opacity="0.85" />
              /**
               * 顶部第二层六边形边框
               */
              <Polygon points="100,40 142,64 142,115 100,139 58,115 58,64" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

              /**
               * 顶部第三层六边形
               * 使用渐变填充，透明度为 0.8
               */
              <Polygon points="100,55 129,72 129,108 100,125 71,108 71,72" fill="url(#gradTop3)" opacity="0.8" />
              /**
               * 顶部第三层六边形边框
               */
              <Polygon points="100,55 129,72 129,108 100,125 71,108 71,72" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              /**
               * 顶部中心六边形
               * 使用发光渐变，应用内发光滤镜
               */
              <Polygon points="100,70 116,79 116,101 100,110 84,101 84,79" fill="url(#gradGlow)" opacity="0.9" filter="url(#innerGlow)" />

              /**
               * 顶部装饰线条
               * 从中心向外延伸的线条，透明度为 0.4
               */
              <G opacity="0.4">
                <Line x1="100" y1="25" x2="100" y2="154" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <Line x1="45" y1="57" x2="155" y2="122" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
                <Line x1="45" y1="122" x2="155" y2="57" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
              </G>
            </G>

            /**
             * 左侧六边形层
             */
            <G>
              /**
               * 左侧第一层六边形
               * 使用渐变填充，透明度为 0.85
               */
              <Polygon points="45,122 100,154 100,185 45,153" fill="url(#gradLeft1)" opacity="0.85" />
              /**
               * 左侧第一层六边形边框
               */
              <Polygon points="45,122 100,154 100,185 45,153" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

              /**
               * 左侧第二层六边形
               * 使用渐变填充，透明度为 0.8
               */
              <Polygon points="58,115 100,139 100,162 58,138" fill="url(#gradLeft2)" opacity="0.8" />
              /**
               * 左侧第二层六边形边框
               */
              <Polygon points="58,115 100,139 100,162 58,138" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              /**
               * 左侧第三层六边形
               * 使用渐变填充，透明度为 0.75
               */
              <Polygon points="71,108 100,125 100,140 71,123" fill="url(#gradLeft3)" opacity="0.75" />
              /**
               * 左侧第三层六边形边框
               */
              <Polygon points="71,108 100,125 100,140 71,123" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </G>

            /**
             * 右侧六边形层
             */
            <G>
              /**
               * 右侧第一层六边形
               * 使用渐变填充，透明度为 0.85
               */
              <Polygon points="100,154 155,122 155,153 100,185" fill="url(#gradRight1)" opacity="0.85" />
              /**
               * 右侧第一层六边形边框
               */
              <Polygon points="100,154 155,122 155,153 100,185" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

              /**
               * 右侧第二层六边形
               * 使用渐变填充，透明度为 0.8
               */
              <Polygon points="100,139 142,115 142,138 100,162" fill="url(#gradRight2)" opacity="0.8" />
              /**
               * 右侧第二层六边形边框
               */
              <Polygon points="100,139 142,115 142,138 100,162" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />

              /**
               * 右侧第三层六边形
               * 使用渐变填充，透明度为 0.75
               */
              <Polygon points="100,125 129,108 129,123 100,140" fill="url(#gradRight3)" opacity="0.75" />
              /**
               * 右侧第三层六边形边框
               */
              <Polygon points="100,125 129,108 129,123 100,140" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
            </G>

            /**
             * 顶部装饰圆点
             * 透明度为 0.5
             */
            <G opacity="0.5">
              <Circle cx="100" cy="70" r="2" fill="#ffffff" />
              <Circle cx="100" cy="40" r="1.5" fill="#ffffff" />
              <Circle cx="100" cy="55" r="1.2" fill="#ffffff" />
            </G>

            /**
             * 左侧装饰圆点
             * 透明度为 0.3
             */
            <G opacity="0.3">
              <Circle cx="45" cy="122" r="1.5" fill="#ffffff" />
              <Circle cx="58" cy="115" r="1.2" fill="#ffffff" />
              <Circle cx="71" cy="108" r="1" fill="#ffffff" />
            </G>

            /**
             * 右侧装饰圆点
             * 透明度为 0.3
             */
            <G opacity="0.3">
              <Circle cx="155" cy="122" r="1.5" fill="#ffffff" />
              <Circle cx="142" cy="115" r="1.2" fill="#ffffff" />
              <Circle cx="129" cy="108" r="1" fill="#ffffff" />
            </G>

            /**
             * 底部装饰圆点
             * 透明度为 0.25
             */
            <G opacity="0.25">
              <Circle cx="100" cy="154" r="1.5" fill="#ffffff" />
              <Circle cx="100" cy="139" r="1.2" fill="#ffffff" />
              <Circle cx="100" cy="125" r="1" fill="#ffffff" />
            </G>

            /**
             * 最底部装饰圆点
             * 透明度为 0.15
             */
            <G opacity="0.15">
              <Circle cx="100" cy="185" r="1.5" fill="#ffffff" />
              <Circle cx="45" cy="153" r="1.2" fill="#ffffff" />
              <Circle cx="155" cy="153" r="1.2" fill="#ffffff" />
            </G>
          </G>

          /**
           * 外部装饰圆环
           * 透明度为 0.2
           */
          <G opacity="0.2">
            <Circle cx="100" cy="70" r="45" fill="none" stroke="url(#gradGlow)" strokeWidth="1" />
            <Circle cx="100" cy="70" r="60" fill="none" stroke="url(#gradGlow)" strokeWidth="0.5" />
          </G>

          /**
           * 外部装饰线条
           * 透明度为 0.15
           */
          <G opacity="0.15">
            <Path d="M40,57 L100,25 L160,57" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M45,122 L100,154 L155,122" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M40,57 L45,122 L45,153" stroke="#ffffff" strokeWidth="0.5" fill="none" />
            <Path d="M160,57 L155,122 L155,153" stroke="#ffffff" strokeWidth="0.5" fill="none" />
          </G>
        </G>
      </Svg>
    </View>
  )
}

export default Logo
