/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', 'sans-serif'],
      },
      fontFeatureSettings: {
        sans: "'cv02', 'cv03', 'cv04', 'cv11'",
      },
    },
  },
  plugins: [],
}
