import { useEffect, useState } from 'react';
import { useGlobalContext } from '@/context/GlobalContext';
import { getLoginUser, updateUserInfo, updateUserPassword, updateUserAvatar } from '@/services/backend/userController';
import { getFriendRequestList, acceptFriendRequest, rejectFriendRequest } from '@/services/backend/friendController';
import { LockOutlined, MailOutlined, UserOutlined, UserAddOutlined, UserDeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Col, Form, Input, message, Row, List, Empty, Spin } from 'antd';
import type { UploadChangeParam, UploadFile } from 'antd/es/upload';
import { Upload, Tabs, Space } from 'antd';
import { ProCard, ProDescriptions } from '@ant-design/pro-components';
import type { FriendRequestVO } from '@/services/backend/types';
import styles from './index.module.less';

const { TabPane } = Tabs;

/**
 * 账户中心页面组件
 * 用于用户管理个人信息、修改密码和上传头像
 */
const AccountCenter: React.FC = () => {
  // 全局上下文，获取当前用户信息
  const { currentUser, setUserInfo } = useGlobalContext();
  // 表单实例
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  // 加载状态
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  // 好友申请列表
  const [friendRequests, setFriendRequests] = useState<FriendRequestVO[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  /**
   * 初始化时获取用户信息
   * 组件挂载时自动调用，获取当前用户信息和待处理的好友申请列表
   */
  useEffect(() => {
    fetchUserInfo();
    fetchFriendRequests();
  }, []);

  /**
   * 获取好友申请列表
   * 从服务器获取状态为待处理(PENDING)的好友申请
   * 默认获取第一页，每页20条记录
   */
  const fetchFriendRequests = () => {
    setRequestsLoading(true);
    getFriendRequestList({ status: 'PENDING', pageNum: 1, pageSize: 20 })
      .then((response) => {
        setFriendRequests(response.data.records || []);
      })
      .catch((error) => {
        console.error('获取好友申请失败:', error);
        message.error('获取好友申请失败');
      })
      .finally(() => {
        setRequestsLoading(false);
      });
  };

  /**
   * 处理接受好友申请
   * @param requestId 好友申请的ID
   * 接受后会从本地列表中移除该申请，并刷新列表
   */
  const handleAcceptRequest = (requestId: number) => {
    acceptFriendRequest(requestId)
      .then(() => {
        message.success('已接受好友申请');
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      })
      .catch((error) => {
        message.error('接受好友申请失败');
        console.error('接受好友申请失败:', error);
      })
      .finally(() => {
        fetchFriendRequests();
      });
  };

  /**
   * 处理拒绝好友申请
   * @param requestId 好友申请的ID
   * 拒绝后会从本地列表中移除该申请，并刷新列表
   */
  const handleRejectRequest = (requestId: number) => {
    rejectFriendRequest(requestId)
      .then(() => {
        message.success('已拒绝好友申请');
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      })
      .catch((error) => {
        message.error('拒绝好友申请失败');
        console.error('拒绝好友申请失败:', error);
      })
      .finally(() => {
        fetchFriendRequests();
      });
  };

  /**
   * 获取用户信息
   * 从服务器获取当前登录用户的详细信息
   * 更新全局上下文中的用户信息，并同步更新表单数据
   */
  const fetchUserInfo = () => {
    getLoginUser().then((res) => {
      setUserInfo(res.data);
      form.setFieldsValue({
        userName: res.data.userName,
        userProfile: res.data.userProfile,
      });
    }).catch((error) => {
      console.error('获取用户信息失败：', error);
      message.error('获取用户信息失败');
    });
  };

  /**
   * 处理更新基本信息
   * @param values 表单提交的值，包含userName和userProfile
   * 更新成功后重新获取用户信息以同步最新数据
   */
  const handleUpdateInfo = (values: any) => {
    setLoading(true);
    updateUserInfo(values).then((res) => {
      message.success('修改成功');
      fetchUserInfo();
    }).catch(() => {
      message.error('修改失败');
    }).finally(() => {
      setLoading(false);
    });
  };

  /**
   * 处理更新密码
   * @param values 表单提交的值，包含oldPassword、newPassword和checkPassword
   * 密码修改成功后需要用户重新登录，1.5秒后跳转到登录页面
   */
  const handleUpdatePassword = (values: any) => {
    setPasswordLoading(true);
    updateUserPassword(values).then((res) => {
      message.success('密码修改成功，请重新登录');
      passwordForm.resetFields();
      setTimeout(() => {
        window.location.href = '/user/login';
      }, 1500);
    }).catch(() => {
      message.error('修改失败');
    }).finally(() => {
      setPasswordLoading(false);
    });
  };

  /**
   * 处理头像上传变化
   * @param info 上传组件的状态信息，包含文件上传状态和服务器响应
   * 上传状态包括：uploading(上传中)、done(上传完成)、error(上传失败)
   * 上传成功后会将图片URL保存到用户信息中
   */
  const handleAvatarChange = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setAvatarLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      const avatarUrl = info.file.response?.data;
      if (avatarUrl) {
        updateUserAvatar({ userAvatar: avatarUrl }).then((res) => {
          message.success('头像修改成功');
          fetchUserInfo();
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

  // 上传按钮组件
  const uploadButton = (
    <div>
      <Avatar size={100} icon={<UserOutlined />} />
      <div style={{ marginTop: 8 }}>点击上传</div>
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Row gutter={24}>
        {/* 用户信息卡片 */}
        <Col lg={7} md={24}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div className={styles.avatarContainer}>
              <div className={styles.avatarWrapper}>
                {/* 显示用户头像或默认头像 */}
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
            {/* 用户信息描述 */}
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
        {/* 设置选项卡 */}
        <Col lg={17} md={24}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <Tabs defaultActiveKey="1">
              {/* 基本设置 */}
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
              {/* 安全设置 */}
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
              {/* 头像设置 */}
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
              {/* 好友申请 */}
              <TabPane tab={`好友申请${friendRequests.length > 0 ? ` (${friendRequests.length})` : ''}`} key="4">
                <ProCard bordered headerBordered>
                  {requestsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                      <Spin tip="加载中..." />
                    </div>
                  ) : friendRequests.length > 0 ? (
                    <List
                      dataSource={friendRequests}
                      renderItem={(request) => (
                        <List.Item
                          actions={[
                            <Button 
                              type="primary" 
                              size="small" 
                              key="accept"
                              icon={<UserAddOutlined />}
                              onClick={() => handleAcceptRequest(request.id!)}
                            >
                              接受
                            </Button>,
                            <Button 
                              danger 
                              size="small" 
                              key="reject"
                              icon={<UserDeleteOutlined />}
                              onClick={() => handleRejectRequest(request.id!)}
                            >
                              拒绝
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<Avatar size={48} src={request.requester?.userAvatar} icon={<UserOutlined />} />}
                            title={
                              <Space>
                                <span>{request.requester?.userName}</span>
                                <span style={{ color: '#8c8c8c', fontSize: 12 }}>{request.createTime}</span>
                              </Space>
                            }
                            description={request.message || '请求添加您为好友'}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty 
                      description="暂无好友申请" 
                      style={{ padding: '60px 0' }}
                    />
                  )}
                </ProCard>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountCenter;
