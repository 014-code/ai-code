/**
 * 注册页面
 * 提供用户注册功能，支持账户密码注册方式
 */
import Footer from '@/components/Footer';
import { userRegister } from '@/services/backend/userController';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import { message, Tabs } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * 用户注册页面组件
 */
const UserRegisterPage: React.FC = () => {
  // 状态管理
  const [type, setType] = useState<string>('account');  // 注册方式
  const navigate = useNavigate();  // 导航

  /**
   * 容器样式
   */
  const containerClassName = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    overflow: 'auto' as const,
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  };

  /**
   * 处理注册提交
   * @param values 注册表单值
   */
  const handleSubmit = (values: API.UserRegisterRequest) => {
    // 验证密码一致性
    const { userPassword, checkPassword } = values;
    if (userPassword !== checkPassword) {
      message.error('二次输入的密码不一致');
      return;
    }

    // 调用注册API
    userRegister({
      ...values,
    }).then(() => {
      // 注册成功处理
      const defaultLoginSuccessMessage = '注册成功！';
      message.success(defaultLoginSuccessMessage);
      navigate('/user/login');  // 跳转到登录页面
    }).catch((error: any) => {
      // 注册失败处理
      const defaultLoginFailureMessage = `注册失败，${error.message}`;
      message.error(defaultLoginFailureMessage);
    });
  };

  return (
    <div style={containerClassName}>
      <div
        style={{
          flex: '1',
          padding: '32px 0',
        }}
      >
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          logo={<img alt="logo" style={{ height: '100%' }} src="/logo.svg" />}
          title="ai零代码平台 - 注册"
          initialValues={{
            autoLogin: true,
          }}
          submitter={{
            searchConfig: {
              submitText: '注册',
            },
          }}
          onFinish={async (values) => {
            await handleSubmit(values as API.UserRegisterRequest);
          }}
        >
          {/* 注册方式选项卡 */}
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '新用户注册',
              },
            ]}
          />
          
          {/* 账户密码注册表单 */}
          {type === 'account' && (
            <>
              {/* 账号输入 */}
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined />,
                }}
                placeholder={'请输入账号'}
                rules={[
                  {
                    required: true,
                    message: '账号是必填项！',
                  },
                ]}
              />
              {/* 密码输入 */}
              <ProFormText.Password
                name="userPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请输入密码'}
                rules={[
                  {
                    required: true,
                    message: '密码是必填项！',
                  },
                ]}
              />
              {/* 确认密码输入 */}
              <ProFormText.Password
                name="checkPassword"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined />,
                }}
                placeholder={'请再次确认密码'}
                rules={[
                  {
                    required: true,
                    message: '确认密码是必填项！',
                  },
                ]}
              />
            </>
          )}

          {/* 登录链接 */}
          <div
            style={{
              marginBottom: 24,
              textAlign: 'right',
            }}
          >
            <Link to="/user/login">老用户登录</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default UserRegisterPage;
