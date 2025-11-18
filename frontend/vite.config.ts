import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: true, // 显示错误覆盖层
      clientPort: 3000, // HMR客户端端口
    },
    watch: {
      usePolling: false, // 在macOS上通常不需要轮询
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true, // 支持WebSocket，用于HMR
      },
      '/audio': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    sourcemap: false, // 生产环境关闭sourcemap以加快构建
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // 预构建依赖
  },
});
