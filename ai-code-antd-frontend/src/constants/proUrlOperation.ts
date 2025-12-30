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
  // 如果是 Vue/React 项目，部署时已经将 dist 内容直接拷贝到根目录，无需 /dist/ 路径
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT || codeGenType === CodeGenTypeEnum.REACT_PROJECT) {
    return `${STATIC_BASE_URL}/${deployKey}/index.html`
  }
  return baseUrl
}
