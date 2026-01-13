import React, {useState, useEffect, useRef, useCallback} from 'react';
import {Card, Form, Input, Button, message, Select, Spin, Radio} from 'antd';
import {history} from '@umijs/max';
import {addForumPost} from '@/services/backend/forumPostController';
import {listFeaturedAppVoByPage, listMyAppVoByPage} from '@/services/backend/appController';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from './index.less';

const {Option} = Select;

const PAGE_SIZE = 20;
const INTERSECTION_THRESHOLD = 0.1;

const ForumPublish: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [loadingMoreApps, setLoadingMoreApps] = useState(false);
  const [featuredApps, setFeaturedApps] = useState<API.AppVO[]>([]);
  const [myApps, setMyApps] = useState<API.AppVO[]>([]);
  const [featuredPageNum, setFeaturedPageNum] = useState(1);
  const [myPageNum, setMyPageNum] = useState(1);
  const [hasMoreFeaturedApps, setHasMoreFeaturedApps] = useState(true);
  const [hasMoreMyApps, setHasMoreMyApps] = useState(true);
  const [appType, setAppType] = useState<'featured' | 'my'>('featured');
  const [selectedAppId, setSelectedAppId] = useState<number | undefined>(undefined);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
      if (featuredRes.code === 0) {
        const newFeaturedApps = featuredRes.data?.records ?? [];
        const featuredTotalCount = featuredRes.data?.totalRow ?? 0;
        setFeaturedApps(newFeaturedApps);
        setHasMoreFeaturedApps(newFeaturedApps.length < featuredTotalCount);
        setFeaturedPageNum(2);
      }
      if (myRes.code === 0) {
        const newMyApps = myRes.data?.records ?? [];
        const myTotalCount = myRes.data?.totalRow ?? 0;
        setMyApps(newMyApps);
        setHasMoreMyApps(newMyApps.length < myTotalCount);
        setMyPageNum(2);
      }
    }).catch((error: any) => {
      message.error(error?.message ?? '加载应用列表失败');
    }).finally(() => {
      setLoadingApps(false);
    });
  }, []);

  const loadMoreApps = useCallback(() => {
    if (loadingMoreApps) return;
    const isFeatured = appType === 'featured';
    const hasMore = isFeatured ? hasMoreFeaturedApps : hasMoreMyApps;
    const pageNum = isFeatured ? featuredPageNum : myPageNum;
    
    if (!hasMore) return;

    setLoadingMoreApps(true);
    const apiCall = isFeatured ? listFeaturedAppVoByPage : listMyAppVoByPage;
    apiCall({
      pageNum,
      pageSize: PAGE_SIZE,
    }).then((res) => {
      if (res.code === 0) {
        const newApps = res.data?.records ?? [];
        const totalCount = res.data?.totalRow ?? 0;
        
        if (isFeatured) {
          setFeaturedApps((prev) => [...prev, ...newApps]);
          setHasMoreFeaturedApps(featuredApps.length + newApps.length < totalCount);
          setFeaturedPageNum((prev) => prev + 1);
        } else {
          setMyApps((prev) => [...prev, ...newApps]);
          setHasMoreMyApps(myApps.length + newApps.length < totalCount);
          setMyPageNum((prev) => prev + 1);
        }
      } else {
        message.error(res.message ?? '加载应用列表失败');
      }
    }).catch((error: any) => {
      message.error(error?.message ?? '加载应用列表失败');
    }).finally(() => {
      setLoadingMoreApps(false);
    });
  }, [appType, hasMoreFeaturedApps, hasMoreMyApps, featuredPageNum, myPageNum, featuredApps.length, myApps.length, loadingMoreApps]);

  useEffect(() => {
    loadInitialApps();
  }, []);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreApps();
        }
      },
      {threshold: INTERSECTION_THRESHOLD}
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreApps]);

  const handleSubmit = (values: any) => {
    setSubmitting(true);
    const params: API.ForumPostAddRequest = {
      title: values.title,
      appId: selectedAppId,
      content: values.content,
    };

    addForumPost(params).then((res) => {
      if (res.code === 0) {
        message.success('发布成功');
        history.push('/forum');
      } else {
        message.error(res.message ?? '发布失败');
      }
    }).catch((error: any) => {
      message.error(error?.message ?? '发布失败');
    }).finally(() => {
      setSubmitting(false);
    });
  };

  const handleCancel = () => {
    history.back();
  };

  return (
    <div className={styles.publishPageContainer}>
      <Card title="发布帖子" className={styles.publishCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[
              {required: true, message: '请输入标题'},
            ]}
          >
            <Input placeholder="请输入帖子标题" maxLength={100} showCount/>
          </Form.Item>

          <Form.Item
            label="关联应用（可选）"
            name="appId"
            tooltip="选择关联的应用案例，让更多人了解你的作品"
          >
            <Radio.Group
              value={appType}
              onChange={(e) => {
                setAppType(e.target.value);
                setSelectedAppId(undefined);
              }}
              style={{marginBottom: 12}}
            >
              <Radio value="featured">精选应用</Radio>
              <Radio value="my">个人应用</Radio>
            </Radio.Group>
            <Select
              placeholder="请选择关联的应用（可选）"
              allowClear
              showSearch
              optionFilterProp="children"
              loading={loadingApps}
              notFoundContent={loadingApps ? <Spin size="small"/> : '暂无应用'}
              onChange={(value) => setSelectedAppId(value)}
              value={selectedAppId}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {(appType === 'featured' ? hasMoreFeaturedApps : hasMoreMyApps) && (appType === 'featured' ? featuredApps : myApps).length > 0 && (
                    <div
                      ref={loadMoreRef}
                      style={{padding: '8px', textAlign: 'center', color: '#8c8c8c'}}
                    >
                      {loadingMoreApps ? (
                        <Spin size="small" tip="加载中..."/>
                      ) : (
                        <span>下拉加载更多</span>
                      )}
                    </div>
                  )}
                  {!(appType === 'featured' ? hasMoreFeaturedApps : hasMoreMyApps) && (appType === 'featured' ? featuredApps : myApps).length > 0 && (
                    <div style={{padding: '8px', textAlign: 'center', color: '#bfbfbf'}}>
                      已加载全部
                    </div>
                  )}
                </>
              )}
            >
              {(appType === 'featured' ? featuredApps : myApps).map((app) => (
                <Option key={app.id} value={app.id}>
                  {app.appName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="内容"
            name="content"
            rules={[
              {required: true, message: '请输入内容'},
            ]}
          >
            <ReactQuill
              theme="snow"
              placeholder="请输入帖子内容"
              style={{minHeight: 400}}
              modules={{
                toolbar: [
                  [{'header': [1, 2, 3, false]}],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  [{'color': []}, {'background': []}],
                  ['link', 'image', 'code-block'],
                  ['clean']
                ],
              }}
            />
          </Form.Item>

          <Form.Item>
            <div className={styles.buttonGroup}>
              <Button onClick={handleCancel}>
                取消
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                发布
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ForumPublish;
