import React, {useState, useEffect, useRef} from 'react';
import {useParams} from '@umijs/max';
import {Button, Card, Input, message, Space, Typography, Avatar, Spin, Tag} from 'antd';
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
import {CODE_GEN_TYPE_CONFIG} from "@/constants/codeGenTypeEnum";
import {VisualEditor, ElementInfo} from '@/utils/VisualEditor';
import VisualEditorPanel from "@/components/VisualEditor";
import Logo from "@/components/Logo";
import CommentSection from "@/components/CommentSection";
import InteractiveBackground from "@/components/InteractiveBackground";
import styles from './index.less';

const {TextArea} = Input, {Title, Text} = Typography;

const MAX_MESSAGE_WIDTH = 500;
const LOAD_MORE_PAGE_SIZE = 10;

interface LoadMoreState {
  hasMore: boolean;
  loading: boolean;
  lastCreateTime?: string;
}

/**
 * AI代码生成聊天页面
 * 提供用户与AI交互的界面，支持代码生成、实时预览、可视化编辑等功能
 */
const ChatPage: React.FC = () => {
  const {appId} = useParams<{ appId: string }>();

  const [messages, setMessages] = useState<API.ChatHistoryVO[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [deployUrl, setDeployUrl] = useState<string>('');
  const [deploying, setDeploying] = useState(false);
  const [appInfo, setAppInfo] = useState<API.AppVO>();
  const [loginUser, setLoginUser] = useState<API.LoginUserVO>();
  const [loadMore, setLoadMore] = useState<LoadMoreState>({
    hasMore: false,
    loading: false,
  });
  const [downloading, setDownloading] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedElements, setSelectedElements] = useState<ElementInfo[]>([]);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const visualEditorRef = useRef<VisualEditor | null>(null);

  useEffect(() => {
    if (appId) {
      initPageData();
    }
  }, [appId]);

  useEffect(() => {
    if (!isStreaming && !isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  }, [messages, isStreaming, isInitialLoad]);

  useEffect(() => {
    if (!visualEditorRef.current) {
      visualEditorRef.current = new VisualEditor({
        onElementSelected: (elementInfo: ElementInfo) => {
          console.log("选择的元素" + elementInfo);
          setSelectedElements(prev => [...prev, elementInfo]);
        },
        onElementHover: (elementInfo: ElementInfo) => {
        }
      });
    }
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleFrameLoad = () => {
    if (iframeRef.current && visualEditorRef.current) {
      visualEditorRef.current.init(iframeRef.current);
      visualEditorRef.current.onIframeLoad();
    }
  };

  useEffect(() => {
    if (visualEditorRef.current) {
      if (isEditMode) {
        visualEditorRef.current.enableEditMode();
      } else {
        visualEditorRef.current.disableEditMode();
      }
    }
  }, [isEditMode]);

  const initPageData = () => {
    getLoginUser().then(userRes => {
      if (userRes.code === 0) {
        setLoginUser(userRes.data);
      }
    }).catch(error => {
      message.error('获取用户信息失败：' + error.message);
    });

    getAppVoById({id: appId}).then(appRes => {
      if (appRes.code === 0) {
        setAppInfo(appRes.data);
        // 如果应用已经有部署地址，直接显示预览
        if (appRes.data?.deployKey) {
          checkAndShowWebsite(appRes.data);
        }
      }
    }).catch(error => {
      message.error('获取应用信息失败：' + error.message);
    });

    loadLatestChatHistory();

    // 检查URL参数中是否有提示词，如果有则自动发送
    const urlParams = new URLSearchParams(window.location.search);
    const promptFromUrl = urlParams.get('prompt');
    if (promptFromUrl) {
      // 延迟一下，确保页面数据已加载
      setTimeout(() => {
        handleSendMessage(promptFromUrl, true).catch(error => {
          console.error('自动发送提示词失败：', error);
        });
        // 清除URL中的prompt参数
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 500);
    }
  };

  /**
   * 加载最新对话历史
   * 获取当前应用的最新对话记录，并按时间排序
   */
  const loadLatestChatHistory = () => {
    if (!appId) return;

    // 调用API获取最新对话历史
    listLatestChatHistoryVo({appId: appId}).then(res => {
      if (res.code === 0 && res.data) {
        // 按创建时间升序排序消息
        const sortedMessages = [...res.data].sort((a, b) =>
          new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
        );
        setMessages(sortedMessages);

        // 标记首次加载完成
        setIsInitialLoad(false);

        // 如果有消息，检查是否需要显示网站预览
        if (sortedMessages.length >= 2) {
          checkAndShowWebsite();
        }

        // 如果没有消息且当前用户是应用创建者，自动发送初始消息
        // 只有当应用是新创建的（没有部署地址）时才自动发送
        if (sortedMessages.length === 0 && appInfo && loginUser &&
          appInfo.userId === loginUser.id && !appInfo.deployKey) {
          autoSendInitMessage();
        }
      }
    }).catch(error => {
      message.error('加载对话历史失败：' + error.message);
    });
  };

  /**
   * 加载更多历史消息
   * 分页加载更早的对话历史记录
   */
  const loadMoreHistory = () => {
    if (!appId) return;

    // 如果没有更多数据或正在加载，直接返回
    if (!loadMore.hasMore || loadMore.loading) return;

    setLoadMore(prev => ({...prev, loading: true}));

    // 调用API获取更多历史消息
    listAppChatHistory({
      appId: appId,
      pageSize: LOAD_MORE_PAGE_SIZE,
      lastCreateTime: loadMore.lastCreateTime
    }).then(res => {
      if (res.code === 0 && res.data?.records) {
        const newMessages = res.data.records;
        if (newMessages.length > 0) {
          // 按创建时间升序排序新消息
          const sortedNewMessages = [...newMessages].sort((a, b) =>
            new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
          );

          // 将新消息添加到现有消息列表前面
          const allMessages = [...sortedNewMessages, ...messages];
          setMessages(allMessages);

          // 更新加载状态
          const lastMessage = newMessages[newMessages.length - 1];
          setLoadMore({
            hasMore: newMessages.length === LOAD_MORE_PAGE_SIZE,
            loading: false,
            lastCreateTime: lastMessage.createTime
          });
        } else {
          // 没有更多数据
          setLoadMore({hasMore: false, loading: false});
        }
      }
    }).catch(error => {
      message.error('加载更多消息失败：' + error.message);
      setLoadMore(prev => ({...prev, loading: false}));
    });
  };

  /**
   * 检查并显示网站
   * 检查是否需要显示部署后的网站预览
   */
  const checkAndShowWebsite = (appData?: any) => {
    // 使用传入的应用数据，如果没有传入则使用 state 中的 appInfo
    const currentAppInfo = appData || appInfo;

    // 如果应用已经有部署地址，直接显示预览
    if (currentAppInfo?.deployKey && currentAppInfo?.codeGenType && currentAppInfo?.id) {
      const previewUrl = getStaticPreviewUrl(
        currentAppInfo.codeGenType,
        String(currentAppInfo.id),
        currentAppInfo.deployKey
      );
      if (previewUrl) {
        setDeployUrl(previewUrl);
        setShowPreview(true);
        setPreviewLoading(false);
      }
    }
  };

  /**
   * 自动发送初始消息
   * 如果应用配置了初始提示词，自动发送第一条消息
   */
  const autoSendInitMessage = () => {
    if (!appInfo?.initPrompt || !loginUser) return;

    // 调用发送消息函数，传入初始提示词
    handleSendMessage(appInfo.initPrompt, true).catch(error => {
      console.error('自动发送初始消息失败：', error);
    });
  };

  /**
   * 下载应用代码
   * 从服务器下载当前应用的源代码压缩包
   */
  const downloadCode = () => {
    if (!appId) {
      message.error("应用不存在");
      return;
    }
    setDownloading(true);

    // 发起下载请求
    fetch(`http://localhost:8123/api/app/download/${appId}`, {
      method: 'GET',
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status}`);
      }

      // 从响应头中提取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `app-${appId}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = decodeURIComponent(filenameMatch[1]);
        }
      }

      // 将响应转换为Blob对象
      return response.blob().then(blob => ({blob, fileName}));
    }).then(({blob, fileName}) => {
      // 创建下载链接并触发下载
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 释放URL对象
      URL.revokeObjectURL(downloadUrl);
      message.success('代码下载成功');
    }).catch(e => {
      message.error("下载失败: " + (e.message || e));
    }).finally(() => {
      setDownloading(false);
    });
  };

  /**
   * 处理发送消息
   * 发送用户消息到AI，并通过SSE流式接收AI的回复
   * @param customMessage 自定义消息内容（可选）
   * @param isAutoSend 是否为自动发送（用于初始消息）
   * @returns Promise<void>
   */
  const handleSendMessage = (customMessage?: string, isAutoSend = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!appId) {
        message.error('应用不存在');
        reject(new Error('应用不存在'));
        return;
      }

      const normalized = typeof customMessage === 'string' ? customMessage : undefined;
      const messageContent = (normalized ?? inputValue).trim();
      if (!messageContent) {
        message.warning('请输入消息内容');
        reject(new Error('请输入消息内容'));
        return;
      }

      if (!isAutoSend) {
        setInputValue('');
      }

      // 创建用户消息对象
      const userMessage: API.ChatHistoryVO = {
        id: Date.now(),
        appId: appId,
        messageType: 'user',
        messageContent: messageContent,
        createTime: new Date().toISOString(),
        user: loginUser as any
      };

      console.log("应用id！！！", userMessage.appId);

      // 将用户消息添加到消息列表
      setMessages(prev => [...prev, userMessage]);
      setLoading(true);

      // 创建AI消息占位符
      const aiMessageId = Date.now() + 1;
      const aiMessage: API.ChatHistoryVO = {
        id: aiMessageId,
        appId: appId,
        messageType: 'ai',
        messageContent: '',
        createTime: new Date().toISOString(),
      };

      // 将AI消息占位符添加到消息列表
      setMessages(prev => [...prev, aiMessage]);

      // 构建SSE连接URL，直接连接后端以绕过webpack-dev-server的代理缓冲问题
      const isDev = process.env.NODE_ENV === 'development';
      const baseURL = isDev ? 'http://localhost:8123/api' : '/api';
      const params = new URLSearchParams({
        appId: appId,
        message: messageContent,
      });
      const url = `${baseURL}/app/chat/gen/code?${params}`;

      // 初始化SSE连接相关变量
      let eventSource: EventSource | null = null;
      let closed = false;
      let streamCompleted = false;
      let aiResponse = '';

      // 关闭SSE连接的辅助函数
      const closeES = () => {
        if (!closed && eventSource) {
          eventSource.close();
          closed = true;
        }
      };

      // 错误处理函数
      const handleError = (error: unknown) => {
        console.error('生成代码失败：', error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId ? {...msg, messageContent: '抱歉，生成过程中出现了错误，请重试。'} : msg
        ));
        setLoading(false);
        setIsStreaming(false);
        message.error('生成失败，请重试');
      };

      // 创建SSE连接，启用withCredentials以支持认证和cookie
      eventSource = new EventSource(url, {withCredentials: true});
      // SSE连接建立时的回调
      eventSource.onopen = () => {
        console.log('SSE 连接已建立');
        setLoading(false);
        setIsStreaming(true);
      };

      // 处理接收到的消息
      eventSource.onmessage = function (event) {
        if (streamCompleted) return;

        try {
          // 解析JSON包装的数据
          const parsed = JSON.parse(event.data);
          const content = parsed.d;

          // 拼接内容
          if (content !== undefined && content !== null) {
            aiResponse += content;
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? {...msg, messageContent: aiResponse} : msg
            ));
          }
        } catch (error) {
          console.error('解析消息失败:', error);
          handleError(error);
        }
      };

      // 监听done事件
      eventSource.addEventListener('done', function () {
        if (streamCompleted) return;

        streamCompleted = true;
        closeES();
        setLoading(false);
        setIsStreaming(false);

        // 流式输出完成后，滚动到底部
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
        }, 100);

        // 延迟更新预览，确保后端已完成处理
        setTimeout(async () => {
          await getAppVoById({id: appId}).then(res => {
            if (res.code === 0) {
              setAppInfo(res.data);
            }
          });
          checkAndShowWebsite();
        }, 1000);

        // 自动部署项目
        handleDeploy().then(() => {
          resolve();
        }).catch((error) => {
          console.error('自动部署失败：', error);
          message.error('自动部署失败：' + (error.message || '未知错误'));
          resolve();
        });
      });

      // 处理business-error事件（后端限流等错误）
      eventSource.addEventListener('business-error', function (event: MessageEvent) {
        if (streamCompleted) return;

        try {
          const errorData = JSON.parse(event.data);
          console.error('SSE业务错误事件:', errorData);

          // 显示具体的错误信息
          const errorMessage = errorData.message || '生成过程中出现错误';
          setMessages(prev => prev.map(msg =>
            msg.id === aiMessageId ? {...msg, messageContent: `❌ ${errorMessage}`} : msg
          ));
          message.error(errorMessage);

          streamCompleted = true;
          closeES();
          setLoading(false);
          setIsStreaming(false);
        } catch (parseError) {
          console.error('解析错误事件失败:', parseError, '原始数据:', event.data);
          handleError(new Error('服务器返回错误'));
        }
      });

      // 处理错误
      eventSource.onerror = function () {
        if (streamCompleted || !loading) return;
        // 检查是否是正常的连接关闭
        if (eventSource?.readyState === EventSource.CONNECTING) {
          streamCompleted = true;
          closeES();
          setLoading(false);
          setIsStreaming(false);

          setTimeout(async () => {
            await getAppVoById({id: appId}).then(res => {
              if (res.code === 0) {
                setAppInfo(res.data);
              }
            });
            checkAndShowWebsite();
          }, 1000);
        } else {
          handleError(new Error('SSE连接错误'));
        }
      };
    });
  };

  /**
   * 处理部署应用
   * 调用后端API部署当前应用，获取部署后的访问URL
   * @returns Promise<void>
   */
  const handleDeploy = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!appId) {
        message.error('应用不存在');
        return;
      }
      setDeploying(true);
      setPreviewLoading(true);

      deployApp({appId}).then(res => {
        if (res?.data) {
          setDeployUrl(res.data);
          message.success('部署成功');
          setShowPreview(true);
          resolve();
        }
      }).catch(err => {
        message.error(err.data?.message || '部署失败');
      }).finally(() => {
        setDeploying(false);
        setPreviewLoading(false);
      });
    });
  };

  /**
   * 切换编辑模式
   * 切换可视化编辑模式的开启/关闭状态
   */
  const toggleEditMode = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    !isEditMode ? message.info("进入编辑模式") : message.info("退出编辑模式");
  };

  /**
   * 处理来自iframe的消息
   * 接收并处理iframe发送的消息，主要用于可视化编辑功能
   * @param event 消息事件对象
   */
  const handleMessage = (event: MessageEvent) => {
    if (visualEditorRef.current) {
      visualEditorRef.current.handleIframeMessage(event);
    }
  };

  /**
   * 移除选中的元素
   * 从选中元素列表中移除指定索引的元素
   * @param index 要移除的元素索引
   */
  const removeSelectedElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 清除所有选中的元素
   * 清空选中元素列表并清除iframe中的选中状态
   */
  const clearAllSelectedElements = () => {
    setSelectedElements([]);
    if (visualEditorRef.current) {
      visualEditorRef.current.clearSelection();
    }
  };

  /**
   * 获取预览URL
   * @returns 完整的预览URL字符串
   */
  const getPreviewUrl = () => {
    if (!appInfo?.codeGenType || !appInfo?.id) {
      console.log('getPreviewUrl: 缺少必要参数', {codeGenType: appInfo?.codeGenType, id: appInfo?.id});
      return '';
    }
    const url = getStaticPreviewUrl(
      appInfo.codeGenType,
      String(appInfo.id),
      appInfo.deployKey || undefined
    );
    console.log('getPreviewUrl 生成的URL:', url, {
      codeGenType: appInfo.codeGenType,
      id: appInfo.id,
      deployKey: appInfo.deployKey
    });
    return url;
  };

  const codeGenTypeLabel = appInfo?.codeGenType
    ? CODE_GEN_TYPE_CONFIG[appInfo.codeGenType as keyof typeof CODE_GEN_TYPE_CONFIG]?.label
    : undefined;

  return (
    <>
      <InteractiveBackground />
      <div className={styles.chatPageContainer}>
      <div className={styles.chatHeader}>
        <Space>
          <Title level={4} style={{margin: 0}}>应用对话</Title>
          <Tag color={"blue"}>{codeGenTypeLabel || '未知类型'}</Tag>
          {appInfo?.user && (
            <Space>
              <Avatar size="small" src={appInfo.user.userAvatar}>{appInfo.user.userName?.[0]}</Avatar>
              <Text style={{fontSize: 14}}>{appInfo.user.userName}</Text>
            </Space>
          )}
        </Space>
        <Space>
          <Button type="primary" ghost loading={downloading} onClick={downloadCode}
                  style={{minWidth: 100}}>下载代码</Button>
          <Button type="primary" loading={deploying} onClick={handleDeploy} style={{minWidth: 100}}>部署应用</Button>
          <Button
            type="dashed"
            icon={<LoginOutlined/>}
            onClick={() => {
              if (!appInfo?.codeGenType || !appInfo?.id) {
                message.warning('暂无可用预览地址，请先部署应用');
                return;
              }
              window.open(getStaticPreviewUrl(appInfo.codeGenType, String(appInfo.id), appInfo.deployKey || ''), '_blank');
            }}
          >
            新窗口打开
          </Button>
        </Space>
      </div>
      <div style={{flex: 1, display: 'flex', minHeight: '800px'}}>
        <div className={styles.chatSection}>
          <div className={styles.chatContent}>
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

            {messages.map(msg => (
              <div key={msg.id}
                   style={{
                     display: 'flex',
                     justifyContent: msg.messageType === 'user' ? 'flex-end' : 'flex-start',
                     marginBottom: 16
                   }}>
                <div style={{
                  maxWidth: MAX_MESSAGE_WIDTH,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  flexDirection: msg.messageType === 'user' ? 'row-reverse' : 'row'
                }}>
                  {msg.messageType === 'user' ? (
                    <Avatar src={loginUser?.userAvatar}>{loginUser?.userName?.[0] || 'U'}</Avatar>
                  ) : (
                    <div
                      style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Logo size={32}/>
                    </div>
                  )}
                  <Card size="small" className={msg.messageType === 'user' ? styles.userMessageCard : styles.aiMessageCard}>
                    <Text className={styles.messageContent}>
                      <ReactMarkdown>
                        {msg.messageContent}
                      </ReactMarkdown>
                    </Text>
                    <div className={styles.messageTime}>
                      {msg.createTime ? new Date(msg.createTime).toLocaleTimeString() : ''}
                    </div>
                  </Card>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{display: 'flex', marginBottom: 16}}>
                <div style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <Logo size={32}/>
                </div>
                <Card size="small" className={styles.loadingMessageCard}>
                  <div className={styles.loadingMessageContent}>
                    <Spin size="small"/>
                    <Text style={{marginLeft: 8}}>AI正在思考中...</Text>
                  </div>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>
          <div className={styles.chatInput}>
            <VisualEditorPanel isEditMode={isEditMode}
                               selectedElements={selectedElements}
                               onToggleEditMode={toggleEditMode}
                               onRemoveElement={removeSelectedElement}
                               onClearAllElements={clearAllSelectedElements}></VisualEditorPanel>
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
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <Space>
              <Title level={5} style={{margin: 0}}>应用预览</Title>
            </Space>
          </div>
          <div className={styles.previewContent}>
            {showPreview && appInfo?.codeGenType && appInfo?.id ? (
              <div style={{position: 'relative', width: '100%', height: '100%'}}>
                {previewLoading && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fafafa',
                    zIndex: 1,
                    borderRadius: 8
                  }}>
                    <Spin size="large"/>
                    <Text style={{marginTop: 16, color: '#666'}}>预览加载中...</Text>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  title="已部署应用预览"
                  src={getPreviewUrl()}
                  className={styles.previewIframe}
                  onLoad={() => {
                    setPreviewLoading(false);
                    handleFrameLoad();
                  }}
                />
              </div>
            ) : (
              <Card
                style={{height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Text type="secondary">
                  {previewLoading ? '预览加载中...' : '请先发送消息，AI将自动生成并部署应用'}
                </Text>
              </Card>
            )}
          </div>
        </div>
      </div>
      {appInfo?.id && (
        <div className={styles.commentArea}>
          <CommentSection appId={String(appInfo.id)}/>
        </div>
      )}
    </div>
    </>
  );
};

export default ChatPage;
