import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  base: process.env.VITE_BASE_PATH || '/',
  build: {
    assetsDir: 'assets',
    outDir: 'dist'
  }
});