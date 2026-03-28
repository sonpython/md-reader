/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: 'var(--editor-bg)',
          sidebar: 'var(--editor-sidebar)',
          active: 'var(--editor-active)',
          border: 'var(--editor-border)',
          text: 'var(--editor-text)',
          accent: 'var(--editor-accent)'
        }
      }
    },
  },
  plugins: [],
}
