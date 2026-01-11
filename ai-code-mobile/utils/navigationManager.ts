/**
 * 全局导航管理器
 * 
 * 用于在非组件环境中进行页面跳转
 * 解决在非React组件中无法直接使用导航对象的问题
 * 通过全局引用实现跨组件的页面导航功能
 */

/**
 * 导航引用对象
 * 
 * 存储全局导航实例的引用，用于在非组件环境中访问导航功能
 * 需要在应用的根组件中通过setNavigationRef方法进行初始化
 */
let navigationRef: any = null;

/**
 * 设置导航引用
 * 
 * 在应用初始化时调用，将导航实例保存到全局变量中
 * 通常在应用的根组件或导航容器组件中调用此方法
 * 
 * @param ref - 导航实例对象，包含navigate、push、replace等导航方法
 */
export const setNavigationRef = (ref: any) => {
  navigationRef = ref;
};

/**
 * 导航到指定页面
 * 
 * 在导航栈中跳转到指定页面，如果页面已存在于导航栈中则返回该页面
 * 
 * @param routeName - 目标页面路由名称
 * @param params - 传递给目标页面的参数对象，默认为空对象
 */
export const navigate = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.navigate(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};

/**
 * 推入新页面到导航栈
 * 
 * 在导航栈顶部添加新页面，不管该页面是否已存在于导航栈中
 * 
 * @param routeName - 目标页面路由名称
 * @param params - 传递给目标页面的参数对象，默认为空对象
 */
export const push = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.push(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};

/**
 * 替换当前页面
 * 
 * 用新页面替换当前页面，不保留当前页面在导航栈中
 * 
 * @param routeName - 目标页面路由名称
 * @param params - 传递给目标页面的参数对象，默认为空对象
 */
export const replace = (routeName: any, params = {}) => {
  if (navigationRef) {
    navigationRef.replace(routeName, params);
  } else {
    console.warn('Navigation ref not set');
  }
};
