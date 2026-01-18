/**
 * 注册页面
 * 提供用户注册功能，支持账户密码注册方式
 */
import Footer from '@/components/Footer';
import { userRegister, userRegisterByEmail, sendEmailCode } from '@/services/backend/userController';
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { useNavigate } from 'react-router-dom';
import { message, Tabs, Button } from 'antd';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * 用户注册页面组件
 */
const UserRegisterPage: React.FC = () => {
  const [type, setType] = useState<string>('account');
  const [email, setEmail] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
    if (type === 'email') {
      const { userPassword, checkPassword, userEmail, emailCode } = values;
      if (userPassword !== checkPassword) {
        message.error('二次输入的密码不一致');
        return;
      }
      if (!emailCode) {
        message.error('请输入验证码');
        return;
      }
      userRegisterByEmail({
        userEmail,
        userPassword,
        checkPassword,
        emailCode,
      }).then(() => {
        message.success('注册成功！');
        navigate('/user/login');
      }).catch((error: any) => {
        message.error(`注册失败，${error.message}`);
      });
    } else {
      const { userPassword, checkPassword } = values;
      if (userPassword !== checkPassword) {
        message.error('二次输入的密码不一致');
        return;
      }
      userRegister({
        ...values,
      }).then(() => {
        message.success('注册成功！');
        navigate('/user/login');
      }).catch((error: any) => {
        message.error(`注册失败，${error.message}`);
      });
    }
  };

  const handleSendEmailCode = async () => {
    if (!email) {
      message.error('请先输入邮箱');
      return;
    }
    const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      message.error('邮箱格式不正确');
      return;
    }
    setLoading(true);
    try {
      await sendEmailCode({ email, type: 'REGISTER' });
      message.success('验证码已发送');
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      message.error(`发送验证码失败，${error.message}`);
    } finally {
      setLoading(false);
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
          <Tabs
            activeKey={type}
            onChange={setType}
            centered
            items={[
              {
                key: 'account',
                label: '账号注册',
              },
              {
                key: 'email',
                label: '邮箱注册',
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

          {type === 'email' && (
            <>
              <ProFormText
                name="userEmail"
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                  onChange: (e) => setEmail(e.target.value),
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
              <ProFormText
                name="emailCode"
                fieldProps={{
                  size: 'large',
                  prefix: <MailOutlined />,
                  suffix: (
                    <Button
                      type="link"
                      disabled={countdown > 0 || loading}
                      onClick={handleSendEmailCode}
                    >
                      {countdown > 0 ? `${countdown}s` : '获取验证码'}
                    </Button>
                  ),
                }}
                placeholder={'请输入验证码'}
                rules={[
                  {
                    required: true,
                    message: '验证码是必填项！',
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
