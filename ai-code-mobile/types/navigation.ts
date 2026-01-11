/**
 * 应用导航参数类型定义
 * 
 * 定义应用中所有页面的导航参数，用于类型安全的路由导航
 * 使用Expo Router进行页面导航时，通过此类型定义确保传递的参数类型正确
 */
export type RootStackParamList = {
    /**
     * 登录页面
     * 用户登录入口，无需传递参数
     */
    Login: undefined;

    /**
     * 注册页面
     * 新用户注册入口，无需传递参数
     */
    Register: undefined;

    /**
     * 首页
     * 应用主页面，展示应用列表和推荐内容，无需传递参数
     */
    Home: undefined;

    /**
     * 个人中心页面
     * 用户个人信息和应用管理页面，无需传递参数
     */
    Profile: undefined;

    /**
     * 网页浏览页面
     * 用于在应用内打开外部网页或预览生成的应用
     * 
     * @param url - 要加载的网页URL地址
     */
    WebView: { url: string };
};