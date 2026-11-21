/**
 * EMERALD & IVORY - AUCTION ARENA THEME
 * Applied to: Auction Setup, Live Auction, Auction Teams Dashboard, Unsold Pool,
 * Auction Podium/Results, and Auction Broadcast.
 * 
 * High-stakes franchise auction identity:
 * Emerald floor, forest cards, champagne gold highlights & burnt copper accents.
 */

export const auctionTheme = {
  id: 'auction',
  name: 'Emerald & Ivory',
  colors: {
    bg: '#0B211D',              // Deep emerald floor
    card: '#15352D',            // Forest green card
    surfaceSecondary: '#20483D',// Deep moss surface
    text: '#F5F0E5',            // Warm ivory typography
    textSecondary: '#B6C5B5',   // Muted sage
    accentPrimary: '#C5A46D',   // Champagne gold
    accentAction: '#D17B55',    // Burnt copper
    accentSecondary: '#B6C5B5', // Sage
    border: '#244F43',          // Muted green border
    badgeBg: '#20483D',
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
    card: '0 6px 20px -3px rgba(0, 0, 0, 0.55), 0 0 1px 1px rgba(197, 164, 109, 0.08)',
    elevated: '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(197, 164, 109, 0.18)',
  },
  cssVars: {
    '--theme-bg': '#0B211D',
    '--theme-card': '#15352D',
    '--theme-surface-secondary': '#20483D',
    '--theme-text': '#F5F0E5',
    '--theme-text-secondary': '#B6C5B5',
    '--theme-accent-primary': '#C5A46D',
    '--theme-accent-action': '#D17B55',
    '--theme-accent-secondary': '#B6C5B5',
    '--theme-border': '#244F43',
  }
};
