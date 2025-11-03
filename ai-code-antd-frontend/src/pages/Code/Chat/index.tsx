import React, { useState, useEffect, useRef } from 'react';
import { useParams } from '@umijs/max';
import { Button, Card, Input, message, Space, Typography, Avatar, Spin } from 'antd';
import {LoginOutlined, SendOutlined} from '@ant-design/icons';
import {deployApp} from "@/services/backend/appController";
import {history} from "@@/core/history";

const { TextArea } = Input, { Title, Text } = Typography;
interface Message {
  id: string; content: string; isUser: boolean; timestamp: Date;
}
const ChatPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string>('');
  const [deploying, setDeploying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const handleSendMessage = async () => {
    const messageContent = inputValue.trim(); if (!messageContent) return;
    const userMessage: Message = { id: Date.now().toString(), content: messageContent, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]); setInputValue(''); setLoading(true);
    const aiMessageId = (Date.now() + 1).toString(); setMessages(prev => [...prev, { id: aiMessageId, content: '', isUser: false, timestamp: new Date() }]);
    try {
      const url = `/api/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(messageContent)}`;
      let eventSource: EventSource | null = null;
      let closed = false;
      let aiResponse = '';
      // 封装事件回调（避免重复注册等问题）
      function closeES() { if (!closed && eventSource) { eventSource.close(); closed = true; } }
      eventSource = new EventSource(url, { withCredentials: true } as any);
      eventSource.onopen = () => console.log('SSE 连接已建立');
      eventSource.onmessage = (event: MessageEvent) => {
        try {
          const parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : {};
          if (parsedData.d) {
            aiResponse += parsedData.d;
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, content: aiResponse } : msg));
          }
        } catch (e) {
          console.warn('AI SSE 数据格式异常:', event.data, e);
        }
      };
      eventSource.addEventListener('done', () => {
        closeES();
        setLoading(false);
      });
      eventSource.onerror = (event) => {
        closeES();
        setLoading(false);
        message.error('AI 生成中断或网络错误');
        console.error('SSE 连接出错', event);
      };
    } catch (error: any) {
      message.error('发送失败：' + error.message);
      setMessages(prev => prev.filter(msg => msg.isUser)); setLoading(false);
    }
  };

  // 部署应用按钮点击事件
  const handleDeploy = async () => {
    if (!appId) return;
    setDeploying(true);
    try {
      const res = await deployApp({
        appId ,
      });
      if (res?.data) {
        setDeployUrl(res.data);
        message.success('部署成功');
      } else {
        throw new Error('无部署地址');
      }
    } catch (e: any) {
      message.error('部署失败：' + (e.message || e));
    }
    setDeploying(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>应用对话</Title>
        <Space>
          <Button type="primary" loading={deploying} onClick={handleDeploy} style={{ minWidth: 100 }}>部署应用</Button>
          <Button type={"dashed"} onClick={() => history.push(`http://localhost:8080/${deployUrl}/`)} icon={<LoginOutlined />}>新窗口打开</Button>
        </Space>
      </div>
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {/* 左列 聊天区 */}
        <div style={{ width: '50%', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
                <div style={{ maxWidth: 500, display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: msg.isUser ? 'row-reverse' : 'row' }}>
                  <Avatar style={{ background: msg.isUser ? '#1890ff' : '#52c41a' }}>{msg.isUser ? 'U' : 'AI'}</Avatar>
                  <Card size="small" style={{ background: msg.isUser ? '#e6f7ff' : '#f6ffed', border: msg.isUser ? '1px solid #91d5ff' : '1px solid #b7eb8f' }}>
                    <Text style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                    <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{msg.timestamp.toLocaleTimeString()}</div>
                  </Card>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', marginBottom: 16 }}>
                <Avatar style={{ background: '#52c41a' }}>AI</Avatar>
                <Card size="small" style={{ background: '#f6ffed' }}><Spin size="small" /><Text style={{ marginLeft: 8 }}>AI正在思考中...</Text></Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
            <Space.Compact style={{ width: '100%' }}>
              <TextArea rows={2} placeholder="请输入您的问题..." value={inputValue} onChange={e => setInputValue(e.target.value)}
                onPressEnter={e => { if (e.ctrlKey || e.metaKey) handleSendMessage(); }} />
              <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={handleSendMessage}>发送</Button>
            </Space.Compact>
            <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>提示：Ctrl+Enter 发送</div>
          </div>
        </div>
        {/* 右列 网页预览区 */}
        <div style={{ width: '50%', background: '#fafafa', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {deployUrl ? (
            <iframe
              title="已部署应用预览"
              style={{ border: '1px solid #eee', borderRadius: 8, width: '100%', height: '80vh', background: '#fff' }}
              sandbox="allow-scripts allow-same-origin"
              src={deployUrl}
            />
          ) : (
            <Card style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Text type="secondary">请先点击上方“部署应用”按钮，完成部署后右侧将显示应用页面</Text>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
