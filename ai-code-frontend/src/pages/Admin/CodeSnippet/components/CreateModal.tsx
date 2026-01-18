import { addCodeSnippet } from '@/services/backend/codeSnippetController';
import { getLoginUser } from '@/services/backend/userController';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-table';
import { message, Modal } from 'antd';
import React from 'react';
import CodeEditor from '@/components/CodeEditor';

interface Props {
  visible: boolean;
  columns: ProColumns<API.CodeSnippet>[];
  onSubmit: (values: API.CodeSnippet) => void;
  onCancel: () => void;
}

const handleAdd = async (fields: API.CodeSnippet) => {
  const hide = message.loading('正在添加');
  try {
    const user = await getLoginUser();
    const codeSnippetWithCreator = {
      ...fields,
      creatorId: user.data?.id,
    };
    await addCodeSnippet(codeSnippetWithCreator);
    hide();
    message.success('创建成功');
    return true;
  } catch (error: any) {
    hide();
    message.error('创建失败，' + error.message);
    return false;
  }
};

const CreateModal: React.FC<Props> = (props) => {
  const { visible, columns, onSubmit, onCancel } = props;

  const customColumns = columns.map(col => {
    if (col.dataIndex === 'snippetCode') {
      return {
        ...col,
        renderFormItem: (_, { type, defaultRender, ...rest }, form) => {
          return (
            <CodeEditor
              value={form.getFieldValue('snippetCode')}
              onChange={(value) => form.setFieldValue('snippetCode', value)}
              placeholder="请输入代码片段..."
              rows={15}
            />
          );
        },
      };
    }
    return col;
  });

  return (
    <Modal
      destroyOnClose
      title={'创建代码模板'}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
      width={800}
    >
      <ProTable
        type="form"
        columns={customColumns}
        onSubmit={(values: API.CodeSnippet) => {
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
