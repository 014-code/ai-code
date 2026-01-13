import CreateModal from '@/pages/Admin/App/components/CreateModal';
import UpdateModal from '@/pages/Admin/App/components/UpdateModal';
import {deleteApp, listAllAppsByPage, setAppFeatured} from '@/services/backend/appController';
import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import {Button, message, Space, Typography} from 'antd';
import React, {useRef, useState} from 'react';

const DEFAULT_PAGE_SIZE = 10;
const TABLE_SCROLL_X = 1000;
const SEARCH_LABEL_WIDTH = 120;
const SEARCH_SPAN = 8;
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
 * 管理员应用管理页面
 * 提供应用的增删改查、设置精选应用等功能
 */
const AppAdminPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.App>();

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
          <Typography.Link
            onClick={() => {
              setCurrentRow(record);
              setUpdateModalVisible(true);
            }}
          >
            修改
          </Typography.Link>
          <Typography.Link type="danger" onClick={() => handleDelete(record)}>
            删除
          </Typography.Link>
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
