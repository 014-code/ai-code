import React, { useRef, useState } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { deletePointsRecord, listPointsRecordByPage } from '@/services/backend/pointsRecordController';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';

const DEFAULT_PAGE_SIZE = 10;
const TABLE_SCROLL_X = 1200;
const SEARCH_LABEL_WIDTH = 120;
const SEARCH_SPAN = 8;
const COLUMN_WIDTHS = {
  id: 80,
  userId: 100,
  points: 80,
  balance: 100,
  type: 120,
  reason: 200,
  relatedId: 100,
  expireTime: 160,
  createTime: 160,
  option: 120,
};

const PointsRecordAdminPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.PointsRecord>();

  const handleDelete = async (row: API.PointsRecord) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deletePointsRecord({
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

  const fetchPointsRecords = async (params: any, sort: any, filter: any) => {
    const {data, code} = await listPointsRecordByPage({
      userId: filter.userId,
      type: filter.type,
      current: params.current,
      pageSize: params.pageSize,
    });

    return {
      success: code === 0,
      data: data?.records || [],
      total: data?.total || 0,
    };
  };

  const columns: ProColumns<API.PointsRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: COLUMN_WIDTHS.id,
      hideInForm: true,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      width: COLUMN_WIDTHS.userId,
      hideInForm: true,
    },
    {
      title: '积分变化',
      dataIndex: 'points',
      valueType: 'digit',
      width: COLUMN_WIDTHS.points,
      render: (text) => {
        const points = Number(text);
        return (
          <span style={{ color: points > 0 ? '#52c41a' : points < 0 ? '#ff4d4f' : 'inherit' }}>
            {points > 0 ? '+' : ''}{points}
          </span>
        );
      },
    },
    {
      title: '余额',
      dataIndex: 'balance',
      valueType: 'digit',
      width: COLUMN_WIDTHS.balance,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'text',
      width: COLUMN_WIDTHS.type,
      valueEnum: {
        'SIGN_IN': { text: '签到', status: 'Success' },
        'DAILY_TASK': { text: '每日任务', status: 'Processing' },
        'INVITE': { text: '邀请', status: 'Warning' },
        'CONSUME': { text: '消费', status: 'Error' },
        'ADMIN_ADJUST': { text: '管理员调整', status: 'Default' },
      },
    },
    {
      title: '原因',
      dataIndex: 'reason',
      valueType: 'textarea',
      width: COLUMN_WIDTHS.reason,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '关联ID',
      dataIndex: 'relatedId',
      valueType: 'text',
      width: COLUMN_WIDTHS.relatedId,
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '过期时间',
      dataIndex: 'expireTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.expireTime,
      hideInSearch: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.createTime,
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
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.PointsRecord>
        headerTitle={'积分记录管理'}
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
            <PlusOutlined/> 新建记录
          </Button>,
        ]}
        request={fetchPointsRecords}
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

export default PointsRecordAdminPage;
