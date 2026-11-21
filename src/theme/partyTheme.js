/**
 * CORAL & LAVENDER - PARTY ARENA THEME
 * Applied to: Party Arena Home, Dumb Charades Setup & Live Gameplay,
 * Who Am I? Setup & Live Gameplay, Party Results, and Party Broadcast.
 */

export const partyTheme = {
  id: 'party',
  name: 'Coral & Lavender',
  colors: {
    bg: '#F8F1EB',              // Warm cream
    card: '#FFFFFF',            // White
    surfaceSecondary: '#F0E5EC',// Soft blush lavender
    text: '#342B3B',            // Deep plum
    textSecondary: '#776B7D',   // Muted mauve
    accentPrimary: '#D97567',   // Coral
    accentSecondary: '#9581B5', // Lavender
    accentAction: '#D7AC64',    // Warm gold
    border: '#E4D6DC',          // Soft rose grey
    badgeBg: '#F0E5EC',
    badgeText: '#342B3B',
    highlight: '#D97567',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 1px 3px rgba(52, 43, 59, 0.05), 0 1px 2px rgba(52, 43, 59, 0.03)',
    card: '0 4px 16px -2px rgba(52, 43, 59, 0.08), 0 0 1px 1px rgba(228, 214, 220, 0.4)',
    elevated: '0 10px 25px -5px rgba(52, 43, 59, 0.12), 0 0 1px 1px rgba(217, 117, 103, 0.15)',
  },
  cssVars: {
    '--theme-bg': '#F8F1EB',
    '--theme-card': '#FFFFFF',
    '--theme-surface-secondary': '#F0E5EC',
    '--theme-text': '#342B3B',
    '--theme-text-secondary': '#776B7D',
    '--theme-accent-primary': '#D97567',
    '--theme-accent-action': '#D7AC64',
    '--theme-accent-secondary': '#9581B5',
    '--theme-border': '#E4D6DC',
  }
};
