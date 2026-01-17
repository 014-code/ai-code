import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, message, Row, Col, Typography, Input, Select, Space, Modal, Button, Avatar, Tag, Tooltip, Spin, Empty, List } from 'antd';
import { listMyAppVoByPage } from '@/services/backend/appController';
import { 
  getSpaceById, 
  listSpaceMembers, 
  addAppToSpace, 
  removeAppFromSpace,
  listSpaceAppsByPage
} from '@/services/backend/spaceController';
import AppCard from '@/pages/Code/Home/components/AppCard';
import InviteFriendsModal from '@/components/InviteFriendsModal';
import { SearchOutlined, PlusOutlined, UserOutlined, TeamOutlined, UserAddOutlined, CheckOutlined } from '@ant-design/icons';
import { SpaceTypeEnum, getSpaceTypeLabel } from '@/constants/spaceTypeEnum';
import { SpaceUserRoleEnum, getSpaceUserRoleLabel, getSpaceUserRoleColor } from '@/constants/spaceUserRoleEnum';
import { useScrollLoad } from '@/hooks/useScrollLoad';
import styles from './index.module.less';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const DEFAULT_PAGE_SIZE = 12;

const SpaceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const spaceId = id;

  const [loading, setLoading] = useState(false);
  const [space, setSpace] = useState<API.SpaceVO | null>(null);
  const [members, setMembers] = useState<API.SpaceUserVO[]>([]);
  const [apps, setApps] = useState<API.AppVO[]>([]);
  const [searchKey, setSearchKey] = useState<string>('');
  const [selectedAppType, setSelectedAppType] = useState<string>('all');
  const [myApps, setMyApps] = useState<API.AppVO[]>([]);
  const [addAppModalVisible, setAddAppModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [addAppLoading, setAddAppLoading] = useState(false);
  const [myAppsPageNum, setMyAppsPageNum] = useState(1);
  const [myAppsLoading, setMyAppsLoading] = useState(false);
  const [myAppsHasMore, setMyAppsHasMore] = useState(true);
  const myAppsListRef = React.useRef<HTMLDivElement>(null);

  /**
   * 加载空间详情
   */
  const loadSpaceDetail = () => {
    setLoading(true);
    getSpaceById(spaceId)
      .then((res) => {
        setSpace(res.data || null);
      })
      .catch(() => {
        message.error('加载空间详情失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 加载空间成员列表
   */
  const loadSpaceMembers = () => {
    listSpaceMembers(spaceId)
      .then((res) => {
        setMembers(res.data || []);
      })
      .catch(() => {
        message.error('加载空间成员失败');
      });
  };

  /**
   * 加载空间应用列表
   */
  const loadSpaceApps = (pageNum = 1, pageSize = DEFAULT_PAGE_SIZE) => {
    setLoading(true);
    listSpaceAppsByPage({
      spaceId,
      pageNum,
      pageSize,
    })
      .then((res) => {
        const appsData = res.data?.records || res.data || [];
        setApps(Array.isArray(appsData) ? appsData : []);
      })
      .catch((error) => {
        console.error('加载空间应用失败:', error);
        message.error('加载空间应用失败');
        setApps([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 添加应用到空间
   */
  const handleAddAppToSpace = () => {
    if (!selectedAppId) {
      message.warning('请选择要添加的应用');
      return;
    }

    setAddAppLoading(true);
    addAppToSpace({
      appId: selectedAppId,
      spaceId: spaceId || '0',
    })
      .then(() => {
        message.success('添加应用成功');
        setAddAppModalVisible(false);
        loadSpaceApps();
      })
      .catch(() => {
        message.error('添加应用失败');
      })
      .finally(() => {
        setAddAppLoading(false);
      });
  };

  /**
   * 从空间移除应用
   */
  const handleRemoveAppFromSpace = (appId: string) => {
    removeAppFromSpace({
      appId,
      spaceId: spaceId || '0',
    })
      .then(() => {
        message.success('移除应用成功');
        loadSpaceApps();
      })
      .catch(() => {
        message.error('移除应用失败');
      });
  };

  /**
   * 打开邀请好友弹窗
   */
  const handleInviteFriends = () => {
    setInviteModalVisible(true);
  };

  /**
   * 邀请好友成功回调
   */
  const handleInviteSuccess = () => {
    message.success('邀请好友成功');
    loadSpaceMembers();
  };

  /**
   * 加载我的应用列表
   */
  const loadMyApps = (pageNum = 1, pageSize = 20) => {
    setMyAppsLoading(true);
    listMyAppVoByPage({
      current: pageNum,
      pageSize,
    })
      .then((res) => {
        const newApps = res.data.records || [];
        
        if (pageNum === 1) {
          setMyApps(newApps);
        } else {
          setMyApps(prev => [...prev, ...newApps]);
        }
        
        setMyAppsHasMore(newApps.length === pageSize);
        setMyAppsPageNum(pageNum);
      })
      .catch(() => {
        message.error('加载我的应用失败');
      })
      .finally(() => {
        setMyAppsLoading(false);
      });
  };

  /**
   * 打开添加应用弹窗
   */
  const handleOpenAddAppModal = () => {
    setAddAppModalVisible(true);
    setMyAppsPageNum(1);
    loadMyApps(1, 20);
  };

  useEffect(() => {
    if (spaceId) {
      loadSpaceDetail();
      loadSpaceMembers();
      loadSpaceApps();
    }
  }, [spaceId]);

  useScrollLoad(() => {
    if (!myAppsLoading && myAppsHasMore) {
      loadMyApps(myAppsPageNum + 1, 20);
    }
  }, {
    threshold: 100,
    disabled: !myAppsHasMore || myAppsLoading,
    containerRef: myAppsListRef,
  });

  if (loading || !space) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* 空间信息卡片 */}
      <Card className={styles.spaceInfoCard}>
        <Row gutter={[24, 24]}>
          <Col span={18}>
            <Title level={3}>{space.spaceName}</Title>
            <Paragraph>{space.description || '暂无描述'}</Paragraph>
            <Space size="middle">
              <Tag color="blue">
                {getSpaceTypeLabel(space.spaceType)}
              </Tag>
              <Tag color="green">
                成员: {space.memberCount}
              </Tag>
              <Tag color="purple">
                应用: {space.appCount}
              </Tag>
            </Space>
          </Col>
          <Col span={6} style={{ textAlign: 'right' }}>
            {space.spaceType === SpaceTypeEnum.TEAM && (
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={handleInviteFriends}
              >
                邀请好友
              </Button>
            )}
          </Col>
        </Row>
      </Card>

      {/* 主要内容区域 */}
      <Row gutter={[24, 0]}>
        {/* 应用列表 */}
        <Col xs={24} sm={24} md={24} lg={18} xl={18}>
          <Card 
            className={styles.appsCard} 
            title={
              <Space>
                <SearchOutlined />
                应用列表
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleOpenAddAppModal}
              >
                添加应用
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {apps.length > 0 ? (
                apps.map((app) => (
                  <Col key={app.id} xs={24} sm={12} md={8} lg={8}>
                    <Card
                      actions={[
                        <Button 
                          danger 
                          size="small"
                          onClick={() => handleRemoveAppFromSpace(app.id!)}
                        >
                          移除
                        </Button>
                      ]}
                    >
                      <AppCard
                        app={{
                          id: app.id!,
                          appName: app.appName || '',
                          appDesc: app.appDesc || '',
                          appType: app.appType || '',
                          cover: app.cover || app.appCover || '',
                          pageViews: app.pageViews || 0,
                          initPrompt: app.initPrompt || '',
                          deployKey: app.deployKey || '',
                          codeGenType: app.codeGenType || '',
                          user: app.user ? {
                            userAvatar: app.user.userAvatar || '',
                            userName: app.user.userName || ''
                          } : undefined
                        }}
                        onCopy={(text) => {}}
                      />
                    </Card>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="暂无应用" />
                </Col>
              )}
            </Row>
          </Card>
        </Col>

        {/* 成员列表 */}
        <Col xs={24} sm={24} md={24} lg={6} xl={6}>
          <Card 
            className={styles.membersCard} 
            title={
              <Space>
                <TeamOutlined />
                成员列表 ({members.length})
              </Space>
            }
          >
            {members.length > 0 ? (
              <List
                dataSource={members}
                renderItem={(member) => (
                  <List.Item className={styles.memberListItem}>
                    <div className={styles.memberItem}>
                      <Avatar 
                        size={40} 
                        src={member.userAvatar} 
                        icon={<UserOutlined />} 
                      />
                      <div className={styles.memberInfo}>
                        <div className={styles.memberName}>{member.userName}</div>
                        <Tag 
                          color={getSpaceUserRoleColor(member.role)}
                          size="small"
                        >
                          {getSpaceUserRoleLabel(member.role)}
                        </Tag>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="暂无成员" />
            )}
          </Card>
        </Col>
      </Row>

      {/* 添加应用弹窗 */}
      <Modal
        title="添加应用"
        open={addAppModalVisible}
        onCancel={() => setAddAppModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAddAppModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="add" 
            type="primary" 
            loading={addAppLoading}
            onClick={handleAddAppToSpace}
          >
            添加
          </Button>
        ]}
        width={900}
      >
        <div style={{ maxHeight: 500, overflowY: 'auto', padding: '8px' }}>
          {myApps.length > 0 ? (
            <Row gutter={[16, 16]}>
              {myApps.map((app) => (
                <Col xs={24} sm={12} md={8} lg={8} key={app.id}>
                  <Card
                    hoverable
                    onClick={() => setSelectedAppId(app.id?.toString())}
                    className={selectedAppId === app.id?.toString() ? styles.selectedAppCard : styles.appCardItem}
                    style={{ cursor: 'pointer', position: 'relative' }}
                    cover={
                      app.cover ? (
                        <div style={{ height: 120, overflow: 'hidden' }}>
                          <img
                            alt={app.appName}
                            src={app.cover}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div style={{ height: 120, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: '#999' }}>无封面</span>
                        </div>
                      )
                    }
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 600 }}>{app.appName}</span>
                          {selectedAppId === app.id?.toString() && (
                            <CheckOutlined style={{ color: '#1890ff', fontSize: 18 }} />
                          )}
                        </div>
                      }
                      description={
                        <div>
                          <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                            {app.appDesc || '暂无描述'}
                          </div>
                          {app.appType && (
                            <Tag color="blue" style={{ fontSize: 12 }}>{app.appType}</Tag>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="暂无可用应用" />
          )}

          {/* 加载更多 */}
          {myAppsLoading && (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin tip="加载中..." />
            </div>
          )}

          {/* 没有更多数据 */}
          {!myAppsHasMore && myApps.length > 0 && (
            <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
              没有更多应用了
            </div>
          )}
        </div>
      </Modal>

      {/* 邀请好友弹窗 */}
      <InviteFriendsModal
        visible={inviteModalVisible}
        onCancel={() => setInviteModalVisible(false)}
        spaceId={spaceId}
        onSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default SpaceDetailPage;