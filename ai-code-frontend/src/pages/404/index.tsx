import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Result } from 'antd';

/**
 * 404 页面组件
 * 当用户访问不存在的路由时显示
 */
const NoFoundPage: React.FC = () => {
  // 导航钩子，用于页面跳转
  const navigate = useNavigate();
  
  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        // 返回首页按钮
        <Button type="primary" onClick={() => navigate('/')}>
          Back Home
        </Button>
      }
    />
  );
};

export default NoFoundPage;
