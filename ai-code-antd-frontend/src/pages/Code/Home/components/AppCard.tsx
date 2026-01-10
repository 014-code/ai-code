import React from 'react';
import {Avatar, Button, Card, Col, Empty, message, Space, Skeleton, Tag} from "antd";
import {history} from "@@/core/history";
import {getStaticPreviewUrl} from "@/constants/proUrlOperation";
import {EyeOutlined} from "@ant-design/icons";
import styles from './AppCard.less';

interface AppData {
  id: number,
  appName: string,
  deployKey: string,
  appDesc: string,
  initPrompt: string,
  cover: string,
  pageViews?: number,
  appType?: string,
  user?: { userAvatar: string, userName: string },
}

interface Props {
  app: AppData,
  onCopy: (text: string) => void;
  // 使用 children 作为默认插槽
  children?: React.ReactNode;
  // 是否加载中
  loading?: boolean;
}

/**
 * 应用卡片组件
 * @constructor
 * @param props
 */
// @ts-ignore
const AppCard: React.FC<Props> = (props) => {
  const {app, onCopy, children, loading = false} = props;

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
    <div className={styles.appCardWrapper}>
      <Col key={app.id}>
        {loading ? (
          <Card className={styles.skeletonCard}>
            <Skeleton.Image active className={styles.skeletonImage} />
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ) : (
          <Card
            hoverable
            //@ts-ignore
            onClick={() => history.push(getStaticPreviewUrl(app.codeGenType, app.id, app.deployKey))}
            className={styles.appCard}
            cover={
              app.cover ? (
                <div className={styles.cardCover}>
                  <img
                    draggable={false}
                    alt="example"
                    src={app.cover}
                  />
                </div>
              ) : (
                <div className={styles.cardEmpty}>
                  <div className={styles.skeletonCover}>
                    <div className={styles.skeletonShimmer}></div>
                    <div className={styles.skeletonIcon}></div>
                    <div className={styles.skeletonTitle}></div>
                    <div className={styles.skeletonSubtitle}></div>
                  </div>
                </div>
              )
            }
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {app.appType && (
                <Tag color="blue">{app.appType}</Tag>
              )}
              {children}
            </div>
            <Card.Meta
              avatar={<Avatar src={app.user?.userAvatar}/>}
              title={app.appName}
              description={
                <div>
                  <div>{"创建者：" + (app.user?.userName || '')}</div>
                  {app.pageViews !== undefined && (
                    <Space size={4} className={styles.pageViews}>
                      <EyeOutlined/>
                      <span>{app.pageViews || 0}</span>
                    </Space>
                  )}
                </div>
              }
            />

          </Card>
        )}

        {!loading && (
          <div className={styles.cardOverlay}>
            {/* 查看应用按钮 */}
            <Button
              size={"large"}
              className={styles.overlayButton}
              //@ts-ignore
              onClick={() => history.push(getStaticPreviewUrl(app.codeGenType, app.id, app.deployKey))}
            >
              查看应用
            </Button>
            {/* 复制提示词按钮 */}
            <Button
              size={"large"}
              className={styles.overlayButton}
              onClick={() => copyToClipboard(app.initPrompt || '')}
            >
              复制提示词
            </Button>
            {/* 查看对话按钮 */}
            <Button
              size={"large"}
              className={styles.overlayButton}
              onClick={() => {
                history.push(`/chat/${app.id}`)
              }}
            >
              查看对话
            </Button>
          </div>
        )}
      </Col>
    </div>
  );
};

export default AppCard;
