/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        surface: '#FFFFFF',
        surfaceBorder: '#E9ECEF',
        primary: '#0066CC',
        warning: '#FFB300',
        danger: '#DC3545',
        success: '#28A745',
        textPrimary: '#212529',
        textMuted: '#6C757D',
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
