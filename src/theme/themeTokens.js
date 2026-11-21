import { websiteTheme } from './websiteTheme';
import { auctionTheme } from './auctionTheme';
import { battleTheme } from './battleTheme';
import { partyTheme } from './partyTheme';

export const THEMES = {
  website: websiteTheme,
  auction: auctionTheme,
  battle: battleTheme,
  party: partyTheme,
};

export const getThemeById = (themeId) => {
  return THEMES[themeId] || THEMES.website;
};

export const getThemeForSection = (platformMode, activePage, broadcastArena) => {
  if (broadcastArena) {
    if (broadcastArena === 'auction') return 'auction';
    if (broadcastArena === 'battle') return 'battle';
    if (broadcastArena === 'party') return 'party';
  }

  switch (platformMode) {
    case 'auction':
      return 'auction';
    case 'battle':
      return 'battle';
    case 'party':
      return 'party';
    case 'home':
    case 'tournaments':
    case 'franchises':
    case 'statistics':
    case 'rules':
    default:
      return 'website';
  }
};
