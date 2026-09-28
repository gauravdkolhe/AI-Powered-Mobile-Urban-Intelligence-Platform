/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f17',
          card: '#131b26',
          border: '#1f2d3d',
          accent: '#00e5ff',
          warning: '#f59e0b',
          danger: '#ef4444',
          success: '#10b981',
          purple: '#a855f7'
        }
      }
    },
  },
  plugins: [],
}
