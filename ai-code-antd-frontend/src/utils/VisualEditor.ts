// VisualEditor.ts
import {message} from "antd";

export interface ElementInfo {
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  selector: string;
  pagePath: string;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  styles?: {
    display: string;
    position: string;
  };
}

export interface VisualEditorOptions {
  onElementSelected?: (elementInfo: ElementInfo) => void;
  onElementHover?: (elementInfo: ElementInfo) => void;
  onEditorReady?: () => void;
}

export class VisualEditor {
  private iframe: HTMLIFrameElement | null = null;
  private isEditMode = false;
  private options: VisualEditorOptions;
  private messageListener: ((event: MessageEvent) => void) | null = null;
  private isInitialized = false;

  constructor(options: VisualEditorOptions = {}) {
    this.options = options;
  }

  /**
   * 初始化编辑器
   */
  init(iframe: HTMLIFrameElement) {
    if (this.isInitialized) {
      console.warn('VisualEditor: Already initialized');
      return;
    }

    this.iframe = iframe;
    this.isInitialized = true;
    this.setupMessageListener();

    console.log('VisualEditor: Initialized with iframe');
  }

  /**
   * 启用编辑模式
   */
  enableEditMode() {
    if (!this.iframe) {
      console.error('VisualEditor: Iframe not initialized');
      return;
    }

    this.isEditMode = true;
    console.log('VisualEditor: Enabling edit mode');

    //父页面发送消息给iframe方法
    this.sendMessageToIframe({
      type: 'TOGGLE_EDIT_MODE',
      editMode: true
    });

    // 如果iframe已经加载，确保脚本已注入
    if (this.iframe.contentDocument && this.iframe.contentWindow) {
      setTimeout(() => {
        this.injectEditScript();
      }, 100);
    }
  }

  /**
   * 禁用编辑模式
   */
  disableEditMode() {
    this.isEditMode = false;
    console.log('VisualEditor: Disabling edit mode');

    this.sendMessageToIframe({
      type: 'TOGGLE_EDIT_MODE',
      editMode: false
    });
  }

  /**
   * 切换编辑模式
   */
  toggleEditMode(): boolean {
    if (this.isEditMode) {
      this.disableEditMode();
    } else {
      this.enableEditMode();
    }
    return this.isEditMode;
  }

  /**
   * 清除选中状态
   */
  clearSelection() {
    console.log('VisualEditor: Clearing selection');
    this.sendMessageToIframe({
      type: 'CLEAR_SELECTION'
    });
  }

  /**
   * 处理iframe加载完成
   */
  onIframeLoad() {
    console.log('VisualEditor: Iframe loaded');

    if (!this.iframe) {
      console.warn('VisualEditor: Iframe reference is null during onIframeLoad');
      return;
    }

    // 延迟注入脚本，确保iframe内容完全加载
    setTimeout(() => {
      console.log('VisualEditor: Delayed script injection starting');

      // 直接注入脚本，由于跨域限制，主要依靠postMessage方式
      this.injectEditScript();

      // 如果当前处于编辑模式，重新启用
      if (this.isEditMode) {
        setTimeout(() => {
          this.enableEditMode();
        }, 1000);
      }
    }, 500);
  }

  /**
   * 处理来自iframe的消息
   */
  handleIframeMessage(event: MessageEvent) {
    // 安全检查：确保消息来自iframe
    if (event.source !== this.iframe?.contentWindow) {
      return;
    }

    const {type, data} = event.data || {};
    if (!type) return;

    console.log('VisualEditor: iframe的内容:', type, data);

    switch (type) {
      case 'VISUAL_EDITOR_READY':
        console.log('VisualEditor: Editor is ready in iframe');
        this.options.onEditorReady?.();
        // 如果应该处于编辑模式，确保启用
        if (this.isEditMode) {
          setTimeout(() => {
            this.enableEditMode();
          }, 100);
        }
        break;
      //   todo 在对话页出现奇怪的类型？？？！
      case 'iframe-click':
        if (this.options.onElementSelected && data?.elementInfo) {
          console.log('VisualEditor: 元素被选中', data.elementInfo);
          this.options.onElementSelected(data.elementInfo);
        }
        break;
      //   todo 在对话页出现奇怪的类型？？？！
      case 'get-iframe-pos':
        if (this.options.onElementSelected && data?.elementInfo) {
          console.log('VisualEditor: 元素被选中', data.elementInfo);
          this.options.onElementSelected(data.elementInfo);
        }
        break;
      case 'ELEMENT_SELECTED':
        if (this.options.onElementSelected && data?.elementInfo) {
          console.log('VisualEditor: 元素被选中', data.elementInfo);
          this.options.onElementSelected(data.elementInfo);
        }
        break;

      case 'ELEMENT_HOVER':
        if (this.options.onElementHover && data?.elementInfo) {
          console.log('VisualEditor: 元素被触摸', data.elementInfo)
          this.options.onElementHover(data.elementInfo);
        }
        break;
      case 'EDITOR_ERROR':
        console.error('VisualEditor: 元素出现错误:', data);
        break;
      default:
        console.log('VisualEditor: 未定义的事件类型:', type);
    }
  }


  /**
   * 销毁编辑器，清理资源
   */
  destroy() {
    this.disableEditMode();

    if (this.messageListener) {
      window.removeEventListener('message', this.messageListener);
      this.messageListener = null;
    }

    this.iframe = null;
    this.isInitialized = false;
    console.log('VisualEditor: Destroyed');
  }

  /**
   * 向iframe发送消息
   */
  private sendMessageToIframe(message: Record<string, any>) {
    if (!this.iframe?.contentWindow) {
      console.warn('VisualEditor: 父页面没法发送消息给iframe');
      return;
    }

    try {
      this.iframe.contentWindow.postMessage(message, '*');
      console.log('VisualEditor: 发送给iframe的内容:', message.type);
    } catch (error) {
      console.error('VisualEditor: Failed to send message to iframe:', error);
    }
  }

  /**
   * 设置消息监听器
   */
  private setupMessageListener() {
    if (this.messageListener) {
      return;
    }

    this.messageListener = (event: MessageEvent) => {
      this.handleIframeMessage(event);
    };

    window.addEventListener('message', this.messageListener);
    console.log('VisualEditor: Message listener setup');
  }

  /**
   * 注入编辑器脚本到iframe
   */
  private injectEditScript() {
    console.log('VisualEditor: Attempting to inject edit script');

    if (!this.iframe) {
      console.warn('VisualEditor: Iframe reference is null');
      return;
    }

    // 直接使用postMessage方式，不再尝试直接DOM访问
    this.injectViaPostMessage();
  }

  /**
   * 通过postMessage注入脚本
   */
  private injectViaPostMessage() {
    console.log('VisualEditor: Injecting script via postMessage');
    this.sendMessageToIframe({
      type: 'INJECT_SCRIPT',
      script: this.generateEditScript()
    });
  }

  /**
   * 注入CSS样式到iframe
   */
  private injectStyles() {
    if (!this.iframe?.contentDocument) {
      return;
    }

    try {
      if (this.iframe.contentDocument.getElementById('visual-editor-styles')) {
        return;
      }

      const style = this.iframe.contentDocument.createElement('style');
      style.id = 'visual-editor-styles';
      style.textContent = `
        .edit-hover {
          outline: 2px dashed #1890ff !important;
          outline-offset: 2px !important;
          cursor: crosshair !important;
          background-color: rgba(24, 144, 255, 0.1) !important;
          transition: all 0.2s ease !important;
        }
        .edit-selected {
          outline: 3px solid #52c41a !important;
          outline-offset: 2px !important;
          cursor: default !important;
          background-color: rgba(82, 196, 26, 0.1) !important;
          transition: all 0.2s ease !important;
        }
        .visual-edit-mode body {
          cursor: crosshair !important;
        }
        .visual-edit-mode * {
          pointer-events: auto !important;
        }
      `;
      this.iframe.contentDocument.head.appendChild(style);
      console.log('VisualEditor: Styles injected successfully');
    } catch (error) {
      console.error('VisualEditor: Failed to inject styles', error);
    }
  }

  /**
   * 生成编辑器脚本
   */
  private generateEditScript(): string {
    return `
      (function() {
        'use strict';

        console.log('VisualEditor: Starting script execution in iframe...');

        // 防止重复初始化
        if (window.__visualEditorInitialized) {
          console.log('VisualEditor: Already initialized in this iframe');
          return;
        }
        window.__visualEditorInitialized = true;

        let isEditMode = false;
        let currentHoverElement = null;
        let currentSelectedElement = null;
        let eventListenersAdded = false;

        // 主初始化函数
        function initializeVisualEditor() {
          console.log('VisualEditor: Initializing in iframe...');

          try {
            // 注入样式
            injectStyles();

            // 设置消息监听
            setupMessageListener();

            // 等待DOM完全加载
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', onDomReady);
            } else {
              setTimeout(onDomReady, 100);
            }

          } catch (error) {
            console.error('VisualEditor: Initialization error:', error);
            notifyParent('EDITOR_ERROR', { error: error.message });
          }
        }

        function onDomReady() {
          console.log('VisualEditor: DOM is ready');
          notifyParent('VISUAL_EDITOR_READY', { ready: true, timestamp: Date.now() });
        }

        function injectStyles() {
          if (document.getElementById('visual-editor-dynamic-styles')) {
            return;
          }

          const style = document.createElement('style');
          style.id = 'visual-editor-dynamic-styles';
          style.textContent = \`
            .edit-hover {
              outline: 2px dashed #1890ff !important;
              outline-offset: 2px !important;
              cursor: crosshair !important;
              background-color: rgba(24, 144, 255, 0.1) !important;
              transition: all 0.2s ease !important;
              z-index: 10000 !important;
              position: relative !important;
            }
            .edit-selected {
              outline: 3px solid #52c41a !important;
              outline-offset: 2px !important;
              cursor: default !important;
              background-color: rgba(82, 196, 26, 0.1) !important;
              transition: all 0.2s ease !important;
              z-index: 10000 !important;
              position: relative !important;
            }
            .visual-edit-mode {
              cursor: crosshair !important;
            }
            .visual-edit-mode * {
              pointer-events: auto !important;
            }
          \`;
          document.head.appendChild(style);
          console.log('VisualEditor: Dynamic styles injected');
        }

        function generateSelector(element) {
          if (!element || element.nodeType !== 1) return '';

          const path = [];
          let current = element;
          let depth = 0;
          const maxDepth = 10;

          while (current && current !== document.body && depth < maxDepth) {
            let selector = current.tagName.toLowerCase();

            // 优先使用ID
            if (current.id) {
              selector += '#' + current.id;
              path.unshift(selector);
              break;
            }

            // 使用类名
            if (current.className && typeof current.className === 'string') {
              const classes = current.className.split(' ')
                .filter(c => c && c.trim() && !c.includes('edit-'))
                .slice(0, 2);
              if (classes.length > 0) {
                selector += '.' + classes.join('.');
              }
            }

            // 添加子元素索引
            if (current.parentElement) {
              const siblings = Array.from(current.parentElement.children)
                .filter(child => child.tagName === current.tagName);
              const index = siblings.indexOf(current) + 1;
              if (index > 0 && siblings.length > 1) {
                selector += ':nth-of-type(' + index + ')';
              }
            }

            path.unshift(selector);
            current = current.parentElement;
            depth++;
          }

          return path.join(' > ');
        }

        function getElementInfo(element) {
          if (!element) return null;

          try {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            return {
              tagName: element.tagName,
              id: element.id || '',
              className: element.className || '',
              textContent: (element.textContent || '').trim().substring(0, 200),
              selector: generateSelector(element),
              pagePath: window.location.pathname + window.location.search + window.location.hash,
              rect: {
                top: Math.round(rect.top + window.scrollY),
                left: Math.round(rect.left + window.scrollX),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              styles: {
                display: computedStyle.display,
                position: computedStyle.position,
                visibility: computedStyle.visibility
              }
            };
          } catch (error) {
            console.error('VisualEditor: Error getting element info:', error);
            return null;
          }
        }

        function clearHoverEffect() {
          if (currentHoverElement) {
            currentHoverElement.classList.remove('edit-hover');
            currentHoverElement = null;
          }
        }

        function clearSelection() {
          const selected = document.querySelectorAll('.edit-selected');
          selected.forEach(el => {
            el.classList.remove('edit-selected');
          });
          currentSelectedElement = null;
        }

        function addEventListeners() {
          if (eventListenersAdded) return;

          console.log('VisualEditor: Adding event listeners');

          document.addEventListener('mouseover', handleMouseOver, true);
          document.addEventListener('mouseout', handleMouseOut, true);
          document.addEventListener('click', handleClick, true);
          document.addEventListener('scroll', handleScroll, true);

          eventListenersAdded = true;
        }

        function removeEventListeners() {
          if (!eventListenersAdded) return;

          console.log('VisualEditor: Removing event listeners');

          document.removeEventListener('mouseover', handleMouseOver, true);
          document.removeEventListener('mouseout', handleMouseOut, true);
          document.removeEventListener('click', handleClick, true);
          document.removeEventListener('scroll', handleScroll, true);

          eventListenersAdded = false;
        }

        function handleMouseOver(event) {
          if (!isEditMode) return;

          const target = event.target;
          if (!target || target === currentHoverElement) return;
          if (target === document.documentElement || target === document.body) return;
          if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE' || target.tagName === 'LINK') return;
          if (target.classList.contains('edit-hover') || target.classList.contains('edit-selected')) return;

          clearHoverEffect();

          try {
            target.classList.add('edit-hover');
            currentHoverElement = target;

            const elementInfo = getElementInfo(target);
            if (elementInfo) {
              notifyParent('ELEMENT_HOVER', { elementInfo });
            }
          } catch (error) {
            console.error('VisualEditor: Mouseover error:', error);
          }
        }

        function handleMouseOut(event) {
          if (!isEditMode) return;
          clearHoverEffect();
        }

        function handleClick(event) {
          if (!isEditMode) return;

          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();

          const target = event.target;
          if (!target || target === document.documentElement || target === document.body) return;
          if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

          clearSelection();
          clearHoverEffect();

          try {
            target.classList.add('edit-selected');
            currentSelectedElement = target;

            const elementInfo = getElementInfo(target);
            if (elementInfo) {
              console.log('VisualEditor: Element selected in iframe', elementInfo);
              notifyParent('ELEMENT_SELECTED', { elementInfo });
            }
          } catch (error) {
            console.error('VisualEditor: Click error:', error);
          }

          return false;
        }

        function handleScroll() {
          clearHoverEffect();
        }

        function setupMessageListener() {
          window.addEventListener('message', function(event) {
            const { type, editMode, script } = event.data || {};

            console.log('VisualEditor: Received message in iframe:', type);

            switch (type) {
              case 'TOGGLE_EDIT_MODE':
                console.log('VisualEditor: Toggle edit mode to', editMode);
                isEditMode = editMode;

                if (isEditMode) {
                  document.documentElement.classList.add('visual-edit-mode');
                  addEventListeners();
                } else {
                  document.documentElement.classList.remove('visual-edit-mode');
                  removeEventListeners();
                  clearHoverEffect();
                  clearSelection();
                }
                break;

              case 'CLEAR_SELECTION':
                clearSelection();
                break;

              case 'INJECT_SCRIPT':
                if (script) {
                  try {
                    // 动态执行脚本
                    eval(script);
                  } catch (error) {
                    console.error('VisualEditor: Script evaluation error:', error);
                  }
                }
                break;
            }
          });
        }

        function notifyParent(type, data) {
          try {
            window.parent.postMessage({
              type: type,
              data: data
            }, '*');
          } catch (error) {
            console.error('VisualEditor: Failed to notify parent:', error);
          }
        }

        // 开始初始化
        initializeVisualEditor();

      })();
    `;
  }
}
