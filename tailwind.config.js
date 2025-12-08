/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

export default {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '321px',
      ...defaultTheme.screens,
    },
    extend: {
      height: {
        'layar' : 'h-[calc(100vh-64px)]',
      },
      fontFamily: {
        inter: ['Inter', "sans-serif"]
      },
      colors: {
        'custom-gray': '#f5f4f4',
        'button-mi' : '#BBB9B9',
        'coklat-mi' : '#2C2727',
        'hitam-mi' : '#212121'
      },
      keyframes: {
        bgSlide: {
          '0%': { 'background-position': '100% 0' },
          '100%': { 'background-position': '0 0' },
        },
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.blocked': {
          display: 'block',
        },
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    },
    require('@tailwindcss/typography'),
  ],
}
