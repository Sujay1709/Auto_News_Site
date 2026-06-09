import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// AutoHub is a pure Vite/React single-page app — there is no backend server.
// `npm run dev` serves the whole application on http://localhost:5175.
export default defineConfig(({ mode }) => {
  // Load .env so the dev News proxy can inject GNEWS_API_KEY server-side
  // (the '' prefix loads all vars, not just VITE_-prefixed ones).
  const env = loadEnv(mode, process.cwd(), '')
  const gnewsKey = env.GNEWS_API_KEY || ''

  return {
    plugins: [react()],
    server: {
      port: 5175,
      strictPort: true,
      proxy: {
        // Live automotive news. The browser calls /newsproxy/... and this dev
        // proxy forwards to GNews.io with the API key appended, so the key
        // never reaches the client. In production an nginx /newsproxy block
        // does the same thing (see nginx.conf). If absent, the News page
        // falls back to cached headlines (see src/data/newsFeed.js).
        '/newsproxy': {
          target: 'https://gnews.io',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => {
            const rest = path.replace(/^\/newsproxy/, '')
            const sep = rest.includes('?') ? '&' : '?'
            return `${rest}${sep}apikey=${gnewsKey}`
          },
        },
        '/agent': {
          // Routes the SPA's agent calls to the local ADK service during
          // `npm run dev`. In production set VITE_AGENT_URL to the deployed
          // agent URL instead (this proxy is absent in a static build, and the
          // chat falls back to the local engine if the agent is unreachable).
          target: 'http://localhost:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/agent/, ''),
        },
      },
    },
  }
})
