/**
 * @name 代理的配置
 * @see 在生产环境 代理是无法生效的，所以这里没有生产环境的配置
 * -------------------------------
 * The agent cannot take effect in the production environment
 * so there is no configuration of the production environment
 * For details, please see
 * https://pro.ant.design/docs/deploy
 *
 * @doc https://umijs.org/docs/guides/proxy
 */
export default {
  // 如果需要自定义本地开发服务器  请取消注释按需调整
  dev: {
    // localhost:8000/api/** -> http://localhost:8123/api/**
    '/api/': {
      // 要代理的地址
      target: 'http://localhost:8123',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      // 禁用代理缓冲，确保 SSE 流式消息实时到达浏览器
      onProxyRes: function (proxyRes, req, res) {
        // 对所有响应都禁用缓冲，确保 SSE 流式消息实时到达浏览器
        proxyRes.headers['Cache-Control'] = 'no-cache, no-transform';
        proxyRes.headers['X-Accel-Buffering'] = 'no';
        proxyRes.headers['Connection'] = 'keep-alive';
        // 禁用压缩，避免压缩导致的缓冲
        delete proxyRes.headers['Content-Encoding'];
      },
      // 对于所有请求，不要缓冲响应
      selfHandleResponse: false,
      // 禁用响应缓冲
      buffer: false,
    },
    // localhost:8000/static/** -> http://localhost:8080/**
    '/static/': {
      // 要代理的地址
      target: 'http://localhost:8080',
      // 配置了这个可以从 http 代理到 https
      // 依赖 origin 的功能可能需要这个，比如 cookie
      changeOrigin: true,
      // 路径重写，去掉 /static 前缀
      pathRewrite: {
        '^/static': '',
      },
      // 设置响应头，允许跨域访问
      onProxyRes: function (proxyRes, req, res) {
        // 添加跨域响应头
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        // 禁用缓存
        proxyRes.headers['Cache-Control'] = 'no-cache, no-transform';
      },
    },
  },

  /**
   * @name 详细的代理配置
   * @doc https://github.com/chimurai/http-proxy-middleware
   */
  test: {
    // localhost:8000/api/** -> https://preview.pro.ant.design/api/**
    '/api/': {
      target: 'https://proapi.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
  pre: {
    '/api/': {
      target: 'your pre url',
      changeOrigin: true,
      pathRewrite: { '^': '' },
    },
  },
};
