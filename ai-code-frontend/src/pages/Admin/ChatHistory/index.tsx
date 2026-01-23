import { useRef, useState } from 'react';
import { Button, message, Space, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { deleteChatHistory, listAllChatHistoryByPage } from '@/services/backend/chatHistoryController';
import CreateModal from './components/CreateModal';

/**
 * 对话历史管理页面（管理员）
 * 用于管理所有用户的对话历史记录
 */
const ChatHistoryAdminPage: React.FC = () => {
  // 模态框显示状态
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);
  // 表格操作引用
  const actionRef = useRef<ActionType>();

  /**
   * 处理删除对话历史
   * @param row 要删除的对话历史数据
   * @returns 是否删除成功
   */
  const handleDelete = async (row: API.ChatHistory) => {
    const hide = message.loading('正在删除');
    if (!row) return true;
    try {
      await deleteChatHistory({
        id: row.id,
      });
      hide();
      message.success('删除成功');
      actionRef?.current?.reload();
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，' + error.message);
      return false;
    }
  };

  /**
   * 表格列配置
   */
  const columns: ProColumns<API.ChatHistory>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      valueType: 'text',
      width: 80,
      hideInForm: true,
    },
    {
      title: '应用ID',
      dataIndex: 'appId',
      valueType: 'text',
      width: 100,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      valueType: 'text',
      width: 80,
    },
    {
      title: '消息类型',
      dataIndex: 'messageType',
      valueType: 'text',
      width: 100,
      valueEnum: {
        'user': {text: '用户消息'},
        'ai': {text: 'AI回复'},
        'error': {text: '错误信息'},
      },
    },
    {
      title: '消息内容',
      dataIndex: 'messageContent',
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
      title: '错误信息',
      dataIndex: 'errorInfo',
      valueType: 'textarea',
      width: 150,
      ellipsis: true,
      render: (text) => (
        <span title={text as string} style={{maxWidth: '150px', display: 'inline-block'}}>
          {text}
        </span>
      ),
      hideInSearch: true,
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
          {/* 删除按钮 */}
          <Typography.Link type="danger" onClick={() => handleDelete(record)}>
            删除
          </Typography.Link>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.ChatHistory>
        headerTitle={'对话历史管理'}
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
            <PlusOutlined/> 新建对话历史
          </Button>,
        ]}
        request={(params, sort, filter) => {
          const sortField = Object.keys(sort)?.[0];
          const sortOrder = sort?.[sortField] ?? undefined;

          return listAllChatHistoryByPage({
            ...params,
            sortField,
            sortOrder,
            ...filter,
          } as API.ChatHistoryQueryRequest).then(({data, code}) => {
            return {
              success: code === 0,
              data: data?.records || [],
              total: data?.total || 0,
            };
          });
        }}
        columns={columns}
      />
      {/* 创建对话历史模态框 */}
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
    </PageContainer>
  );
};

export default ChatHistoryAdminPage;
