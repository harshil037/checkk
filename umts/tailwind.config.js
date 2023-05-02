module.exports = {
  important: '#__UMTS',
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './node_modules/@mts-online/**/*'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecf9f7',
          100: '#c5ede7',
          200: '#9ee1d8',
          300: '#77d5c8',
          400: '#68d0c2', //main umts theme color
          500: '#36af9f',
          600: '#2a887c',
          700: '#1e6158',
          800: '#123a35',
          900: '#061312',
        },
        heading: 'rgba(0, 0, 0, 0.65)',
      },
      fontSize: {
        xl: '20px',
      },
    },
  },
  plugins: [],
}
