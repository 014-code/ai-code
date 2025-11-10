import React, {useEffect, useState} from 'react';
import {addApp, listMyAppVoByPage, listFeaturedAppVoByPage} from '@/services/backend/appController';
import {Button, Card, Input, message, Typography, Row, Tag, Dropdown, Space, MenuProps} from 'antd';
import {history} from '@umijs/max';
import AppCard from "@/pages/Code/Home/components/AppCard";
import {
  CheckCircleOutlined,
  DoubleRightOutlined,
  DownOutlined,
  LogoutOutlined,
  ProductOutlined
} from "@ant-design/icons";
import {CODE_GEN_TYPE_CONFIG, CodeGenTypeEnum} from "@/constants/codeGenTypeEnum";

const {Title} = Typography, {TextArea} = Input;

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [myApps, setMyApps] = useState<any[]>([]);
  const [featuredApps, setFeaturedApps] = useState<any[]>([]);
  // 选择的应用类型（必须存 value，而不是 label）
  const [codeType, setCodeType] = useState<string>(CodeGenTypeEnum.HTML);

  // 下拉框选项值
  const menuItems: MenuProps['items'] = Object.values(CodeGenTypeEnum).map(type => ({
    label: CODE_GEN_TYPE_CONFIG[type].label,
    key: type,
    icon: <ProductOutlined/>,
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
      const {data: appId} = await addApp({appName: prompt, appDesc: prompt, initPrompt: prompt, codeGenType: codeType});
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
    listMyAppVoByPage({pageNum: 1, pageSize: 8}).then(({data}) => setMyApps(data?.records || []));
    listFeaturedAppVoByPage({pageNum: 1, pageSize: 8}).then(({data}) => setFeaturedApps(data?.records || []));
  }, []);

  return (
    <div style={{padding: 32, width: 1300, margin: '0 auto'}}>
      <Title level={2} style={{color: '#1890ff', fontWeight: 'bold', marginBottom: 0}}>AI 低代码应用生成器</Title>
      <Card style={{margin: '24px 0', position: "relative"}}>
        {/*下拉选择应用生成类型*/}
        <div style={{marginBottom: '30px'}}>
          <Dropdown menu={{
            items: menuItems,
            onClick: handleMenuClick
          }}>
            <Button>
              <Space>
                {CODE_GEN_TYPE_CONFIG[codeType as CodeGenTypeEnum]?.label || '选择类型'}
                <DownOutlined/>
              </Space>
            </Button>
          </Dropdown>
        </div>
        <TextArea rows={8} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="输入你的应用名称"
                  style={{resize: 'none', fontSize: '22px'}}/>
        <Button type="primary" loading={loading}
                style={{marginTop: 8, position: "absolute", bottom: "40px", right: "40px"}} onClick={handleCreateApp}
                size={"large"}>创建应用</Button>
      </Card>
      <Card title="应用商城">
        <div style={{display: "flex", justifyContent: "space-between", marginBottom: '20px'}}>
          <Dropdown menu={{
            items: menuItems,
            onClick: handleMenuClick
          }}>
            <Button shape="round" icon={<LogoutOutlined/>} size={"large"}>
              <Space>
                {CODE_GEN_TYPE_CONFIG[codeType as CodeGenTypeEnum]?.label || '选择类型'}
                <DownOutlined/>
              </Space>
            </Button>
          </Dropdown>
          {/*todo 标签查询*/}
          <Button shape="round" size={"large"}>
            全部
          </Button>
          <Button shape="round" size={"large"}>
            管理系统
          </Button>
          {/*// @ts-ignore*/}
          <Button type={"primary"} shape="round" icon={<DoubleRightOutlined/>} size={"large"} onClick={() => history.push("/cases")}>全部案例</Button>
        </div>
        <Row gutter={16}>
          {featuredApps.map(app => (
            // eslint-disable-next-line react/jsx-key
            <AppCard app={app} onCopy={inputCopy} children={<Tag icon={<CheckCircleOutlined/>} color="success">
              精选
            </Tag>}></AppCard>
          ))}
        </Row>
      </Card>
      <Card title="我的应用" style={{marginBottom: 24}}>
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
