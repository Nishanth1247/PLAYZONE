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
        // FOUR DYNAMIC THEMES ARCHITECTURE (Alpine Editorial, Emerald & Ivory, Cobalt & Silver, Coral & Lavender)
        theme: {
          bg: 'var(--theme-bg)',
          card: 'var(--theme-card)',
          surface: 'var(--theme-surface-secondary)',
          text: 'var(--theme-text)',
          muted: 'var(--theme-text-secondary)',
          border: 'var(--theme-border)',
          accent: 'var(--theme-accent-primary)',
          action: 'var(--theme-accent-action)',
          secondary: 'var(--theme-accent-secondary)',
        },

        // NEW BIDBATTLE DESIGN SYSTEM (MIDNIGHT NAVY & SLATE)
        navy: {
          bg: '#111827',       // Midnight Navy (Main background)
          deep: '#222F43',     // Deep Slate (Secondary background / Cards)
          surface: '#2C394C',  // Slate Grey (Elevated surface)
          light: '#F0EDE5',    // Soft Ivory (Light surface)
          text: '#F5F3EE',     // Warm White (Main text on dark)
          secondary: '#AEB9CC',// Muted Blue Grey (Secondary text)
          coral: '#D97858',    // Terracotta Coral (Primary accent)
          sage: '#91A98B',     // Sage (Secondary accent)
          champagne: '#D4B879',// Champagne (Premium highlight)
          border: '#39465A',   // Muted Slate (Borders)
        },

        // System-wide surface aliases mapped to the new palette
        battle: {
          bg: '#111827',
          surface: '#222F43',
          card: '#222F43',
          cardHover: '#2C394C',
          elevated: '#2C394C',
          border: '#39465A',
          borderLight: '#4B5A70',
          text: '#F5F3EE',
          muted: '#AEB9CC',
          coral: '#D97858',
          sage: '#91A98B',
          champagne: '#D4B879',
          ivory: '#F0EDE5',
        },

        mono: {
          bg: '#111827',
          surface: '#222F43',
          card: '#222F43',
          elevated: '#2C394C',
          border: '#39465A',
          text: '#F5F3EE',
          secondary: '#AEB9CC',
          muted: '#7E8B9F',
          action: '#D97858',
          actionDark: '#111827',
          actionSec: '#2C394C',
        },

        // Muted Franchise Identities
        franchise: {
          nishanth: '#8875A8',
          ajmal: '#71999B',
          praneeth: '#B68B68',
          nagulan: '#84977B',
        },

        // Brand aliases mapped to new palette
        brand: {
          purple: '#8875A8',
          cyan: '#71999B',
          orange: '#D97858',
          neon: '#91A98B',
          gold: '#D4B879',
          primary: '#F5F3EE',
          secondary: '#AEB9CC',
          muted: '#7E8B9F',
          dark: '#111827',
          border: '#39465A',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Outfit"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', 'system-ui', 'sans-serif'],
        broadcast: ['"Outfit"', 'system-ui', 'sans-serif'],
        title: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
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
