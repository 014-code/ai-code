import React, { useEffect, useState } from 'react';
import { useParams, history } from '@umijs/max';
import { getAppVoById, updateApp, updateAppByAdmin } from '@/services/backend/appController';
import { Button, Card, Form, Input, message, Typography } from 'antd';
const { Title } = Typography, { TextArea } = Input;

const AppEditPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [appInfo, setAppInfo] = useState<any>();
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}'); // 假定用 localStorage 临时替代

  useEffect(() => {
    appId && getAppVoById({ id: appId }).then(({ data }) => {
      setAppInfo(data);
      form.setFieldsValue({ appName: data?.appName, appDesc: data?.appDesc });
    });
  }, [appId]);

  const canEdit = () =>
    currentUser?.userRole === 'admin' || appInfo?.userId === currentUser?.id;

  const handleSubmit = async (values: any) => {
    if (!canEdit()) return message.error('无权限');
    setLoading(true);
    try {
      if (currentUser?.userRole === 'admin') await updateAppByAdmin({ ...values, id: appId });
      else await updateApp({ ...values, id: appId });
      message.success('已保存'); history.push('/home');
    } catch (e: any) { message.error('保存失败：' + e.message); }
    setLoading(false);
  };

  if (!canEdit()) return (
    <Card style={{ margin: 32, maxWidth: 400 }}>
      <Title level={4}>无权编辑</Title>
      <Button type="primary" onClick={() => history.push('/home')}>返回首页</Button>
    </Card>
  );

  return (
    <Card style={{ margin: 32, maxWidth: 600 }}>
      <Title level={2}>编辑应用</Title>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item label="应用名称" name="appName" rules={[{ required: true, message: '必填' }]}> <Input /> </Form.Item>
        <Form.Item label="应用描述" name="appDesc"> <TextArea rows={3} /> </Form.Item>
        <Form.Item>
          <Button htmlType="submit" type="primary" loading={loading}>保存</Button>
          <Button onClick={() => history.push('/home')} style={{ marginLeft: 16 }}>取消</Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AppEditPage;