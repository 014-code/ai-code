import React, {useEffect, useState} from 'react';
import {addApp, listMyAppVoByPage, listFeaturedAppVoByPage} from '@/services/backend/appController';
import {Button, Card, Input, message, Typography, Row, Col} from 'antd';
import {history} from '@umijs/max';
import AppCard from "@/pages/Code/Home/components/AppCard";

const {Title} = Typography, {TextArea} = Input;

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);

  const handleCreateApp = async () => {
    if (!prompt.trim()) return message.warning('请输入提示词');
    setLoading(true);
    try {
      const {data: appId} = await addApp({appName: prompt, appDesc: prompt, initPrompt: prompt});
      message.success('创建成功');
      history.push(`/chat/${appId}`);
    } catch (e: any) {
      message.error('创建失败:' + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    listMyAppVoByPage({pageNum: 1, pageSize: 8}).then(({data}) => setMyApps(data?.records || []));
    listFeaturedAppVoByPage({pageNum: 1, pageSize: 8}).then(({data}) => setFeaturedApps(data?.records || []));
  }, []);

  return (
    <div style={{padding: 32, width: 1300, margin: '0 auto'}}>
      <Title>AI 应用生成</Title>
      <Card style={{margin: '24px 0', position: "relative"}}>
        <TextArea rows={8} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入你的应用名称"
                  style={{resize: 'none', fontSize: '22px'}}/>
        <Button type="primary" loading={loading} style={{marginTop: 8, position: "absolute", bottom: "40px", right: "40px"}} onClick={handleCreateApp} size={"large"}>创建应用</Button>
      </Card>
      <Card title="精选应用">
        <Row gutter={16}>
          {featuredApps.map(app => (
            // eslint-disable-next-line react/jsx-key
            <AppCard app={app}></AppCard>
          ))}
        </Row>
      </Card>
      <Card title="我的应用" style={{marginBottom: 24}}>
        <Row gutter={16}>
          {myApps.map(app => (
            <>
              <AppCard app={app}></AppCard>
            </>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
