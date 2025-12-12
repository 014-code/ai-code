// types/navigation.ts
export type RootStackParamList = {
    // 基础页面
    Login: undefined;                 // 登录
    Register: undefined;                 // 注册
    Home: undefined;                  // 首页
    Profile: undefined;               // 个人中心

    // 带参数的页面

    // 其他
    WebView: { url: string };         // 网页
};