import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Dòng này cực quan trọng để vào bằng IP Tailscale
    port: 5173
  }
})