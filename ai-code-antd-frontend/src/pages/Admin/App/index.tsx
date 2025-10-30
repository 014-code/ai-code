import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, message, Space, Typography, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CreateModal from './components/CreateModal';
import UpdateModal from './components/UpdateModal';
import { deleteAppByAdmin, listAppByPage, updateAppByAdmin } from '@/services/backend/appController';

const AppAdminPage: React.FC = () => {
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<any>();
  const actionRef = useRef<any>();

  const columns = [
    { title: 'ID', dataIndex: 'id' },
    { title: '应用名', dataIndex: 'appName' },
    { title: '描述', dataIndex: 'appDesc' },
    { title: '优先级', dataIndex: 'priority', render: (_, r) => <Tag color={r.priority === 99 ? 'red' : 'green'}>{r.priority}</Tag> },
    { title: '操作', valueType: 'option', render: (_, record) => (
      <Space>
        <Typography.Link onClick={() => { setCurrentRow(record); setUpdateModalVisible(true); }}>编辑</Typography.Link>
        <Typography.Link type="danger" onClick={async () => { await deleteAppByAdmin({id:record.id}); message.success('删除成功'); actionRef.current?.reload(); }}>删除</Typography.Link>
        {record.priority !== 99 &&
          <Button type="link" size="small" onClick={async () => { await updateAppByAdmin({ id: record.id, priority: 99 }); message.success('设为精选'); actionRef.current?.reload(); }}>设为精选</Button>
        }
      </Space>
    )}
  ];

  return (
    <PageContainer>
      <ProTable
        headerTitle="应用管理"
        actionRef={actionRef}
        rowKey="id"
        columns={columns as any}
        request={async (params) => {
          const { data } = await listAppByPage(params);
          return { success: true, data: data?.records || [], total: data?.total || 0 };
        }}
        toolBarRender={() => [<Button type="primary" onClick={() => setCreateModalVisible(true)}><PlusOutlined />新建</Button>]}
      />
      <CreateModal visible={createModalVisible} onSubmit={() => { setCreateModalVisible(false); actionRef.current?.reload(); }} onCancel={() => setCreateModalVisible(false)} />
      <UpdateModal visible={updateModalVisible} oldData={currentRow} onSubmit={() => { setUpdateModalVisible(false); setCurrentRow(undefined); actionRef.current?.reload(); }} onCancel={() => setUpdateModalVisible(false)} />
    </PageContainer>
  );
};

export default AppAdminPage;