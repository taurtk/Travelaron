import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api/proxy': {
        target: 'http://ec2-13-223-49-221.compute-1.amazonaws.com:8080/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/proxy/, ''),
      },
    }
  }
})
