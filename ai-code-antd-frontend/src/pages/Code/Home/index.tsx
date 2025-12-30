import React, { useEffect, useState } from 'react';
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage, listAllAppTypes, listAllPresetPrompts } from '@/services/backend/appController';
import { Button, Card, Input, message, Typography, Row, Tag, Dropdown, Space, MenuProps } from 'antd';
import { history } from '@umijs/max';
import AppCard from "@/pages/Code/Home/components/AppCard";
import {
  CheckCircleOutlined,
  DoubleRightOutlined,
  DownOutlined,
  LogoutOutlined,
  ProductOutlined,
  DownOutlined as ChevronDownOutlined,
  UpOutlined
} from "@ant-design/icons";
import { CODE_GEN_TYPE_CONFIG, CodeGenTypeEnum } from "@/constants/codeGenTypeEnum";

const { Title } = Typography, { TextArea } = Input;

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);
  // 应用类别列表
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]);
  // 当前选中的应用类别
  const [selectedAppType, setSelectedAppType] = useState<string>('all');
  // 选择的应用类型
  const [codeType, setCodeType] = useState<string>(CodeGenTypeEnum.HTML);
  // 是否展开所有类别
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  // 预设提示词列表
  const [presetPrompts, setPresetPrompts] = useState<API.PresetPromptVO[]>([]);

  // 下拉框选项值
  const menuItems: MenuProps['items'] = Object.values(CodeGenTypeEnum).map(type => ({
    label: CODE_GEN_TYPE_CONFIG[type].label,
    key: type,
    icon: <ProductOutlined />,
  }));

  //下拉框改变事件
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    // e.key 即枚举值：'html' | 'multi_file' | 'vue_project' | 'react_project'
    setCodeType(e.key);
  };

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
   * 复制提示词到输入框内
   */
  function inputCopy(text: string) {
    setPrompt(text);
  }

  useEffect(() => {
    listMyAppVoByPage({ pageNum: 1, pageSize: 8 }).then(({ data }) => setMyApps(data?.records || []));
    listFeaturedAppVoByPage({
      pageNum: 1,
      pageSize: 8,
      appType: selectedAppType === 'all' ? undefined : selectedAppType
    }).then(({ data }) => setFeaturedApps(data?.records || []));
    // 加载应用类别
    listAllAppTypes().then(({ data }) => setAppTypes(data || []));
    // 加载预设提示词
    listAllPresetPrompts().then(({ data }) => setPresetPrompts(data || []));
  }, [selectedAppType]);

  return (
    <div style={{ padding: 32, width: 1600, margin: '0 auto' }}>
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
      <Card style={{ margin: '50px auto', position: "relative", maxWidth: 700, borderRadius: 30, paddingBottom: 60 }}>
        <TextArea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入你的应用名称"
          style={{ resize: 'none', fontSize: '22px' }} />
        {/* 预设提示词标签 */}
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
            {/* 全部按钮 */}
            <Button
              shape="round"
              size="large"
              type={selectedAppType === 'all' ? 'primary' : 'default'}
              onClick={() => setSelectedAppType('all')}
            >
              全部
            </Button>
            {/* 动态渲染应用类别按钮 - 默认显示前6个，点击展开后显示全部 */}
            {appTypes
              .slice(0, isExpanded ? appTypes.length : 6)
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
            {/* 展开/收起按钮 - 当类别超过6个时显示 */}
            {appTypes.length > 6 && (
              <Button
                type="text"
                size="large"
                onClick={() => setIsExpanded(!isExpanded)}
                icon={isExpanded ? <UpOutlined /> : <ChevronDownOutlined />}
              >
                {isExpanded ? '收起' : '展开'}
              </Button>
            )}
          </div>
          {/*// @ts-ignore*/}
          <Button type={"primary"} shape="round" icon={<DoubleRightOutlined />} size={"large"}
            onClick={() => history.push("/cases")}>全部案例</Button>
        </div>
        <Row gutter={16}>
          {featuredApps.map(app => (
            // eslint-disable-next-line react/jsx-key
            <AppCard app={app} onCopy={inputCopy} children={<Tag icon={<CheckCircleOutlined />} color="success">
              精选
            </Tag>}></AppCard>
          ))}
        </Row>
      </Card>
      <Card title="我的应用" style={{ marginBottom: 24, marginTop: 24 }}>
        <Row gutter={16}>
          {myApps.map(app => (
            // eslint-disable-next-line react/jsx-key
            <AppCard app={app} onCopy={inputCopy}></AppCard>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default HomePage;
