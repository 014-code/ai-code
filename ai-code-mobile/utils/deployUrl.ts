import { CodeGenTypeEnum } from '@/constants/codeGenTypeEnum'
import { STATIC_BASE_URL } from '@/constants/index'

export const getStaticPreviewUrl = (codeGenType: string, appId: string, deployKey: string) => {
  const baseUrl = `${STATIC_BASE_URL}/${codeGenType}_${appId}/`
  if (codeGenType === CodeGenTypeEnum.MULTI_FILE || codeGenType === CodeGenTypeEnum.HTML) {
    return `${STATIC_BASE_URL}/${deployKey}/`
  }
  if (codeGenType === CodeGenTypeEnum.VUE_PROJECT || codeGenType === CodeGenTypeEnum.REACT_PROJECT) {
    return `${STATIC_BASE_URL}/${deployKey}/index.html`
  }
  return baseUrl
}
