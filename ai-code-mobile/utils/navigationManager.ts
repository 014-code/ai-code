/**
 * 全局导航管理器
 * 用于在非组件环境中进行页面跳转
 */
let navigationRef: any = null;

export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

export const navigate = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.navigate(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};

export const push = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.push(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};

export const replace = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.replace(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};
