import React from 'react';
import { Input } from 'antd';

interface CodeEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  rows?: number;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  placeholder = '请输入代码...',
  rows = 10,
  language = 'javascript',
}) => {
  const { TextArea } = Input;

  return (
    <div style={{ width: '100%' }}>
      <TextArea
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
          fontSize: '13px',
          lineHeight: '1.5',
          backgroundColor: '#f5f5f5',
          border: '1px solid #d9d9d9',
          borderRadius: '4px',
          padding: '8px',
        }}
      />
    </div>
  );
};

export default CodeEditor;
