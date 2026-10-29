import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  cacheDir: path.join(os.tmpdir(), 'vite-cache-clg'),
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
})
