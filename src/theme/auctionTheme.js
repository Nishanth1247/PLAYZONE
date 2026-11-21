/**
 * EMERALD & IVORY - AUCTION ARENA THEME
 * Applied to: Auction Setup, Live Auction, Auction Teams Dashboard, Unsold Pool,
 * Auction Podium/Results, and Auction Broadcast.
 */

export const auctionTheme = {
  id: 'auction',
  name: 'Emerald & Ivory',
  colors: {
    bg: '#102C27',              // Deep emerald
    card: '#193B33',            // Forest green
    surfaceSecondary: '#244A40',// Deep moss
    text: '#F5F0E5',            // Warm ivory
    textSecondary: '#B6C5B5',   // Muted sage
    accentPrimary: '#C5A46D',   // Champagne gold
    accentAction: '#D77A54',    // Burnt copper
    accentSecondary: '#B6C5B5', // Sage
    border: '#35574B',          // Muted green
    badgeBg: '#244A40',
    badgeText: '#F5F0E5',
    highlight: '#C5A46D',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 2px 6px rgba(0, 0, 0, 0.4)',
    card: '0 6px 20px -3px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(245, 240, 229, 0.06)',
    elevated: '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(197, 164, 109, 0.15)',
  },
  cssVars: {
    '--theme-bg': '#102C27',
    '--theme-card': '#193B33',
    '--theme-surface-secondary': '#244A40',
    '--theme-text': '#F5F0E5',
    '--theme-text-secondary': '#B6C5B5',
    '--theme-accent-primary': '#C5A46D',
    '--theme-accent-action': '#D77A54',
    '--theme-accent-secondary': '#B6C5B5',
    '--theme-border': '#35574B',
  }
};
