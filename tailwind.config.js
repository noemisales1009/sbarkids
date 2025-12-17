/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#13a4ec",
        "background-light": "#f6f7f8",
        "background-dark": "#101c22",
        "urgent": "#D0021B",
        "attention": "#F5A623",
        "normal": "#2e7d32",
        "info": "#4A90E2"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      }
    }
  },
  darkMode: 'class',
}
