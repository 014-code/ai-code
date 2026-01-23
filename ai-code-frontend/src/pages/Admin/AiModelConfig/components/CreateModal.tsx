import { useRef } from 'react';
import { Modal, Form, Input, InputNumber, Select } from 'antd';
import type { ProFormInstance } from '@ant-design/pro-components';
import { addAiModelConfig } from '@/services/backend/aiModelConfigController';

const { TextArea } = Input;

interface CreateModalProps {
  visible: boolean;
  onVisibleChange: (visible: boolean) => void;
  onFinish: () => void;
}

const CreateModal: React.FC<CreateModalProps> = ({
  visible,
  onVisibleChange,
  onFinish,
}) => {
  const formRef = useRef<ProFormInstance>();

  const handleSubmit = async () => {
    try {
      const values = await formRef.current?.validateFields();
      await addAiModelConfig(values);
      onVisibleChange(false);
      onFinish();
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    <Modal
      title="新建AI模型配置"
      open={visible}
      onOk={handleSubmit}
      onCancel={() => onVisibleChange(false)}
      width={600}
      destroyOnClose
    >
      <Form
        ref={formRef}
        layout="vertical"
        initialValues={{
          isEnabled: 1,
          sortOrder: 0,
        }}
      >
        <Form.Item
          label="模型标识"
          name="modelKey"
          rules={[
            { required: true, message: '请输入模型标识' },
            { max: 100, message: '模型标识不能超过100个字符' },
          ]}
        >
          <Input placeholder="例如：gpt-4、claude-3-opus" />
        </Form.Item>

        <Form.Item
          label="模型名称"
          name="modelName"
          rules={[
            { required: true, message: '请输入模型名称' },
            { max: 100, message: '模型名称不能超过100个字符' },
          ]}
        >
          <Input placeholder="例如：GPT-4、Claude 3 Opus" />
        </Form.Item>

        <Form.Item
          label="提供商"
          name="provider"
          rules={[{ required: true, message: '请选择提供商' }]}
        >
          <Select placeholder="请选择提供商">
            <Select.Option value="openai">OpenAI</Select.Option>
            <Select.Option value="anthropic">Anthropic</Select.Option>
            <Select.Option value="azure">Azure</Select.Option>
            <Select.Option value="google">Google</Select.Option>
            <Select.Option value="other">其他</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="基础URL"
          name="baseUrl"
          rules={[
            { required: true, message: '请输入基础URL' },
            { type: 'url', message: '请输入有效的URL' },
          ]}
        >
          <Input placeholder="例如：https://api.openai.com/v1" />
        </Form.Item>

        <Form.Item
          label="等级"
          name="tier"
          rules={[{ required: true, message: '请选择等级' }]}
        >
          <Select placeholder="请选择等级">
            <Select.Option value="basic">基础版</Select.Option>
            <Select.Option value="standard">标准版</Select.Option>
            <Select.Option value="premium">高级版</Select.Option>
            <Select.Option value="enterprise">企业版</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="积分/千Token"
          name="pointsPerKToken"
          rules={[
            { required: true, message: '请输入积分/千Token' },
            { type: 'number', min: 0, message: '积分不能为负数' },
          ]}
        >
          <InputNumber
            min={0}
            placeholder="例如：10"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item
          label="描述"
          name="description"
          rules={[{ max: 500, message: '描述不能超过500个字符' }]}
        >
          <TextArea
            rows={4}
            placeholder="请输入模型描述"
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          label="排序"
          name="sortOrder"
          rules={[
            { required: true, message: '请输入排序' },
            { type: 'number', min: 0, message: '排序不能为负数' },
          ]}
        >
          <InputNumber
            min={0}
            placeholder="数值越小排序越靠前"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreateModal;
