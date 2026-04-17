/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FF5A7D',
          light: '#FFB3C6',
          dark: '#E5476A',
        },
        secondary: {
          DEFAULT: '#5C80E5',
          light: '#A3B9F5',
          dark: '#4A6BC9',
        },
        typography: {
          DEFAULT: '#333333',
          light: '#666666',
          lighter: '#999999',
        },
        active: '#FF5A7D',
        important: '#4ECDC4',
        neutral: '#9CA3AF',
        disabled: '#D1D5DB',
        bg: {
          primary: '#FFFFFF',
          secondary: '#FFF5F7',
          tertiary: '#F0F4FF',
          neutral: '#F9FAFB',
        },
      },
    },
  },
  plugins: [],
}
