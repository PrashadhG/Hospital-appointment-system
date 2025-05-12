/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a73e8',
          light: '#e8f0fe'
        },
        secondary: '#008080',
        success: '#34a853',
        danger: '#ea4335',
        warning: '#fbbc05',
        info: '#4285f4',
        dark: '#202124',
        medium: '#5f6368',
        light: '#f8f9fa'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};