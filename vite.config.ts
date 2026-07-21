import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    server: {
      port: 3000,

      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'https://localhost:7235',
          changeOrigin: true,
          secure: false,
        },

        '/uploads': {
          target: env.VITE_API_URL || 'https://localhost:7235',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});