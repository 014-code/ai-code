import { addApp } from '@/services/backend/appController';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { message, Modal } from 'antd';

interface Props {
  visible: boolean;
  columns: ProColumns<API.App>[];
  onSubmit: (values: API.AppAddRequest) => void;
  onCancel: () => void;
}

const handleAdd = async (fields: API.AppAddRequest) => {
  const hide = message.loading('正在添加');
  try {
    await addApp(fields);
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
      title={'创建'}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={columns}
        onSubmit={(values: API.AppAddRequest) => {
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
