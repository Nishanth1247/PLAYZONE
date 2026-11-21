/**
 * COBALT & SILVER - BATTLE ARENA THEME
 * Applied to: Battle Setup, Battle Auction Stage, Tactical Draft Board,
 * Battle Match Stage, Battle Results, and Battle Broadcast.
 */

export const battleTheme = {
  id: 'battle',
  name: 'Cobalt & Silver',
  colors: {
    bg: '#101B32',              // Deep cobalt navy
    card: '#1C2D4B',            // Blue slate
    surfaceSecondary: '#293D5C',// Steel blue
    text: '#F0F3F8',            // Ice white
    textSecondary: '#B7C3D4',   // Silver grey
    accentPrimary: '#6198E8',   // Electric cobalt
    accentSecondary: '#C6D0DD', // Silver
    accentAction: '#C5A46D',    // Muted gold
    border: '#394C69',          // Muted blue
    badgeBg: '#293D5C',
    badgeText: '#F0F3F8',
    highlight: '#6198E8',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 2px 6px rgba(0, 0, 0, 0.4)',
    card: '0 6px 20px -3px rgba(10, 20, 40, 0.6), 0 0 1px 1px rgba(97, 152, 232, 0.08)',
    elevated: '0 12px 32px -4px rgba(10, 20, 40, 0.8), 0 0 1px 1px rgba(198, 208, 221, 0.12)',
  },
  cssVars: {
    '--theme-bg': '#101B32',
    '--theme-card': '#1C2D4B',
    '--theme-surface-secondary': '#293D5C',
    '--theme-text': '#F0F3F8',
    '--theme-text-secondary': '#B7C3D4',
    '--theme-accent-primary': '#6198E8',
    '--theme-accent-action': '#C5A46D',
    '--theme-accent-secondary': '#C6D0DD',
    '--theme-border': '#394C69',
  }
};
