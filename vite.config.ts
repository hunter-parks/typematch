import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fontsHandler from './api/fonts.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), {
    name: 'google-fonts-catalog',
    configureServer(server) { server.middlewares.use('/api/fonts', (req, res) => { void fontsHandler(req, res) }) },
    configurePreviewServer(server) { server.middlewares.use('/api/fonts', (req, res) => { void fontsHandler(req, res) }) },
  }],
  base: './',
  build: { assetsInlineLimit: 0 },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
