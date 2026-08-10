/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#050507',
        deep: '#0A0A0F',
        surface: '#0F0F18',
        neon: {
          purple: '#9B5CFF',
          pink: '#FF3D8D',
          blue: '#00BFFF',
          green: '#00FF85',
          orange: '#FF9E3D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '32px',
      },
      boxShadow: {
        'glow-purple': '0 0 24px rgba(155, 92, 255, 0.45)',
        'glow-pink': '0 0 24px rgba(255, 61, 141, 0.45)',
        'glow-green': '0 0 24px rgba(0, 255, 133, 0.4)',
        'glow-blue': '0 0 24px rgba(0, 191, 255, 0.4)',
      },
    },
  },
  plugins: [],
};
