import { ProLayout } from '@ant-design/pro-components';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  SmileOutlined,
  AppstoreOutlined,
  MessageOutlined,
  CrownOutlined,
  TableOutlined,
  TeamOutlined,
  RobotOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import Logo from '@/components/Logo';
import Footer from '@/components/Footer';
import AvatarDropdown from '@/components/RightContent/AvatarDropdown';
import defaultSettings from '@/config/defaultSettings';

const BasicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [pathname, setPathname] = useState(location.pathname);

  useEffect(() => {
    setPathname(location.pathname);
  }, [location]);

  return (
    <ProLayout
      logo={<Logo size={32} />}
      title={defaultSettings.title}
      layout={defaultSettings.layout}
      navTheme={defaultSettings.navTheme}
      contentWidth={defaultSettings.contentWidth}
      fixedHeader={defaultSettings.fixedHeader}
      fixSiderbar={defaultSettings.fixSiderbar}
      location={{
        pathname,
      }}
      route={{
        path: '/',
        routes: [
          {
            path: '/home',
            name: '首页',
            icon: <SmileOutlined />,
          },
          {
            path: '/space',
            name: '应用空间',
            icon: <TeamOutlined />,
          },
          {
            path: '/cases',
            name: '全部案例',
            icon: <AppstoreOutlined />,
          },
          {
            path: '/forum',
            name: '技术社区',
            icon: <MessageOutlined />,
          },
          {
            path: '/admin',
            name: '管理页',
            icon: <CrownOutlined />,
            routes: [
              {
                path: '/admin/user',
                name: '用户管理',
                icon: <TableOutlined />,
              },
              {
                path: '/admin/app',
                name: '应用管理',
                icon: <TableOutlined />,
              },
              {
                path: '/admin/chatHistory',
                name: '对话管理',
                icon: <TableOutlined />,
              },
              {
                path: '/admin/codeSnippet',
                name: '代码模板管理',
                icon: <TableOutlined />,
              },
              {
                path: '/admin/pointsRecord',
                name: '积分记录管理',
                icon: <TableOutlined />,
              },
              {
                path: '/admin/aiModelConfig',
                name: 'AI模型配置',
                icon: <RobotOutlined />,
              },
              {
                path: '/admin/dataRepair',
                name: '数据修复工具',
                icon: <ToolOutlined />,
              },
            ],
          },
        ],
      }}
      menuItemRender={(itemProps, defaultDom) => {
        return (
          <div
            onClick={() => {
              navigate(itemProps.path || '/');
            }}
          >
            {defaultDom}
          </div>
        );
      }}
      avatarProps={{
        title: defaultSettings.title,
        render: () => <AvatarDropdown menu={true} />,
      }}
      footerRender={() => <Footer />}
      {...defaultSettings}
    >
      <Outlet />
    </ProLayout>
  );
};

export default BasicLayout;