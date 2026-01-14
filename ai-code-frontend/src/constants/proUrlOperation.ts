import { CodeGenTypeEnum } from "@/constants/codeGenTypeEnum";
import { STATIC_BASE_URL } from "@/constants/index";

export const getStaticPreviewUrl = (codeGenType: string, appId: string, deployKey: string) => {
  if (!deployKey) {
    return `${STATIC_BASE_URL}/${codeGenType}_${appId}/`
  }
  return `${STATIC_BASE_URL}/${deployKey}/`
}