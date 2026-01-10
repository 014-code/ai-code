import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, message, Row, Typography, Input, Select, Space } from 'antd';
import { listFeaturedAppVoByPage, listAllAppTypes } from '@/services/backend/appController';
import AppCard from '@/pages/Code/Home/components/AppCard';
import { SearchOutlined } from '@ant-design/icons';
import styles from './index.less';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

const PAGE_MAX_WIDTH = 1900;
const PAGE_SIZE = 24;
const INTERSECTION_THRESHOLD = 0.1;
const SEARCH_DELAY = 100;

const CasesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apps, setApps] = useState<API.AppVO[]>([]);
  const [searchKey, setSearchKey] = useState<string>('');
  const [selectedAppType, setSelectedAppType] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('createTime');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchApps = React.useCallback(async (isLoadMore: boolean = false, currentPageNum: number = 1) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      const params: any = {
        pageNum: currentPageNum,
        pageSize: PAGE_SIZE,
        appType: selectedAppType === 'all' ? undefined : selectedAppType,
        searchKey: searchKey || undefined,
        sortField: sortField || undefined,
        sortOrder: sortOrder || undefined,
      };
      const res = await listFeaturedAppVoByPage(params);
      if (res.code === 0) {
        const newApps = res.data?.records ?? [];
        const totalCount = res.data?.totalRow ?? 0;
        
        setApps(prev => {
          const updatedApps = isLoadMore ? [...prev, ...newApps] : newApps;
          setHasMore(updatedApps.length < totalCount);
          return updatedApps;
        });
        
        setTotal(totalCount);
        if (isLoadMore) {
          setPageNum(prev => prev + 1);
        } else {
          setPageNum(2);
        }
      } else {
        message.error(res.message ?? '加载失败');
      }
    } catch (error: any) {
      message.error(error?.message ?? '加载失败');
    }
    setLoading(false);
    setLoadingMore(false);
  }, [selectedAppType, searchKey, sortField, sortOrder]);

  const loadAppTypes = async () => {
    try {
      const { data } = await listAllAppTypes();
      setAppTypes(data || []);
    } catch (error: any) {
      message.error('加载应用类型失败');
    }
  };

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchApps(true, pageNum);
    }
  }, [loadingMore, hasMore, fetchApps, pageNum]);

  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPageNum(1);
    setHasMore(true);
    fetchApps(false, 1);
  };

  const handleCopy = (_text: string) => undefined;

  useEffect(() => {
    loadAppTypes();
  }, []);

  useEffect(() => {
    setPageNum(1);
    setHasMore(true);
    fetchApps(false, 1);
  }, [selectedAppType, sortField, sortOrder]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  return (
    <div className={styles.casesPageContainer}>
      <Card className={styles.filterCard}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Search
            placeholder="搜索应用名称或描述"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            style={{ width: '100%' }}
            onSearch={handleSearch}
            onChange={(e) => {
              const value = e.target.value;
              setSearchKey(value);
              if (!value) {
                handleSearch('');
              }
            }}
          />

          <Space wrap>
            <span>应用类型：</span>
            <Select
              value={selectedAppType}
              onChange={setSelectedAppType}
              style={{ width: 150 }}
            >
              <Option value="all">全部</Option>
              {appTypes.map((type) => (
                <Option key={type.text} value={type.text}>
                  {type.text}
                </Option>
              ))}
            </Select>

            <span style={{ marginLeft: 16 }}>排序方式：</span>
            <Select
              value={sortField}
              onChange={setSortField}
              style={{ width: 120 }}
            >
              <Option value="createTime">创建时间</Option>
              <Option value="pageViews">浏览量</Option>
            </Select>

            <Select
              value={sortOrder}
              onChange={setSortOrder}
              style={{ width: 100 }}
            >
              <Option value="desc">降序</Option>
              <Option value="asc">升序</Option>
            </Select>
          </Space>
        </Space>
      </Card>

      <Card loading={loading} className={styles.appsCard}>
        <Row>
          {apps.map(app => (
            <AppCard key={app.id} app={app as any} onCopy={handleCopy} />
          ))}
        </Row>
        {!apps.length && !loading && (
          <div className={styles.emptyState}>
            暂无案例，稍后再来看看吧～
          </div>
        )}
        {hasMore && apps.length > 0 && (
          <div ref={loadMoreRef} className={styles.loadMoreContainer}>
            {loadingMore ? (
              <span className={styles.loadingText}>加载中...</span>
            ) : (
              <span className={styles.hintText}>下拉加载更多</span>
            )}
          </div>
        )}
        {!hasMore && apps.length > 0 && (
          <div className={styles.loadMoreContainer}>
            <span className={styles.allLoadedText}>已加载全部 {total} 条数据</span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CasesPage;