import { defineConfig } from 'vite'
import react from '@vitejs/react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // <--- CHỈ CẦN THÊM ĐÚNG DÒNG NÀY ĐỂ FIX LỖI GIAO DIỆN
})