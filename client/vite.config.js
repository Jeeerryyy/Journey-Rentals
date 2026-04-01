import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        // Split large third-party libs into separate cacheable chunks
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          swiper: ['swiper'],
        },
      },
    },
    // OPTIMIZATION: Drop all console statements from the production build
    minify: 'esbuild',
    target: 'es2020',
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
})