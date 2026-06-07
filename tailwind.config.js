/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        warm: {
          50:  '#fafaf9',
          100: '#f2ede6',
        },
      },
      fontSize: {
        base: ['18px', { lineHeight: '1.65' }],
      },
      minHeight: {
        tap: '44px',
      },
    },
  },
  plugins: [],
}
