import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * 分页 Hook 的配置选项接口
 * @template T - 数据项的类型
 */
interface UsePaginationOptions<T> {
  /**
   * 每页显示的数据条数，默认为 10
   */
  pageSize?: number
  /**
   * 数据获取函数，接收请求参数，返回 Promise
   */
  fetchFunction: (params: any) => Promise<any>
  /**
   * 初始请求参数，默认为空对象
   */
  initialParams?: any
  /**
   * 是否在组件挂载时自动加载数据，默认为 true
   */
  autoLoad?: boolean
}

/**
 * 分页 Hook 的返回值接口
 * @template T - 数据项的类型
 */
interface UsePaginationReturn<T> {
  /**
   * 当前页面的数据列表
   */
  data: T[]
  /**
   * 是否正在加载数据
   */
  loading: boolean
  /**
   * 是否正在刷新数据
   */
  refreshing: boolean
  /**
   * 是否还有更多数据可以加载
   */
  hasMore: boolean
  /**
   * 当前页码
   */
  pageNum: number
  /**
   * 手动加载数据的方法
   * @param isRefresh - 是否为刷新操作，默认为 false
   */
  loadData: (isRefresh?: boolean) => Promise<void>
  /**
   * 加载更多数据的方法
   */
  loadMore: () => void
  /**
   * 下拉刷新的方法
   */
  onRefresh: () => void
  /**
   * 重置分页状态的方法
   */
  reset: () => void
  /**
   * 更新请求参数的方法
   * @param newParams - 新的请求参数
   */
  updateParams: (newParams: any) => void
}

/**
 * 通用分页 Hook
 * 用于管理列表数据的分页加载、刷新、加载更多等功能
 *
 * @template T - 数据项的类型
 * @param options - 分页配置选项
 * @returns 分页状态和操作方法
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   loading,
 *   hasMore,
 *   loadMore,
 *   onRefresh,
 *   updateParams
 * } = usePagination<AppVO>({
 *   pageSize: 10,
 *   fetchFunction: fetchAppList,
 *   initialParams: { type: 'all' },
 *   autoLoad: true
 * })
 * ```
 */
export function usePagination<T = any>({
  pageSize = 10,
  fetchFunction,
  initialParams = {},
  autoLoad = true,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  /**
   * 当前页面的数据列表
   */
  const [data, setData] = useState<T[]>([])
  /**
   * 是否正在加载数据的加载状态
   */
  const [loading, setLoading] = useState<boolean>(false)
  /**
   * 是否正在刷新数据的刷新状态
   */
  const [refreshing, setRefreshing] = useState<boolean>(false)
  /**
   * 是否还有更多数据可以加载
   */
  const [hasMore, setHasMore] = useState<boolean>(true)
  /**
   * 当前页码，从 1 开始
   */
  const [pageNum, setPageNum] = useState<number>(1)
  /**
   * 当前请求参数
   */
  const [params, setParams] = useState<any>(initialParams)
  /**
   * 使用 ref 保存当前数据，避免闭包陷阱
   * 在 loadMore 中需要使用最新的 data 值
   */
  const dataRef = useRef<T[]>([])

  /**
   * 同步 dataRef 的值与 data 状态
   * 确保在回调函数中能获取到最新的数据
   */
  dataRef.current = data

  /**
   * 加载数据的核心方法
   * @param isRefresh - 是否为刷新操作，true 表示刷新（重置页码），false 表示加载更多
   */
  const loadData = useCallback(async (isRefresh = false) => {
    /**
     * 防止重复加载
     * 如果已经在加载中，直接返回
     */
    if (loading) return

    /**
     * 设置加载状态为 true
     */
    setLoading(true)
    try {
      /**
       * 构建请求参数
       * 合并当前参数、页码和每页大小
       */
      const requestParams = {
        ...params,
        /**
         * 如果是刷新操作，页码重置为 1
         * 否则使用当前页码
         */
        pageNum: isRefresh ? 1 : pageNum,
        pageSize,
      }

      /**
       * 调用数据获取函数
       */
      const res = await fetchFunction(requestParams)
      /**
       * 从响应中提取数据列表
       * 如果没有 records 字段，使用空数组
       */
      const records = res.data?.records || []
      /**
       * 从响应中提取总条数
       * 支持 totalRow 和 total 两种字段名
       * 使用 parseInt 确保转换为数字类型
       */
      const total = parseInt(res.data?.totalRow || res.data?.total || 0, 10)

      /**
       * 根据是否为刷新操作，决定数据合并方式
       * 刷新：直接使用新数据
       * 加载更多：将新数据追加到现有数据后面
       */
      const newData = isRefresh ? records : [...dataRef.current, ...records]

      /**
       * 更新数据列表
       */
      setData(newData)
      /**
       * 判断是否还有更多数据
       * 如果当前数据量小于总条数，说明还有更多数据
       */
      setHasMore(newData.length < total)

      /**
       * 更新页码
       * 刷新操作：重置为 1
       * 加载更多：页码加 1
       */
      if (isRefresh) {
        setPageNum(1)
      } else {
        setPageNum(prev => prev + 1)
      }
    } catch (error) {
      /**
       * 捕获并打印加载错误
       */
      console.error('加载数据失败：', error)
      /**
       * 重新抛出错误，让调用方可以处理
       */
      throw error
    } finally {
      /**
       * 无论成功还是失败，都重置加载状态
       */
      setLoading(false)
      setRefreshing(false)
    }
  }, [loading, params, pageNum, pageSize, fetchFunction])

  /**
   * 加载更多数据的方法
   * 检查是否满足加载更多的条件：
   * 1. 没有正在加载
   * 2. 还有更多数据
   * 3. 已有数据（避免首次加载时触发）
   */
  const loadMore = useCallback(() => {
    if (!loading && hasMore && dataRef.current.length > 0) {
      /**
       * 调用 loadData 加载下一页数据
       * isRefresh 为 false，表示加载更多
       */
      loadData(false)
    }
  }, [loading, hasMore, loadData])

  /**
   * 下拉刷新的方法
   * 重置页码并重新加载第一页数据
   */
  const onRefresh = useCallback(() => {
    /**
     * 设置刷新状态为 true
     */
    setRefreshing(true)
    /**
     * 重置页码为 1
     */
    setPageNum(1)
    /**
     * 调用 loadData 刷新数据
     * isRefresh 为 true，表示刷新操作
     */
    loadData(true)
  }, [loadData])

  /**
   * 重置分页状态的方法
   * 清空数据，重置页码和参数
   */
  const reset = useCallback(() => {
    /**
     * 清空数据列表
     */
    setData([])
    /**
     * 重置页码为 1
     */
    setPageNum(1)
    /**
     * 重置 hasMore 为 true
     */
    setHasMore(true)
    /**
     * 重置请求参数为初始值
     */
    setParams(initialParams)
  }, [initialParams])

  /**
   * 更新请求参数的方法
   * 当参数改变时，需要重新加载数据
   * @param newParams - 新的请求参数
   */
  const updateParams = useCallback((newParams: any) => {
    /**
     * 更新请求参数
     */
    setParams(newParams)
    /**
     * 重置页码为 1
     */
    setPageNum(1)
    /**
     * 清空数据列表
     */
    setData([])
    /**
     * 重置 hasMore 为 true
     */
    setHasMore(true)
  }, [initialParams])

  /**
   * 组件挂载时自动加载数据
   * 只有当 autoLoad 为 true 时才自动加载
   */
  useEffect(() => {
    if (autoLoad) {
      /**
       * 加载第一页数据
       * isRefresh 为 true，表示首次加载
       */
      loadData(true)
    }
  }, [])

  /**
   * 返回分页状态和操作方法
   */
  return {
    data,
    loading,
    refreshing,
    hasMore,
    pageNum,
    loadData,
    loadMore,
    onRefresh,
    reset,
    updateParams,
  }
}
