import React, { useState, useEffect, useRef } from 'react';
import { Modal, List, Checkbox, Button, Input, Spin, message, Empty } from 'antd';
import { SearchOutlined, LoadingOutlined } from '@ant-design/icons';
import { getFriendList } from '@/services/backend/friendController';
import {batchAddMembers, listSpaceMembers} from '@/services/backend/spaceController';
import { useScrollLoad } from '@/hooks/useScrollLoad';
import type { UserVO } from '@/services/backend/types';

interface InviteFriendsModalProps {
  visible: boolean;
  onCancel: () => void;
  spaceId: string;
  onSuccess?: () => void;
}

/**
 * 团队空间邀请好友弹窗组件
 * 支持查询好友列表、多选、批量邀请
 */
const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  onCancel,
  spaceId,
  onSuccess
}) => {
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [friends, setFriends] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState();

  /**
   * 获取好友列表
   * @param pageNum 页码，默认为1
   * @param refresh 是否刷新列表，默认为false
   */
  const fetchFriends = (pageNum = 1, refresh = false) => {
    setLoading(true);
    getFriendList({ pageNum, pageSize: 20 })
      .then((response) => {
        const newFriends = response.data.records || [];
        
        if (refresh) {
          setFriends(newFriends);
        } else {
          setFriends(prev => [...prev, ...newFriends]);
        }
        setHasMore(newFriends.length === 20);
        setCurrentPage(pageNum);
      })
      .catch((error) => {
        message.error('获取好友列表失败');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  /**
   * 处理好友选择
   * @param friendId 好友ID
   * @param checked 是否选中
   */
  const handleFriendSelect = (friendId: string, checked: boolean) => {
    if (checked) {
      setSelectedFriends(prev => [...prev, friendId]);
    } else {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    }
  };

  /**
   * 处理邀请好友
   * 将选中的好友批量添加到空间中
   */
  const handleInvite = () => {
    if (selectedFriends.length === 0) {
      message.warning('请选择要邀请的好友');
      return;
    }

    setInviting(true);
    batchAddMembers({
      spaceId: String(spaceId),
      userIds: selectedFriends,
      role: 'MEMBER'
    })
      .then(() => {
        message.success('邀请好友成功');
        setSelectedFriends([]);
        onCancel();
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch((error) => {
        message.error('邀请好友失败');
        console.error('邀请好友失败:', error);
      })
      .finally(() => {
        setInviting(false);
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
   * 弹窗显示时自动加载好友列表和该空间的用户列表
   */
  useEffect(() => {
    if (visible) {
      fetchFriends(1, true);
      loadSpaceMembers();
      setSelectedFriends([]);
    }
  }, [visible]);

  useScrollLoad(() => {
    if (!loading && hasMore) {
      fetchFriends(currentPage + 1);
    }
  }, {
    threshold: 100,
    disabled: !hasMore || loading,
    containerRef: listRef,
  });

  return (
    <Modal
      title="邀请好友加入团队空间"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="invite"
          type="primary"
          loading={inviting}
          onClick={handleInvite}
          disabled={selectedFriends.length === 0}
        >
          邀请好友
        </Button>
      ]}
      width={600}
    >
      {/* 搜索框 */}
      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="搜索好友"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      {/* 好友列表 */}
      <div ref={listRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
        {friends.length > 0 ? (
            <List
                dataSource={friends}
                renderItem={(friend) => {
                  // 检查当前好友是否在 members 数组中
                  const isSelected = members.some(item => item.userId === friend.id);

                  return (
                      <List.Item
                          actions={[
                            <Checkbox
                                key="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleFriendSelect(friend.id!, e.target.checked)}
                            />
                          ]}
                      >
                        <List.Item.Meta
                            avatar={friend.userAvatar ? (
                                <img
                                    src={friend.userAvatar}
                                    alt={friend.userName}
                                    style={{ width: 40, height: 40, borderRadius: 20 }}
                                />
                            ) : (
                                <div style={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: 20,
                                  backgroundColor: '#f0f0f0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#999'
                                }}>
                                  {friend.userName?.[0] || '?'}
                                </div>
                            )}
                            title={friend.userName}
                            description={friend.userProfile || '无简介'}
                        />
                      </List.Item>
                  );
                }}
            />
        ) : (
            <Empty description="暂无好友" />
        )}

        {/* 加载更多 */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <Spin tip="加载中..." />
          </div>
        )}

        {/* 没有更多数据 */}
        {!hasMore && friends.length > 0 && (
          <div style={{ textAlign: 'center', padding: 16, color: '#999' }}>
            没有更多好友了
          </div>
        )}
      </div>

      {/* 已选择数量 */}
      {selectedFriends.length > 0 && (
        <div style={{ marginTop: 16, color: '#1890ff' }}>
          已选择 {selectedFriends.length} 位好友
        </div>
      )}
    </Modal>
  );
};

export default InviteFriendsModal;