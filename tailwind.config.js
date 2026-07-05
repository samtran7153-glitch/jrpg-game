/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      colors: {
        retro: {
          bg: '#0f0f1b',
          panel: '#1a1a2e',
          border: '#4a4a6a',
          accent: '#e94560',
          gold: '#f5c518',
          green: '#4ecca3',
          blue: '#4ea8de',
          purple: '#9d4edd',
          text: '#e0e0e0',
          dim: '#6a6a8a',
        },
      },
    },
  },
  plugins: [],
}
