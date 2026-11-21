/**
 * ALPINE EDITORIAL - MAIN WEBSITE THEME
 * Applied to: Home, Tournament Hub, Tournament Details, Tournament Creation Wizard,
 * Franchise Manager, Statistics & Records, Season Manager, Rules, Settings, and non-arena pages.
 */

export const websiteTheme = {
  id: 'website',
  name: 'Alpine Editorial',
  colors: {
    bg: '#F4F1E8',              // Warm porcelain
    card: '#FFFFFF',            // White
    surfaceSecondary: '#EAE6DC',// Soft stone
    text: '#26343B',            // Charcoal ink
    textSecondary: '#697477',   // Muted grey
    accentPrimary: '#176B68',   // Deep teal
    accentAction: '#C46A45',    // Burnt copper
    accentSecondary: '#A8B8A3', // Sage
    border: '#D9D5CA',          // Warm grey
    badgeBg: '#EAE6DC',
    badgeText: '#26343B',
    highlight: '#176B68',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 1px 3px rgba(38, 52, 59, 0.05), 0 1px 2px rgba(38, 52, 59, 0.03)',
    card: '0 4px 16px -2px rgba(38, 52, 59, 0.08), 0 0 1px 1px rgba(38, 52, 59, 0.04)',
    elevated: '0 10px 25px -5px rgba(38, 52, 59, 0.12), 0 0 1px 1px rgba(38, 52, 59, 0.05)',
  },
  cssVars: {
    '--theme-bg': '#F4F1E8',
    '--theme-card': '#FFFFFF',
    '--theme-surface-secondary': '#EAE6DC',
    '--theme-text': '#26343B',
    '--theme-text-secondary': '#697477',
    '--theme-accent-primary': '#176B68',
    '--theme-accent-action': '#C46A45',
    '--theme-accent-secondary': '#A8B8A3',
    '--theme-border': '#D9D5CA',
  }
};
