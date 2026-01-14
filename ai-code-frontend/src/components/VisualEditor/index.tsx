/**
 * 可视化编辑器面板组件
 * 提供编辑模式切换和选中元素管理功能
 */
import React from 'react';
import { Button, Alert, Typography } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { type ElementInfo } from '@/utils/VisualEditor';

const { Text } = Typography;

/**
 * 可视化编辑器面板属性接口
 */
interface VisualEditorPanelProps {
  isEditMode: boolean;            // 是否开启编辑模式
  selectedElements: ElementInfo[];  // 选中的元素列表
  onToggleEditMode: () => void;   // 切换编辑模式回调
  onRemoveElement: (index: number) => void;  // 移除选中元素回调
  onClearAllElements: () => void;  // 清除所有选中元素回调
}

/**
 * 可视化编辑器面板组件
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
      {/* 选中元素列表 */}
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

      {/* 编辑模式切换按钮 */}
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

      {/* 编辑模式提示 */}
      {isEditMode && (
        <div style={{ fontSize: 12, color: '#52c41a', marginTop: 8, textAlign: 'center' }}>
          编辑模式已开启，可以点击右侧网页元素
        </div>
      )}
    </div>
  );
};

export default VisualEditorPanel;
