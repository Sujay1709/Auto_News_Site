import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // NOTE: /news and /info are now owned by the React SPA (React Router),
    // so they must NOT be proxied to Flask or direct URL loads would 502.
    proxy: {
      '/static': 'http://localhost:8080',
      '/api': 'http://localhost:8080',
      // NewsAPI rejects browser-origin requests (HTTP 426). Routing through the
      // Vite dev server makes it a server-side call, which NewsAPI accepts —
      // giving the News page real-time global headlines in development.
      '/newsapi': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/newsapi/, ''),
      },
    },
  },
})