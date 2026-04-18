/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#12121A',
        surfaceBorder: '#1E1E2E',
        primary: '#00E5FF',
        warning: '#FFB300',
        danger: '#FF3D3D',
        textPrimary: '#F0F0F0',
        textMuted: '#6B7280',
      },
      fontFamily: {
        mono: ['"IBM Plex Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [],
}
