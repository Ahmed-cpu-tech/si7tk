/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef7f6',
          100: '#d6ece9',
          200: '#afd9d5',
          300: '#83c2bd',
          400: '#54a8a3',
          500: '#358e8a',
          600: '#287370',
          700: '#225c5b',
          800: '#1e4b4a',
          900: '#1b3f3e',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
