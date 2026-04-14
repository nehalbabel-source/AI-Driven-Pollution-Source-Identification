/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom dark theme palette
        surface:  '#0f1117',
        card:     '#1a1d2e',
        cardBorder:'#252840',
        accent:   '#6366f1',
        accentLight:'#818cf8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
