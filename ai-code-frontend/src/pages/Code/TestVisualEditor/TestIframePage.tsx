import React, { useEffect, useState } from 'react';
import { VisualEditor } from '@/utils/VisualEditor';

/**
 * 测试iframe页面组件
 * 用于测试可视化编辑器在iframe内的元素选择功能
 */
const TestIframePage: React.FC = () => {
  // 脚本注入状态
  const [scriptInjected, setScriptInjected] = useState(false);

  /**
   * 注入可视化编辑脚本
   */
  useEffect(() => {
    if (!scriptInjected) {
      const scriptElement = document.createElement('script');
      scriptElement.textContent = new VisualEditor().generateEditScript();
      document.head.appendChild(scriptElement);
      setScriptInjected(true);
    }
  }, [scriptInjected]);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: 20 }}>
      <h1>iframe 测试页面</h1>
      <p>这是一个嵌套的HTML页面，用于测试iframe内元素选择。</p>
      
      {/* 测试元素：灰色背景div */}
      <div style={{ backgroundColor: '#f0f0f0', padding: 10, margin: '10px 0', borderRadius: 4 }}>
        这是一个灰色背景的div元素
      </div>
      
      {/* 测试元素：按钮 */}
      <button style={{ backgroundColor: '#1890ff', color: 'white', border: 'none', padding: '8px 16px', margin: '10px 5px', borderRadius: 4, cursor: 'pointer' }}>
        蓝色按钮
      </button>
      <button style={{ backgroundColor: '#52c41a', color: 'white', border: 'none', padding: '8px 16px', margin: '10px 5px', borderRadius: 4, cursor: 'pointer' }}>
        绿色按钮
      </button>
      
      {/* 测试元素：列表 */}
      <ul>
        <li>列表项一</li>
        <li>列表项二</li>
        <li>列表项三</li>
      </ul>
      
      {/* 测试元素：特殊区域 */}
      <div style={{ marginTop: 20, padding: 16, border: '1px solid #d9d9d9', borderRadius: 4 }}>
        <h3>特殊区域</h3>
        <p>这个区域有特殊的样式，可以测试样式选择器。</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {/* 测试元素：子区域1 */}
          <div style={{ flex: 1, padding: 10, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
            子区域1
          </div>
          {/* 测试元素：子区域2 */}
          <div style={{ flex: 1, padding: 10, backgroundColor: '#f6ffed', borderRadius: 4 }}>
            子区域2
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestIframePage;