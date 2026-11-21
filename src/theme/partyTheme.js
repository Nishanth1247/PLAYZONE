/**
 * DARK PLUM & MUTED CORAL - PARTY ARENA THEME
 * Applied to: Party Arena Home, Dumb Charades Setup & Live Gameplay,
 * Who Am I? Setup & Live Gameplay, Party Results, and Party Broadcast.
 * 
 * Cheerful in-person social gaming identity in dark plum & muted coral:
 * Dark plum canvas, deep purple cards, muted coral accents & soft lavender highlights.
 */

export const partyTheme = {
  id: 'party',
  name: 'Dark Plum & Muted Coral',
  colors: {
    bg: '#1B1521',              // Dark plum floor
    card: '#302438',            // Deep plum card
    surfaceSecondary: '#413148',// Plum elevated surface
    text: '#F5EFF8',            // Soft white with plum tint
    textSecondary: '#B3A2BC',   // Muted lavender grey
    accentPrimary: '#C77B79',   // Muted coral
    accentSecondary: '#A18BC2', // Lavender
    accentAction: '#D6A568',    // Warm amber
    border: '#4A3A54',          // Soft plum border
    badgeBg: '#413148',
    badgeText: '#F5EFF8',
    highlight: '#C77B79',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 2px 6px rgba(0, 0, 0, 0.4)',
    card: '0 6px 20px -3px rgba(27, 21, 33, 0.6), 0 0 1px 1px rgba(199, 123, 121, 0.1)',
    elevated: '0 12px 32px -4px rgba(27, 21, 33, 0.8), 0 0 1px 1px rgba(161, 139, 194, 0.18)',
  },
  cssVars: {
    '--theme-bg': '#1B1521',
    '--theme-card': '#302438',
    '--theme-surface-secondary': '#413148',
    '--theme-text': '#F5EFF8',
    '--theme-text-secondary': '#B3A2BC',
    '--theme-accent-primary': '#C77B79',
    '--theme-accent-action': '#D6A568',
    '--theme-accent-secondary': '#A18BC2',
    '--theme-border': '#4A3A54',
  }
};
