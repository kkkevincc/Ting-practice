import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages 部署路径配置
// 如果仓库名是 Ting-practice，则 base 应该是 '/Ting-practice/'
const base = process.env.GITHUB_PAGES === 'true' ? '/Ting-practice/' : '/';

export default defineConfig({
  base,
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
    outDir: 'dist',
    sourcemap: false, // 生产环境关闭sourcemap以加快构建
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // 预构建依赖
  },
});
