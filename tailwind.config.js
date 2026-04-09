/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,svelte,js,ts}'],
  darkMode:'class',
  theme: {
    base: false,
    extend: {
      colors:{
        'base-light':"#f4f4f5",
        'base-dark':"#1f2937"
      }
    },
  },
  plugins: [require('daisyui')],
}
