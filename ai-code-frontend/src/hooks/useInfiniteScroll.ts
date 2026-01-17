import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseInfiniteScrollOptions<T> {
  loadMore: (page: number) => Promise<T[]>;
  initialData?: T[];
  pageSize?: number;
  threshold?: number;
  loadAtTop?: boolean;  // 是否在顶部加载更多
}

export interface UseInfiniteScrollReturn<T> {
  data: T[];
  loading: boolean;
  hasMore: boolean;
  loadMoreData: () => Promise<void>;
  reset: () => void;
  addData: (newData: T[], prepend?: boolean) => void;
  setData: (data: T[]) => void;
  updateItem: (predicate: (item: T) => boolean, updater: (item: T) => T) => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll<T>({
  loadMore,
  initialData = [],
  pageSize = 20,
  threshold = 100,
  loadAtTop = false,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);
  const prevScrollHeightRef = useRef(0);

  const loadMoreData = useCallback(async () => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);

    try {
      const newData = await loadMore(page);
      
      if (newData.length < pageSize) {
        setHasMore(false);
      }
      
      if (loadAtTop) {
        // 顶部加载：保存当前滚动高度
        const container = scrollContainerRef.current;
        if (container) {
          prevScrollHeightRef.current = container.scrollHeight;
        }
        setData(prev => [...newData, ...prev]);
      } else {
        // 底部加载
        setData(prev => [...prev, ...newData]);
      }
      
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('加载更多数据失败:', error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [loadMore, page, hasMore, pageSize, loadAtTop]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    
    if (loadAtTop) {
      // 顶部加载：当滚动到顶部时触发
      if (scrollTop < threshold) {
        loadMoreData();
      }
    } else {
      // 底部加载：当滚动到底部时触发
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMoreData();
      }
    }
  }, [loadMoreData, threshold, loadAtTop]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 顶部加载时，保持滚动位置
  useEffect(() => {
    if (loadAtTop && !loading && prevScrollHeightRef.current > 0) {
      const container = scrollContainerRef.current;
      if (container) {
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = newScrollHeight - prevScrollHeightRef.current;
        prevScrollHeightRef.current = 0;
      }
    }
  }, [data, loading, loadAtTop]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setLoading(false);
    loadingRef.current = false;
    prevScrollHeightRef.current = 0;
  }, [initialData]);

  const addData = useCallback((newData: T[], prepend = false) => {
    setData(prev => prepend ? [...newData, ...prev] : [...prev, ...newData]);
  }, []);

  const updateItem = useCallback((predicate: (item: T) => boolean, updater: (item: T) => T) => {
    setData(prev => prev.map(item => predicate(item) ? updater(item) : item));
  }, []);

  return {
    data,
    loading,
    hasMore,
    loadMoreData,
    reset,
    addData,
    setData,
    updateItem,
    scrollContainerRef,
  };
}
