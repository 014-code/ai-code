import { VisualEditor } from './VisualEditor';

/**
 * 创建一个带有可视化编辑器脚本的代理iframe
 */
export class IframeHelper {
  /**
   * 获取带有编辑器脚本的代理页面URL
   * @param originalUrl 原始URL
   * @returns 代理页面URL
   */
  static getProxyUrl(originalUrl: string): string {
    const script = new VisualEditor().generateEditScript();

    return `data:text/html,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>应用预览</title>
      </head>
      <body style="margin: 0; padding: 0;">
        <iframe
          id="preview-frame"
          src="${originalUrl}"
          style="border: none; width: 100%; height: 100vh;"
          onload="handleFrameLoad()"
        ></iframe>

        <script>
          // 消息转发：将内层iframe的消息转发到父窗口
          function handleFrameLoad() {
            const previewFrame = document.getElementById('preview-frame');

            // 监听来自内层iframe的消息
            window.addEventListener('message', function(event) {
              // 如果消息来自内层iframe，转发到父窗口
              if (event.source === previewFrame.contentWindow) {
                window.parent.postMessage(event.data, '*');
                console.log('Proxy: Forwarding message to parent:', event.data.type);
              }
            });

            // 监听来自父窗口的消息，转发到内层iframe
            window.addEventListener('message', function(event) {
              // 如果消息来自父窗口，并且是针对编辑器的消息，转发到内层iframe
              if (event.source === window.parent &&
                  event.data &&
                  ['TOGGLE_EDIT_MODE', 'CLEAR_SELECTION', 'INJECT_SCRIPT'].includes(event.data.type)) {
                previewFrame.contentWindow.postMessage(event.data, '*');
                console.log('Proxy: Forwarding message to inner frame:', event.data.type);
              }
            });

            // 延迟注入编辑器脚本到内层iframe
            setTimeout(function() {
              if (previewFrame.contentWindow) {
                previewFrame.contentWindow.postMessage({
                  type: 'INJECT_SCRIPT',
                  script: ${JSON.stringify(script)}
                }, '*');
                console.log('Proxy: Injected script to inner frame');
              }
            }, 1000);
          }
        </script>
      </body>
      </html>
    `)}`;
  }

  /**
   * 创建一个代理iframe组件，带有可视化编辑器功能
   * @param url 原始URL
   * @param onLoad 加载完成回调
   * @param otherProps 其他iframe属性
   * @returns React组件
   */
  static createProxyIframe(url: string, onLoad?: () => void, otherProps?: any) {
    const props = {
      src: this.getProxyUrl(url),
      style: { border: '1px solid #ddd', borderRadius: 4, width: '100%', flex: 1 },
      onLoad,
      ...otherProps
    };

    return props;
  }
}
