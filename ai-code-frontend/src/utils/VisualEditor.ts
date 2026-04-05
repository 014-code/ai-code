/**
 * 元素信息接口 - 定义可视化编辑器中选中元素的详细信息
 */
export interface ElementInfo {
  tagName: string;        // 元素标签名
  id: string;             // 元素ID
  className: string;      // 元素类名
  textContent: string;    // 元素文本内容（截断）
  selector: string;       // 元素选择器路径
  pagePath: string;       // 页面路径（查询参数和哈希）
  rect: {                 // 元素边界矩形
    top: number;          // 顶部位置
    left: number;         // 左侧位置
    width: number;        // 宽度
    height: number;       // 高度
  };
}

/**
 * 可视化编辑器选项接口 - 定义编辑器的回调函数
 */
export interface VisualEditorOptions {
  onElementSelected?: (elementInfo: ElementInfo) => void;  // 元素选中回调
  onElementHover?: (elementInfo: ElementInfo) => void;      // 元素悬停回调
}

/**
 * 可视化编辑器类 - 用于在iframe中实现可视化编辑功能
 * 支持元素选择、悬停效果和编辑模式切换
 */
export class VisualEditor {
  private iframe: HTMLIFrameElement | null = null;  // iframe元素引用
  private isEditMode = false;                       // 编辑模式状态
  private options: VisualEditorOptions;             // 编辑器选项

  /**
   * 构造函数
   * @param options 编辑器配置选项
   */
  constructor(options: VisualEditorOptions = {}) {
    this.options = options;
  }

  /**
   * 初始化编辑器
   * @param iframe 目标iframe元素
   */
  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }

  /**
   * 启用编辑模式
   * 注入编辑脚本并开启编辑功能
   */
  enableEditMode() {
    if (!this.iframe) {
      return;
    }
    this.isEditMode = true;
    // 增加延迟，确保iframe已完全加载
    setTimeout(() => {
      this.injectEditScript();
    }, 1000);
  }

  /**
   * 禁用编辑模式
   * 关闭编辑功能并清除所有编辑效果
   */
  disableEditMode() {
    this.isEditMode = false;
    if (!this.iframe?.contentWindow) {
      return;
    }
    // 发送消息通知iframe关闭编辑模式
    this.sendMessageToIframe({
      type: 'TOGGLE_EDIT_MODE',
      editMode: false,
    });
    // 清除所有编辑效果
    this.sendMessageToIframe({
      type: 'CLEAR_ALL_EFFECTS',
    });
  }

  /**
   * 切换编辑模式
   * @returns 当前编辑模式状态
   */
  toggleEditMode() {
    if (this.isEditMode) {
      this.disableEditMode();
    } else {
      this.enableEditMode();
    }
    return this.isEditMode;
  }

  /**
   * 同步编辑器状态
   * 确保iframe中的编辑效果与当前状态一致
   */
  syncState() {
    if (!this.isEditMode) {
      // 如果不是编辑模式，清除所有效果
      this.sendMessageToIframe({
        type: 'CLEAR_ALL_EFFECTS',
      });
    }
  }

  /**
   * 清除选择状态
   * 移除所有元素的选中效果
   */
  clearSelection() {
    this.sendMessageToIframe({
      type: 'CLEAR_SELECTION',
    });
  }

  /**
   * 高亮显示元素（用于协同编辑）
   * @param elementInfo 元素信息
   * @param userName 操作用户名称
   */
  highlightElement(elementInfo: ElementInfo, userName: string) {
    // 先清除之前的高亮效果
    this.clearHighlight();
    // 再显示新的高亮
    this.sendMessageToIframe({
      type: 'HIGHLIGHT_ELEMENT',
      elementInfo,
      userName
    });
  }

  /**
   * 清除高亮效果
   */
  clearHighlight() {
    this.sendMessageToIframe({
      type: 'CLEAR_HIGHLIGHT',
    });
  }

  /**
   * 处理iframe加载完成事件
   * 根据当前编辑模式状态执行相应操作
   */
  onIframeLoad() {
    // 只有在编辑模式下才注入脚本
    if (this.isEditMode) {
      // 增加延迟，确保iframe完全加载
      setTimeout(() => {
        this.injectEditScript();
      }, 1000);
    }
  }

  /**
   * 处理来自iframe的消息
   * @param event 消息事件对象
   */
  handleIframeMessage(event: MessageEvent) {
    const { type, data } = event.data;
    switch (type) {
      case 'ELEMENT_SELECTED':
        // 处理元素选中事件
        if (this.options.onElementSelected && data.elementInfo) {
          this.options.onElementSelected(data.elementInfo);
        }
        break;
      case 'ELEMENT_HOVER':
        // 处理元素悬停事件
        if (this.options.onElementHover && data.elementInfo) {
          this.options.onElementHover();
        }
        break;
    }
  }

  /**
   * 向iframe发送消息
   * @param message 消息内容
   */
  private sendMessageToIframe(message: Record<string, any>) {
    if (this.iframe?.contentWindow) {
      this.iframe.contentWindow.postMessage(message, '*');
    }
  }

  /**
   * 注入编辑脚本到iframe中
   * 等待iframe加载完成后执行注入
   */
  private injectEditScript() {
    if (!this.iframe) {
      return;
    }

    // 等待iframe加载完成的递归函数
    const waitForIframeLoad = () => {
      try {
        if (this.iframe!.contentWindow && this.iframe!.contentDocument) {
          // 移除已存在的脚本
          const existingScript = this.iframe!.contentDocument.getElementById('visual-edit-script');
          if (existingScript) {
            existingScript.remove();
          }

          // 生成编辑脚本并注入
          const script = this.generateEditScript();
          const scriptElement = this.iframe!.contentDocument.createElement('script');
          scriptElement.id = 'visual-edit-script';
          scriptElement.textContent = script;
          this.iframe!.contentDocument.head.appendChild(scriptElement);
        } else {
          // iframe未加载完成，继续等待
          setTimeout(waitForIframeLoad, 100);
        }
      } catch (error) {
        console.error('[VisualEditor] 注入脚本出错:', error);
      }
    };

    waitForIframeLoad();
  }

  /**
   * 生成编辑脚本
   * 包含样式注入、事件监听和消息处理逻辑
   * @returns 编辑脚本字符串
   */
  private generateEditScript() {
    return `
      (function() {
        let isEditMode = true;          // 编辑模式状态
        let currentHoverElement = null;  // 当前悬停元素
        let currentSelectedElement = null; // 当前选中元素

        /**
         * 注入编辑模式所需的样式
         */
        function injectStyles() {
          if (document.getElementById('edit-mode-styles')) return;
          const style = document.createElement('style');
          style.id = 'edit-mode-styles';
          style.textContent = \`
            .edit-hover {
              outline: 2px dashed #1890ff !important;
              outline-offset: 2px !important;
              cursor: crosshair !important;
              transition: outline 0.2s ease !important;
              position: relative !important;
            }
            .edit-hover::before {
              content: '' !important;
              position: absolute !important;
              top: -4px !important;
              left: -4px !important;
              right: -4px !important;
              bottom: -4px !important;
              background: rgba(24, 144, 255, 0.02) !important;
              pointer-events: none !important;
              z-index: -1 !important;
            }
            .edit-selected {
              outline: 3px solid #52c41a !important;
              outline-offset: 2px !important;
              cursor: default !important;
              position: relative !important;
            }
            .edit-selected::before {
              content: '' !important;
              position: absolute !important;
              top: -4px !important;
              left: -4px !important;
              right: -4px !important;
              bottom: -4px !important;
              background: rgba(82, 196, 26, 0.03) !important;
              pointer-events: none !important;
              z-index: -1 !important;
            }
            .edit-highlight {
              outline: 3px solid #ff7a45 !important;
              outline-offset: 2px !important;
              position: relative !important;
            }
            .edit-highlight::before {
              content: attr(data-highlight-user) !important;
              position: absolute !important;
              top: -28px !important;
              left: -2px !important;
              background: #ff7a45 !important;
              color: white !important;
              padding: 4px 8px !important;
              border-radius: 4px !important;
              font-size: 12px !important;
              font-weight: bold !important;
              white-space: nowrap !important;
              z-index: 10000 !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
            }
          \`;
          document.head.appendChild(style);
        }

        /**
         * 生成元素的选择器路径
         * @param element 目标元素
         * @returns 选择器路径字符串
         */
        function generateSelector(element) {
          const path = [];
          let current = element;
          while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();
            // 如果有ID，直接使用ID选择器
            if (current.id) {
              selector += '#' + current.id;
              path.unshift(selector);
              break;
            }
            // 添加类名选择器
            if (current.className) {
              const classes = current.className.split(' ').filter(c => c && !c.startsWith('edit-'));
              if (classes.length > 0) {
                selector += '.' + classes.join('.');
              }
            }
            // 添加nth-child选择器确保唯一性
            const siblings = Array.from(current.parentElement?.children || []);
            const index = siblings.indexOf(current) + 1;
            selector += ':nth-child(' + index + ')';
            path.unshift(selector);
            current = current.parentElement;
          }
          return path.join(' > ');
        }

        /**
         * 获取元素的详细信息
         * @param element 目标元素
         * @returns 元素信息对象
         */
        function getElementInfo(element) {
          const rect = element.getBoundingClientRect();
          let pagePath = window.location.search + window.location.hash;
          if (!pagePath) {
            pagePath = '';
          }

          return {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            textContent: element.textContent?.trim().substring(0, 100) || '',
            selector: generateSelector(element),
            pagePath: pagePath,
            rect: {
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height
            }
          };
        }

        /**
         * 清除悬停效果
         */
        function clearHoverEffect() {
          if (currentHoverElement) {
            currentHoverElement.classList.remove('edit-hover');
            currentHoverElement = null;
          }
        }

        /**
         * 清除选中效果
         */
        function clearSelectedEffect() {
          const selected = document.querySelectorAll('.edit-selected');
          selected.forEach(el => el.classList.remove('edit-selected'));
          currentSelectedElement = null;
        }

        let eventListenersAdded = false;

        /**
         * 添加事件监听器
         */
        function addEventListeners() {
           if (eventListenersAdded) return;

           // 鼠标悬停处理
           const mouseoverHandler = (event) => {
             if (!isEditMode) return;
             injectStyles();
             const target = event.target;
             if (target === currentHoverElement || target === currentSelectedElement) return;
             if (target === document.body || target === document.documentElement) return;
             if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

             clearHoverEffect();
           target.classList.add('edit-hover');
           currentHoverElement = target;

           // 获取元素信息并发送给父窗口
           const elementInfo = getElementInfo(target);
           try {
               window.parent.postMessage({
                 type: 'ELEMENT_HOVER',
                 data: { elementInfo }
               }, '*');
             } catch {
             }
           };

           // 鼠标离开处理
           const mouseoutHandler = (event) => {
             if (!isEditMode) return;

             const target = event.target;
             if (!event.relatedTarget || !target.contains(event.relatedTarget)) {
               clearHoverEffect();
             }
           };

           // 点击选择处理
           const clickHandler = (event) => {
             if (!isEditMode) return;

             event.preventDefault();
             event.stopPropagation();

             const target = event.target;
             if (target === document.body || target === document.documentElement) return;
             if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

             clearSelectedEffect();
             clearHoverEffect();

             target.classList.add('edit-selected');
             currentSelectedElement = target;

             // 获取元素信息并发送给父窗口
             const elementInfo = getElementInfo(target);
             try {
               window.parent.postMessage({
                 type: 'ELEMENT_SELECTED',
                 data: { elementInfo }
               }, '*');
             } catch {
             }
           };

           // 添加事件监听器
           document.body.addEventListener('mouseover', mouseoverHandler, true);
           document.body.addEventListener('mouseout', mouseoutHandler, true);
           document.body.addEventListener('click', clickHandler, true);
           eventListenersAdded = true;
         }

         /**
          * 设置事件监听器
          */
         function setupEventListeners() {
           addEventListeners();
         }

         /**
         * 处理来自父窗口的消息
         */
         window.addEventListener('message', (event) => {
           const { type, editMode } = event.data;
           switch (type) {
             case 'TOGGLE_EDIT_MODE':
               isEditMode = editMode;
               if (isEditMode) {
                 injectStyles();
                 showEditTip();
               } else {
                 clearHoverEffect();
                 clearSelectedEffect();
               }
               break;
             case 'CLEAR_SELECTION':
               clearSelectedEffect();
               break;
             case 'CLEAR_ALL_EFFECTS':
               isEditMode = false;
               clearHoverEffect();
               clearSelectedEffect();
               const tip = document.getElementById('edit-tip');
               if (tip) tip.remove();
               break;
             case 'HIGHLIGHT_ELEMENT':
               if (event.data.elementInfo) {
                 injectStyles();
                 highlightElement(event.data.elementInfo, event.data.userName);
               }
               break;
              case 'CLEAR_HIGHLIGHT':
                clearHighlightEffect();
                break;
              default:
                break;
            }
          });

         /**
          * 高亮显示元素（用于协同编辑）
          * @param elementInfo 元素信息
          * @param userName 操作用户名称
          */
         function highlightElement(elementInfo, userName) {
           // 先清除之前的高亮效果
           clearHighlightEffect();
           // 再显示新的高亮
           const element = document.querySelector(elementInfo.selector);
           if (element) {
             element.classList.add('edit-highlight');
             element.setAttribute('data-highlight-user', userName);
           }
         }

         /**
          * 清除高亮效果
          */
         function clearHighlightEffect() {
           const highlighted = document.querySelectorAll('.edit-highlight');
           highlighted.forEach(el => {
             el.classList.remove('edit-highlight');
             el.removeAttribute('data-highlight-user');
           });
         }

         /**
          * 显示编辑模式提示
          */
         function showEditTip() {
           if (document.getElementById('edit-tip')) return;
           const tip = document.createElement('div');
           tip.id = 'edit-tip';
           tip.innerHTML = '🎯 编辑模式已开启<br/>悬浮查看元素，点击选中元素';
           tip.style.cssText = \`
             position: fixed;
             top: 20px;
             right: 20px;
             background: #1890ff;
             color: white;
             padding: 12px 16px;
             border-radius: 6px;
             font-size: 14px;
             z-index: 9999;
             box-shadow: 0 4px 12px rgba(0,0,0,0.15);
             animation: fadeIn 0.3s ease;
           \`;
           const style = document.createElement('style');
           style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';
           document.head.appendChild(style);
           document.body.appendChild(tip);
           // 3秒后自动隐藏提示
           setTimeout(() => {
             if (tip.parentNode) {
               tip.style.animation = 'fadeIn 0.3s ease reverse';
               setTimeout(() => tip.remove(), 300);
             }
           }, 3000);
         }

         // 初始化
         injectStyles();         // 注入样式
         setupEventListeners();  // 设置事件监听器
         showEditTip();          // 显示编辑提示
      })();
    `;
  }
}
