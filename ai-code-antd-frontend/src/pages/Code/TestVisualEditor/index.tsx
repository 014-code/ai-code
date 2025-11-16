import React, {useEffect, useRef, useState} from 'react';
import {Card, Button, Typography, Space, Alert} from 'antd';
import {EditOutlined} from '@ant-design/icons';
import {VisualEditor, ElementInfo} from '@/utils/VisualEditor';
import VisualEditorPanel from '@/components/VisualEditor';

const {Title, Text, Paragraph} = Typography;

const TestVisualEditorPage: React.FC = () => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<ElementInfo[]>([]);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const visualEditorRef = useRef<VisualEditor | null>(null);

  // 获取测试页面的HTML，包含编辑器脚本
  const getTestHtmlWithScript = () => {
    const script = new VisualEditor().generateEditScript();
    return `data:text/html,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
        </style>
        <script>${script}</script>
      </head>
      <body>
        <h1>iframe 测试页面</h1>
        <p>这是一个嵌套的HTML页面，用于测试iframe内元素选择。</p>
        <div style="background-color: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 4px;">
          这是一个灰色背景的div元素
        </div>
        <button style="background-color: #1890ff; color: white; border: none; padding: 8px 16px; margin: 10px 5px; border-radius: 4px; cursor: pointer;">
          蓝色按钮
        </button>
        <button style="background-color: #52c41a; color: white; border: none; padding: 8px 16px; margin: 10px 5px; border-radius: 4px; cursor: pointer;">
          绿色按钮
        </button>
        <ul>
          <li>列表项一</li>
          <li>列表项二</li>
          <li>列表项三</li>
        </ul>
        <div style="margin-top: 20px; padding: 16px; border: 1px solid #d9d9d9; border-radius: 4px;">
          <h3>特殊区域</h3>
          <p>这个区域有特殊的样式，可以测试样式选择器。</p>
          <div style="display: flex; gap: 10px;">
            <div style="flex: 1; padding: 10px; background-color: #e6f7ff; border-radius: 4px;">
              子区域1
            </div>
            <div style="flex: 1; padding: 10px; background-color: #f6ffed; border-radius: 4px;">
              子区域2
            </div>
          </div>
        </div>
      </body>
      </html>
    `)}`;
  };

  // 初始化可视化编辑器
  useEffect(() => {
    if (!visualEditorRef.current) {
      visualEditorRef.current = new VisualEditor({
        onElementSelected: (elementInfo: ElementInfo) => {
          console.log("选择的元素" + elementInfo)
          //选择元素方法
          setSelectedElements(prev => [...prev, elementInfo]);
        },
        onElementHover: (elementInfo: ElementInfo) => {
          // 可以在这里实现悬浮时的效果，比如显示提示信息
        }
      });
    }

    // 监听iframe消息
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

  // 当iframe加载完成后初始化可视化编辑器
  useEffect(() => {
    if (iframeRef.current && visualEditorRef.current) {
      visualEditorRef.current.init(iframeRef.current);
    }
  }, [iframeRef.current]);

  // 同步编辑模式状态
  useEffect(() => {
    if (visualEditorRef.current) {
      if (isEditMode) {
        visualEditorRef.current.enableEditMode();
      } else {
        visualEditorRef.current.disableEditMode();
      }
    }
  }, [isEditMode]);

  // 切换可视化编辑模式
  const toggleEditMode = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
  };

  // 移除选中的元素
  const removeSelectedElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  // 清除所有选中的元素
  const clearAllSelectedElements = () => {
    setSelectedElements([]);
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  // 处理iframe加载完成事件
  const handleIframeLoad = () => {
    if (visualEditorRef.current) {
      visualEditorRef.current.onIframeLoad();
    }
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

        <Card title="iframe 测试" style={{flex: 1}}>
          <div style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <Alert
              message="提示"
              description="这个iframe用于测试跨域元素选择功能。在编辑模式下，iframe中的元素会被高亮显示，点击可以选择它们。"
              type="info"
              style={{marginBottom: 16}}
            />
            <iframe
              ref={iframeRef}
              src={getTestHtmlWithScript()}
              style={{border: '1px solid #ddd', borderRadius: 4, width: '100%', flex: 1}}
              onLoad={handleIframeLoad}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestVisualEditorPage;
