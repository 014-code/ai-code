import React, { useEffect, useState } from 'react';
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage, listAllAppTypes, listAllPresetPrompts } from '@/services/backend/appController';
import { Button, Card, Input, message, Typography, Row, Col, Tag, Dropdown, Space, MenuProps, Pagination } from 'antd';
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
import Logo from "@/components/Logo";
import { createParticleBurst } from "@/utils/animation";
import InteractiveBackground from "@/components/InteractiveBackground";
import styles from './index.less';

const { Title } = Typography, { TextArea } = Input;

const DEFAULT_MY_APPS_PAGE_SIZE = 8;
const DEFAULT_FEATURED_APPS_PAGE_SIZE = 10;
const MAX_VISIBLE_APP_TYPES = 6;

/**
 * 首页组件
 * AI 零代码应用生成器的主页面
 * 提供应用创建、应用商城、我的应用等功能
 * @returns React 组件
 */
const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);
  const [myAppsTotal, setMyAppsTotal] = useState(0);
  const [myAppsPageNum, setMyAppsPageNum] = useState(1);
  const [myAppsPageSize, setMyAppsPageSize] = useState(DEFAULT_MY_APPS_PAGE_SIZE);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [featuredAppsLoading, setFeaturedAppsLoading] = useState(false);
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]);
  const [selectedAppType, setSelectedAppType] = useState<string>('all');
  const [codeType, setCodeType] = useState<string>(CodeGenTypeEnum.HTML);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [presetPrompts, setPresetPrompts] = useState<API.PresetPromptVO[]>([]);
  const [typingPlaceholder, setTypingPlaceholder] = useState('');

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
   * 根据用户输入的提示词创建新应用，并跳转到对话页面
   */
  const handleCreateApp = async () => {
    if (!prompt.trim()) return message.warning('请输入提示词');
    setLoading(true);
    try {
      const { data: appId } = await addApp({ appName: prompt, appDesc: prompt, initPrompt: prompt, codeGenType: codeType });
      message.success('创建成功');
      history.push(`/chat/${appId}?prompt=${encodeURIComponent(prompt)}`);
    } catch (e: any) {
      message.error('创建失败:' + e.message);
    }
    setLoading(false);
  };

  /**
   * 加载我的应用列表
   * @param pageNum - 页码，默认为 1
   * @param pageSize - 每页数量，默认为 DEFAULT_MY_APPS_PAGE_SIZE
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
   * @param page - 当前页码
   * @param pageSize - 每页数量
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setMyAppsPageNum(page);
    setMyAppsPageSize(pageSize);
    loadMyApps(page, pageSize);
  };

  /**
   * 加载精选应用列表
   * @param appType - 应用类型，'all' 表示所有类型
   */
  const loadFeaturedApps = async (appType: string) => {
    setFeaturedAppsLoading(true);
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
    setFeaturedAppsLoading(false);
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
   * @param text - 要复制的文本
   */
  const inputCopy = (text: string) => {
    setPrompt(text);
  };

  /**
   * 处理预设标签点击
   * @param text - 提示词文本
   * @param event - 鼠标事件
   */
  const handlePresetTagClick = (text: string, event: React.MouseEvent) => {
    createParticleBurst(event);
    setPrompt(text);
  };

  useEffect(() => {
    loadMyApps(1, DEFAULT_MY_APPS_PAGE_SIZE);
    loadFeaturedApps(selectedAppType);
    loadAppTypes();
    loadPresetPrompts();
  }, [selectedAppType]);

  useEffect(() => {
    if (presetPrompts.length === 0) return;

    let charIndex = 0;
    let isDeleting = false;
    let currentIndex = 0;

    const typeEffect = () => {
      const currentPrompt = presetPrompts[currentIndex].prompt || '';

      if (!isDeleting && charIndex < currentPrompt.length) {
        setTypingPlaceholder(currentPrompt.substring(0, charIndex + 1));
        charIndex++;
        setTimeout(typeEffect, 150);
      } else if (!isDeleting && charIndex >= currentPrompt.length) {
        setTimeout(() => {
          isDeleting = true;
          typeEffect();
        }, 3000);
      } else if (isDeleting && charIndex > 0) {
        setTypingPlaceholder(currentPrompt.substring(0, charIndex - 1));
        charIndex--;
        setTimeout(typeEffect, 80);
      } else {
        isDeleting = false;
        charIndex = 0;
        currentIndex = (currentIndex + 1) % presetPrompts.length;
        setTimeout(typeEffect, 500);
      }
    };

    typeEffect();
  }, [presetPrompts]);

  return (
    <>
      <InteractiveBackground />
      <div className={styles.homePageContainer}>
        <div className={styles.headerSection}>
          <Logo size={120} />
          <Title level={2} className={styles.title}>CodeFree Builder -Nexus Creator
            <p>构建精美应用--只需靠 说</p>
          </Title>
        </div>
      <Card className={styles.createCard}>
        <TextArea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={typingPlaceholder} className={styles.textArea} />
        <Button type="primary" loading={loading} className={styles.createButton} onClick={handleCreateApp} size={"large"}>创建应用</Button>
      </Card>
      {presetPrompts.length > 0 && (
        <div className={styles.presetPromptsContainer}>
          <div className={styles.presetPromptsTitle}>
          </div>
          <div className={styles.presetTagsWrapper}>
            {presetPrompts.map((item) => (
              <Tag
                key={item.label}
                className={styles.presetTag}
                onClick={(e) => handlePresetTagClick(item.prompt || '', e)}
              >
                {item.label}
              </Tag>
            ))}
          </div>
        </div>
      )}
      <Card title="应用商城">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
          <Dropdown menu={{
            items: menuItems,
            onClick: handleMenuClick
          }}>
            <Button shape="round" icon={<LogoutOutlined />} size={"large"} className={styles.outlineGradientButton}>
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
              className={selectedAppType === 'all' ? styles.gradientButton : styles.outlineGradientButton}
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
                  className={selectedAppType === appType.text ? styles.gradientButton : styles.outlineGradientButton}
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
            onClick={() => history.push("/cases")} className={styles.gradientButton}>全部案例</Button>
        </div>
        <Row gutter={[16, 16]}>
          {featuredApps.map(app => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={app.id}>
              <AppCard app={app} onCopy={inputCopy} loading={featuredAppsLoading}>
                <Tag icon={<CheckCircleOutlined />} color="success">
                  精选
                </Tag>
              </AppCard>
            </Col>
          ))}
        </Row>
      </Card>
      <Card title="我的应用" style={{ marginBottom: 24, marginTop: 24 }} loading={myAppsLoading}>
        <Row gutter={[16, 16]}>
          {myApps.map(app => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={app.id}>
              <AppCard app={app} onCopy={inputCopy}></AppCard>
            </Col>
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
    </>
  );
};

export default HomePage;
