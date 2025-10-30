import React, { useEffect, useState } from 'react';
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage } from '@/services/backend/appController';
import { Button, Card, Input, message, Typography, Row, Col } from 'antd';
import { history } from '@umijs/max';

const { Title} = Typography, { TextArea } = Input;

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);

  const handleCreateApp = async () => {
    if (!prompt.trim()) return message.warning('请输入提示词');
    setLoading(true);
    try {
      const { data: appId } = await addApp({ appName: prompt, appDesc: prompt, initPrompt: prompt });
      message.success('创建成功');
      history.push(`/chat/${appId}`);
    } catch (e: any) { message.error('创建失败:' + e.message); }
    setLoading(false);
  };

  useEffect(() => {
    listMyAppVoByPage({ pageNum: 1, pageSize: 8 }).then(({ data }) => setMyApps(data?.records || []));
    listFeaturedAppVoByPage({ pageNum: 1, pageSize: 8 }).then(({ data }) => setFeaturedApps(data?.records || []));
  }, []);

  return (
    <div style={{ padding: 32, width: 1300, margin: '0 auto' }}>
      <Title>AI 应用生成</Title>
      <Card style={{ margin: '24px 0' }}>
        <TextArea rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入你的应用名称"/>
        <Button type="primary" loading={loading} style={{ marginTop: 8 }} onClick={handleCreateApp}>创建应用</Button>
      </Card>
      <Card title="我的应用" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          {myApps.map(app => (
            <>
              <Col span={6} key={app.id}>
                <Card hoverable onClick={() => history.push(`http://localhost:8080/${app.deployKey}/`)}>
                  <b>{app.appName}</b>
                  <div style={{color: '#888', fontSize: 12}}>{app.appDesc}</div>
                </Card>
              </Col>
            </>

          ))}
        </Row>
      </Card>
      <Card title="精选应用">
        <Row gutter={16}>
          {featuredApps.map(app => (
            <Col span={6} key={app.id}>
              <Card hoverable onClick={() => history.push(`http://localhost:8080/${app.deployKey}/`)}>
                <b>{app.appName}</b>
                <div style={{ color: '#888', fontSize: 12 }}>{app.appDesc}</div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
