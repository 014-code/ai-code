import { updatePointsRecord } from '@/services/backend/pointsRecordController';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { message, Modal } from 'antd';

interface Props {
  oldData?: API.PointsRecord;
  visible: boolean;
  columns: ProColumns<API.PointsRecord>[];
  onSubmit: (values: API.PointsRecord) => void;
  onCancel: () => void;
}

const handleUpdate = async (fields: API.PointsRecord) => {
  const hide = message.loading('正在更新');
  try {
    await updatePointsRecord(fields);
    hide();
    message.success('更新成功');
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，' + error.message);
    return false;
  }
};

const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;

  if (!oldData) {
    return <></>;
  }

  return (
    <Modal
      destroyOnClose
      title={'更新积分记录'}
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
        form={{
          initialValues: oldData,
        }}
        onSubmit={(values: API.PointsRecord) => {
          handleUpdate({
            ...values,
            id: oldData?.id,
          }).then(success => {
            if (success) {
              onSubmit?.(values);
            }
          });
        }}
      />
    </Modal>
  );
};
export default UpdateModal;
