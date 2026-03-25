import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import os from 'os'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  cacheDir: path.join(os.tmpdir(), 'vite-cache-clg'),
  server: {
    port: 3000,
  },
})
