import { useEffect, useRef, useCallback } from 'react';

export interface UseScrollLoadOptions {
  threshold?: number;  // 触发加载的距离阈值
  disabled?: boolean;  // 是否禁用加载
  containerRef?: React.RefObject<HTMLElement>;  // 滚动容器引用，不传则使用window
}

export function useScrollLoad(
  onLoadMore: () => void,
  options: UseScrollLoadOptions = {}
) {
  const { threshold = 100, disabled = false, containerRef } = options;
  const loadingRef = useRef(false);

  const handleScroll = useCallback(() => {
    if (disabled || loadingRef.current) {
      return;
    }

    const container = containerRef?.current || window;
    let scrollTop = 0;
    let scrollHeight = 0;
    let clientHeight = 0;

    if (container === window) {
      scrollTop = window.scrollY || document.documentElement.scrollTop;
      scrollHeight = document.documentElement.scrollHeight;
      clientHeight = window.innerHeight;
    } else {
      const element = container as HTMLElement;
      scrollTop = element.scrollTop;
      scrollHeight = element.scrollHeight;
      clientHeight = element.clientHeight;
    }

    // 检查是否滚动到底部
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadingRef.current = true;
      onLoadMore();
      // 延迟重置loading状态，防止频繁触发
      setTimeout(() => {
        loadingRef.current = false;
      }, 200);
    }
  }, [disabled, threshold, containerRef, onLoadMore]);

  useEffect(() => {
    const container = containerRef?.current || window;
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll, containerRef]);

  return {
    resetLoading: () => {
      loadingRef.current = false;
    },
  };
}
