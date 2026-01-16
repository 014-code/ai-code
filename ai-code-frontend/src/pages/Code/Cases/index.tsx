/**
 * 案例页面
 * 展示精选应用案例，支持搜索、筛选和无限滚动加载
 */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, message, Row, Col, Typography, Input, Select, Space } from 'antd';
import { listFeaturedAppVoByPage, listAllAppTypes } from '@/services/backend/appController';
import AppCard from '@/pages/Code/Home/components/AppCard';
import { SearchOutlined } from '@ant-design/icons';
import InteractiveBackground from '@/components/InteractiveBackground';
import styles from './index.module.less';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 常量定义
const PAGE_MAX_WIDTH = 1900;  // 页面最大宽度
const PAGE_SIZE = 24;  // 每页显示条数
const INTERSECTION_THRESHOLD = 0.1;  // 交叉观察器阈值
const SEARCH_DELAY = 100;  // 搜索延迟

/**
 * 案例页面组件
 */
const CasesPage: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState(false);  // 初始加载状态
  const [loadingMore, setLoadingMore] = useState(false);  // 加载更多状态
  const [apps, setApps] = useState<API.AppVO[]>([]);  // 应用列表
  const [searchKey, setSearchKey] = useState<string>('');  // 搜索关键词
  const [selectedAppType, setSelectedAppType] = useState<string>('all');  // 选中的应用类型
  const [sortField, setSortField] = useState<string>('createTime');  // 排序字段
  const [sortOrder, setSortOrder] = useState<string>('desc');  // 排序顺序
  const [appTypes, setAppTypes] = useState<API.AppTypeVO[]>([]);  // 应用类型列表
  const [pageNum, setPageNum] = useState(1);  // 当前页码
  const [hasMore, setHasMore] = useState(true);  // 是否有更多数据
  const [total, setTotal] = useState(0);  // 总数据量
  
  // 引用管理
  const observerRef = useRef<IntersectionObserver | null>(null);  // 交叉观察器引用
  const loadMoreRef = useRef<HTMLDivElement>(null);  // 加载更多元素引用

  /**
   * 获取应用列表
   * @param isLoadMore 是否为加载更多
   * @param currentPageNum 当前页码
   */
  const fetchApps = React.useCallback(async (isLoadMore: boolean = false, currentPageNum: number = 1) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    try {
      // 构建查询参数
      const params: any = {
        pageNum: currentPageNum,
        pageSize: PAGE_SIZE,
        appType: selectedAppType === 'all' ? undefined : selectedAppType,
        searchKey: searchKey || undefined,
        sortField: sortField || undefined,
        sortOrder: sortOrder || undefined,
      };
      
      // 调用API获取数据
      const res = await listFeaturedAppVoByPage(params);
      const newApps = res.data?.records ?? [];
      const totalCount = res.data?.totalRow ?? 0;

      // 更新应用列表
      setApps(prev => {
        const updatedApps = isLoadMore ? [...prev, ...newApps] : newApps;
        setHasMore(updatedApps.length < totalCount);
        return updatedApps;
      });

      setTotal(totalCount);
      
      // 更新页码
      if (isLoadMore) {
        setPageNum(prev => prev + 1);
      } else {
        setPageNum(2);  // 首次加载后，下次从第2页开始
      }
    } catch (error: any) {
      message.error(error?.message ?? '加载失败');
    }
    setLoading(false);
    setLoadingMore(false);
  }, [selectedAppType, searchKey, sortField, sortOrder]);

  /**
   * 加载应用类型
   */
  const loadAppTypes = async () => {
    try {
      const res = await listAllAppTypes();
      setAppTypes(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      message.error(error?.message ?? '加载应用类型失败');
    }
  };

  /**
   * 加载更多数据
   */
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchApps(true, pageNum);
    }
  }, [loadingMore, hasMore, fetchApps, pageNum]);

  /**
   * 处理搜索
   * @param value 搜索关键词
   */
  const handleSearch = (value: string) => {
    setSearchKey(value);
    setPageNum(1);
    setHasMore(true);
    fetchApps(false, 1);
  };

  /**
   * 处理复制（占位函数）
   */
  const handleCopy = (_text: string) => undefined;

  // 加载应用类型
  useEffect(() => {
    loadAppTypes();
  }, []);

  // 当筛选条件或排序方式变化时，重新加载数据
  useEffect(() => {
    setPageNum(1);
    setHasMore(true);
    fetchApps(false, 1);
  }, [selectedAppType, sortField, sortOrder]);

  // 设置无限滚动
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    // 创建交叉观察器
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: INTERSECTION_THRESHOLD }
    );

    observerRef.current.observe(element);

    // 清理函数
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  return (
    <>
      <InteractiveBackground />
      <div className={styles.casesPageContainer}>
        {/* 筛选卡片 */}
        <Card className={styles.filterCard}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 搜索框 */}
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

            {/* 筛选和排序 */}
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

        {/* 应用列表卡片 */}
        <Card loading={loading} className={styles.appsCard}>
          <Row gutter={[16, 16]}>
            {apps.map(app => (
              <Col xs={24} sm={12} md={12} lg={6} xl={6} key={app.id}>
                <AppCard app={app as any} onCopy={handleCopy} />
              </Col>
            ))}
          </Row>
          
          {/* 空状态 */}
          {!apps.length && !loading && (
            <div className={styles.emptyState}>
              暂无案例，稍后再来看看吧～
            </div>
          )}
          
          {/* 加载更多 */}
          {hasMore && apps.length > 0 && (
            <div ref={loadMoreRef} className={styles.loadMoreContainer}>
              {loadingMore ? (
                <span className={styles.loadingText}>加载中...</span>
              ) : (
                <span className={styles.hintText}>下拉加载更多</span>
              )}
            </div>
          )}
          
          {/* 全部加载完成 */}
          {!hasMore && apps.length > 0 && (
            <div className={styles.loadMoreContainer}>
              <span className={styles.allLoadedText}>已加载全部 {total} 条数据</span>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};

export default CasesPage;
