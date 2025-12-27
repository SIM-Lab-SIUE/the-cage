const { join } = require('path');
const { theme } = require('./src/config/branding.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
    join(__dirname, 'public/**/*.html'),
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        accent: 'var(--accent-color)',
      },
    },
  },
  plugins: [],
};