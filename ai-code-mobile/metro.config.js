// 根目录创建 metro.config.js 如下配置：
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const { withNativeWind } = require('nativewind/metro');
module.exports = withNativeWind(config, { input: './global.css' })

