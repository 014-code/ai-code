import React, {useEffect, useRef, useState} from 'react';
import {Card, Button, Typography, Space, Alert} from 'antd';
import {EditOutlined} from '@ant-design/icons';
import {VisualEditor, ElementInfo} from '@/utils/VisualEditor';
import VisualEditorPanel from '@/components/VisualEditor';

const {Title, Text, Paragraph} = Typography;

/**
 * 测试可视化编辑器页面组件
 * 使用 react-frame-component 实现 iframe 可视化编辑功能
 * @returns React 组件
 */
const TestVisualEditorPage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<ElementInfo[]>([]);
  const [iframeReady, setIframeReady] = useState<boolean>(false);

  const visualEditorRef = useRef<VisualEditor | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        }
      });
    }

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
   * 当 iframe 加载完成后初始化可视化编辑器
   */
  const handleFrameLoad = () => {
    if (iframeRef.current && visualEditorRef.current) {
      visualEditorRef.current.init(iframeRef.current);
      visualEditorRef.current.onIframeLoad();
      setIframeReady(true);
    }
  };

  /**
   * 切换可视化编辑模式
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
   */
  const removeSelectedElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 清除所有选中的元素
   */
  const clearAllSelectedElements = () => {
    setSelectedElements([]);
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 获取 iframe 的测试页面 URL
   * 使用后端服务器提供的测试页面，避免跨域问题
   */
  const getTestPageUrl = () => {
    return 'http://localhost:8123/api/static/test-page.html';
  };

  return (
    <div style={{padding: 24, height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <Card title="可视化编辑器测试页面" style={{marginBottom: 16}}>
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

      <div style={{flex: 1, display: 'flex', minHeight: 0}}>
        <Card title="测试网页" style={{flex: 1, marginRight: 16}}>
          <div style={{height: '100%', overflow: 'auto'}}>
            <Title level={2}>这是一个测试网页</Title>
            <Paragraph>
              点击右上角的"可视化编辑"按钮，然后选择这个页面中的任意元素。
            </Paragraph>
            <Space direction="vertical" style={{width: '100%'}}>
              <Button type="primary">主按钮</Button>
              <Button type="default">默认按钮</Button>
              <Button type="dashed">虚线按钮</Button>
            </Space>

            <div style={{marginTop: 16}}>
              <Title level={4}>文本区域</Title>
              <Paragraph>
                这里是一些示例文本，可以用来测试文本选择功能。
                当你点击这段文本时，它会被添加到左侧的选中元素列表中。
              </Paragraph>
            </div>

            <div style={{marginTop: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 4}}>
              <Title level={4}>卡片区域</Title>
              <Paragraph>
                这是一个带边框的区域，你也可以选择它。
              </Paragraph>
            </div>
          </div>
        </Card>

        <Card title="iframe 测试 (标准iframe)" style={{flex: 1}}>
          <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Alert
              message="提示"
              description="这个iframe用于测试跨域元素选择功能。在编辑模式下，iframe中的元素会被高亮显示，点击可以选择它们。"
              type="info"
              style={{marginBottom: 16}}
            />
            <div style={{flex: 1, overflow: 'hidden'}}>
              <iframe
                ref={iframeRef}
                src={getTestPageUrl()}
                style={{border: '1px solid #ddd', borderRadius: 4, width: '100%', height: '100%'}}
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
