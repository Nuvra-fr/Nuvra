import type { Config } from 'tailwindcss';

/**
 * Nuvra design tokens.
 *
 * Identity: deep ink blacks + electric Nuvra blue, glass surfaces, hairlines,
 * light. Glassmorphism is a *hierarchy*, not a default: only the floating
 * capsule header, modals, dropdowns and a few hero surfaces use backdrop blur
 * (see `.glass-capsule` / `.glass-panel` in globals.css). Everything else stays
 * opaque so text contrast never depends on what scrolls behind it.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#04060A',
          925: '#05080E',
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
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.75rem',
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 8px 30px rgba(0,0,0,0.35)',
        glow: '0 0 0 1px rgba(51,114,255,0.35), 0 8px 40px rgba(27,81,245,0.18)',
        // ── Liquid glass ───────────────────────────────────────────────
        /** Floating capsule: hairline top highlight + soft ambient drop. */
        glass:
          '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 0 0 1px rgba(255,255,255,0.045) inset, 0 18px 50px -18px rgba(0,0,0,0.75)',
        /** Panels (modals, dropdowns, dashboard chrome). */
        panel:
          '0 1px 0 0 rgba(255,255,255,0.05) inset, 0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 60px -24px rgba(0,0,0,0.8)',
        /** Primary action: blue with a light rim, never a neon halo. */
        'button-primary':
          '0 1px 0 0 rgba(255,255,255,0.22) inset, 0 6px 18px -6px rgba(27,81,245,0.55)',
        lift: '0 12px 32px -14px rgba(0,0,0,0.7)',
      },
      backdropBlur: {
        capsule: '22px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        panelIn: {
          from: { opacity: '0', transform: 'translateY(-6px) scale(0.985)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) both',
        fadeIn: 'fadeIn 0.25s ease-out both',
        panelIn: 'panelIn 0.18s cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
