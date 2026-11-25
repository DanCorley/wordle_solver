import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // The word lists live in ../data so they can be shared outside the web app.
  server: { fs: { allow: ['..'] } },
  test: { environment: 'jsdom' },
})
