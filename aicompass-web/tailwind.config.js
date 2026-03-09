/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F3A',
        teal: '#006D6B',
        teal2: '#008280',
        gold: '#C17F24',
        gold2: '#d4922d',
        sky: '#1A7BC4',
        red: '#B32B2B',
        green: '#1A6B3A',
        amber: '#B86A00',
      },
      fontFamily: {
        fraunces: ['Fraunces', 'serif'],
        'jetbrains': ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
