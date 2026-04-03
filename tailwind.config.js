/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // <--- Dòng này chính là bản đồ chỉ đường cho Tailwind
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}