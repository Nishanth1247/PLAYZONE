/**
 * MIDNIGHT COBALT & STEEL - BATTLE ARENA THEME
 * Applied to: Battle Setup, Battle Auction Stage, Tactical Draft Board,
 * Battle Match Stage, Battle Results, and Battle Broadcast.
 * 
 * Combat & tactical arena identity:
 * Midnight cobalt floor, slate cards, electric cobalt accents & brushed steel grey.
 */

export const battleTheme = {
  id: 'battle',
  name: 'Midnight Cobalt & Steel',
  colors: {
    bg: '#0A1224',              // Deep midnight cobalt navy
    card: '#172744',            // Blue slate card
    surfaceSecondary: '#233B5C',// Steel blue surface
    text: '#F0F3F8',            // Ice white typography
    textSecondary: '#AAB8CB',   // Silver grey
    accentPrimary: '#568BE0',   // Electric cobalt
    accentSecondary: '#AAB8CB', // Steel grey
    accentAction: '#C5A46D',    // Muted gold
    border: '#2C4468',          // Steel blue border
    badgeBg: '#233B5C',
    badgeText: '#F0F3F8',
    highlight: '#568BE0',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 2px 6px rgba(0, 0, 0, 0.4)',
    card: '0 6px 20px -3px rgba(10, 18, 36, 0.6), 0 0 1px 1px rgba(86, 139, 224, 0.1)',
    elevated: '0 12px 32px -4px rgba(10, 18, 36, 0.8), 0 0 1px 1px rgba(170, 184, 203, 0.15)',
  },
  cssVars: {
    '--theme-bg': '#0A1224',
    '--theme-card': '#172744',
    '--theme-surface-secondary': '#233B5C',
    '--theme-text': '#F0F3F8',
    '--theme-text-secondary': '#AAB8CB',
    '--theme-accent-primary': '#568BE0',
    '--theme-accent-action': '#C5A46D',
    '--theme-accent-secondary': '#AAB8CB',
    '--theme-border': '#2C4468',
  }
};
