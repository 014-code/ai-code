/**
 * 登录页面
 * 提供用户登录功能，支持账户密码和邮箱密码登录方式
 */
import Footer from '@/components/Footer';
import { userLogin } from '@/services/backend/userController';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Tabs } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGlobal } from '@/context/GlobalContext';

/**
 * 登录组件
 */
const Login: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const { setUserInfo, currentUser } = useGlobal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const containerClassName = {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100vh',
    overflow: 'auto' as const,
    backgroundImage:
      "url('https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr')",
    backgroundSize: '100% 100%',
  };

  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      const res = await userLogin({
        ...values,
      });

      const defaultLoginSuccessMessage = '登录成功！';
      message.success(defaultLoginSuccessMessage);
      
      const token = res.data?.token || document.cookie
        .split('; ')
        .find(row => row.startsWith('satoken='))
        ?.split('=')[1];
      
      if (token) {
        localStorage.setItem('satoken', token);
        console.log('Token 已保存:', token);
      }
      
      setUserInfo(res.data);
      
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
      return;
    } catch (error: any) {
      const defaultLoginFailureMessage = `登录失败，${error.message}`;
      message.error(defaultLoginFailureMessage);
    }
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
          logo={<img alt="logo" style={{ height: '100%' }} src="/logo.png" />}
          title="ai零代码生成平台"
          subTitle={'快速开发属于自己的前端项目'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={(values) => {
            handleSubmit(values as API.UserLoginRequest);
          }}
        >
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
              {
                key: 'email',
                label: '邮箱密码登录',
              },
            ]}
          />
          
          {type === 'account' && (
            <>
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
            </>
          )}

          {type === 'email' && (
            <>
              <ProFormText
                name="userAccount"
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                }}
                placeholder={'请输入邮箱'}
                rules={[
                  {
                    required: true,
                    message: '邮箱是必填项！',
                  },
                  {
                    pattern: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                    message: '邮箱格式不正确！',
                  },
                ]}
              />
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
            </>
          )}

          <div
            style={{
              marginBottom: 24,
              textAlign: 'right',
            }}
          >
            <Link to="/user/register">新用户注册</Link>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
