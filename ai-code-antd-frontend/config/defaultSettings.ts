import {ProLayoutProps} from '@ant-design/pro-components';

/**
 * 默认设置
 */
const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: "light",
    colorMenuBackground: '#fff', // menu 的背景颜色
    colorBgMenuItemHover: '#91d5ff', // menuItem 的 hover 背景颜色
    colorTextMenu: '#607AAF', // menuItem 的字体颜色
    colorTextMenuSelected: '#3497ff', // menuItem 的选中字体颜色
    colorTextMenuItemHover: '#607AAF', // menuItem 的 hover 字体颜色
    colorTextMenuActive: '#607AAF', // menuItem hover 的选中字体颜色
  colorPrimary: "#13C2C2",
  layout: "top",
  contentWidth: "Fixed",
  fixedHeader: false,
  fixSiderbar: false,
  pwa: true,
  title: "coderAI代码生成平台",
  logo: "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg",
  splitMenus: false,
  token: {
    // 参见ts声明，demo 见文档，通过token 修改样式
    //https://procomponents.ant.design/components/layout#%E9%80%9A%E8%BF%87-token-%E4%BF%AE%E6%94%B9%E6%A0%B7%E5%BC%8F
  },
};

export default Settings;
