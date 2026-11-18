/**
 * BIDBATTLE 7.2 - Party Arena Game Registry
 * Dedicated 4-game local multiplayer suite: Dumb Charades, Impostor, Spyfall, Find the Liar.
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
    tagline: 'Social Deduction, Secret Deception & Charades',
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
    badge: 'Party Hit',
    accentColor: '#9147FF',
    featured: true,
  },
  {
    id: 'party_impostor',
    universe: 'party_arena',
    title: 'Impostor',
    shortDesc: 'Everyone receives the exact same secret word except ONE player who gets an imposter clue or blank slate. Interrogate and find them!',
    longDesc: 'Social deduction bluffing game. Non-impostors share a secret word; the chosen Impostor must bluff without getting caught. Secret pass-the-laptop voting reveals if the imposter was identified, followed by a dramatic last-gasp word guess.',
    icon: '🕵️',
    mechanic: 'impostor',
    minPlayers: 2,
    maxPlayers: 4,
    defaultRounds: 4,
    defaultTimer: 60,
    tags: ['Social Deduction', 'Secret Bluffing', 'Deception'],
    badge: 'Top Deduction',
    accentColor: '#00D9FF',
    featured: true,
  },
  {
    id: 'party_spyfall',
    universe: 'party_arena',
    title: 'Spyfall',
    shortDesc: 'All innocent players receive a secret location and suggested role. One player is the SPY! Ask clever questions to expose the spy.',
    longDesc: 'High-stakes undercover interrogation. Everyone except the Spy knows the secret location (e.g., Space Station, Submarine, Cricket Stadium, Film Set). Non-spies ask subtle questions to detect who is clueless. Spies listen intently to deduce the location before being accused!',
    icon: '🔍',
    mechanic: 'spyfall',
    minPlayers: 2,
    maxPlayers: 4,
    defaultRounds: 4,
    defaultTimer: 90,
    tags: ['Undercover', 'Secret Location', 'Interrogation'],
    badge: 'Tactical',
    accentColor: '#FF8A35',
    featured: true,
  },
  {
    id: 'party_find_the_liar',
    universe: 'party_arena',
    title: 'Find the Liar',
    shortDesc: 'Most players answer Question A, but ONE liar secretly answered Question B! Compare all answers on screen and vote who is lying.',
    longDesc: 'Humorous, psychological party game. During pass-the-laptop, players secretly type their genuine response. Regular players answer Question A (e.g., "Your favorite food"), but the Liar was shown Question B (e.g., "Food you hate"). All answers appear together: discuss, vote, and uncover the liar!',
    icon: '🤥',
    mechanic: 'find_the_liar',
    minPlayers: 2,
    maxPlayers: 4,
    defaultRounds: 4,
    defaultTimer: 60,
    tags: ['Secret Answers', 'Psychological', 'Voting'],
    badge: 'Hilarious',
    accentColor: '#B7F34A',
    featured: true,
  },
];

export const getGameById = (id) => GAME_REGISTRY.find((g) => g.id === id);
export const getGamesByUniverse = (universeId) => GAME_REGISTRY.filter((g) => g.universe === universeId || universeId === 'all');
export const getFeaturedGames = () => GAME_REGISTRY.filter((g) => g.featured);
