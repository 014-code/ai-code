import Footer from '@/components/Footer';
import { getLoginUser } from '@/services/backend/userController';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { AvatarDropdown } from './components/RightContent/AvatarDropdown';
import { requestConfig } from './requestConfig';
import Logo from './components/Logo';

const loginPath = '/user/login';

export async function getInitialState(): Promise<InitialState> {
  const initialState: InitialState = {
    currentUser: undefined,
  };
  const { location } = history;
  if (location.pathname !== loginPath) {
    try {
      const res = await getLoginUser();
      if (res && res.data) {
        initialState.currentUser = res.data;
      }
    } catch (error: any) {
      console.log('未登录或获取用户信息失败:', error.message);
    }
  }
  return initialState;
}

export const layout: RunTimeLayoutConfig = ({ initialState }) => {
  return {
    avatarProps: {
      render: () => {
        return <AvatarDropdown menu={true} />;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.userName,
    },
    footerRender: () => <Footer />,
    menuHeaderRender: () => <Logo size={32} />,
    ...defaultSettings,
  };
};

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = requestConfig;
