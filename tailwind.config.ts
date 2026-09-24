import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04060A',
          900: '#070A10',
          850: '#0A0E16',
          800: '#0E131D',
          700: '#151B28',
          600: '#1D2534',
        },
        nuvra: {
          50: '#EEF5FF',
          100: '#D9E8FF',
          200: '#BCD7FF',
          300: '#8EBCFF',
          400: '#5996FF',
          500: '#3372FF',
          600: '#1B51F5',
          700: '#143EE1',
          800: '#1734B6',
          900: '#192F8F',
        },
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(51,114,255,0.35), 0 8px 40px rgba(27,81,245,0.18)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
