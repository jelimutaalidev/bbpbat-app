// project/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl'; // 1. Tambahkan import ini
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl() // 2. Tambahkan plugin ini
  ],
  // optimizeDeps removed to allow default optimization behavior for lucide-react
  server: {
    host: true,  // 3. Tambahkan ini
    https: true, // 4. Tambahkan ini
    watch: {
      ignored: ['**/bbpbat_backend_project/**', '**/venv/**'],
    },
    proxy: {
      // Pengaturan proxy Anda tetap aman di sini
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});