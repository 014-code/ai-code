import React from 'react';
import {Avatar, Button, Card, Col, message} from "antd";
import {history} from "@@/core/history";

interface AppData {
  id: number,
  appName: string,
  deployKey: string,
  appDesc: string,
  initPrompt: string,
  cover: string,
  user?: { userAvatar: string, userName: string },
}

interface Props {
  app: AppData,
  onCopy: (text: string) => void;
  // 使用 children 作为默认插槽
  children?: React.ReactNode;
}

/**
 * 应用卡片组件
 * @constructor
 * @param props
 */
// @ts-ignore
const AppCard: React.FC<Props> = (props) => {
  const {app, onCopy, children} = props;

  // 复制到剪贴板函数
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 同步填充到父组件输入框
      onCopy(text);
      message.success('复制成功');
    } catch (err) {
      console.error('复制失败:', err);
      // 降级方案：使用老式方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        // 同步填充到父组件输入框
        onCopy(text);
        message.success('复制成功');
      } catch (fallbackErr) {
        message.error('复制失败，请手动复制');
      }
      document.body.removeChild(textArea);
    }
  };


  return (
    <div style={{position: 'relative'}}>
      <Col key={app.id}>
        <Card
          hoverable
          onClick={() => history.push(`http://localhost:8080/${app.deployKey}/`)}
          style={{width: 200, textAlign: "center"}}
          cover={
            <img
              draggable={false}
              alt="example"
              src={app.cover}
            />
          }
        >
          <div style={{marginBottom: '10px', marginLeft: '50px'}}>
            {children}
          </div>
          <Card.Meta
            avatar={<Avatar src={app.user?.userAvatar}/>}
            title={app.appName}
            description={"创建者：" + (app.user?.userName || '')}
          />

        </Card>

        {/* 悬浮遮罩 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          flexDirection: "column",
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          opacity: 0,
          transition: 'opacity 0.3s',
          borderRadius: '8px',
        }}
             onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
             onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
        >
          {/* 查看应用按钮 */}
          <Button
            size={"small"}
            style={{padding: '5px 10px', cursor: 'pointer'}}
            onClick={() => history.push(`http://localhost:8080/${app.deployKey}/`)}
          >
            查看应用
          </Button>
          {/* 复制提示词按钮 */}
          <Button
            size={"small"}
            style={{padding: '5px 10px', cursor: 'pointer'}}
            onClick={() => copyToClipboard(app.initPrompt || '')}
          >
            复制提示词
          </Button>
          {/* 查看对话按钮 */}
          <Button
            size={"small"}
            style={{padding: '5px 10px', cursor: 'pointer'}}
            onClick={() => {
              // 查看对话，跳转相应对话页
              history.push({
                pathname: `/chat/${app.id}`,
              })
            }}
          >
            查看对话
          </Button>
        </div>
      </Col>
    </div>
  );
};

export default AppCard;
