import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// AutoHub is a pure Vite/React single-page app — there is no backend server.
// `npm run dev` serves the whole application on http://localhost:5175.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      // NewsAPI rejects browser-origin requests (HTTP 426). Routing through the
      // Vite dev server makes it a server-side call, which NewsAPI accepts —
      // giving the News page real-time global headlines during development.
      // This proxy only exists in `npm run dev`; in a deployed static build it
      // is absent and the News page falls back to cached headlines
      // (see the FALLBACK list in src/pages/News.jsx).
      '/newsapi': {
        target: 'https://newsapi.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/newsapi/, ''),
      },
    },
  },
})
