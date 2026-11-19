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
        // BIDBATTLE 8.4 — Championship Editorial & Sports Broadcast Palette
        forest: '#18251F',     // Forest Ink – primary background
        pine: '#24352C',       // Deep Pine – secondary surfaces
        ivory: '#E8E3D4',      // Warm Ivory – primary typography & light surfaces
        terracotta: '#C66A45', // Terracotta – main action accent
        gold: '#C3A45D',       // Antique Gold – championship & premium details
        sage: '#91A08B',       // Muted Sage – secondary information
        charcoal: '#303832',   // Soft Charcoal – supporting borders & elements

        // System-wide surface aliases mapped to the new palette
        battle: {
          bg: '#18251F',
          surface: '#24352C',
          card: '#24352C',
          cardHover: '#303832',
          border: '#303832',
          borderLight: '#414D43',
          text: '#E8E3D4',
          muted: '#91A08B',
        },
        // Preserved 4 Predefined Franchises (used strictly for team identities)
        franchise: {
          nishanth: '#9147FF',
          ajmal: '#00D9FF',
          praneeth: '#FF8A35',
          nagulan: '#B7F34A',
        },
        brand: {
          purple: '#9147FF',
          cyan: '#00D9FF',
          orange: '#FF8A35',
          neon: '#B7F34A',
          terracotta: '#C66A45',
          gold: '#C3A45D',
          sage: '#91A08B',
          pink: '#FF4FA3',
          blue: '#2B66FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Rajdhani', 'Impact', 'Teko', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-purple': '0 0 25px -5px rgba(145, 71, 255, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(0, 217, 255, 0.4)',
        'glow-orange': '0 0 25px -5px rgba(255, 138, 53, 0.4)',
        'glow-neon': '0 0 25px -5px rgba(183, 243, 74, 0.4)',
        'glow-pink': '0 0 25px -5px rgba(255, 79, 163, 0.4)',
        'card-elevated': '0 12px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05)',
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
