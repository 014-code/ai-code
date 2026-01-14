import { userLogout } from '@/services/backend/userController';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '@/context/GlobalContext';
import { flushSync } from 'react-dom';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const navigate = useNavigate();
  const { currentUser, setUserInfo } = useGlobal();

  const loginOut = async () => {
    await userLogout();
    const { search, pathname } = window.location;
    const urlParams = new URL(window.location.href).searchParams;
    const redirect = urlParams.get('redirect');
    
    if (window.location.pathname !== '/user/login' && !redirect) {
      navigate(`/user/login?redirect=${encodeURIComponent(pathname + search)}`);
    }
  };

  const onMenuClick: MenuProps['onClick'] = useCallback(
    (event) => {
      const { key } = event;
      if (key === 'logout') {
        flushSync(() => {
          setUserInfo(undefined);
        });
        loginOut();
        return;
      }
      navigate(`/account/${key}`);
    },
    [navigate, setUserInfo]
  );

  if (!currentUser) {
    return (
      <Button type="primary" shape="round" onClick={() => navigate('/user/login')}>
        登录
      </Button>
    );
  }

  const menuItems: MenuProps['items'] = [
    ...(menu
      ? [
          {
            key: 'center',
            icon: <UserOutlined />,
            label: '个人中心',
          },
          {
            type: 'divider' as const,
          },
        ]
      : []),
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <Dropdown
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
    >
      <Space style={{ cursor: 'pointer' }}>
        {currentUser?.userAvatar ? (
          <Avatar size="small" src={currentUser?.userAvatar} />
        ) : (
          <Avatar size="small" icon={<UserOutlined />} />
        )}
        <span className="anticon">{currentUser?.userName ?? '无名'}</span>
      </Space>
    </Dropdown>
  );
};

export const AvatarName = () => {};

export default AvatarDropdown;