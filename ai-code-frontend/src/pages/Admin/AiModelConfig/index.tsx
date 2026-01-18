import React, { useRef, useState } from 'react';
import { Button, message, Space, Switch, Tag, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import {
  deleteAiModelConfig,
  listAiModelConfig,
  updateModelStatus,
} from '@/services/backend/aiModelConfigController';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';

const DEFAULT_PAGE_SIZE = 10;
const TABLE_SCROLL_X = 1400;
const SEARCH_LABEL_WIDTH = 120;
const SEARCH_SPAN = 8;
const COLUMN_WIDTHS = {
  id: 80,
  modelKey: 150,
  modelName: 150,
  provider: 120,
  baseUrl: 200,
  tier: 100,
  pointsPerKToken: 120,
  description: 200,
  isEnabled: 80,
  sortOrder: 80,
  createTime: 160,
  updateTime: 160,
  option: 150,
};

const AiModelConfigAdminPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  const [updateModalVisible, setUpdateModalVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.AiModelConfig>();

  const handleDelete = async (row: API.AiModelConfig) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deleteAiModelConfig({
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

  const handleStatusChange = async (checked: boolean, record: API.AiModelConfig) => {
    const hide = message.loading('正在更新状态');
    try {
      await updateModelStatus({
        id: record.id,
        isEnabled: checked ? 1 : 0,
      });
      hide();
      message.success('状态更新成功');
      actionRef?.current?.reload();
    } catch (error: any) {
      hide();
      message.error('状态更新失败，' + error.message);
    }
  };

  const columns: ProColumns<API.AiModelConfig>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: COLUMN_WIDTHS.id,
      hideInForm: true,
      hideInSearch: true,
    },
    {
      title: '模型标识',
      dataIndex: 'modelKey',
      valueType: 'text',
      width: COLUMN_WIDTHS.modelKey,
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '模型标识不能为空',
          },
        ],
      },
    },
    {
      title: '模型名称',
      dataIndex: 'modelName',
      valueType: 'text',
      width: COLUMN_WIDTHS.modelName,
      ellipsis: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '模型名称不能为空',
          },
        ],
      },
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      valueType: 'text',
      width: COLUMN_WIDTHS.provider,
      valueEnum: {
        'openai': { text: 'OpenAI', status: 'Default' },
        'anthropic': { text: 'Anthropic', status: 'Processing' },
        'azure': { text: 'Azure', status: 'Success' },
        'google': { text: 'Google', status: 'Warning' },
        'other': { text: '其他', status: 'Error' },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '提供商不能为空',
          },
        ],
      },
    },
    {
      title: '基础URL',
      dataIndex: 'baseUrl',
      valueType: 'text',
      width: COLUMN_WIDTHS.baseUrl,
      ellipsis: true,
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '基础URL不能为空',
          },
          {
            type: 'url',
            message: '请输入有效的URL',
          },
        ],
      },
    },
    {
      title: '等级',
      dataIndex: 'tier',
      valueType: 'text',
      width: COLUMN_WIDTHS.tier,
      valueEnum: {
        'basic': { text: '基础版', status: 'Default' },
        'standard': { text: '标准版', status: 'Processing' },
        'premium': { text: '高级版', status: 'Success' },
        'enterprise': { text: '企业版', status: 'Warning' },
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '等级不能为空',
          },
        ],
      },
    },
    {
      title: '积分/千Token',
      dataIndex: 'pointsPerKToken',
      valueType: 'digit',
      width: COLUMN_WIDTHS.pointsPerKToken,
      hideInSearch: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '积分/千Token不能为空',
          },
        ],
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      valueType: 'textarea',
      width: COLUMN_WIDTHS.description,
      ellipsis: true,
      hideInSearch: true,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      valueType: 'text',
      width: COLUMN_WIDTHS.isEnabled,
      hideInForm: true,
      hideInSearch: true,
      render: (_, record) => (
        <Switch
          checked={record.isEnabled === 1}
          onChange={(checked) => handleStatusChange(checked, record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      valueType: 'digit',
      width: COLUMN_WIDTHS.sortOrder,
      hideInSearch: true,
      hideInTable: true,
      formItemProps: {
        rules: [
          {
            required: true,
            message: '排序不能为空',
          },
        ],
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.createTime,
      hideInForm: true,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      valueType: 'dateTime',
      width: COLUMN_WIDTHS.updateTime,
      hideInForm: true,
      hideInSearch: true,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: COLUMN_WIDTHS.option,
      fixed: 'right',
      render: (_, record) => [
        <a
          key="edit"
          onClick={() => {
            setCurrentRow(record);
            setUpdateModalVisible(true);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={async () => {
            const confirm = await window.confirm('确定要删除这个模型配置吗？');
            if (confirm) {
              await handleDelete(record);
            }
          }}
        >
          删除
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.AiModelConfig>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        request={async (params, sort, filter) => {
          const { data, code } = await listAiModelConfig({
            provider: filter.provider,
            tier: filter.tier,
            current: params.current,
            pageSize: params.pageSize,
          });

          return {
            success: code === 0,
            data: data?.records || [],
            total: data?.total || 0,
          };
        }}
        scroll={{ x: TABLE_SCROLL_X }}
        search={{
          labelWidth: SEARCH_LABEL_WIDTH,
          span: SEARCH_SPAN,
        }}
        pagination={{
          defaultPageSize: DEFAULT_PAGE_SIZE,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        dateFormatter="string"
        headerTitle="AI模型配置管理"
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
      />
      <CreateModal
        visible={createModalVisible}
        onVisibleChange={setCreateModalVisible}
        onFinish={async () => {
          setCreateModalVisible(false);
          actionRef?.current?.reload();
        }}
      />
      <UpdateModal
        visible={updateModalVisible}
        onVisibleChange={setUpdateModalVisible}
        values={currentRow || {}}
        onFinish={async () => {
          setUpdateModalVisible(false);
          actionRef?.current?.reload();
        }}
      />
    </PageContainer>
  );
};

export default AiModelConfigAdminPage;
