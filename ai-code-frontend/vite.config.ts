import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[local]_[hash:base64:5]',
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          '@root-entry-name': 'variable',
        },
      },
    },
  },
  server: {
     // 强制禁用缓存
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    port: 8000,
    proxy: {
      '/api/': {
        target: 'http://localhost:8123',
        changeOrigin: true,
      },
      '/deploy/': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deploy/, ''),
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: isDev,
  },
})
