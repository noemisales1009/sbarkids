/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#3b82f6",
        "primary-dark": "#2563eb",
        "background-light": "#f8fafc",
        "background-dark": "#0f172a",
        "card-light": "#ffffff",
        "card-dark": "#1e293b",
        "urgent": "#ef4444",
        "attention": "#f59e0b",
        "normal": "#10b981",
        "info": "#3b82f6"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      spacing: {
        '17': '68px',
      },
      keyframes: {
        'loading-bar': {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'loading-bar': 'loading-bar 1.2s ease-in-out infinite',
      },
    }
  },
  darkMode: 'class',
}
