import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Form, Input, Button, Card, message, Spin, Tabs, Empty, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { listFeaturedAppVoByPage, listMyAppVoByPage } from '@/services/backend/appController';
import { addForumPost } from '@/services/backend/forumPostController';
import './index.less';

// 常量定义
const PAGE_SIZE = 10; // 每页应用数量

/**
 * 论坛发布页面组件
 * 用于发布新的论坛帖子，可选择关联应用
 */
const ForumPublish: React.FC = () => {
  // 导航钩子
  const navigate = useNavigate();
  // 表单实例
  const [form] = Form.useForm();
  // 状态管理
  const [submitting, setSubmitting] = useState(false); // 提交状态
  const [loadingApps, setLoadingApps] = useState(false); // 初始加载应用状态
  const [loadingMoreApps, setLoadingMoreApps] = useState(false); // 加载更多应用状态
  const [featuredApps, setFeaturedApps] = useState<API.AppVO[]>([]); // 精选应用列表
  const [myApps, setMyApps] = useState<API.AppVO[]>([]); // 我的应用列表
  const [featuredPageNum, setFeaturedPageNum] = useState(1); // 精选应用当前页码
  const [myPageNum, setMyPageNum] = useState(1); // 我的应用当前页码
  const [hasMoreFeaturedApps, setHasMoreFeaturedApps] = useState(true); // 是否有更多精选应用
  const [hasMoreMyApps, setHasMoreMyApps] = useState(true); // 是否有更多我的应用
  const [appType, setAppType] = useState<'featured' | 'my'>('featured'); // 当前选中的应用类型
  const [selectedAppId, setSelectedAppId] = useState<number | undefined>(undefined); // 选中的应用ID
  // 引用
  const observerRef = useRef<IntersectionObserver | null>(null); // 交叉观察器引用，用于无限滚动
  const loadMoreRef = useRef<HTMLDivElement>(null); // 加载更多元素引用

  /**
   * 加载初始应用列表
   */
  const loadInitialApps = useCallback(() => {
    setLoadingApps(true);
    Promise.all([
      listFeaturedAppVoByPage({
        pageNum: 1,
        pageSize: PAGE_SIZE,
      }),
      listMyAppVoByPage({
        pageNum: 1,
        pageSize: PAGE_SIZE,
      }),
    ]).then(([featuredRes, myRes]) => {
      setFeaturedApps(featuredRes.data?.records ?? []);
      setHasMoreFeaturedApps((featuredRes.data?.records?.length ?? 0) >= PAGE_SIZE);
      setFeaturedPageNum(1);
      setMyApps(myRes.data?.records ?? []);
      setHasMoreMyApps((myRes.data?.records?.length ?? 0) >= PAGE_SIZE);
      setMyPageNum(1);
    }).catch((error: any) => {
      message.error(error?.message ?? '加载应用列表失败');
    }).finally(() => {
      setLoadingApps(false);
    });
  }, []);

  /**
   * 加载更多精选应用
   */
  const loadMoreFeaturedApps = useCallback(() => {
    if (loadingMoreApps || !hasMoreFeaturedApps) return;
    setLoadingMoreApps(true);
    const nextPageNum = featuredPageNum + 1;
    listFeaturedAppVoByPage({
      pageNum: nextPageNum,
      pageSize: PAGE_SIZE,
    }).then((res) => {
      const newApps = res.data?.records ?? [];
      setFeaturedApps((prev) => [...prev, ...newApps]);
      setHasMoreFeaturedApps(newApps.length >= PAGE_SIZE);
      setFeaturedPageNum(nextPageNum);
    }).catch((error: any) => {
      message.error(error?.message ?? '加载更多失败');
    }).finally(() => {
      setLoadingMoreApps(false);
    });
  }, [featuredPageNum, hasMoreFeaturedApps, loadingMoreApps]);

  /**
   * 加载更多我的应用
   */
  const loadMoreMyApps = useCallback(() => {
    if (loadingMoreApps || !hasMoreMyApps) return;
    setLoadingMoreApps(true);
    const nextPageNum = myPageNum + 1;
    listMyAppVoByPage({
      pageNum: nextPageNum,
      pageSize: PAGE_SIZE,
    }).then((res) => {
      const newApps = res.data?.records ?? [];
      setMyApps((prev) => [...prev, ...newApps]);
      setHasMoreMyApps(newApps.length >= PAGE_SIZE);
      setMyPageNum(nextPageNum);
    }).catch((error: any) => {
      message.error(error?.message ?? '加载更多失败');
    }).finally(() => {
      setLoadingMoreApps(false);
    });
  }, [myPageNum, hasMoreMyApps, loadingMoreApps]);

  /**
   * 初始化加载应用列表
   */
  useEffect(() => {
    loadInitialApps();
  }, [loadInitialApps]);

  /**
   * 设置无限滚动观察器
   */
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (appType === 'featured') {
          loadMoreFeaturedApps();
        } else {
          loadMoreMyApps();
        }
      }
    }, { threshold: 0.1 });

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [appType, loadMoreFeaturedApps, loadMoreMyApps]);

  /**
   * 处理表单提交
   * @param values 表单提交的值
   */
  const handleSubmit = (values: any) => {
    setSubmitting(true);
    const params: API.ForumPostAddRequest = {
      title: values.title,
      appId: selectedAppId,
      content: values.content,
    };

    addForumPost(params).then((res) => {
      message.success('发布成功');
      navigate('/forum');
    }).catch((error: any) => {
      message.error(error?.message ?? '发布失败');
    }).finally(() => {
      setSubmitting(false);
    });
  };

  /**
   * 处理应用选择
   * @param appId 应用ID
   */
  const handleAppSelect = (appId: number) => {
    setSelectedAppId(appId);
  };

  // 当前显示的应用列表和加载状态
  const currentApps = appType === 'featured' ? featuredApps : myApps;
  const hasMore = appType === 'featured' ? hasMoreFeaturedApps : hasMoreMyApps;

  // 富文本编辑器配置
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'code-block'],
      ['clean']
    ],
  };

  return (
    <div className="forum-publish-container">
      <Card title="发布帖子" bordered={false}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* 标题输入 */}
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入帖子标题" maxLength={100} showCount />
          </Form.Item>

          {/* 关联应用选择 */}
          <Form.Item label="关联应用（可选）">
            <Tabs
              activeKey={appType}
              onChange={(key) => setAppType(key as 'featured' | 'my')}
              items={[
                {
                  key: 'featured',
                  label: '精选应用',
                  children: (
                    <div className="app-list-container">
                      {loadingApps && currentApps.length === 0 ? (
                        <div className="loading-container">
                          <Spin tip="加载中..." />
                        </div>
                      ) : currentApps.length === 0 ? (
                        <Empty description="暂无应用" />
                      ) : (
                        <div className="app-list">
                          {currentApps.map((app) => (
                            <div
                              key={app.id}
                              className={`app-item ${selectedAppId === app.id ? 'selected' : ''}`}
                              onClick={() => handleAppSelect(app.id!)}
                            >
                              <div className="app-name">{app.appName}</div>
                              <div className="app-desc">{app.appDesc}</div>
                              <div className="app-tags">
                                {app.appType && <Tag color="blue">{app.appType}</Tag>}
                                {app.scoringStrategy && <Tag color="green">{app.scoringStrategy}</Tag>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasMore && (
                        <div ref={loadMoreRef} className="load-more-container">
                          {loadingMoreApps ? <Spin tip="加载中..." /> : <span>加载更多</span>}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'my',
                  label: '我的应用',
                  children: (
                    <div className="app-list-container">
                      {loadingApps && currentApps.length === 0 ? (
                        <div className="loading-container">
                          <Spin tip="加载中..." />
                        </div>
                      ) : currentApps.length === 0 ? (
                        <Empty description="暂无应用" />
                      ) : (
                        <div className="app-list">
                          {currentApps.map((app) => (
                            <div
                              key={app.id}
                              className={`app-item ${selectedAppId === app.id ? 'selected' : ''}`}
                              onClick={() => handleAppSelect(app.id!)}
                            >
                              <div className="app-name">{app.appName}</div>
                              <div className="app-desc">{app.appDesc}</div>
                              <div className="app-tags">
                                {app.appType && <Tag color="blue">{app.appType}</Tag>}
                                {app.scoringStrategy && <Tag color="green">{app.scoringStrategy}</Tag>}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {hasMore && (
                        <div ref={loadMoreRef} className="load-more-container">
                          {loadingMoreApps ? <Spin tip="加载中..." /> : <span>加载更多</span>}
                        </div>
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Form.Item>

          {/* 内容输入（富文本编辑器） */}
          <Form.Item
            label="内容"
            name="content"
            rules={[{ required: true, message: '请输入内容' }]}
          >
            <ReactQuill
              theme="snow"
              modules={modules}
              placeholder="请输入帖子内容..."
              style={{ minHeight: 400 }}
            />
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} block size="large">
              发布
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForumPublish;
