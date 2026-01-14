import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Typography, Space, Alert } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { VisualEditor, type ElementInfo } from '@/utils/VisualEditor';
import VisualEditorPanel from '@/components/VisualEditor';

const { Title, Text, Paragraph } = Typography;

/**
 * 测试可视化编辑器页面
 * 用于验证可视化编辑器的功能，包括元素选择、编辑模式切换等
 */
const TestVisualEditorPage: React.FC = () => {
  // 状态管理
  const [isEditMode, setIsEditMode] = useState<boolean>(false); // 是否处于编辑模式
  const [selectedElements, setSelectedElements] = useState<ElementInfo[]>([]); // 选中的元素列表
  const [iframeReady, setIframeReady] = useState<boolean>(false); // iframe是否加载完成

  // 引用
  const visualEditorRef = useRef<VisualEditor | null>(null); // 可视化编辑器实例引用
  const iframeRef = useRef<HTMLIFrameElement>(null); // iframe元素引用

  /**
   * 初始化可视化编辑器
   */
  useEffect(() => {
    if (!visualEditorRef.current) {
      visualEditorRef.current = new VisualEditor({
        onElementSelected: (elementInfo: ElementInfo) => {
          setSelectedElements(prev => [...prev, elementInfo]);
        },
        onElementHover: (elementInfo: ElementInfo) => {
          // 悬停处理逻辑
        }
      });
    }

    /**
     * 处理iframe消息
     * @param event 消息事件
     */
    const handleMessage = (event: MessageEvent) => {
      if (visualEditorRef.current) {
        visualEditorRef.current.handleIframeMessage(event);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  /**
   * 处理iframe加载完成
   */
  const handleFrameLoad = () => {
    if (iframeRef.current && visualEditorRef.current) {
      visualEditorRef.current.init(iframeRef.current);
      visualEditorRef.current.onIframeLoad();
      setIframeReady(true);
    }
  };

  /**
   * 切换编辑模式
   */
  const toggleEditMode = () => {
    if (!iframeRef.current || !iframeReady) {
      console.warn('iframe未加载完成');
      return;
    }
    const newMode = visualEditorRef.current?.toggleEditMode() ?? false;
    setIsEditMode(newMode);
  };

  /**
   * 移除选中的元素
   * @param index 元素索引
   */
  const removeSelectedElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 清空所有选中的元素
   */
  const clearAllSelectedElements = () => {
    setSelectedElements([]);
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 获取测试页面URL
   * @returns 测试页面URL
   */
  const getTestPageUrl = () => {
    return 'http://localhost:8123/api/static/test-page.html';
  };

  return (
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 可视化编辑器控制面板 */}
      <Card title="可视化编辑器测试页面" style={{ marginBottom: 16 }}>
        <Paragraph>
          这是一个测试页面，用于验证可视化编辑器的功能。点击"可视化编辑"按钮后，可以在右侧的iframe页面中选择元素。
        </Paragraph>

        <VisualEditorPanel
          isEditMode={isEditMode}
          selectedElements={selectedElements}
          onToggleEditMode={toggleEditMode}
          onRemoveElement={removeSelectedElement}
          onClearAllElements={clearAllSelectedElements}
        />
      </Card>

      {/* 测试区域 */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* 本地测试网页 */}
        <Card title="测试网页" style={{ flex: 1, marginRight: 16 }}>
          <div style={{ height: '100%', overflow: 'auto' }}>
            <Title level={2}>这是一个测试网页</Title>
            <Paragraph>
              点击右上角的"可视化编辑"按钮，然后选择这个页面中的任意元素。
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary">主按钮</Button>
              <Button type="default">默认按钮</Button>
              <Button type="dashed">虚线按钮</Button>
            </Space>

            <div style={{ marginTop: 16 }}>
              <Title level={4}>文本区域</Title>
              <Paragraph>
                这里是一些示例文本，可以用来测试文本选择功能。
                当你点击这段文本时，它会被添加到左侧的选中元素列表中。
              </Paragraph>
            </div>

            <div style={{ marginTop: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4 }}>
              <Title level={4}>卡片区域</Title>
              <Paragraph>
                这是一个带边框的区域，你也可以选择它。
              </Paragraph>
            </div>
          </div>
        </Card>

        {/* iframe测试区域 */}
        <Card title="iframe 测试 (标准iframe)" style={{ flex: 1 }}>
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Alert
              message="提示"
              description="这个iframe用于测试跨域元素选择功能。在编辑模式下，iframe中的元素会被高亮显示，点击可以选择它们。"
              type="info"
              style={{ marginBottom: 16 }}
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <iframe
                ref={iframeRef}
                src={getTestPageUrl()}
                style={{ border: '1px solid #ddd', borderRadius: 4, width: '100%', height: '100%' }}
                onLoad={handleFrameLoad}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestVisualEditorPage;