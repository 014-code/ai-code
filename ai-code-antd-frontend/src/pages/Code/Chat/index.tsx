import React, {useState, useEffect, useRef} from 'react';
import {useParams} from '@umijs/max';
import {Button, Card, Input, message, Space, Typography, Avatar, Spin} from 'antd';
import {LoginOutlined, SendOutlined, ReloadOutlined} from '@ant-design/icons';
import {deployApp, getAppVoById} from "@/services/backend/appController";
import {history} from "@@/core/history";
import {
  listAppChatHistory,
  listLatestChatHistoryVo,
} from "@/services/backend/chatHistoryController";
import {getLoginUser} from "@/services/backend/userController";
import ReactMarkdown from 'react-markdown';
import {getStaticPreviewUrl} from "@/constants/proUrlOperation";

const {TextArea} = Input, {Title, Text} = Typography;

interface LoadMoreState {
  hasMore: boolean;
  loading: boolean;
  lastCreateTime?: string;
}

const ChatPage: React.FC = () => {
  //当前appid
  const {appId} = useParams<{ appId: string }>();
  //聊天消息列表
  const [messages, setMessages] = useState<API.ChatHistoryVO[]>([]);
  //输入框值
  const [inputValue, setInputValue] = useState('');
  //ai回复加载效果
  const [loading, setLoading] = useState(false);
  //部署地址
  const [deployUrl, setDeployUrl] = useState<string>('');
  //部署状态
  const [deploying, setDeploying] = useState(false);
  //应用信息
  const [appInfo, setAppInfo] = useState<API.AppVO>();
  //登录用户信息
  const [loginUser, setLoginUser] = useState<API.LoginUserVO>();
  //加载更多状态
  const [loadMore, setLoadMore] = useState<LoadMoreState>({
    hasMore: false,
    loading: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化页面数据
  useEffect(() => {
    if (appId) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      initPageData();
    }
  }, [appId]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  // 初始化页面数据
  const initPageData = async () => {
    try {
      // 获取登录用户信息
      const userRes = await getLoginUser();
      if (userRes.code === 0) {
        setLoginUser(userRes.data);
      }

      // 获取应用信息
      // @ts-ignore
      const appRes = await getAppVoById({id: appId});
      if (appRes.code === 0) {
        setAppInfo(appRes.data);
      }

      // 加载最近10条对话历史
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await loadLatestChatHistory();

    } catch (error: any) {
      message.error('初始化页面失败：' + error.message);
    }
  };

  // 加载最近10条对话历史
  const loadLatestChatHistory = async () => {
    try {
      // @ts-ignore
      const res = await listLatestChatHistoryVo({appId: appId});
      if (res.code === 0 && res.data) {
        // 按创建时间升序排列
        const sortedMessages = [...res.data].sort((a, b) =>
          new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
        );
        setMessages(sortedMessages);

        // 如果有对话记录，检查是否需要显示网站
        if (sortedMessages.length >= 2) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          checkAndShowWebsite();
        }

        // 检查是否需要自动发送初始消息
        if (sortedMessages.length === 0 && appInfo && loginUser &&
          appInfo.userId === loginUser.id) {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          autoSendInitMessage();
        }
      }
    } catch (error: any) {
      message.error('加载对话历史失败：' + error.message);
    }
  };

  // 加载更多历史消息（游标查询）
  const loadMoreHistory = async () => {
    if (!loadMore.hasMore || loadMore.loading) return;

    setLoadMore(prev => ({...prev, loading: true}));

    try {
      const res = await listAppChatHistory({
        // @ts-ignore
        appId,
        pageSize: 10,
        lastCreateTime: loadMore.lastCreateTime
      });

      if (res.code === 0 && res.data?.records) {
        const newMessages = res.data.records;
        if (newMessages.length > 0) {
          // 按创建时间升序排列新消息
          const sortedNewMessages = [...newMessages].sort((a, b) =>
            new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
          );

          // 合并消息列表，保持升序
          const allMessages = [...sortedNewMessages, ...messages];
          setMessages(allMessages);

          // 更新游标状态
          const lastMessage = newMessages[newMessages.length - 1];
          setLoadMore({
            hasMore: newMessages.length === 10,
            loading: false,
            lastCreateTime: lastMessage.createTime
          });
        } else {
          setLoadMore({hasMore: false, loading: false});
        }
      }
    } catch (error: any) {
      message.error('加载更多消息失败：' + error.message);
      setLoadMore(prev => ({...prev, loading: false}));
    }
  };

  // 检查并显示网站
  const checkAndShowWebsite = async () => {
    if (!deployUrl && appId) {
      try {
        // 这里可以调用获取部署状态的接口
        // 暂时留空，根据实际业务逻辑实现
      } catch (error) {
        console.error('检查网站状态失败：', error);
      }
    }
  };

  // 自动发送初始消息
  const autoSendInitMessage = async () => {
    if (!appInfo?.initPrompt || !loginUser) return;

    try {
      // 由后端统一保存，前端不再重复保存用户消息

      // 触发AI回复
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      await handleSendMessage(appInfo.initPrompt, true);
    } catch (error: any) {
      console.error('自动发送初始消息失败：', error);
    }
  };

  /**
   * 发送消息给ai方法
   */
  const handleSendMessage = async (customMessage?: string, isAutoSend = false) => {
    const normalized = typeof customMessage === 'string' ? customMessage : undefined;
    const messageContent = (normalized ?? inputValue).trim();
    if (!messageContent) {
      message.warning('请输入消息内容');
      return;
    }

    if (!isAutoSend) {
      setInputValue('');
    }

    try {
      // 由后端统一保存，前端不再重复保存用户消息

      // 创建用户消息对象
      const userMessage: API.ChatHistoryVO = {
        id: Date.now(),
        // @ts-ignore
        appId,
        messageType: 'user',
        messageContent: messageContent,
        createTime: new Date().toISOString(),
        user: loginUser
      };

      // 将用户消息添加到列表
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);

      // 创建AI消息占位符
      const aiMessageId = Date.now() + 1;
      const aiMessage: API.ChatHistoryVO = {
        id: aiMessageId,
        // @ts-ignore
        appId,
        messageType: 'ai',
        messageContent: '',
        createTime: new Date().toISOString(),
      };

      setMessages(prev => [...prev, aiMessage]);

      // 调用AI生成代码接口
      const url = `/api/app/chat/gen/code?appId=${appId}&message=${encodeURIComponent(messageContent)}`;
      let eventSource: EventSource | null = null;
      let closed = false;
      let aiResponse = '';

      // 封装事件回调（避免重复注册等问题）
      function closeES() {
        if (!closed && eventSource) {
          eventSource.close();
          closed = true;
        }
      }

      eventSource = new EventSource(url, {withCredentials: true} as any);
      eventSource.onopen = () => console.log('SSE 连接已建立');
      eventSource.onmessage = (event: MessageEvent) => {
        let chunk = '';
        try {
          const parsed = typeof event.data === 'string' ? JSON.parse(event.data) : null;
          if (parsed && typeof parsed.d === 'string') {
            chunk = parsed.d;
          }
        } catch (_) {
          // 非 JSON，直接作为文本追加
          if (typeof event.data === 'string') {
            chunk = event.data;
          }
        }
        if (chunk) {
          aiResponse += chunk;
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId ? {...msg, messageContent: aiResponse} : msg
          ));
        }
      };

      eventSource.addEventListener('done', async () => {
        closeES();

        // 由后端统一保存 AI 消息，前端不再重复保存

        setLoading(false);

        // 如果有至少2条对话记录，检查是否需要显示网站
        if (messages.length + 2 >= 2) {
          checkAndShowWebsite();
        }
      });

      eventSource.onerror = (event) => {
        closeES();
        setLoading(false);
        message.error('AI 生成中断或网络错误');
        console.error('SSE 连接出错', event);
      };
    } catch (error: any) {
      message.error('发送失败：' + error.message);
      setMessages(prev => prev.filter(msg => msg.messageType === 'user'));
      setLoading(false);
    }
  };

  // 部署应用按钮点击事件
  const handleDeploy = async () => {
    if (!appId) return;
    setDeploying(true);
    try {
      const res = await deployApp({
        // @ts-ignore
        appId,
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
    <div style={{height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5'}}>
      <div style={{
        padding: 16,
        borderBottom: '1px solid #f0f0f0',
        background: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={4} style={{margin: 0}}>应用对话</Title>
        <Space>
          <Button type="primary" loading={deploying} onClick={handleDeploy} style={{minWidth: 100}}>部署应用</Button>
          <Button
            type="dashed"
            icon={<LoginOutlined/>}
            onClick={() => {
              if (!appInfo?.codeGenType || !appInfo?.id) {
                message.warning('暂无可用预览地址，请先部署应用');
                return;
              }
              history.push(getStaticPreviewUrl(appInfo.codeGenType, String(appInfo.id), appInfo.deployKey));
            }}
          >
            新窗口打开
          </Button>
        </Space>
      </div>
      <div style={{flex: 1, display: 'flex', minHeight: 0}}>
        {/* 左列 聊天区 */}
        <div style={{width: '50%', borderRight: '1px solid #eee', display: 'flex', flexDirection: 'column'}}>
          <div style={{flex: 1, overflow: 'auto', padding: 24}}>
            {/* 加载更多按钮 */}
            {loadMore.hasMore && (
              <div style={{display: 'flex', justifyContent: 'center', marginBottom: 16}}>
                <Button
                  type="dashed"
                  icon={<ReloadOutlined/>}
                  loading={loadMore.loading}
                  onClick={loadMoreHistory}
                >
                  加载更多历史消息
                </Button>
              </div>
            )}

            {/* 消息列表 */}
            {messages.map(msg => (
              <div key={msg.id}
                   style={{
                     display: 'flex',
                     justifyContent: msg.messageType === 'user' ? 'flex-end' : 'flex-start',
                     marginBottom: 16
                   }}>
                <div style={{
                  maxWidth: 500,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  flexDirection: msg.messageType === 'user' ? 'row-reverse' : 'row'
                }}>
                  <Avatar style={{background: msg.messageType === 'user' ? '#1890ff' : '#52c41a'}}>
                    {msg.messageType === 'user' ? 'U' : 'AI'}
                  </Avatar>
                  <Card size="small" style={{
                    background: msg.messageType === 'user' ? '#e6f7ff' : '#f6ffed',
                    border: msg.messageType === 'user' ? '1px solid #91d5ff' : '1px solid #b7eb8f'
                  }}>
                    <Text style={{whiteSpace: 'pre-wrap'}}>
                      <ReactMarkdown>
                        {msg.messageContent}
                      </ReactMarkdown>
                    </Text>
                    <div style={{fontSize: 12, color: '#999', marginTop: 4}}>
                      {msg.createTime ? new Date(msg.createTime).toLocaleTimeString() : ''}
                    </div>
                  </Card>
                </div>
              </div>
            ))}

            {/* AI回复加载状态 */}
            {loading && (
              <div style={{display: 'flex', marginBottom: 16}}>
                <Avatar style={{background: '#52c41a'}}>AI</Avatar>
                <Card size="small" style={{background: '#f6ffed'}}>
                  <Spin size="small"/>
                  <Text style={{marginLeft: 8}}>AI正在思考中...</Text>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
          <div style={{padding: 16, borderTop: '1px solid #f0f0f0', background: '#fff'}}>
            <Space.Compact style={{width: '100%'}}>
              <TextArea rows={2} placeholder="请输入您的问题..." value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onPressEnter={e => {
                          if (e.ctrlKey || e.metaKey) handleSendMessage();
                        }}/>
              <Button type="primary" icon={<SendOutlined/>} loading={loading}
                      onClick={() => handleSendMessage()}>发送</Button>
            </Space.Compact>
            <div style={{fontSize: 12, color: '#999', marginTop: 8}}>提示：Ctrl+Enter 发送</div>
          </div>
        </div>
        {/* 右列 网页预览区 */}
        <div style={{
          width: '50%',
          background: '#fafafa',
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {`http://localhost:8080/${appInfo?.deployKey}/` || deployUrl ? (
            <iframe
              title="已部署应用预览"
              style={{border: '1px solid #eee', borderRadius: 8, width: '100%', height: '80vh', background: '#fff'}}
              sandbox="allow-scripts allow-same-origin"
              src={
                appInfo?.codeGenType && appInfo?.id
                  ? getStaticPreviewUrl(appInfo.codeGenType, String(appInfo.id), appInfo.deployKey)
                  : undefined
              }
            />
          ) : (
            <Card
              style={{height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Text type="secondary">请先点击上方“部署应用”按钮，完成部署后右侧将显示应用页面</Text>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
