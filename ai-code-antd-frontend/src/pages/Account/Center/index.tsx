import { getLoginUser, updateUserInfo, updateUserPassword, updateUserAvatar } from '@/services/backend/userController';
import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Avatar, Button, Card, Col, Form, Input, message, Row, Space, Tabs, Upload } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const { TabPane } = Tabs;

/**
 * 账户中心页面
 * 提供用户信息展示、基本信息修改、密码修改、头像上传等功能
 */
const AccountCenter: React.FC = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [currentUser, setCurrentUser] = useState<API.LoginUserVO>(initialState?.currentUser);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = () => {
    getLoginUser().then((res) => {
      if (res.data) {
        setCurrentUser(res.data);
        form.setFieldsValue({
          userName: res.data.userName,
          userProfile: res.data.userProfile,
        });
      }
    }).catch(() => {
      message.error('获取用户信息失败');
    });
  };

  const handleUpdateInfo = (values: any) => {
    setLoading(true);
    updateUserInfo(values).then((res) => {
      if (res.code === 0) {
        message.success('修改成功');
        fetchUserInfo();
        setInitialState((s: any) => ({
          ...s,
          currentUser: res.data,
        }));
      } else {
        message.error(res.message || '修改失败');
      }
    }).catch(() => {
      message.error('修改失败');
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleUpdatePassword = (values: any) => {
    setPasswordLoading(true);
    updateUserPassword(values).then((res) => {
      if (res.code === 0) {
        message.success('密码修改成功，请重新登录');
        passwordForm.resetFields();
        setTimeout(() => {
          window.location.href = '/user/login';
        }, 1500);
      } else {
        message.error(res.message || '修改失败');
      }
    }).catch(() => {
      message.error('修改失败');
    }).finally(() => {
      setPasswordLoading(false);
    });
  };

  const handleAvatarChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response?.data;
      if (avatarUrl) {
        updateUserAvatar({ userAvatar: avatarUrl }).then((res) => {
          if (res.code === 0) {
            message.success('头像修改成功');
            fetchUserInfo();
            setInitialState((s: any) => ({
              ...s,
              currentUser: res.data,
            }));
          } else {
            message.error(res.message || '修改失败');
          }
        }).catch(() => {
          message.error('修改失败');
        }).finally(() => {
          setAvatarLoading(false);
        });
      } else {
        setAvatarLoading(false);
      }
    }
  };

  const uploadButton = (
    <div>
      <Avatar size={100} icon={<UserOutlined />} />
      <div style={{ marginTop: 8 }}>点击上传</div>
    </div>
  );

  return (
    <PageContainer>
      <Row gutter={24}>
        <Col lg={7} md={24}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarWrapper}>
                {currentUser?.userAvatar ? (
                  <Avatar size={120} src={currentUser.userAvatar} />
                ) : (
                  <Avatar size={120} icon={<UserOutlined />} />
                )}
              </div>
              <div className={styles.avatarInfo}>
                <div className={styles.userName}>{currentUser?.userName || '无名'}</div>
                <div className={styles.userAccount}>账号：{currentUser?.userAccount}</div>
              </div>
            </div>
            <ProDescriptions column={1} bordered>
              <ProDescriptions.Item label="用户角色">
                {currentUser?.userRole === 'admin' ? '管理员' : '普通用户'}
              </ProDescriptions.Item>
              <ProDescriptions.Item label="创建时间">
                {currentUser?.createTime}
              </ProDescriptions.Item>
            </ProDescriptions>
          </Card>
        </Col>
        <Col lg={17} md={24}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Tabs defaultActiveKey="1">
              <TabPane tab="基本设置" key="1">
                <ProCard bordered headerBordered>
                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleUpdateInfo}
                    initialValues={{
                      userName: currentUser?.userName,
                      userProfile: currentUser?.userProfile,
                    }}
                  >
                    <Form.Item
                      label="昵称"
                      name="userName"
                      rules={[
                        { required: true, message: '请输入昵称' },
                        { max: 20, message: '昵称不能超过20个字符' },
                      ]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="请输入昵称" />
                    </Form.Item>
                    <Form.Item
                      label="个人简介"
                      name="userProfile"
                      rules={[
                        { max: 200, message: '个人简介不能超过200个字符' },
                      ]}
                    >
                      <Input.TextArea
                        prefix={<MailOutlined />}
                        placeholder="请输入个人简介"
                        rows={4}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        更新基本信息
                      </Button>
                    </Form.Item>
                  </Form>
                </ProCard>
              </TabPane>
              <TabPane tab="安全设置" key="2">
                <ProCard bordered headerBordered>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handleUpdatePassword}
                  >
                    <Form.Item
                      label="原密码"
                      name="oldPassword"
                      rules={[
                        { required: true, message: '请输入原密码' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
                    </Form.Item>
                    <Form.Item
                      label="新密码"
                      name="newPassword"
                      rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 8, message: '密码长度不能少于8位' },
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
                    </Form.Item>
                    <Form.Item
                      label="确认新密码"
                      name="checkPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: '请再次输入新密码' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('两次输入的密码不一致'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="请再次输入新密码" />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={passwordLoading}>
                        修改密码
                      </Button>
                    </Form.Item>
                  </Form>
                </ProCard>
              </TabPane>
              <TabPane tab="头像设置" key="3">
                <ProCard bordered headerBordered>
                  <div className={styles.avatarUpload}>
                    <Upload
                      name="file"
                      listType="picture-card"
                      className="avatar-uploader"
                      showUploadList={false}
                      action="/api/file/upload"
                      withCredentials={true}
                      onChange={handleAvatarChange}
                      beforeUpload={(file) => {
                        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                        if (!isJpgOrPng) {
                          message.error('只能上传 JPG/PNG 格式的图片!');
                          return false;
                        }
                        const isLt2M = file.size / 1024 / 1024 < 2;
                        if (!isLt2M) {
                          message.error('图片大小不能超过 2MB!');
                          return false;
                        }
                        return true;
                      }}
                    >
                      {currentUser?.userAvatar ? (
                        <img
                          src={currentUser.userAvatar}
                          alt="avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        uploadButton
                      )}
                    </Upload>
                    <div className={styles.avatarTips}>
                      <p>支持 JPG、PNG 格式，文件大小不超过 2MB</p>
                      <p>建议尺寸：200x200 像素</p>
                    </div>
                  </div>
                </ProCard>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default AccountCenter;
