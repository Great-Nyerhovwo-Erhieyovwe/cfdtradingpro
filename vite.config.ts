import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // IMPORTANT for React Router in production
  base: '/',

  // Dev server (local only)
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Production build settings
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,

    rollupOptions: {
      output: {
        // SAFE production chunking (fixes blank page issues)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },
});