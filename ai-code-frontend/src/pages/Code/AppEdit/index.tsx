import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/context/GlobalContext';
import { getAppVoById, updateApp, updateAppByAdmin } from '@/services/backend/appController';
import { Button, Card, Form, Input, message, Typography, Row, Col } from 'antd';

const { Title } = Typography;
const { TextArea } = Input;

/**
 * 应用编辑页面组件
 * 用于编辑应用的基本信息
 */
const AppEditPage: React.FC = () => {
  // URL 参数，获取应用 ID
  const { appId } = useParams<{ appId: string }>();
  // 导航钩子，用于页面跳转
  const navigate = useNavigate();
  // 全局上下文，获取当前用户信息
  const { currentUser } = useGlobalContext();
  // 表单实例
  const [form] = Form.useForm();
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 应用信息
  const [appInfo, setAppInfo] = useState<any>();

  /**
   * 初始化时获取应用信息
   */
  useEffect(() => {
    if (appId) {
      getAppVoById({ id: appId }).then(({ data }) => {
        setAppInfo(data);
        form.setFieldsValue({ appName: data?.appName, appDesc: data?.appDesc });
      });
    }
  }, [appId]);

  /**
   * 检查用户是否有权限编辑
   * @returns 是否有权限
   */
  const canEdit = () =>
    currentUser?.userRole === 'admin' || appInfo?.userId === currentUser?.id;

  /**
   * 处理表单提交
   * @param values 表单提交的值
   */
  const handleSubmit = (values) => {
    if (!canEdit()) return message.error('无权限');
    setLoading(true);
    // 根据用户角色选择不同的更新方法
    const updateFn = currentUser?.userRole === 'admin' ? updateAppByAdmin : updateApp;
    updateFn({ ...values, id: appId }).then(() => {
      message.success('已保存');
      navigate('/home');
    }).catch((e) => {
      message.error('保存失败：' + e.message);
    }).finally(() => {
      setLoading(false);
    });
  };

  // 无权限时显示的内容
  if (!canEdit()) return (
    <Card style={{ margin: 32, maxWidth: 400 }}>
      <Title level={4}>无权编辑</Title>
      <Button type="primary" onClick={() => navigate('/home')}>返回首页</Button>
    </Card>
  );

  return (
    <Row gutter={16} style={{ margin: 32 }}>
      <Col span={24}>
        <Card>
          <Title level={2}>编辑应用</Title>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item label="应用名称" name="appName" rules={[{ required: true, message: '必填' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="应用描述" name="appDesc">
              <TextArea rows={3} />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" loading={loading}>保存</Button>
              <Button onClick={() => navigate('/home')} style={{ marginLeft: 16 }}>取消</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default AppEditPage;
