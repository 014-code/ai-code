import React, { useEffect, useState } from 'react';
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage, listAllAppTypes, listAllPresetPrompts } from '@/services/backend/appController';
import { Button, Card, Input, message, Typography, Row, Tag, Dropdown, Space, MenuProps, Pagination } from 'antd';
import { history } from '@umijs/max';
import AppCard from "@/pages/Code/Home/components/AppCard";
import {
  CheckCircleOutlined,
  DoubleRightOutlined,
  DownOutlined,
  LogoutOutlined,
  ProductOutlined,
  UpOutlined
} from "@ant-design/icons";
import { CODE_GEN_TYPE_CONFIG, CodeGenTypeEnum } from "@/constants/codeGenTypeEnum";

const { Title } = Typography, { TextArea } = Input;

const PAGE_WIDTH = 1600;
const CARD_MAX_WIDTH = 700;
const CARD_BORDER_RADIUS = 30;
const CARD_PADDING_BOTTOM = 60;
const DEFAULT_MY_APPS_PAGE_SIZE = 8;
const DEFAULT_FEATURED_APPS_PAGE_SIZE = 10;
const MAX_VISIBLE_APP_TYPES = 6;

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);
  const [myAppsTotal, setMyAppsTotal] = useState(0);
  const [myAppsPageNum, setMyAppsPageNum] = useState(1);
  const [myAppsPageSize, setMyAppsPageSize] = useState(DEFAULT_MY_APPS_PAGE_SIZE);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]);
  const [selectedAppType, setSelectedAppType] = useState<string>('all');
  const [codeType, setCodeType] = useState<string>(CodeGenTypeEnum.HTML);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [presetPrompts, setPresetPrompts] = useState<API.PresetPromptVO[]>([]);

  const menuItems: MenuProps['items'] = Object.values(CodeGenTypeEnum).map(type => ({
    label: CODE_GEN_TYPE_CONFIG[type].label,
    key: type,
    icon: <ProductOutlined />,
  }));

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setCodeType(e.key);
  };

  /**
   * 创建新应用
   */
  const handleCreateApp = async () => {
    if (!prompt.trim()) return message.warning('请输入提示词');
    setLoading(true);
    try {
      const { data: appId } = await addApp({ appName: prompt, appDesc: prompt, initPrompt: prompt, codeGenType: codeType });
      message.success('创建成功');
      history.push(`/chat/${appId}`);
    } catch (e: any) {
      message.error('创建失败:' + e.message);
    }
    setLoading(false);
  };

  /**
   * 加载我的应用列表
   */
  const loadMyApps = async (pageNum: number = 1, pageSize: number = DEFAULT_MY_APPS_PAGE_SIZE) => {
    setMyAppsLoading(true);
    try {
      const { data } = await listMyAppVoByPage({ pageNum, pageSize });
      setMyApps(data?.records || []);
      setMyAppsTotal(data?.totalRow || 0);
    } catch (error: any) {
      message.error('加载我的应用失败');
    }
    setMyAppsLoading(false);
  };

  /**
   * 处理分页变化
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setMyAppsPageNum(page);
    setMyAppsPageSize(pageSize);
    loadMyApps(page, pageSize);
  };

  /**
   * 加载精选应用列表
   */
  const loadFeaturedApps = async (appType: string) => {
    try {
      const { data } = await listFeaturedAppVoByPage({
        pageNum: 1,
        pageSize: DEFAULT_FEATURED_APPS_PAGE_SIZE,
        appType: appType === 'all' ? undefined : appType
      });
      setFeaturedApps(data?.records || []);
    } catch (error: any) {
      message.error('加载精选应用失败');
    }
  };

  /**
   * 加载应用类型列表
   */
  const loadAppTypes = async () => {
    try {
      const { data } = await listAllAppTypes();
      setAppTypes(data || []);
    } catch (error: any) {
      message.error('加载应用类型失败');
    }
  };

  /**
   * 加载预设提示词列表
   */
  const loadPresetPrompts = async () => {
    try {
      const { data } = await listAllPresetPrompts();
      setPresetPrompts(data || []);
    } catch (error: any) {
      message.error('加载预设提示词失败');
    }
  };

  /**
   * 复制文本到输入框
   */
  const inputCopy = (text: string) => {
    setPrompt(text);
  };

  useEffect(() => {
    loadMyApps(1, DEFAULT_MY_APPS_PAGE_SIZE);
    loadFeaturedApps(selectedAppType);
    loadAppTypes();
    loadPresetPrompts();
  }, [selectedAppType]);

  return (
    <div style={{ padding: 32, width: PAGE_WIDTH, margin: '0 auto' }}>
      <Title level={2} style={{
        background: 'linear-gradient(135deg, #1890ff, #52c41a)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        marginBottom: 0,
        textAlign: 'center',
        fontSize: '42px',
        fontFamily: 'Arial, sans-serif'
      }}>AI 零代码应用生成器</Title>
      <Card style={{ margin: '50px auto', position: "relative", maxWidth: CARD_MAX_WIDTH, borderRadius: CARD_BORDER_RADIUS, paddingBottom: CARD_PADDING_BOTTOM }}>
        <TextArea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入你的应用名称"
          style={{ resize: 'none', fontSize: '22px' }} />
        {presetPrompts.length > 0 && (
          <div style={{ marginTop: 12, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {presetPrompts.map((item) => (
              <Tag
                key={item.label}
                style={{ cursor: 'pointer', fontSize: '13px', padding: '4px 12px' }}
                onClick={() => setPrompt(item.prompt || '')}
              >
                {item.label}
              </Tag>
            ))}
          </div>
        )}
        <Button type="primary" loading={loading}
          style={{ position: "absolute", bottom: "20px", right: "20px" }} onClick={handleCreateApp}
          size={"large"}>创建应用</Button>
      </Card>
      <Card title="应用商城">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
          <Dropdown menu={{
            items: menuItems,
            onClick: handleMenuClick
          }}>
            <Button shape="round" icon={<LogoutOutlined />} size={"large"}>
              <Space>
                {CODE_GEN_TYPE_CONFIG[codeType as CodeGenTypeEnum]?.label || '选择类型'}
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>
          <div style={{ display: "flex", gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              shape="round"
              size="large"
              type={selectedAppType === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedAppType('all')}
            >
              全部
            </Button>
            {appTypes
              .slice(0, isExpanded ? appTypes.length : MAX_VISIBLE_APP_TYPES)
              .map((appType) => (
                <Button
                  key={appType.code}
                  shape="round"
                  size="large"
                  type={selectedAppType === appType.text ? 'primary' : 'default'}
                  onClick={() => setSelectedAppType(appType.text || '')}
                >
                  {appType.text}
                </Button>
              ))}
            {appTypes.length > MAX_VISIBLE_APP_TYPES && (
              <Button
                type="text"
                size="large"
                onClick={() => setIsExpanded(!isExpanded)}
                icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
              >
                {isExpanded ? '收起' : '展开'}
              </Button>
            )}
          </div>
          <Button type={"primary"} shape="round" icon={<DoubleRightOutlined />} size={"large"}
            onClick={() => history.push("/cases")}>全部案例</Button>
        </div>
        <Row gutter={16}>
          {featuredApps.map(app => (
            <AppCard key={app.id} app={app} onCopy={inputCopy}>
              <Tag icon={<CheckCircleOutlined />} color="success">
                精选
              </Tag>
            </AppCard>
          ))}
        </Row>
      </Card>
      <Card title="我的应用" style={{ marginBottom: 24, marginTop: 24 }} loading={myAppsLoading}>
        <Row gutter={16}>
          {myApps.map(app => (
            <AppCard key={app.id} app={app} onCopy={inputCopy}></AppCard>
          ))}
        </Row>
        {myAppsTotal > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={myAppsPageNum}
              pageSize={myAppsPageSize}
              total={myAppsTotal}
              onChange={handlePageChange}
              showSizeChanger
              showQuickJumper
              showTotal={(total) => `共 ${total} 条`}
              pageSizeOptions={[8, 12, 16, 20]}
            />
          </div>
        )}
        {myAppsTotal === 0 && !myAppsLoading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#999' }}>
            暂无应用，快去创建一个吧～
          </div>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
