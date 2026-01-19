import { useEffect, useState } from 'react';
import { Modal, Table, message, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { listPointsRecordByPage } from '@/services/backend/pointsRecordController';

interface PointsModalProps {
  visible: boolean;
  userId?: number;
  onCancel: () => void;
}

interface PointsRecord {
  id: number;
  userId: number;
  points: number;
  balance: number;
  type: string;
  reason: string;
  createTime: string;
}

const PointsModal: React.FC<PointsModalProps> = ({ visible, userId, onCancel }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<PointsRecord[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  useEffect(() => {
    if (visible && userId) {
      fetchPointsRecords();
    }
  }, [visible, userId, currentPage, pageSize]);

  const fetchPointsRecords = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const response = await listPointsRecordByPage({
        current: currentPage,
        pageSize: pageSize,
        userId: userId,
      });
      
      if (response.code === 0 && response.data) {
        setDataSource(response.data.records || []);
        setTotal(response.data.total || 0);
      } else {
        message.error('获取积分记录失败');
      }
    } catch (error) {
      message.error('获取积分记录失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<PointsRecord> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '积分变化',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points: number) => {
        if (points > 0) {
          return <Tag color="green">+{points}</Tag>;
        } else if (points < 0) {
          return <Tag color="red">{points}</Tag>;
        }
        return <Tag>{points}</Tag>;
      },
    },
    {
      title: '变化后余额',
      dataIndex: 'balance',
      key: 'balance',
      width: 120,
      render: (balance: number) => <Tag color="blue">{balance}</Tag>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
    },
  ];

  return (
    <Modal
      title="积分记录"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey="id"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
        }}
      />
    </Modal>
  );
};

export default PointsModal;
