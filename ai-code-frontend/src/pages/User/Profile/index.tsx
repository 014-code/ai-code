import React, {useState, useEffect, useRef} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Button, Avatar, Card, List, Spin, message, Empty, Divider, Space as AntSpace, Row, Col, Tag} from 'antd';
import {
    UserOutlined,
    MessageOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    EyeOutlined,
    LikeOutlined,
    CommentOutlined
} from '@ant-design/icons';
import {
    getFriendRequestList,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendList,
    deleteFriend,
    sendFriendRequest
} from '@/services/backend/friendController';
import {getUserForumPostList} from '@/services/backend/forumPostController';
import {getUserInfo} from '@/services/backend/userController';
import {useScrollLoad} from '@/hooks/useScrollLoad';
import type {UserVO, FriendRequestVO} from '@/services/backend/types';
import styles from './index.module.less';

/**
 * 用户主页组件
 * 显示用户信息、好友操作、发布的帖子列表
 */
const UserProfilePage: React.FC = () => {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState<UserVO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);
    const [friendRequests, setFriendRequests] = useState<FriendRequestVO[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const postsListRef = useRef<HTMLDivElement>(null);

    /**
     * 获取用户信息
     * @param userId 用户ID
     */
    const fetchUserInfo = () => {
        if (!userId) return;
        setIsLoading(true);
        getUserInfo(userId)
            .then((response) => {
                setUserInfo(response.data);
            })
            .catch((error) => {
                message.error('获取用户信息失败');
                console.error('获取用户信息失败:', error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    /**
     * 检查是否为好友
     * 通过获取好友列表来判断当前用户是否在好友列表中
     */
    const checkFriendStatus = () => {
        getFriendList({pageNum: 1, pageSize: 100})
            .then((response) => {
                const friends = response.data.records || [];
                const friend = friends.find((f: UserVO) => f.id === Number(userId));
                setIsFriend(!!friend);
            })
            .catch((error) => {
                console.error('检查好友状态失败:', error);
            });
    };

    /**
     * 获取好友请求列表
     * 获取当前用户收到的待处理好友申请
     */
    const fetchFriendRequests = () => {
        getFriendRequestList({status: 'PENDING', pageNum: 1, pageSize: 20})
            .then((response) => {
                setFriendRequests(response.data.records || []);
            })
            .catch((error) => {
                console.error('获取好友请求失败:', error);
            });
    };

    /**
     * 获取用户帖子列表
     * @param pageNum 页码
     * @param refresh 是否刷新列表
     */
    const fetchUserPosts = (pageNum = 1, refresh = false) => {
        if (!userId) return;
        setPostsLoading(true);
        getUserForumPostList(userId, pageNum, 10)
            .then((response) => {
                const newPosts = response.data.records || [];
                if (refresh) {
                    setPosts(newPosts);
                } else {
                    setPosts(prev => [...prev, ...newPosts]);
                }
                setHasMore(newPosts.length === 10);
                setCurrentPage(pageNum);
            })
            .catch((error) => {
                message.error('获取帖子列表失败');
                console.error('获取帖子列表失败:', error);
            })
            .finally(() => {
                setPostsLoading(false);
            });
    };

    /**
     * 处理添加好友
     * 向目标用户发送好友请求
     */
    const handleAddFriend = () => {
        if (!userId) return;
        sendFriendRequest({addresseeId: userId, message: '请求添加您为好友'})
            .then(() => {
                message.success('发送好友请求成功');
                checkFriendStatus();
            })
            .catch((err) => {
                message.error(err.message + '发送好友请求失败');
            });
    };

    /**
     * 处理删除好友
     * 从好友列表中移除该用户
     */
    const handleDeleteFriend = () => {
        if (!userId) return;
        deleteFriend(userId)
            .then(() => {
                message.success('删除好友成功');
                setIsFriend(false);
            })
            .catch((error) => {
                message.error('删除好友失败');
                console.error('删除好友失败:', error);
            });
    };

    /**
     * 处理接受好友请求
     * @param requestId 好友请求的ID
     * 接受后会从本地列表中移除该申请
     */
    const handleAcceptRequest = (requestId: number) => {
        acceptFriendRequest(requestId)
            .then(() => {
                message.success('已接受好友请求');
                setFriendRequests(prev => prev.filter(req => req.id !== requestId));
            })
            .catch((error) => {
                message.error('接受好友请求失败');
                console.error('接受好友请求失败:', error);
            });
    };

    /**
     * 处理拒绝好友请求
     * @param requestId 好友请求的ID
     * 拒绝后会从本地列表中移除该申请
     */
    const handleRejectRequest = (requestId: number) => {
        rejectFriendRequest(requestId)
            .then(() => {
                message.success('已拒绝好友请求');
                setFriendRequests(prev => prev.filter(req => req.id !== requestId));
            })
            .catch((error) => {
                message.error('拒绝好友请求失败');
                console.error('拒绝好友请求失败:', error);
            });
    };

    /**
     * 组件挂载时自动调用，获取用户信息、好友状态、好友申请列表和用户帖子列表
     */
    useEffect(() => {
        fetchUserInfo();
        checkFriendStatus();
        fetchFriendRequests();
        fetchUserPosts(1, true);
    }, [userId]);

    useScrollLoad(() => {
        if (!postsLoading && hasMore) {
            fetchUserPosts(currentPage + 1);
        }
    }, {
        threshold: 100,
        disabled: !hasMore || postsLoading,
        containerRef: postsListRef,
    });

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" tip="加载中..."/>
            </div>
        );
    }

    if (!userInfo) {
        return (
            <div className={styles.errorContainer}>
                <Empty description="用户不存在"/>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 用户信息头部 */}
            <Card className={styles.userInfoCard}>
                <div className={styles.userInfo}>
                    <div className={styles.avatarSection}>
                        <Avatar
                            size={128}
                            src={userInfo.userAvatar}
                            icon={<UserOutlined/>}
                            className={styles.avatar}
                        />
                    </div>
                    <div className={styles.infoSection}>
                        <h1 className={styles.userName}>{userInfo.userName}</h1>
                        <p className={styles.userProfile}>{userInfo.userProfile || '该用户还没有设置个人简介'}</p>
                        <div className={styles.actionButtons}>
                            {isFriend ? (
                                <Button
                                    danger
                                    icon={<UserDeleteOutlined/>}
                                    onClick={handleDeleteFriend}
                                >
                                    删除好友
                                </Button>
                            ) : (
                                <Button
                                    type="primary"
                                    icon={<UserAddOutlined/>}
                                    onClick={handleAddFriend}
                                >
                                    添加好友
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </Card>

            {/* 好友请求审核 */}
            {friendRequests.length > 0 && (
                <Card className={styles.requestsCard} title="好友请求">
                    <List
                        dataSource={friendRequests}
                        renderItem={(request) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        size="small"
                                        key="accept"
                                        onClick={() => handleAcceptRequest(request.id!)}
                                    >
                                        接受
                                    </Button>,
                                    <Button
                                        danger
                                        size="small"
                                        key="reject"
                                        onClick={() => handleRejectRequest(request.id!)}
                                    >
                                        拒绝
                                    </Button>
                                ]}
                            >
                                <List.Item.Meta
                                    avatar={<Avatar src={request.requester?.userAvatar}/>}
                                    title={request.requester?.userName}
                                    description={request.message || '请求添加您为好友'}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            )}

            <Divider/>

            {/* 用户发布的帖子列表 */}
            <Card className={styles.postsCard} title="发布的帖子">
                <div ref={postsListRef} className={styles.postsList}>
                    {posts.length > 0 ? (
                        <Row gutter={[16, 16]}>
                            {posts.map((post) => (
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} key={post.id}>
                                    <Card
                                        className={styles.postCard}
                                        hoverable
                                        onClick={() => navigate(`/forum/detail/${post.id}`)}
                                    >
                                        {/* 帖子头部 */}
                                        <div className={styles.postHeader}>
                                            <div className={styles.postTitle}>
                                                {post.isPinned === 1 && (
                                                    <Tag color="red" className={styles.pinnedTag}>置顶</Tag>
                                                )}
                                                <span className={styles.titleText}>{post.title}</span>
                                            </div>
                                        </div>

                                        {/* 应用信息 */}
                                        {post.app && (
                                            <div className={styles.appInfo}>
                                                <AntSpace size="small">
                                                    <MessageOutlined/>
                                                    <span className={styles.appName}>{post.app.appName}</span>
                                                    {post.app.appType && (
                                                        <Tag color="blue"
                                                             className={styles.appType}>{post.app.appType}</Tag>
                                                    )}
                                                </AntSpace>
                                            </div>
                                        )}

                                        {/* 帖子内容摘要 */}
                                        <div className={styles.postBody}>
                                            <div className={styles.postExcerpt}>
                                                {post.content?.substring(0, 200)}
                                                {post.content && post.content.length > 200 && '...'}
                                            </div>
                                        </div>

                                        {/* 帖子底部信息 */}
                                        <div className={styles.postFooter}>
                                            <AntSpace size="middle">
                        <span className={styles.metaItem}>
                          <EyeOutlined/> {post.viewCount || 0}
                        </span>
                                                <span className={styles.metaItem}>
                          <LikeOutlined/> {post.likeCount || 0}
                        </span>
                                                <span className={styles.metaItem}>
                          <CommentOutlined/> {post.commentCount || 0}
                        </span>
                                            </AntSpace>
                                            <AntSpace>
                                                <span className={styles.createTime}>{post.createTime}</span>
                                            </AntSpace>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Empty description="该用户还没有发布帖子"/>
                    )}
                    {postsLoading && (
                        <div className={styles.loadingMore}>
                            <Spin tip="加载更多..."/>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default UserProfilePage;