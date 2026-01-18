import { userLogout } from '@/services/backend/userController';
import { dailySignIn, getSignInStatus } from '@/services/backend/signInRecordController';
import { LogoutOutlined, UserOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Space, message, Badge, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobal } from '@/context/GlobalContext';
import { flushSync } from 'react-dom';

export type GlobalHeaderRightProps = {
  menu?: boolean;
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu }) => {
  const navigate = useNavigate();
  const { currentUser, setUserInfo } = useGlobal();
  const [hasSignedIn, setHasSignedIn] = useState(false);
  const [continuousDays, setContinuousDays] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchSignInStatus();
    }
  }, [currentUser]);

  const fetchSignInStatus = async () => {
    try {
      const response = await getSignInStatus();
      if (response.code === 0 && response.data) {
        setHasSignedIn(response.data.hasSignedInToday || false);
        setContinuousDays(response.data.continuousDays || 0);
      }
    } catch (error) {
      console.error('获取签到状态失败', error);
    }
  };

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await dailySignIn();
      if (response.code === 0 && response.data) {
        setHasSignedIn(true);
        setContinuousDays(response.data.continuousDays || 0);
        message.success(`签到成功！连续签到 ${response.data.continuousDays} 天，获得 ${response.data.pointsEarned} 积分`);
        if (response.data.bonusMessage) {
          message.success(response.data.bonusMessage);
        }
      }
    } catch (error: any) {
      message.error(error.message || '签到失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

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
    <Space size="middle">
      <Tooltip title={hasSignedIn ? '今日已签到' : '点击签到'}>
        <Badge dot={!hasSignedIn}>
          <Button
            type="default"
            size="small"
            icon={<CalendarOutlined />}
            onClick={handleSignIn}
            disabled={hasSignedIn || loading}
            loading={loading}
          >
            {hasSignedIn ? '已签到' : '签到'}
          </Button>
        </Badge>
      </Tooltip>
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
    </Space>
  );
};

export const AvatarName = () => {};

export default AvatarDropdown;