import CreateModal from '@/pages/Admin/App/components/CreateModal';
import UpdateModal from '@/pages/Admin/App/components/UpdateModal';
import {deleteApp, listAllAppsByPage, setAppFeatured} from '@/services/backend/appController';
import {PlusOutlined} from '@ant-design/icons';
import type {ActionType, ProColumns} from '@ant-design/pro-components';
import {PageContainer, ProTable} from '@ant-design/pro-components';
import '@umijs/max';
import {Button, message, Space, Typography} from 'antd';
import React, {useRef, useState} from 'react';

/**
 * 应用管理页面
 *
 * @constructor
 */
const AppAdminPage: React.FC = () => {
  // 是否显示新建窗口
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  // 是否显示更新窗口
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  // 当前应用点击的数据
  const [currentRow, setCurrentRow] = useState<API.App>();

  /**
   * 删除节点
   *
   * @param row
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
   * 设为精选应用
   */
  function setNew(record: API.App) {
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
  }

  /**
   * 表格列配置
   */
  const columns: ProColumns<API.App>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
      hideInForm: true,
    },
    {
      title: '应用名',
      dataIndex: 'appName',
      valueType: 'text',
      width: 150,
      ellipsis: true,
    },
    {
      title: '部署标识',
      dataIndex: 'deployKey',
      valueType: 'text',
      width: 120,
      ellipsis: true,
    },
    {
      title: '初始化提示词',
      dataIndex: 'initPrompt',
      valueType: 'textarea',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <span title={text as string} style={{maxWidth: '200px', display: 'inline-block'}}>
          {text}
        </span>
      ),
    },
    {
      title: '代码生成类型',
      dataIndex: 'codeGenType',
      valueType: 'text',
      width: 120,
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      valueType: 'digit',
      width: 80,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      width: 80,
    },
    {
      title: '创建时间',
      sorter: true,
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '更新时间',
      sorter: true,
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: 160,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 120,
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
          labelWidth: 120,
          span: 8,
          defaultCollapsed: false,
        }}
        scroll={{x: 1000}}
        pagination={{
          pageSize: 10,
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
        request={async (params, sort, filter) => {
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
            // @ts-ignore
            total: parseInt(data?.totalRow as string) || 0,
          };
        }}
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
