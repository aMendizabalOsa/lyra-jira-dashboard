import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Versión del dashboard: la del package.json raíz (la misma que empaqueta el .exe).
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
