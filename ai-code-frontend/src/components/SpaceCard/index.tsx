import React from 'react';
import { Avatar, Button, Card, Col, Empty, message, Space, Skeleton, Tag } from "antd";
import { useNavigate } from 'react-router-dom';
import { TeamOutlined, UserOutlined, PlusOutlined } from "@ant-design/icons";
import { SpaceTypeEnum, getSpaceTypeLabel } from "@/constants/spaceTypeEnum";
import styles from './SpaceCard.module.less';

interface SpaceData {
  id: string,
  spaceName: string,
  spaceType: number,
  spaceDesc: string,
  memberCount?: number,
  appCount?: number,
  user?: { userAvatar: string, userName: string },
}

interface Props {
  space: SpaceData;
  onEdit?: (space: SpaceData) => void;
  onDelete?: (spaceId: string) => void;
  loading?: boolean;
}

const SpaceCard: React.FC<Props> = (props) => {
  const { space, onEdit, onDelete, loading = false } = props;
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/space/${space.id}`);
  };

  const getSpaceTypeTag = (type: number) => {
    if (type === 1) {
      return <Tag color="blue" icon={<UserOutlined />}>{getSpaceTypeLabel(SpaceTypeEnum.PERSONAL)}</Tag>;
    } else if (type === 2) {
      return <Tag color="green" icon={<TeamOutlined />}>{getSpaceTypeLabel(SpaceTypeEnum.TEAM)}</Tag>;
    }
    return <Tag>{type}</Tag>;
  };

  return (
    <div className={styles.spaceCardWrapper}>
      {loading ? (
        <Card className={styles.skeletonCard}>
          <Skeleton.Image active className={styles.skeletonImage} />
          <Skeleton active paragraph={{ rows: 2 }} />
        </Card>
      ) : (
        <Card
          hoverable
          onClick={handleCardClick}
          className={styles.spaceCard}
          cover={
            <div className={styles.cardCover}>
              <div className={styles.coverContent}>
                {space.spaceType === 1 ? (
                  <UserOutlined className={styles.coverIcon} />
                ) : (
                  <TeamOutlined className={styles.coverIcon} />
                )}
              </div>
            </div>
          }
        >
          <div className={styles.cardContent}>
            <div className={styles.spaceName}>{space.spaceName}</div>
            <div className={styles.spaceDesc}>{space.spaceDesc || '暂无描述'}</div>
            <div className={styles.spaceStats}>
              <div className={styles.statItem}>
                <TeamOutlined />
                <span>{space.memberCount || 0} 成员</span>
              </div>
              <div className={styles.statItem}>
                <PlusOutlined />
                <span>{space.appCount || 0} 应用</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {!loading && (
        <div className={styles.cardOverlay}>
          <Button
            size={"large"}
            className={styles.overlayButton}
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick();
            }}
          >
            进入空间
          </Button>
          {onEdit && (
            <Button
              size={"large"}
              className={styles.overlayButton}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(space);
              }}
            >
              编辑空间
            </Button>
          )}
          {onDelete && (
            <Button
              size={"large"}
              className={styles.overlayButton}
              danger
              onClick={(e) => {
                e.stopPropagation();
                onDelete(space.id);
              }}
            >
              删除空间
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SpaceCard;
