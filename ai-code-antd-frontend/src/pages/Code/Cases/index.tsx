import React, { useEffect, useState } from 'react';
import { Card, message, Row, Typography } from 'antd';
import { listFeaturedAppVoByPage } from '@/services/backend/appController';
import AppCard from '@/pages/Code/Home/components/AppCard';

const { Title, Paragraph } = Typography;

const CasesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [apps, setApps] = useState<API.AppVO[]>([]);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await listFeaturedAppVoByPage({ pageNum: 1, pageSize: 24 });
      if (res.code === 0) {
        setApps(res.data?.records ?? []);
      } else {
        message.error(res.message ?? '加载失败');
      }
    } catch (error: any) {
      message.error(error?.message ?? '加载失败');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCopy = (_text: string) => undefined;

  return (
    <div style={{ padding: 32, width: 1300, margin: '0 auto' }}>
      <Title level={2}>全部案例</Title>
      <Paragraph type="secondary">
        浏览精选案例，直接体验部署效果或复制提示词继续创作。
      </Paragraph>
      <Card loading={loading} style={{ padding: 24 }}>
        <Row gutter={[16, 16]}>
          {apps.map(app => (
            <AppCard key={app.id} app={app as any} onCopy={handleCopy} />
          ))}
        </Row>
        {!apps.length && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#999' }}>
            暂无案例，稍后再来看看吧～
          </div>
        )}
      </Card>
    </div>
  );
};

export default CasesPage;

