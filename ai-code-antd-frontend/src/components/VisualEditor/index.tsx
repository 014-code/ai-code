import React from 'react';
import { Button, Alert, Space, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { ElementInfo } from '@/utils/VisualEditor';

const { Text } = Typography;

/**
 * 可视化编辑器面板组件属性接口
 */
interface VisualEditorPanelProps {
  isEditMode: boolean;
  selectedElements: ElementInfo[];
  onToggleEditMode: () => void;
  onRemoveElement: (index: number) => void;
  onClearAllElements: () => void;
}

/**
 * 可视化编辑器面板组件
 * 显示已选择的页面元素列表，并提供编辑模式切换功能
 * @param props - 组件属性
 * @returns React 组件
 */
const VisualEditorPanel: React.FC<VisualEditorPanelProps> = ({
  isEditMode,
  selectedElements,
  onToggleEditMode,
  onRemoveElement,
  onClearAllElements,
}) => {
  return (
    <div style={{ marginBottom: 16 }}>
      {selectedElements.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text strong>已选择的页面元素:</Text>
            <Button size="small" type="link" onClick={onClearAllElements}>清除全部</Button>
          </div>
          {selectedElements.map((element, index) => (
            <Alert
              key={index}
              type="info"
              closable
              onClose={() => onRemoveElement(index)}
              style={{ marginBottom: 8 }}
              message={`${element.tagName} 元素`}
              description={
                <div style={{ fontSize: 12 }}>
                  <div>选择器: {element.selector}</div>
                  <div>文本: {element.textContent.substring(0, 50)}{element.textContent.length > 50 ? '...' : ''}</div>
                </div>
              }
            />
          ))}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          type={isEditMode ? "default" : "primary"}
          icon={<EditOutlined />}
          onClick={onToggleEditMode}
          style={{
            backgroundColor: isEditMode ? '#52c41a' : undefined,
            color: isEditMode ? '#fff' : undefined,
          }}
        >
          {isEditMode ? '退出编辑' : '可视化编辑'}
        </Button>
      </div>

      {isEditMode && (
        <div style={{ fontSize: 12, color: '#52c41a', marginTop: 8, textAlign: 'center' }}>
          编辑模式已开启，可以点击右侧网页元素
        </div>
      )}
    </div>
  );
};

export default VisualEditorPanel;
