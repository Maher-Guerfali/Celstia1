import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ephemeris': {
        target: 'https://ephemeris.kibo.cz/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/ephemeris/, ''),
      }
    }
  }
});
