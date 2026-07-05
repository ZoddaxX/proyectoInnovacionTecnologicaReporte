import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api/ia': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/api': 'http://localhost:3002',
    },
  },
});
