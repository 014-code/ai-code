import { saveUserMessage } from '@/services/backend/chatHistoryController';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import '@umijs/max';
import { message, Modal } from 'antd';
import React from 'react';

interface Props {
  visible: boolean;
  columns: ProColumns<API.ChatHistory>[];
  onSubmit: (values: API.ChatHistoryAddRequest) => void;
  onCancel: () => void;
}

/**
 * 添加节点
 * @param fields
 */
const handleAdd = (fields: API.ChatHistoryAddRequest) => {
  const hide = message.loading('正在添加');
  return saveUserMessage(fields).then(() => {
    hide();
    message.success('创建成功');
    return true;
  }).catch((error: any) => {
    hide();
    message.error('创建失败，' + error.message);
    return false;
  });
};

/**
 * 创建弹窗
 * @param props
 * @constructor
 */
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
        onSubmit={(values: API.ChatHistoryAddRequest) => {
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
