import { addPointsRecord } from '@/services/backend/pointsRecordController';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { message, Modal } from 'antd';

interface Props {
  visible: boolean;
  columns: ProColumns<API.PointsRecord>[];
  onSubmit: (values: API.PointsRecord) => void;
  onCancel: () => void;
}

const handleAdd = async (fields: API.PointsRecord) => {
  const hide = message.loading('正在添加');
  try {
    await addPointsRecord(fields);
    hide();
    message.success('创建成功');
    return true;
  } catch (error) {
    hide();
    message.error('创建失败，' + error.message);
    return false;
  }
};

const CreateModal: React.FC<Props> = (props) => {
  const { visible, columns, onSubmit, onCancel } = props;

  return (
    <Modal
      destroyOnClose
      title={'创建积分记录'}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
      width={600}
    >
      <ProTable
        type="form"
        columns={columns}
        onSubmit={(values: API.PointsRecord) => {
          handleAdd(values).then(success => {
            if (success) {
              onSubmit?.(values);
            }
          });
        }}
      />
    </Modal>
  );
};
export default CreateModal;
