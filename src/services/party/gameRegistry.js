/**
 * BIDBATTLE 7.9 - Party Arena Game Registry
 * Dumb Charades is the official local multiplayer Party Arena game.
 * Designed for 2-4 players on one physical laptop and shared screen.
 */

export const FIXED_PARTY_PLAYERS = [
  { id: 'p1', name: 'Nishanth', color: '#9147FF', avatar: '👑', tagline: 'The Mastermind' },
  { id: 'p2', name: 'Ajmal', color: '#00D9FF', avatar: '⚡', tagline: 'The Speedster' },
  { id: 'p3', name: 'Praneeth', color: '#FF8A35', avatar: '🔥', tagline: 'The Strategist' },
  { id: 'p4', name: 'Nagulan', color: '#B7F34A', avatar: '🛡️', tagline: 'The Enforcer' },
];

export const UNIVERSES = {
  PARTY_ARENA: {
    id: 'party_arena',
    name: 'Party Arena',
    tagline: 'Silent Acting & Charades Showdown',
    icon: '🎉',
    color: '#9147FF',
    badgeVariant: 'purple',
    gradient: 'from-purple-900/60 to-purple-600/20',
  },
};

export const GAME_REGISTRY = [
  {
    id: 'party_dumb_charades',
    universe: 'party_arena',
    title: 'Dumb Charades',
    shortDesc: 'Pass the laptop secretly to view your movie prompt. Act silently without speaking or lip-syncing while players guess aloud!',
    longDesc: 'Classic party game reimagined for 2-4 local players. Pass the laptop to inspect your secret film title (Tamil Cinema, Marvel MCU, or Mixed). Start the timer and act silently while everyone shouts out answers. Operator awards +100 pts (+50 bonus for rapid guesses <=15s).',
    icon: '🎭',
    mechanic: 'dumb_charades',
    minPlayers: 2,
    maxPlayers: 4,
    defaultRounds: 4,
    defaultTimer: 45,
    hasCategories: true,
    tags: ['Silent Acting', 'Kollywood & MCU', 'Timer Blitz'],
    badge: 'Official Party Game',
    accentColor: '#9147FF',
    featured: true,
  },
];

export const getGameById = (id) => GAME_REGISTRY.find((g) => g.id === id) || GAME_REGISTRY[0];
export const getGamesByUniverse = (universeId) => GAME_REGISTRY.filter((g) => g.universe === universeId || universeId === 'all');
export const getFeaturedGames = () => GAME_REGISTRY;
