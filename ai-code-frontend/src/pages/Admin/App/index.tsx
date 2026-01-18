import React, { useRef, useState } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { deleteApp, listAllAppsByPage, setAppFeatured } from '@/services/backend/appController';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';

// 常量定义
const DEFAULT_PAGE_SIZE = 10; // 默认分页大小
const TABLE_SCROLL_X = 1000; // 表格横向滚动宽度
const SEARCH_LABEL_WIDTH = 120; // 搜索标签宽度
const SEARCH_SPAN = 8; // 搜索表单宽度
const COLUMN_WIDTHS = {
  id: 80,
  appName: 150,
  deployKey: 120,
  initPrompt: 200,
  codeGenType: 120,
  priority: 80,
  userId: 80,
  createTime: 160,
  updateTime: 160,
  option: 120,
};

/**
 * 应用管理页面（管理员）
 * 用于管理所有应用，包括创建、修改、删除和设置精选
 */
const AppAdminPage: React.FC = () => {
  // 模态框显示状态
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  // 表格操作引用
  const actionRef = useRef<ActionType>();
  // 当前选中的行数据
  const [currentRow, setCurrentRow] = useState<API.App>();

  /**
   * 处理删除应用
   * @param row 要删除的应用数据
   * @returns 是否删除成功
   */
  const handleDelete = async (row: API.App) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deleteApp({
        id: row.id as any,
      });
      hide();
      message.success('删除成功');
      actionRef?.current?.reload();
      return true;
    } catch (error: any) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  /**
   * 设置应用为精选或取消精选
   * @param record 应用数据
   */
  const setNew = (record: API.App) => {
    const current = Number(record.priority) || 0;
    const nextPriority = current === 1 ? 0 : 1;
    setAppFeatured({ id: record.id as any, priority: nextPriority })
      .then(() => {
        message.success(nextPriority === 1 ? '已设为精选' : '已取消精选');
        actionRef?.current?.reload();
      })
      .catch(err => {
        message.error(err.message || '操作失败');
      });
  };

  /**
   * 获取应用列表数据
   * @param params 分页参数
   * @param sort 排序参数
   * @param filter 筛选参数
   * @returns 表格数据
   */
  const fetchApps = async (params: any, sort: any, filter: any) => {
    const sortField = Object.keys(sort)?.[0];
    const sortOrder = sort?.[sortField] ?? undefined;

    const {data, code} = await listAllAppsByPage({
      pageNum: params.current,
      pageSize: params.pageSize,
      sortField,
      sortOrder,
      ...filter,
    } as API.AppQueryRequest);

    return {
      success: code === 0,
      data: data?.records || [],
      total: parseInt(data?.totalRow as string) || 0,
    };
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<API.App>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: COLUMN_WIDTHS.id,
      hideInForm: true,
    },
    {
      title: '应用名',
      dataIndex: 'appName',
      valueType: 'text',
      width: COLUMN_WIDTHS.appName,
      ellipsis: true,
    },
    {
      title: '部署标识',
      dataIndex: 'deployKey',
      valueType: 'text',
      width: COLUMN_WIDTHS.deployKey,
      ellipsis: true,
    },
    {
      title: '初始化提示词',
      dataIndex: 'initPrompt',
      valueType: 'textarea',
      width: COLUMN_WIDTHS.initPrompt,
      ellipsis: true,
      render: (text) => (
        <span title={text as string} style={{maxWidth: `${COLUMN_WIDTHS.initPrompt}px`, display: 'inline-block'}}>
          {text}
        </span>
      ),
    },
    {
      title: '代码生成类型',
      dataIndex: 'codeGenType',
      valueType: 'text',
      width: COLUMN_WIDTHS.codeGenType,
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      valueType: 'digit',
      width: COLUMN_WIDTHS.priority,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      width: COLUMN_WIDTHS.userId,
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.createTime,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      sorter: true,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.updateTime,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: COLUMN_WIDTHS.option,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {/* 修改按钮 */}
          <Typography.Link
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalVisible(true);
            }}
          >
            修改
          </Typography.Link>
          {/* 删除按钮 */}
          <Typography.Link type="danger" onClick={() => handleDelete(record)}>
            删除
          </Typography.Link>
          {/* 设为精选/取消精选按钮 */}
          <Button type={"primary"} size={"small"}
                  onClick={() => setNew(record)}>{Number(record.priority) === 1 ? '取消精选' : '设为精选'}</Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.App>
        headerTitle={'应用管理'}
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: SEARCH_LABEL_WIDTH,
          span: SEARCH_SPAN,
          defaultCollapsed: false,
        }}
        scroll={{x: TABLE_SCROLL_X}}
        pagination={{
          pageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined/> 新建应用
          </Button>,
        ]}
        request={fetchApps}
        columns={columns}
      />
      {/* 创建应用模态框 */}
      <CreateModal
        visible={createModalVisible}
        columns={columns}
        onSubmit={() => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        }}
        onCancel={() => {
          setCreateModalVisible(false);
        }}
      />
      {/* 修改应用模态框 */}
      <UpdateModal
        visible={updateModalVisible}
        columns={columns}
        oldData={currentRow}
        onSubmit={() => {
          setUpdateModalVisible(false);
          setCurrentRow(undefined);
          actionRef.current?.reload();
        }}
        onCancel={() => {
          setUpdateModalVisible(false);
        }}
      />
    </PageContainer>
  );
};

export default AppAdminPage;
