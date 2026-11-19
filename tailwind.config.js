/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // MONOCHROME CHAMPIONSHIP SYSTEM
        mono: {
          bg: '#090909',
          surface: '#111111',
          card: '#191919',
          elevated: '#222222',
          border: '#303030',
          text: '#F2F2F0',
          secondary: '#A3A3A3',
          muted: '#737373',
          action: '#F2F2F0',
          actionDark: '#090909',
          actionSec: '#303030',
        },

        // System-wide surface aliases mapped directly to monochrome palette
        battle: {
          bg: '#090909',
          surface: '#111111',
          card: '#191919',
          cardHover: '#222222',
          border: '#303030',
          borderLight: '#3a3a3a',
          text: '#F2F2F0',
          muted: '#A3A3A3',
        },

        // Muted Franchise Identities
        franchise: {
          nishanth: '#8875A8',
          ajmal: '#71999B',
          praneeth: '#B68B68',
          nagulan: '#84977B',
        },

        // Brand aliases mapped to muted franchise & monochrome tones
        brand: {
          purple: '#8875A8',
          cyan: '#71999B',
          orange: '#B68B68',
          neon: '#84977B',
          primary: '#F2F2F0',
          secondary: '#A3A3A3',
          muted: '#737373',
          dark: '#090909',
          border: '#303030',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        broadcast: ['"Space Grotesk"', 'sans-serif'],
        title: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'mono-subtle': '0 2px 8px rgba(0, 0, 0, 0.4)',
        'mono-card': '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
        'mono-elevated': '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        // Backwards compatibility aliases stripped of colorful neon glow
        'glow-purple': '0 0 12px rgba(136, 117, 168, 0.25)',
        'glow-cyan': '0 0 12px rgba(113, 153, 155, 0.25)',
        'glow-orange': '0 0 12px rgba(182, 139, 104, 0.25)',
        'glow-neon': '0 0 12px rgba(132, 151, 123, 0.25)',
        'glow-pink': '0 0 12px rgba(255, 255, 255, 0.1)',
        'card-elevated': '0 8px 24px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite alternate',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'stamp': 'stampIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        'float': 'float 4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 15px rgba(145, 71, 255, 0.3)' },
          '100%': { boxShadow: '0 0 35px rgba(0, 217, 255, 0.6)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        stampIn: {
          '0%': { transform: 'scale(3) rotate(-15deg)', opacity: '0' },
          '70%': { transform: 'scale(0.92) rotate(-8deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-10deg)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
