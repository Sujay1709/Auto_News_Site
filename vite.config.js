import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cars': 'http://localhost:8080',
      '/news': 'http://localhost:8080',
      '/info': 'http://localhost:8080',
      '/static': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
    },
  },
})