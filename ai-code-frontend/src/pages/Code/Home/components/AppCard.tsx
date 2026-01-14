import React from 'react';
import { Avatar, Button, Card, Col, Empty, message, Space, Skeleton, Tag } from "antd";
import { useNavigate } from 'react-router-dom';
import { getStaticPreviewUrl } from "@/constants/proUrlOperation";
import { EyeOutlined } from "@ant-design/icons";
import styles from './AppCard.module.less';

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
  codeGenType?: string,
}

interface Props {
  app: AppData,
  onCopy: (text: string) => void;
  children?: React.ReactNode;
  loading?: boolean;
}

const AppCard: React.FC<Props> = (props) => {
  const { app, onCopy, children, loading = false } = props;
  const navigate = useNavigate();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onCopy(text);
      message.success('复制成功');
    } catch (err) {
      console.error('复制失败:', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
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
      {loading ? (
        <Card className={styles.skeletonCard}>
          <Skeleton.Image active className={styles.skeletonImage} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      ) : (
        <Card
          hoverable
          onClick={() => window.open(getStaticPreviewUrl(app.codeGenType, app.id, app.deployKey), '_blank')}
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
            avatar={<Avatar src={app.user?.userAvatar} />}
            title={app.appName}
            description={
              <div>
                <div>{"创建者：" + (app.user?.userName || '')}</div>
                {app.pageViews !== undefined && (
                  <Space size={4} className={styles.pageViews}>
                    <EyeOutlined />
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
          <Button
            size={"large"}
            className={styles.overlayButton}
            onClick={() => window.open(getStaticPreviewUrl(app.codeGenType, app.id, app.deployKey), '_blank')}
          >
            查看应用
          </Button>
          <Button
            size={"large"}
            className={styles.overlayButton}
            onClick={() => copyToClipboard(app.initPrompt || '')}
          >
            复制提示词
          </Button>
          <Button
            size={"large"}
            className={styles.overlayButton}
            onClick={() => {
              navigate(`/chat/${app.id}`)
            }}
          >
            查看对话
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppCard;
