/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Brand system — exact tokens from mobileappdesignprompt.txt. Do not invent new ones.
        teal: '#06D6A0',
        navy: '#1D2B64',
        'navy-alt': '#1C398E',
        ink: '#0A0F1E',
        amber: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter'],
      },
      borderRadius: {
        card: '12px',
        sheet: '20px',
      },
    },
  },
  plugins: [],
};
