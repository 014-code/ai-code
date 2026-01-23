import { useState, useEffect } from 'react';
import { Card, List, Avatar, Space, Empty, Spin } from 'antd';
import { EyeOutlined, LikeOutlined, MessageOutlined, FireOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { listHotPosts } from '@/services/backend/forumPostController';
import styles from './HotPosts.module.less';

const HotPosts: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hotPosts, setHotPosts] = useState<API.ForumPostVO[]>([]);

  const fetchHotPosts = () => {
    setLoading(true);
    listHotPosts(10).then((res) => {
      setHotPosts(res.data || []);
    }).catch((error) => {
      console.error('加载热门帖子失败:', error);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchHotPosts();
  }, []);

  const handlePostClick = (postId: string) => {
    navigate(`/forum/detail/${postId}`);
  };

  return (
    <Card
      title={
        <Space>
          <FireOutlined style={{ color: '#ff4d4f' }} />
          <span>热门帖子</span>
        </Space>
      }
      className={styles.hotPostsCard}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip="加载中..." />
        </div>
      ) : (
        <List
          dataSource={hotPosts}
          renderItem={(post, index) => {
            const rankClass = index < 3 ? `rankTop${index + 1}` : '';
            return (
              <List.Item
                key={post.id}
                className={styles.hotPostItem}
                onClick={() => handlePostClick(post.id!)}
              >
                <div className={styles.hotPostContent}>
                  <div className={styles.hotPostRank}>
                    {index < 3 ? (
                      <span className={`${styles.rankBadge} ${styles[rankClass]}`}>
                        {index + 1}
                      </span>
                    ) : (
                      <span className={styles.rankBadge}>{index + 1}</span>
                    )}
                  </div>
                  <div className={styles.hotPostInfo}>
                    <div className={styles.hotPostTitle}>
                      {post.isPinned === 1 && (
                        <span className={styles.pinnedTag}>[置顶]</span>
                      )}
                      {post.title}
                    </div>
                    <div className={styles.hotPostMeta}>
                      <Space size="small">
                        <Avatar size="small" src={post.user?.userAvatar} icon={post.user?.userAvatar ? undefined : 'user'} />
                        <span className={styles.metaItem}>{post.user?.userName}</span>
                        <span className={styles.metaItem}>
                          <EyeOutlined /> {post.viewCount || 0}
                        </span>
                        <span className={styles.metaItem}>
                          <LikeOutlined /> {post.likeCount || 0}
                        </span>
                        <span className={styles.metaItem}>
                          <MessageOutlined /> {post.commentCount || 0}
                        </span>
                      </Space>
                    </div>
                  </div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
      {!loading && hotPosts.length === 0 && (
        <Empty description="暂无热门帖子" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default HotPosts;
