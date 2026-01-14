import type { ProLayoutProps } from '@ant-design/pro-components';

const Settings: ProLayoutProps & {
  pwa?: boolean;
  logo?: string;
} = {
  navTheme: "light",
  colorMenuBackground: '#fff',
  colorBgMenuItemHover: '#91d5ff',
  colorTextMenu: '#607AAF',
  colorTextMenuSelected: '#3497ff',
  colorTextMenuItemHover: '#607AAF',
  colorTextMenuActive: '#607AAF',
  colorPrimary: "#13C2C2",
  layout: "top",
  contentWidth: "Fixed",
  fixedHeader: false,
  fixSiderbar: false,
  pwa: true,
  title: "coderAI代码生成平台",
  logo: "https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg",
  splitMenus: false,
  token: {},
};

export default Settings;