import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addApp, listMyAppVoByPage, listFeaturedAppVoByPage, listAllAppTypes, listAllPresetPrompts } from '@/services/backend/appController';
import { listEnabledModels } from '@/services/backend/aiModelController';
import { Button, Card, Input, message, Typography, Row, Col, Tag, Dropdown, Space, Pagination, Select } from 'antd';
import type { MenuProps } from 'antd';
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
import styles from './index.module.less';

const { Title } = Typography;
const { TextArea } = Input;

// 常量定义
const DEFAULT_MY_APPS_PAGE_SIZE = 8; // 默认我的应用分页大小
const DEFAULT_FEATURED_APPS_PAGE_SIZE = 10; // 默认精选应用分页大小
const MAX_VISIBLE_APP_TYPES = 6; // 最大可见应用类型数量

/**
 * 主页组件
 * 应用的首页，包含创建应用、展示我的应用和精选应用等功能
 */
const HomePage: React.FC = () => {
  // 状态管理
  const [prompt, setPrompt] = useState(''); // 提示词
  const [loading, setLoading] = useState(false); // 创建应用加载状态
  const [myApps, setMyApps] = useState<[]>([]); // 我的应用列表
  const [featuredApps, setFeaturedApps] = useState<[]>([]); // 精选应用列表
  const [myAppsTotal, setMyAppsTotal] = useState(0); // 我的应用总数
  const [myAppsPageNum, setMyAppsPageNum] = useState(1); // 我的应用当前页码
  const [myAppsPageSize, setMyAppsPageSize] = useState(DEFAULT_MY_APPS_PAGE_SIZE); // 我的应用每页大小
  const [myAppsLoading, setMyAppsLoading] = useState(false); // 我的应用加载状态
  const [featuredAppsLoading, setFeaturedAppsLoading] = useState(false); // 精选应用加载状态
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]); // 应用类型列表
  const [selectedAppType, setSelectedAppType] = useState<string>('all'); // 选中的应用类型
  const [codeType, setCodeType] = useState<string>(CodeGenTypeEnum.HTML); // 代码生成类型
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // 应用类型是否展开
  const [presetPrompts, setPresetPrompts] = useState<API.PresetPromptVO[]>([]); // 预设提示词列表
  const [typingPlaceholder, setTypingPlaceholder] = useState(''); // 打字效果占位符
  const [models, setModels] = useState<API.AiModelConfig[]>([]); // AI模型列表
  const [selectedModelKey, setSelectedModelKey] = useState<string>(''); // 选中的模型key

  // 导航钩子
  const navigate = useNavigate();

  // 代码类型下拉菜单配置
  const menuItems: MenuProps['items'] = Object.values(CodeGenTypeEnum).map(type => ({
    label: CODE_GEN_TYPE_CONFIG[type].label,
    key: type,
    icon: <ProductOutlined key={`icon-${type}`} />,
  }));

  /**
   * 处理代码类型选择
   * @param e 菜单点击事件
   */
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setCodeType(e.key);
  };

  /**
   * 处理创建应用
   */
  const handleCreateApp = async () => {
    if (!prompt.trim()) return message.warning('请输入提示词');
    setLoading(true);
    try {
      const { data: appId } = await addApp({ 
        appName: prompt, 
        appDesc: prompt, 
        initPrompt: prompt, 
        codeGenType: codeType,
        modelKey: selectedModelKey 
      });
      message.success('创建成功');
      navigate(`/chat/${appId}?prompt=${encodeURIComponent(prompt)}`);
    } catch (e) {
      message.error('创建失败:' + e.message);
    }
    setLoading(false);
  };

  /**
   * 加载我的应用列表
   * @param pageNum 页码
   * @param pageSize 每页大小
   */
  const loadMyApps = async (pageNum: number = 1, pageSize: number = DEFAULT_MY_APPS_PAGE_SIZE) => {
    setMyAppsLoading(true);
    try {
      const { data } = await listMyAppVoByPage({ pageNum, pageSize });
      setMyApps(data?.records || []);
      setMyAppsTotal(data?.total || 0);
    } catch (error) {
      message.error('加载我的应用失败');
    }
    setMyAppsLoading(false);
  };

  /**
   * 处理分页变化
   * @param page 页码
   * @param pageSize 每页大小
   */
  const handlePageChange = (page: number, pageSize: number) => {
    setMyAppsPageNum(page);
    setMyAppsPageSize(pageSize);
    loadMyApps(page, pageSize);
  };

  /**
   * 加载精选应用列表
   * @param appType 应用类型
   */
  const loadFeaturedApps = async (appType: string) => {
    setFeaturedAppsLoading(true);
    try {
      const res = await listFeaturedAppVoByPage({
        pageNum: 1,
        pageSize: DEFAULT_FEATURED_APPS_PAGE_SIZE,
        appType: appType === 'all' ? undefined : appType
      });
      setFeaturedApps(res.data?.records || []);
    } catch (error) {
      console.error('加载精选应用失败:', error);
      setFeaturedApps([]);
    }
    setFeaturedAppsLoading(false);
  };

  /**
   * 加载应用类型列表
   */
  const loadAppTypes = async () => {
    try {
      const res = await listAllAppTypes();
      setAppTypes(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error('加载应用类型失败:', error);
      setAppTypes([]);
    }
  };

  /**
   * 加载预设提示词列表
   */
  const loadPresetPrompts = async () => {
    try {
      const { data } = await listAllPresetPrompts();
      setPresetPrompts(data || []);
    } catch (error) {
      message.error('加载预设提示词失败');
    }
  };

  /**
   * 加载AI模型列表
   */
  const loadModels = async () => {
    try {
      const { data } = await listEnabledModels();
      setModels(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedModelKey(data[0].modelKey);
      }
    } catch (error) {
      message.error('加载AI模型失败');
    }
  };

  /**
   * 复制应用提示词
   * @param text 提示词文本
   */
  const inputCopy = (text: string) => {
    setPrompt(text);
  };

  /**
   * 处理预设标签点击
   * @param text 预设提示词
   * @param event 点击事件
   */
  const handlePresetTagClick = (text: string, event: React.MouseEvent) => {
    createParticleBurst(event);
    setPrompt(text);
  };

  /**
   * 初始化加载数据
   */
  useEffect(() => {
    loadMyApps(1, DEFAULT_MY_APPS_PAGE_SIZE);
    loadFeaturedApps(selectedAppType);
    loadAppTypes();
    loadPresetPrompts();
    loadModels();
  }, [selectedAppType]);

  /**
   * 打字效果动画
   */
  useEffect(() => {
    if (presetPrompts.length === 0) return;

    let charIndex = 0;
    let isDeleting = false;
    let currentIndex = 0;

    const typeEffect = () => {
      if (!presetPrompts[currentIndex]) {
        currentIndex = 0;
      }
      const currentPrompt = presetPrompts[currentIndex]?.prompt || '';

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
        {/* 头部区域 */}
        <div className={styles.headerSection}>
          <Logo size={120} />
          <Title level={2} className={styles.title}>CodeFree Builder -Nexus Creator
            <p>构建精美应用--只需靠 说</p>
          </Title>
        </div>
        
        {/* 创建应用卡片 */}
        <Card className={styles.createCard}>
          <TextArea rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={typingPlaceholder} className={styles.textArea} />
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <Select
              value={selectedModelKey}
              onChange={setSelectedModelKey}
              placeholder="选择AI模型"
              style={{ width: '100%' }}
              size="large"
              options={models.map(model => ({
                label: `${model.modelName} (${model.provider})`,
                value: model.modelKey
              }))}
            />
          </div>
          <Button type="primary" loading={loading} className={styles.createButton} onClick={handleCreateApp} size={"large"}>创建应用</Button>
        </Card>
        
        {/* 预设提示词 */}
        {presetPrompts.length > 0 && (
          <div className={styles.presetPromptsContainer}>
            <div className={styles.presetPromptsTitle}>
            </div>
            <div className={styles.presetTagsWrapper}>
              {presetPrompts.map((item) => (
                <Tag
                  key={item.id}
                  className={styles.presetTag}
                  onClick={(e) => handlePresetTagClick(item.prompt || '', e)}
                >
                  {item.label || '预设'}
                </Tag>
              ))}
            </div>
          </div>
        )}
        
        {/* 应用商城 */}
        <Card title="应用商城">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: '20px' }}>
            {/* 代码类型下拉菜单 */}
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
            
            {/* 应用类型筛选 */}
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
            
            {/* 全部案例按钮 */}
            <Button type={"primary"} shape="round" icon={<DoubleRightOutlined />} size={"large"}
              onClick={() => navigate("/cases")} className={styles.gradientButton}>全部案例</Button>
          </div>
          
          {/* 精选应用列表 */}
          <Row gutter={[16, 16]}>
            {featuredApps.map(app => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={app.id}>
                <AppCard app={app} onCopy={inputCopy} loading={featuredAppsLoading}>
                  <Tag key="featured" icon={<CheckCircleOutlined />} color="success">
                    精选
                  </Tag>
                </AppCard>
              </Col>
            ))}
          </Row>
        </Card>
        
        {/* 我的应用 */}
        <Card title="我的应用" style={{ marginBottom: 24, marginTop: 24 }} loading={myAppsLoading}>
          <Row gutter={[16, 16]}>
            {myApps.map(app => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={app.id}>
                <AppCard app={app} onCopy={inputCopy}></AppCard>
              </Col>
            ))}
          </Row>
          
          {/* 分页控件 */}
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
          
          {/* 空状态 */}
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
