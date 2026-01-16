/**
 * 应用对话页面
 * 提供AI代码生成、可视化编辑、应用部署和预览功能
 */
import {useState, useEffect, useRef} from 'react';
import {useParams} from 'react-router-dom';
import {Button, Card, Input, message, Space, Typography, Avatar, Spin, Tag, Modal} from 'antd';
import {LoginOutlined, SendOutlined, ReloadOutlined, StopOutlined, TeamOutlined, WifiOutlined, DisconnectOutlined} from '@ant-design/icons';
const { Group: AvatarGroup } = Avatar;
import {deployApp, getAppVoById, cancelCodeGeneration} from "@/services/backend/appController";
import {
  listAppChatHistory,
  listLatestChatHistoryVo,
} from "@/services/backend/chatHistoryController";
import {getLoginUser} from "@/services/backend/userController";
import ReactMarkdown from 'react-markdown';
import {getStaticPreviewUrl} from "@/constants/proUrlOperation";
import {CODE_GEN_TYPE_CONFIG} from "@/constants/codeGenTypeEnum";
import { VisualEditor, type ElementInfo } from '@/utils/VisualEditor';
import VisualEditorPanel from "@/components/VisualEditor";
import Logo from "@/components/Logo";
import CommentSection from "@/components/CommentSection";
import InteractiveBackground from "@/components/InteractiveBackground";
import AppEditWebSocket from '@/utils/websocket';
import { NotificationTypeEnum, EditStatusEnum, InteractionActionEnum, DeployActionEnum } from '@/enums/actionEnum';
import styles from './index.module.less';

const {TextArea} = Input, {Title, Text} = Typography;

// 常量定义
const MAX_MESSAGE_WIDTH = 500;  // 消息最大宽度
const LOAD_MORE_PAGE_SIZE = 10;  // 加载更多消息的分页大小

/**
 * 加载更多状态接口
 */
interface LoadMoreState {
  hasMore: boolean;    // 是否有更多消息
  loading: boolean;    // 是否正在加载
  lastCreateTime?: string;  // 最后一条消息的创建时间
}

/**
 * 应用对话页面组件
 */
const ChatPage: React.FC = () => {
  const {appId} = useParams<{ appId: string }>();  // 从URL参数获取应用ID

  // 状态管理
  const [messages, setMessages] = useState<API.ChatHistoryVO[]>([]);  // 对话消息列表
  const [inputValue, setInputValue] = useState('');  // 输入框内容
  const [loading, setLoading] = useState(false);  // 加载状态
  const [deployUrl, setDeployUrl] = useState<string>('');  // 部署URL
  const [deploying, setDeploying] = useState(false);  // 部署中状态
  const [appInfo, setAppInfo] = useState<API.AppVO>();  // 应用信息
  const [loginUser, setLoginUser] = useState<API.LoginUserVO>();  // 登录用户信息
  const [loadMore, setLoadMore] = useState<LoadMoreState>({
    hasMore: false,
    loading: false,
  });  // 加载更多状态
  const [downloading, setDownloading] = useState<boolean>(false);  // 下载中状态
  const [isEditMode, setIsEditMode] = useState<boolean>(false);  // 编辑模式状态
  const [selectedElements, setSelectedElements] = useState<ElementInfo[]>([]);  // 选中的元素列表
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);  // 预览加载状态
  const [showPreview, setShowPreview] = useState<boolean>(false);  // 是否显示预览
  const [isStreaming, setIsStreaming] = useState<boolean>(false);  // 是否正在流式传输
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);  // 是否首次加载
  const [hasSentUrlPrompt, setHasSentUrlPrompt] = useState<boolean>(false);  // 是否已发送URL中的提示词
  const [isInitialized, setIsInitialized] = useState<boolean>(false);  // 是否已初始化
  const [websocket, setWebsocket] = useState<AppEditWebSocket | null>(null);  // WebSocket实例
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);  // 在线用户列表
  const [onlineUsersVisible, setOnlineUsersVisible] = useState<boolean>(false);  // 在线用户列表弹窗显示状态
  const [currentEditingUser, setCurrentEditingUser] = useState<any>(null);  // 当前编辑用户
  const [isOtherUserGenerating, setIsOtherUserGenerating] = useState<boolean>(false);  // 是否有其他用户正在生成
  const [otherGeneratingUser, setOtherGeneratingUser] = useState<any>(null);  // 其他生成用户

  // 引用管理
  const messagesEndRef = useRef<HTMLDivElement>(null);  // 消息滚动到底部的引用
  const iframeRef = useRef<HTMLIFrameElement>(null);  // iframe引用
  const visualEditorRef = useRef<VisualEditor | null>(null);  // 可视化编辑器引用

  // 初始化页面数据
  useEffect(() => {
    if (appId) {
      initPageData();
    }
  }, [appId]);

  // 消息滚动到底部
  useEffect(() => {
    if (!isStreaming && !isInitialLoad) {
      messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  }, [messages, isStreaming, isInitialLoad]);

  // 初始化可视化编辑器
  useEffect(() => {
    if (!visualEditorRef.current) {
      visualEditorRef.current = new VisualEditor({
        onElementSelected: (elementInfo: ElementInfo) => {
          setSelectedElements(prev => [...prev, elementInfo]);
        },
        onElementHover: (elementInfo: ElementInfo) => {
          // 元素悬停处理
        }
      });
    }
    // 添加消息事件监听器
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
      // 组件卸载时关闭WebSocket连接
      if (websocket) {
        websocket.disconnect();
      }
    };
  }, [websocket]);

  // 处理iframe加载完成事件
  const handleFrameLoad = () => {
    if (iframeRef.current && visualEditorRef.current) {
      // 添加延迟，确保iframe完全加载
      setTimeout(() => {
        visualEditorRef.current.init(iframeRef.current);
        visualEditorRef.current.onIframeLoad();
      }, 500);
    }
  };

  // 编辑模式切换
  useEffect(() => {
    if (visualEditorRef.current && iframeRef.current) {
      if (isEditMode) {
        visualEditorRef.current.enableEditMode();
      } else {
        visualEditorRef.current.disableEditMode();
      }
    }
  }, [isEditMode]);

  /**
   * 初始化页面数据
   */
  const initPageData = () => {
    // 获取用户信息
    getLoginUser().then(userRes => {
      setLoginUser(userRes.data);
    }).catch(error => {
      message.error('获取用户信息失败：' + error.message);
    });

    // 获取应用信息
    getAppVoById({id: appId}).then(appRes => {
      setAppInfo(appRes.data);
      if (appRes.data?.deployKey) {
        checkAndShowWebsite(appRes.data);
      }
    }).catch(error => {
      message.error('获取应用信息失败：' + error.message);
    });

    // 处理URL中的提示词
    const urlParams = new URLSearchParams(window.location.search);
    const promptFromUrl = urlParams.get('prompt');
    if (promptFromUrl && !hasSentUrlPrompt) {
      setHasSentUrlPrompt(true);
      setTimeout(() => {
        handleSendMessage(promptFromUrl, true).catch(error => {
          console.error('自动发送提示词失败：', error);
        });
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }, 500);
    }

    // 加载最新对话历史
    loadLatestChatHistory();
  };
  
  /**
   * 加载最新对话历史
   */
  const loadLatestChatHistory = () => {
    if (!appId) return;

    listLatestChatHistoryVo({appId: appId}).then(res => {
      // 按时间排序消息
      const sortedMessages = [...res.data].sort((a, b) =>
        new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
      );
      setMessages(sortedMessages);

      setIsInitialLoad(false);

      // 如果有足够的消息，显示网站预览
      if (sortedMessages.length >= 2) {
        checkAndShowWebsite();
      }

      // 如果没有消息且是应用所有者，自动发送初始消息
      // 只有在没有从 URL 发送过消息时才自动发送
      if (sortedMessages.length === 0 && appInfo && loginUser &&
        appInfo.userId === loginUser.id && !appInfo.deployKey && !hasSentUrlPrompt) {
        autoSendInitMessage();
      }
    }).catch(error => {
      message.error('加载对话历史失败：' + error.message);
    });
  };

  /**
   * 加载更多对话历史
   */
  const loadMoreHistory = () => {
    if (!appId) return;

    if (!loadMore.hasMore || loadMore.loading) return;

    setLoadMore(prev => ({...prev, loading: true}));

    listAppChatHistory({
      appId: appId,
      pageSize: LOAD_MORE_PAGE_SIZE,
      lastCreateTime: loadMore.lastCreateTime
    }).then(res => {
      const newMessages = res.data?.records || [];
      // 按时间排序新消息
      const sortedNewMessages = [...newMessages].sort((a, b) =>
        new Date(a.createTime!).getTime() - new Date(b.createTime!).getTime()
      );

      // 合并消息列表
      const allMessages = [...sortedNewMessages, ...messages];
      setMessages(allMessages);

      // 更新加载更多状态
      setLoadMore({
        hasMore: newMessages.length === LOAD_MORE_PAGE_SIZE,
        loading: false,
        lastCreateTime: newMessages.length > 0 ? newMessages[newMessages.length - 1].createTime : loadMore.lastCreateTime
      });
    }).catch(error => {
      message.error('加载更多消息失败：' + error.message);
      setLoadMore(prev => ({...prev, loading: false}));
    });
  };

  /**
   * 检查并显示网站预览
   * @param appData 应用数据
   */
  const checkAndShowWebsite = (appData?: any) => {
    const currentAppInfo = appData || appInfo;

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
   */
  const autoSendInitMessage = () => {
    if (!appInfo?.initPrompt || !loginUser) return;

    handleSendMessage(appInfo.initPrompt, true).catch(error => {
      console.error('自动发送初始消息失败：', error);
    });
  };

  /**
   * 下载代码
   */
  const downloadCode = () => {
    if (!appId) {
      message.error("应用不存在");
      return;
    }
    setDownloading(true);

    fetch(`http://localhost:8123/api/app/download/${appId}`, {
      method: 'GET',
      credentials: 'include',
    }).then(response => {
      if (!response.ok) {
        message.error(`下载失败: ${response.status}`);
      }

      // 获取文件名
      const contentDisposition = response.headers.get('Content-Disposition');
      let fileName = `app-${appId}.zip`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          fileName = decodeURIComponent(filenameMatch[1]);
        }
      }

      return response.blob().then(blob => ({blob, fileName}));
    }).then(({blob, fileName}) => {
      // 创建下载链接
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
      message.success('代码下载成功');
    }).catch(e => {
      message.error("下载失败: " + (e.message || e));
    }).finally(() => {
      setDownloading(false);
    });
  };

  /**
   * 发送消息
   * @param customMessage 自定义消息内容
   * @param isAutoSend 是否自动发送
   * @returns Promise
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

      // 构建消息内容，包含选中的元素信息
      let finalMessageContent = messageContent;
      if (selectedElements.length > 0) {
        finalMessageContent = `${messageContent}\n\n[选中的元素信息]:\n${JSON.stringify(selectedElements)}`;
      }

      // 创建用户消息
      const userMessage: API.ChatHistoryVO = {
        id: Date.now(),
        appId: appId,
        messageType: 'user',
        messageContent: finalMessageContent,
        createTime: new Date().toISOString(),
        user: loginUser as any
      };

      // 如果在协同编辑模式，发送WebSocket消息通知其他用户
      if (websocket && websocket.isActive()) {
        websocket.sendMessage({
          type: InteractionActionEnum.SEND_MESSAGE,
          message: finalMessageContent,
          user: loginUser
        });
      }

      // 添加用户消息到列表
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

      // 添加AI消息到列表
      setMessages(prev => [...prev, aiMessage]);

      // 清除选中的元素
      if (selectedElements.length > 0) {
        clearAllSelectedElements();
      }

      // 构建API请求URL
      const isDev = import.meta.env.DEV;
      const baseURL = isDev ? 'http://localhost:8123/api' : '/api';
      const params = new URLSearchParams({
        appId: appId,
        message: finalMessageContent,
      });
      const url = `${baseURL}/app/chat/gen/code?${params}`;

      // 流式处理
      let eventSource: EventSource | null = null;
      let closed = false;
      let streamCompleted = false;
      let aiResponse = '';

      // 关闭事件源
      const closeES = () => {
        if (!closed && eventSource) {
          eventSource.close();
          closed = true;
        }
      };

      // 处理错误
      const handleError = (error: unknown) => {
        console.error('生成代码失败：', error);
        setMessages(prev => prev.map(msg =>
          msg.id === aiMessageId ? {...msg, messageContent: '抱歉，生成过程中出现了错误，请重试。'} : msg
        ));
        setLoading(false);
        setIsStreaming(false);
        message.error('生成失败，请重试');
      };

      // 建立SSE连接
      eventSource = new EventSource(url, {withCredentials: true});
      
      // 连接建立成功
      eventSource.onopen = () => {
        console.log('SSE 连接已建立');
        setLoading(false);
        setIsStreaming(true);
      };

      // 接收消息
      eventSource.onmessage = function (event) {
        if (streamCompleted) return;

        // 检查是否是结束消息
        if (event.data === '[DONE]') {
          if (streamCompleted) return;

          streamCompleted = true;
          closeES();
          setLoading(false);
          setIsStreaming(false);

          // 滚动到底部
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
          }, 100);

          // 更新应用信息并检查网站状态
          setTimeout(async () => {
            await getAppVoById({id: appId}).then(res => {
              setAppInfo(res.data);
            });
            checkAndShowWebsite();
          }, 1000);

          // 自动部署
          handleDeploy().then(() => {
            resolve();
          }).catch((error) => {
            console.error('自动部署失败：', error);
            message.error('自动部署失败：' + (error.message || '未知错误'));
            resolve();
          });
          return;
        }

        try {
          const parsed = JSON.parse(event.data);
          const content = parsed.d;

          if (content !== undefined && content !== null) {
            aiResponse += content;
            // 更新AI消息内容
            setMessages(prev => prev.map(msg =>
              msg.id === aiMessageId ? {...msg, messageContent: aiResponse} : msg
            ));
          }
        } catch (error) {
          console.error('解析消息失败:', error);
          handleError(error);
        }
      };

      // 业务错误事件
      eventSource.addEventListener('business-error', function (event: MessageEvent) {
        if (streamCompleted) return;

        try {
          const errorData = JSON.parse(event.data);
          console.error('SSE业务错误事件:', errorData);

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

      // 连接错误
      eventSource.onerror = function () {
        if (streamCompleted || !loading) return;
        if (eventSource?.readyState === EventSource.CONNECTING) {
          streamCompleted = true;
          closeES();
          setLoading(false);
          setIsStreaming(false);

          // 更新应用信息并检查网站状态
          setTimeout(async () => {
            await getAppVoById({id: appId}).then(res => {
              setAppInfo(res.data);
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
   * 部署应用
   * @returns Promise
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

          // 如果在协同编辑模式，发送WebSocket消息通知其他用户
          if (websocket && websocket.isActive()) {
            websocket.sendMessage({
              type: DeployActionEnum.DEPLOY_PROJECT,
              user: loginUser
            });
          }

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
   * 取消代码生成
   */
  const handleCancelGeneration = async () => {
    if (!appId) {
      message.error('应用不存在');
      return;
    }

    try {
      await cancelCodeGeneration({appId: Number(appId)});
      message.success('已取消生成');
      setLoading(false);
      setIsStreaming(false);
    } catch (error: any) {
      message.error('取消失败：' + (error.message || '未知错误'));
    }
  };

  /**
   * 切换编辑模式
   */
  const toggleEditMode = () => {
    const newMode = !isEditMode;
    setIsEditMode(newMode);
    !isEditMode ? message.info("进入编辑模式") : message.info("退出编辑模式");
  };

  /**
   * 进入协同编辑
   */
  const enterCollaborativeEdit = () => {
    if (!appId) {
      message.warning('应用不存在');
      return;
    }

    if (!websocket) {
      const ws = new AppEditWebSocket(appId);
      
      // 先注册所有事件监听器
      ws.on('open', () => {
        message.success('WebSocket连接已建立');
        // 连接成功后发送进入编辑消息
        ws.sendMessage({
          type: EditStatusEnum.ENTER_EDIT,
        });
        // 启用编辑模式
        setIsEditMode(true);
        message.success('已进入协同编辑模式');
      });

      ws.on(NotificationTypeEnum.INFO, (data: any) => {
        console.log('收到INFO消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(EditStatusEnum.ENTER_EDIT, (data: any) => {
        console.log('收到ENTER_EDIT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(EditStatusEnum.EXIT_EDIT, (data: any) => {
        console.log('收到EXIT_EDIT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(EditStatusEnum.EDIT_ACTION, (data: any) => {
        console.log('收到EDIT_ACTION消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(InteractionActionEnum.SEND_MESSAGE, (data: any) => {
        console.log('收到SEND_MESSAGE消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(InteractionActionEnum.HOVER_ELEMENT, (data: any) => {
        console.log('收到HOVER_ELEMENT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(InteractionActionEnum.SELECT_ELEMENT, (data: any) => {
        console.log('收到SELECT_ELEMENT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(InteractionActionEnum.CLEAR_ELEMENT, (data: any) => {
        console.log('收到CLEAR_ELEMENT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(DeployActionEnum.DEPLOY_PROJECT, (data: any) => {
        console.log('收到DEPLOY_PROJECT消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on(DeployActionEnum.STOP_RESPONSE, (data: any) => {
        console.log('收到STOP_RESPONSE消息:', data);
        handleWebSocketMessage(data);
      });

      ws.on('close', () => {
        message.info('WebSocket连接已关闭');
        setOnlineUsers([]);
        setCurrentEditingUser(null);
        setIsOtherUserGenerating(false);
      });

      ws.on('error', (error: any) => {
        message.error('WebSocket连接错误');
        console.error('WebSocket错误:', error);
      });

      // 最后调用connect方法，建立WebSocket连接
      ws.connect();
      setWebsocket(ws);
    }
  };

  /**
   * 退出协同编辑
   */
  const exitCollaborativeEdit = () => {
    if (websocket && websocket.isActive()) {
      websocket.sendMessage({
        type: EditStatusEnum.EXIT_EDIT,
      });
      // 禁用编辑模式
      setIsEditMode(false);
      // 延迟关闭连接，确保消息发送成功
      setTimeout(() => {
        websocket?.disconnect();
        setWebsocket(null);
        message.success('已退出协同编辑模式');
      }, 300);
    }
  };

  /**
   * 处理WebSocket消息
   */
  const handleWebSocketMessage = (data: any) => {
    if (!data) {
      return;
    }

    const userName = data.user?.userName || '未知用户';

    switch (data.type) {
      case NotificationTypeEnum.INFO:
        console.log('收到INFO消息:', data);
        if (data.onlineUsers) {
          console.log('设置在线用户列表:', data.onlineUsers);
          setOnlineUsers(data.onlineUsers);
        }
        if (data.currentEditingUser) {
          setCurrentEditingUser(data.currentEditingUser);
        }
        break;

      case EditStatusEnum.ENTER_EDIT:
        if (data.user) {
          setCurrentEditingUser(data.user);
          if (data.user.id !== loginUser?.id) {
            setIsOtherUserGenerating(true);
            setOtherGeneratingUser(data.user);
            message.info(`${userName} ${EditStatusEnum.ENTER_EDIT}`);
          }
        }
        break;

      case EditStatusEnum.EXIT_EDIT:
        if (data.user) {
          if (data.user.id === loginUser?.id) {
            setCurrentEditingUser(null);
          }
          setIsOtherUserGenerating(false);
          setOtherGeneratingUser(null);
          message.info(`${userName} 退出协同编辑`);
          // 关闭 websocket
          if (data.user.id !== loginUser?.id) {
            websocket?.disconnect();
            setWebsocket(null);
          }
          // 清除指定用户的高亮样式
          if (visualEditorRef.current && visualEditorRef.current.isIframeReady()) {
            visualEditorRef.current.clearHighlight(userName);
          }
        }
        break;

      case InteractionActionEnum.SEND_MESSAGE:
        if (data.user && data.user.id !== loginUser?.id) {
          console.log('收到其他用户消息:', data.user);
          // 添加其他用户的消息到消息列表
          const otherUserMessage: API.ChatHistoryVO = {
            id: Date.now(),
            appId: appId,
            messageType: 'user',
            messageContent: data.message || '',
            createTime: new Date().toISOString(),
            user: data.user
          };
          console.log('添加的消息:', otherUserMessage);
          setMessages(prev => [...prev, otherUserMessage]);
        }
        break;

      case InteractionActionEnum.HOVER_ELEMENT:
        if (data.user && data.user.id !== loginUser?.id) {
          // 显示被触摸元素的边框和用户名称
          if (visualEditorRef.current && data.element) {
            visualEditorRef.current.highlightElement(data.element, userName);
          }
        }
        break;

      case InteractionActionEnum.SELECT_ELEMENT:
        if (data.user && data.user.id !== loginUser?.id) {
          // 处理其他用户选择的元素
          if (data.element) {
            const elementInfo: ElementInfo = data.element;
            setSelectedElements(prev => [...prev, elementInfo]);
          }
        }
        break;

      case InteractionActionEnum.CLEAR_ELEMENT:
        if (data.user && data.user.id !== loginUser?.id) {
          // 清除其他用户清除的元素
          setSelectedElements([]);
          if (visualEditorRef.current) {
            visualEditorRef.current.clearSelection();
          }
        }
        break;

      case DeployActionEnum.DEPLOY_PROJECT:
        if (data.user && data.user.id !== loginUser?.id) {
          message.info(`${userName} ${DeployActionEnum.DEPLOY_PROJECT}`);
          // 调用部署项目方法
          handleDeploy().catch(err => {
            console.error('自动部署失败:', err);
          });
        }
        break;

      case DeployActionEnum.STOP_RESPONSE:
        if (data.user && data.user.id !== loginUser?.id) {
          message.info(`${userName} ${DeployActionEnum.STOP_RESPONSE}`);
          // 停止回复（预留）
          handleCancelGeneration();
        }
        break;

      default:
        break;
    }
  };

  /**
   * 处理来自iframe的消息
   * @param event 消息事件
   */
  const handleMessage = (event: MessageEvent) => {
    if (visualEditorRef.current) {
      visualEditorRef.current?.handleIframeMessage(event);
    }

    const { type, data } = event.data;

    // 如果在协同编辑模式，发送WebSocket消息通知其他用户
    if (websocket && websocket.isActive()) {
      switch (type) {
        case 'ELEMENT_HOVER':
          if (data.elementInfo) {
            websocket?.sendMessage({
              type: InteractionActionEnum.HOVER_ELEMENT,
              element: data.elementInfo,
              user: loginUser
            });
          }
          break;
        case 'ELEMENT_SELECTED':
          if (data.elementInfo) {
            websocket?.sendMessage({
              type: InteractionActionEnum.SELECT_ELEMENT,
              element: data.elementInfo,
              user: loginUser
            });
          }
          break;
      }
    }
  };

  /**
   * 移除选中的元素
   * @param index 元素索引
   */
  const removeSelectedElement = (index: number) => {
    setSelectedElements(prev => prev.filter((_, i) => i !== index));
    if (visualEditorRef.current) {
      visualEditorRef.current?.clearSelection();
    }
  };

  /**
   * 清除所有选中的元素
   */
  const clearAllSelectedElements = () => {
    setSelectedElements([]);
    if (visualEditorRef.current) {
      visualEditorRef.current?.clearSelection();
    }

    // 如果在协同编辑模式，发送WebSocket消息通知其他用户
    if (websocket && websocket.isActive()) {
      websocket.sendMessage({
        type: InteractionActionEnum.CLEAR_ELEMENT,
        user: loginUser
      });
    }
  };

  /**
   * 获取预览URL
   * @returns 预览URL
   */
  const getPreviewUrl = () => {
    if (!appInfo?.codeGenType || !appInfo?.id) {
      return '';
    }
    const url = getStaticPreviewUrl(
      appInfo.codeGenType,
      String(appInfo.id),
      appInfo.deployKey || undefined
    );
    return url;
  };

  // 获取代码生成类型标签
  const codeGenTypeLabel = appInfo?.codeGenType
    ? CODE_GEN_TYPE_CONFIG[appInfo.codeGenType as keyof typeof CODE_GEN_TYPE_CONFIG]?.label
    : undefined;

  return (
    <>
      <InteractiveBackground />
      <div className={styles.chatPageContainer}>
        {/* 聊天头部 */}
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
            {/* WebSocket连接状态 */}
            <Tag 
              color={websocket && websocket.isActive() ? "green" : "default"}
              icon={websocket && websocket.isActive() ? <WifiOutlined /> : <DisconnectOutlined />}
            >
              {websocket && websocket.isActive() ? "已连接" : "未连接"}
            </Tag>
            {/* 在线用户列表 */}
            <Space>
              <Tag 
                color="green" 
                icon={<TeamOutlined/>}
                onClick={() => setOnlineUsersVisible(true)}
                style={{cursor: 'pointer'}}
              >
                在线: {onlineUsers.length}
              </Tag>
              <AvatarGroup size="small" maxCount={3}>
                {onlineUsers.map((user: any) => (
                  <Avatar key={user.id} src={user.userAvatar}>{user.userName?.[0]}</Avatar>
                ))}
              </AvatarGroup>
            </Space>
          </Space>
          <Space>
            <Button type="primary" ghost loading={downloading} onClick={downloadCode}
                    style={{minWidth: 100}}>下载代码</Button>
            <Button type="primary" loading={deploying} onClick={handleDeploy} style={{minWidth: 100}}>部署应用</Button>
            <>
              {websocket ? (
                <Button
                  type="primary"
                  danger
                  icon={<TeamOutlined/>}
                  onClick={exitCollaborativeEdit}
                  style={{minWidth: 120}}
                >
                  退出协同
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<TeamOutlined/>}
                  onClick={enterCollaborativeEdit}
                  style={{minWidth: 120}}
                >
                  进入协同
                </Button>
              )}
            </>
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

        {/* 主要内容区域 */}
        <div style={{flex: 1, display: 'flex', minHeight: '800px', position: 'relative'}}>
          {/* 聊天区域 */}
          <div className={styles.chatSection}>
            <div className={styles.chatContent}>
              {/* 加载更多消息按钮 */}
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

              {/* 其他用户正在生成提示 */}
              {isOtherUserGenerating && otherGeneratingUser && (
                <div style={{display: 'flex', marginBottom: 16}}>
                  <Avatar src={otherGeneratingUser.userAvatar} size={32}>
                    {otherGeneratingUser.userName?.[0]}
                  </Avatar>
                  <Card size="small" style={{marginLeft: 8, backgroundColor: '#f0f9ff'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                      <Spin size="small"/>
                      <Text style={{fontSize: 14}}>
                        {otherGeneratingUser.userName} 正在生成代码...
                      </Text>
                    </div>
                  </Card>
                </div>
              )}

              {/* 消息列表 */}
              {messages.map(msg => {
                console.log('渲染消息:', msg);
                const isCurrentUserMessage = msg.messageType === 'user' && (!msg.user || msg.user.id === loginUser?.id);
                const userAvatar = msg.user?.userAvatar || loginUser?.userAvatar;
                const userName = msg.user?.userName || loginUser?.userName;
                
                return (
                  <div key={msg.id}
                       style={{
                         display: 'flex',
                         justifyContent: isCurrentUserMessage ? 'flex-end' : 'flex-start',
                         marginBottom: 16
                       }}>
                    <div style={{
                      maxWidth: MAX_MESSAGE_WIDTH,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 8,
                      flexDirection: isCurrentUserMessage ? 'row-reverse' : 'row'
                    }}>
                      {/* 用户头像或Logo */}
                      {msg.messageType === 'user' ? (
                        <Avatar src={userAvatar}>{userName?.[0] || 'U'}</Avatar>
                      ) : (
                        <div
                          style={{width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          <Logo size={32}/>
                        </div>
                      )}
                      {/* 消息卡片 */}
                      <Card size="small" className={msg.messageType === 'user' ? styles.userMessageCard : styles.aiMessageCard}>
                        {msg.user && msg.user.id !== loginUser?.id && (
                          <div style={{fontSize: 12, color: '#999', marginBottom: 4}}>
                            {msg.user.userName}
                          </div>
                        )}
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
                );
              })}

              {/* 加载中状态 */}
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

            {/* 聊天输入区域 */}
            <div className={styles.chatInput}>
              {/* 可视化编辑器面板 */}
              <VisualEditorPanel isEditMode={isEditMode}
                                 selectedElements={selectedElements}
                                 onToggleEditMode={toggleEditMode}
                                 onRemoveElement={removeSelectedElement}
                                 onClearAllElements={clearAllSelectedElements}></VisualEditorPanel>
              {/* 输入框和发送按钮 */}
              <Space.Compact style={{width: '100%'}}>
                <TextArea rows={2} placeholder="请输入您的问题..." value={inputValue}
                          onChange={e => setInputValue(e.target.value)}
                          onPressEnter={e => {
                            if (e.ctrlKey || e.metaKey) handleSendMessage();
                          }}/>
                {loading ? (
                  <Button type="primary" icon={<StopOutlined/>} onClick={handleCancelGeneration}>取消</Button>
                ) : (
                  <Button type="primary" icon={<SendOutlined/>} onClick={() => handleSendMessage()}>发送</Button>
                )}
              </Space.Compact>
              <div style={{fontSize: 12, color: '#999', marginTop: 8}}>提示：Ctrl+Enter 发送</div>
            </div>
          </div>

          {/* 预览区域 */}
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <Space>
                <Title level={5} style={{margin: 0}}>应用预览</Title>
              </Space>
            </div>
            <div className={styles.previewContent}>
              {showPreview && appInfo?.codeGenType && appInfo?.id ? (
                <div style={{position: 'relative', width: '100%', height: '100%'}}>
                  {/* 预览加载中 */}
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
                  {/* 应用预览iframe */}
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

        {/* 评论区域 */}
        {appInfo?.id && (
          <div className={styles.commentArea}>
            <CommentSection appId={String(appInfo.id)}/>
          </div>
        )}

        {/* 在线用户列表弹窗 */}
        <Modal
          title="在线用户"
          open={onlineUsersVisible}
          onCancel={() => setOnlineUsersVisible(false)}
          footer={null}
          width={400}
        >
          <div style={{maxHeight: 400, overflowY: 'auto'}}>
            {onlineUsers.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px 0', color: '#999'}}>
                暂无在线用户
              </div>
            ) : (
              <Space direction="vertical" style={{width: '100%'}} size="middle">
                {onlineUsers.map((user: any) => (
                  <div key={user.id} style={{display: 'flex', alignItems: 'center', padding: '8px 0'}}>
                    <Avatar size={40} src={user.userAvatar}>{user.userName?.[0]}</Avatar>
                    <div style={{marginLeft: 12, flex: 1}}>
                      <div style={{fontSize: 14, fontWeight: 500}}>{user.userName}</div>
                      <div style={{fontSize: 12, color: '#999'}}>
                        {currentEditingUser?.id === user.id ? '正在编辑' : '在线'}
                      </div>
                    </div>
                    {currentEditingUser?.id === user.id && (
                      <Tag color="blue" size="small">编辑中</Tag>
                    )}
                  </div>
                ))}
              </Space>
            )}
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ChatPage;
