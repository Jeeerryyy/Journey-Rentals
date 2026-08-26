import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@/components/ui': path.resolve(__dirname, './src/shared/ui'),
      '@/ui': path.resolve(__dirname, './src/shared/ui'),
      '@/lib': path.resolve(__dirname, './src/shared/lib'),
      '@/context': path.resolve(__dirname, './src/shared/context'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@website': path.resolve(__dirname, './src/website'),
      '@crm': path.resolve(__dirname, './src/crm'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@': path.resolve(__dirname, './src'),
    },
  },
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
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    minify: 'esbuild',
    target: 'es2020',
  },
})