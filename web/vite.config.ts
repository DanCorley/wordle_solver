import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // The word lists live in ../data so they can be shared outside the web app.
  // Daily mode goes through the same path as the nginx proxy in production.
  server: {
    fs: { allow: ['..'] },
    proxy: {
      '/api/wordle': {
        target: 'https://www.nytimes.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/wordle/, '/svc/wordle/v2'),
      },
    },
  },
  test: { environment: 'jsdom' },
})
