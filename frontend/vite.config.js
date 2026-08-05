import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // Manual chunks only for production build (avoids dev mode issues)
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons': ['react-icons/fi'],
          'charts': ['recharts'],
          'animation': ['framer-motion'],
          'toast': ['react-hot-toast'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));