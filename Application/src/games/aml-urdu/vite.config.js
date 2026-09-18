import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    open: true,
    watch: { ignored: ['**/dist/**', '**/node_modules/**'] }
  },
  preview: { port: 4173 }
});
