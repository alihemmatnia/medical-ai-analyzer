/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: "#070a13",
          navy: "#0c1222",
          panel: "#131b2f",
          border: "#1e293b",
          cyan: "#06b6d4",
          emerald: "#10b981",
          indigo: "#6366f1",
          purple: "#a855f7",
          rose: "#f43f5e",
          amber: "#f59e0b",
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.15)',
        'glow-indigo': '0 0 15px rgba(99, 102, 241, 0.15)',
        'glow-purple': '0 0 15px rgba(168, 85, 247, 0.15)',
      }
    },
  },
  plugins: [],
}

