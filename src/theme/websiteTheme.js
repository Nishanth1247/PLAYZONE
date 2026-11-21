/**
 * MIDNIGHT OBSIDIAN - MAIN WEBSITE THEME
 * Applied to: Home, Tournament Hub, Tournament Details, Tournament Creation Wizard,
 * Franchise Manager, Statistics & Records, Season Manager, Rules, and non-arena pages.
 * 
 * Distinct sports-tech & gaming management visual identity:
 * Midnight Obsidian + Electric Jade with warm amber highlights.
 */

export const websiteTheme = {
  id: 'website',
  name: 'Midnight Obsidian',
  colors: {
    bg: '#101418',              // Midnight black
    surfaceSecondary: '#151C22',// Deep graphite
    card: '#1C252D',            // Obsidian slate
    cardSecondary: '#25313A',   // Dark steel
    elevated: '#2B3841',        // Graphite surface
    text: '#EDF2F3',            // Soft silver-white
    textSecondary: '#A5B2B8',   // Muted silver
    mutedText: '#788890',       // Slate grey
    accentPrimary: '#45C4A1',   // Electric jade
    accentSecondary: '#258C76', // Deep jade
    accentAction: '#45C4A1',    // Electric jade for primary action
    highlight: '#D6A568',       // Warm amber
    border: '#34414A',          // Subtle graphite
    success: '#58B68C',         // Muted green
    warning: '#E2AE61',         // Warm amber
    danger: '#D87878',          // Muted coral
    badgeBg: '#25313A',
    badgeText: '#EDF2F3',
  },
  typography: {
    fontHeading: '"Outfit", system-ui, sans-serif',
    fontBody: '"DM Sans", system-ui, sans-serif',
    fontTitle: '"Barlow Condensed", Impact, sans-serif',
    fontMono: '"IBM Plex Mono", monospace',
  },
  shadows: {
    subtle: '0 1px 3px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.25)',
    card: '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(52, 65, 74, 0.35)',
    elevated: '0 12px 32px -4px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(69, 196, 161, 0.12)',
  },
  cssVars: {
    '--theme-bg': '#101418',
    '--theme-card': '#1C252D',
    '--theme-surface-secondary': '#151C22',
    '--theme-card-secondary': '#25313A',
    '--theme-elevated': '#2B3841',
    '--theme-text': '#EDF2F3',
    '--theme-text-secondary': '#A5B2B8',
    '--theme-muted': '#788890',
    '--theme-accent-primary': '#45C4A1',
    '--theme-accent-action': '#45C4A1',
    '--theme-accent-secondary': '#258C76',
    '--theme-highlight': '#D6A568',
    '--theme-border': '#34414A',
    '--theme-success': '#58B68C',
    '--theme-warning': '#E2AE61',
    '--theme-danger': '#D87878',
  }
};
