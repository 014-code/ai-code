/**
 * 部署URL生成工具
 * 
 * 根据不同的代码生成类型生成对应的静态资源预览URL
 * 支持多种代码生成类型的URL格式转换
 */

import { CodeGenTypeEnum } from '@/constants/codeGenTypeEnum';
import { STATIC_BASE_URL } from '@/constants/index';

/**
 * 获取静态预览URL
 * 
 * 根据代码生成类型和应用ID生成对应的预览URL
 * 不同类型的代码生成对应不同的URL格式：
 * - 多文件和HTML类型：使用部署密钥作为路径
 * - Vue和React项目：使用部署密钥并添加index.html
 * - 其他类型：使用代码类型和应用ID作为路径
 * 
 * @param codeGenType - 代码生成类型，决定URL的格式
 * @param appId - 应用ID，用于构建URL路径
 * @param deployKey - 部署密钥，用于多文件和项目类型的URL构建
 * @returns 返回完整的静态资源预览URL
 */
export const getStaticPreviewUrl = (codeGenType: string, appId: string, deployKey: string) => {
  const baseUrl = `${STATIC_BASE_URL}/${codeGenType}_${appId}/`;
  
  if (codeGenType === CodeGenTypeEnum.MULTI_FILE || codeGenType === CodeGenTypeEnum.HTML) {
    return `${STATIC_BASE_URL}/${deployKey}/`;
  }
  
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT || codeGenType === CodeGenTypeEnum.REACT_PROJECT) {
    return `${STATIC_BASE_URL}/${deployKey}/index.html`;
  }
  
  return baseUrl;
};
