/**
 * 登录页面
 * 提供用户登录功能，支持账户密码登录方式
 */
import Footer from '@/components/Footer';
import { userLogin } from '@/services/backend/userController';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
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
  // 状态管理
  const [type, setType] = useState<string>('account');  // 登录方式
  const { setUserInfo, currentUser } = useGlobal();  // 全局上下文
  const navigate = useNavigate();  // 导航
  const [searchParams] = useSearchParams();  // URL参数

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
   * 处理登录提交
   * @param values 登录表单值
   */
  const handleSubmit = async (values: API.UserLoginRequest) => {
    try {
      // 调用登录API
      const res = await userLogin({
        ...values,
      });

      // 登录成功处理
      const defaultLoginSuccessMessage = '登录成功！';
      message.success(defaultLoginSuccessMessage);
      
      // 保存 Sa-Token 到 localStorage
      // 优先从响应数据中获取 token
      const token = res.data?.token || document.cookie
        .split('; ')
        .find(row => row.startsWith('satoken='))
        ?.split('=')[1];
      
      if (token) {
        localStorage.setItem('satoken', token);
        console.log('Token 已保存:', token);
      }
      
      // 更新全局状态
      setUserInfo(res.data);
      
      // 跳转到指定页面或首页
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
      return;
    } catch (error: any) {
      // 登录失败处理
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
          logo={<img alt="014" style={{ height: '100%' }} src="/logo.png" />}
          title="014-ai零代码生成平台"
          subTitle={'快速开发属于自己的前端项目'}
          initialValues={{
            autoLogin: true,
          }}
          onFinish={(values) => {
            handleSubmit(values as API.UserLoginRequest);
          }}
        >
          {/* 登录方式选项卡 */}
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账户密码登录',
              },
            ]}
          />
          
          {/* 账户密码登录表单 */}
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
            </>
          )}

          {/* 注册链接 */}
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
