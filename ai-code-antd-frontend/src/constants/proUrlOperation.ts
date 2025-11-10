import {CodeGenTypeEnum} from "@/constants/codeGenTypeEnum";
import {STATIC_BASE_URL} from "@/constants/index";

/**
 * 部署路径操作类
 */
// 获取静态资源预览URL
export const getStaticPreviewUrl = (codeGenType: string, appId: string, deployKey: string) => {
  const baseUrl = `${STATIC_BASE_URL}/${codeGenType}_${appId}/`
  //如果是原生则
  if (codeGenType === CodeGenTypeEnum.MULTI_FILE || codeGenType === CodeGenTypeEnum.HTML) {
    return `${STATIC_BASE_URL}/${deployKey}/`
  }
  // 如果是 Vue/React 项目，浏览地址需要添加 dist 后缀
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT || codeGenType === CodeGenTypeEnum.REACT_PROJECT) {
    return `${STATIC_BASE_URL}/${deployKey}/dist/index.html`
  }
  return baseUrl
}
