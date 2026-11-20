/**
 * PLAYZONE — Centralized Tournament Hub & Season Manager Service
 * Manages multi-tournament persistence, lifecycle states, arena configurations,
 * isolated squad/match states, and cross-tournament telemetry.
 */

import { franchiseService } from './franchiseService.js';
import { AUCTION_PRESETS } from './presets.js';

export const TOURNAMENT_STORAGE_KEY = 'playzone_tournaments_v1';
export const ACTIVE_TOURNAMENT_ID_KEY = 'playzone_current_active_tournament_id_v1';

// Safe helper for localStorage across Browser and Node test environments
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof global !== 'undefined' && global.localStorage) {
    return global.localStorage;
  }
  return null;
};

// Dispatch global tournament updates
const notifySubscribers = () => {
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('playzone_tournaments_updated'));
  }
};

/**
 * Seed initial sample tournaments so new users immediately have rich, interactive data.
 */
export const DEFAULT_TOURNAMENTS = [
  {
    id: 'tourn-tamil-super-clash-2026',
    name: 'Tamil Cinema Super Clash 2026',
    description: 'Premier franchise championship clashing superstar Tamil actors in tactical auction & arena battles.',
    category: 'Cinema',
    logo: '🎬',
    themeColor: '#D4B879',
    season: 'Season 1',
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    status: 'active',
    franchiseIds: ['team-nishanth', 'team-ajmal', 'team-praneeth', 'team-nagulan'],
    gameModes: ['auction', 'battle'],
    auctionConfig: {
      presetId: 'tamil_cinema_heroes_2026',
      presetName: 'Tamil Cinema Heroes & Icons',
      defaultPurse: 100,
      basePrice: 1.0,
      maxSquadSize: 5,
      minSquadSize: 3,
      timerDuration: 20,
      antiSelfBidding: true,
    },
    battleConfig: {
      squadSize: 3,
      startingPurse: 100,
      scheduleType: 'round_robin',
      scoringSystem: '3_1_0',
    },
    partyConfig: null,
    progress: {
      percentage: 45,
      currentStage: 'Round 1: Team Auction',
      completedStages: ['Setup', 'Lot Preparation'],
      totalStages: 4,
    },
    results: null,
    historyLog: [
      { id: 'log-1', timestamp: 1732000000000, event: 'Tournament Created', details: 'Configured with 4 franchises and 2 arenas.' },
      { id: 'log-2', timestamp: 1732050000000, event: 'Status changed to Active', details: 'Commenced Round 1: Team Auction.' },
    ],
    createdAt: 1732000000000,
    updatedAt: 1732050000000,
  },
  {
    id: 'tourn-kollywood-blockbuster-cup',
    name: 'Kollywood Blockbuster Cup',
    description: 'Historical auction tournament featuring all-time highest grossing films and actors.',
    category: 'Cinema',
    logo: '🏆',
    themeColor: '#71999B',
    season: 'Winter 2025',
    startDate: '2025-10-10',
    endDate: '2025-10-25',
    status: 'completed',
    franchiseIds: ['team-nishanth', 'team-ajmal', 'team-praneeth'],
    gameModes: ['auction'],
    auctionConfig: {
      presetId: 'tamil_cinema_heroes_2026',
      presetName: 'Tamil Cinema Heroes',
      defaultPurse: 100,
      basePrice: 2.0,
      maxSquadSize: 4,
      minSquadSize: 3,
      timerDuration: 15,
      antiSelfBidding: true,
    },
    progress: {
      percentage: 100,
      currentStage: 'Completed',
      completedStages: ['Setup', 'Auction', 'Settlement', 'Podium'],
      totalStages: 4,
    },
    results: {
      championTeamId: 'team-nishanth',
      championTeamName: 'Nishanth',
      championColor: '#8875A8',
      championLogo: '👑',
      runnerUpTeamId: 'team-ajmal',
      runnerUpTeamName: 'Ajmal',
      finalScores: {
        'team-nishanth': 365,
        'team-ajmal': 342,
        'team-praneeth': 310,
      },
      completedAt: '2025-10-25T18:30:00Z',
      summaryNotes: 'Nishanth secured championship victory with a total score of 365 pts.',
    },
    historyLog: [
      { id: 'log-1', timestamp: 1729000000000, event: 'Tournament Created', details: 'Initialized 3-way auction format.' },
      { id: 'log-2', timestamp: 1729800000000, event: 'Championship Decided', details: 'Nishanth crowned tournament champion.' },
    ],
    createdAt: 1729000000000,
    updatedAt: 1729800000000,
  },
  {
    id: 'tourn-friday-night-party-showdown',
    name: 'Friday Night Party Showdown',
    description: 'High-energy local multiplayer party battle with Dumb Charades and Who Am I guessing duels.',
    category: 'Gaming',
    logo: '🎉',
    themeColor: '#B68B68',
    season: 'Party Series',
    startDate: '2026-11-28',
    endDate: '2026-11-28',
    status: 'upcoming',
    franchiseIds: ['team-nishanth', 'team-ajmal', 'team-praneeth', 'team-nagulan'],
    gameModes: ['party'],
    partyConfig: {
      selectedGames: ['party_dumb_charades', 'party_who_am_i'],
      roundDuration: 60,
      totalRounds: 5,
    },
    progress: {
      percentage: 0,
      currentStage: 'Scheduled',
      completedStages: ['Setup'],
      totalStages: 3,
    },
    results: null,
    historyLog: [
      { id: 'log-1', timestamp: 1732100000000, event: 'Tournament Created', details: 'Party games selected and ready to launch.' },
    ],
    createdAt: 1732100000000,
    updatedAt: 1732100000000,
  },
];

export const tournamentHubService = {
  /**
   * Retrieves all tournaments from localStorage, or seeds default data if first run
   */
  getAllTournaments() {
    const storage = getStorage();
    if (!storage) return [...DEFAULT_TOURNAMENTS];

    try {
      const raw = storage.getItem(TOURNAMENT_STORAGE_KEY);
      if (!raw) {
        this._saveToStorage(DEFAULT_TOURNAMENTS);
        return [...DEFAULT_TOURNAMENTS];
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      this._saveToStorage(DEFAULT_TOURNAMENTS);
      return [...DEFAULT_TOURNAMENTS];
    } catch (e) {
      console.error('Failed to read tournaments from storage:', e);
      return [...DEFAULT_TOURNAMENTS];
    }
  },

  /**
   * Retrieves a single tournament by ID
   */
  getTournamentById(id) {
    if (!id) return null;
    const all = this.getAllTournaments();
    return all.find((t) => t.id === id) || null;
  },

  /**
   * Filtered lists by lifecycle status
   */
  getActiveTournaments() {
    return this.getAllTournaments().filter((t) => t.status === 'active' || t.status === 'paused');
  },

  getUpcomingTournaments() {
    return this.getAllTournaments().filter((t) => t.status === 'upcoming' || t.status === 'draft');
  },

  getCompletedTournaments() {
    return this.getAllTournaments().filter((t) => t.status === 'completed');
  },

  getArchivedTournaments() {
    return this.getAllTournaments().filter((t) => t.status === 'archived');
  },

  /**
   * Computes accurate telemetry statistics for the overview dashboard
   */
  getOverviewStats() {
    const all = this.getAllTournaments();
    const active = all.filter((t) => t.status === 'active' || t.status === 'paused');
    const completed = all.filter((t) => t.status === 'completed');
    const upcoming = all.filter((t) => t.status === 'upcoming' || t.status === 'draft');
    const archived = all.filter((t) => t.status === 'archived');

    // Calculate unique participating franchises
    const franchiseSet = new Set();
    all.forEach((t) => {
      if (Array.isArray(t.franchiseIds)) {
        t.franchiseIds.forEach((fId) => franchiseSet.add(fId));
      }
    });

    // Most recent tournament by updatedAt
    const sortedByUpdate = [...all].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const recentTournament = sortedByUpdate[0] || null;

    // Latest champion from completed tournaments
    const sortedCompleted = [...completed].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    const latestChampionTournament = sortedCompleted.find((t) => t.results?.championTeamName) || null;

    return {
      totalCount: all.length,
      activeCount: active.length,
      completedCount: completed.length,
      upcomingCount: upcoming.length,
      archivedCount: archived.length,
      totalParticipatingFranchises: franchiseSet.size,
      recentTournament,
      latestChampion: latestChampionTournament
        ? {
            tournamentId: latestChampionTournament.id,
            tournamentName: latestChampionTournament.name,
            teamId: latestChampionTournament.results.championTeamId,
            teamName: latestChampionTournament.results.championTeamName,
            teamColor: latestChampionTournament.results.championColor || '#D4B879',
            teamLogo: latestChampionTournament.results.championLogo || '👑',
            completedAt: latestChampionTournament.results.completedAt,
          }
        : null,
    };
  },

  /**
   * Validates tournament creation payload
   */
  validateTournament(data, existingTournaments = null) {
    const errors = {};
    const all = existingTournaments || this.getAllTournaments();

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.name = 'Tournament name is required.';
    } else if (data.name.trim().length < 3) {
      errors.name = 'Tournament name must be at least 3 characters.';
    } else if (data.name.trim().length > 60) {
      errors.name = 'Tournament name cannot exceed 60 characters.';
    }

    // Check duplicate name (case-insensitive, excluding current editing id)
    if (data.name) {
      const nameLower = data.name.trim().toLowerCase();
      const duplicate = all.find((t) => t.name.toLowerCase() === nameLower && t.id !== data.id);
      if (duplicate) {
        errors.name = 'A tournament with this name already exists.';
      }
    }

    // Franchises check
    if (!Array.isArray(data.franchiseIds) || data.franchiseIds.length < 2) {
      errors.franchises = 'At least 2 franchises must be selected for the tournament.';
    }

    // Game modes check
    if (!Array.isArray(data.gameModes) || data.gameModes.length === 0) {
      errors.gameModes = 'At least one arena mode (Auction, Battle, or Party) must be selected.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Creates a new tournament and saves to storage
   */
  createTournament(payload) {
    const all = this.getAllTournaments();
    const validation = this.validateTournament(payload, all);
    if (!validation.isValid) {
      throw new Error(Object.values(validation.errors)[0] || 'Invalid tournament data.');
    }

    const id = `tourn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    // Snapshot franchise details so tournament has independent historical data
    const activeFranchises = franchiseService.getActiveFranchises();
    const franchisesSnapshot = payload.franchiseIds
      .map((fId) => activeFranchises.find((f) => f.id === fId) || franchiseService.getFranchiseById(fId))
      .filter(Boolean);

    const newTournament = {
      id,
      name: payload.name.trim(),
      description: payload.description ? payload.description.trim() : '',
      category: payload.category || 'Cinema',
      logo: payload.logo || this.generateInitialsLogo(payload.name),
      themeColor: payload.themeColor || '#D4B879',
      season: payload.season ? payload.season.trim() : '',
      startDate: payload.startDate || null,
      endDate: payload.endDate || null,
      status: payload.status || 'upcoming', // 'draft' | 'upcoming'
      franchiseIds: [...payload.franchiseIds],
      franchisesSnapshot,
      gameModes: [...payload.gameModes],
      auctionConfig: payload.auctionConfig || null,
      battleConfig: payload.battleConfig || null,
      partyConfig: payload.partyConfig || null,
      arenaState: null,
      progress: {
        percentage: 0,
        currentStage: payload.status === 'draft' ? 'Draft' : 'Ready to Launch',
        completedStages: [],
        totalStages: payload.gameModes.length * 2,
      },
      results: null,
      historyLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: now,
          event: payload.status === 'draft' ? 'Draft Created' : 'Tournament Configured',
          details: `Created with ${payload.franchiseIds.length} franchises and modes: ${payload.gameModes.join(', ')}.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    all.unshift(newTournament);
    this._saveToStorage(all);
    notifySubscribers();

    return newTournament;
  },

  /**
   * Updates an existing tournament
   */
  updateTournament(id, updates) {
    const all = this.getAllTournaments();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) {
      throw new Error(`Tournament with ID "${id}" not found.`);
    }

    const current = all[idx];

    // Restrict editing certain fields if tournament is completed or active
    if (current.status === 'completed' && updates.franchiseIds) {
      throw new Error('Participating franchises cannot be altered on completed tournaments.');
    }

    // Validate if name changed
    if (updates.name && updates.name !== current.name) {
      const validation = this.validateTournament({ ...current, ...updates, id }, all);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors)[0]);
      }
    }

    const updated = {
      ...current,
      ...updates,
      updatedAt: Date.now(),
    };

    all[idx] = updated;
    this._saveToStorage(all);
    notifySubscribers();

    return updated;
  },

  /**
   * Sets lifecycle status with strict transition rules
   */
  setTournamentStatus(id, newStatus, extraNotes = '') {
    const allowed = ['draft', 'upcoming', 'active', 'paused', 'completed', 'archived'];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status "${newStatus}". Must be one of: ${allowed.join(', ')}`);
    }

    const tournament = this.getTournamentById(id);
    if (!tournament) throw new Error('Tournament not found.');

    const oldStatus = tournament.status;
    if (oldStatus === newStatus) return tournament;

    // Log the event
    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      event: `Status changed to ${newStatus.toUpperCase()}`,
      details: extraNotes || `Transitioned from ${oldStatus} to ${newStatus}.`,
    };

    const historyLog = Array.isArray(tournament.historyLog) ? [...tournament.historyLog, logEntry] : [logEntry];

    return this.updateTournament(id, {
      status: newStatus,
      historyLog,
    });
  },

  /**
   * Duplicates an existing tournament
   */
  duplicateTournament(id) {
    const source = this.getTournamentById(id);
    if (!source) throw new Error('Source tournament not found.');

    const all = this.getAllTournaments();
    let copyName = `${source.name} (Copy)`;
    let counter = 1;
    while (all.some((t) => t.name.toLowerCase() === copyName.toLowerCase())) {
      counter++;
      copyName = `${source.name} (Copy ${counter})`;
    }

    const newTournament = {
      ...source,
      id: `tourn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: copyName,
      status: 'upcoming',
      arenaState: null,
      progress: {
        percentage: 0,
        currentStage: 'Ready to Launch',
        completedStages: [],
        totalStages: source.gameModes?.length ? source.gameModes.length * 2 : 2,
      },
      results: null,
      historyLog: [
        {
          id: `log-${Date.now()}`,
          timestamp: Date.now(),
          event: 'Tournament Cloned',
          details: `Duplicated from "${source.name}".`,
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    all.unshift(newTournament);
    this._saveToStorage(all);
    notifySubscribers();

    return newTournament;
  },

  /**
   * Archives a tournament
   */
  archiveTournament(id) {
    return this.setTournamentStatus(id, 'archived', 'Tournament archived to archive storage.');
  },

  /**
   * Restores an archived tournament
   */
  restoreTournament(id) {
    const t = this.getTournamentById(id);
    if (!t) throw new Error('Tournament not found.');
    const fallbackStatus = t.results?.championTeamName ? 'completed' : 'upcoming';
    return this.setTournamentStatus(id, fallbackStatus, `Restored from archive to ${fallbackStatus}.`);
  },

  /**
   * Permanently deletes a tournament
   */
  deleteTournament(id) {
    const all = this.getAllTournaments();
    const target = all.find((t) => t.id === id);
    if (!target) throw new Error('Tournament not found.');

    // If active tournament pointer matches, clear it
    const activeId = this.getActiveTournamentId();
    if (activeId === id) {
      this.clearActiveTournamentId();
    }

    const filtered = all.filter((t) => t.id !== id);
    this._saveToStorage(filtered);
    notifySubscribers();

    return true;
  },

  /**
   * Active tournament pointer management
   */
  getActiveTournamentId() {
    const storage = getStorage();
    if (!storage) return null;
    return storage.getItem(ACTIVE_TOURNAMENT_ID_KEY) || null;
  },

  setActiveTournamentId(id) {
    const storage = getStorage();
    if (storage) {
      storage.setItem(ACTIVE_TOURNAMENT_ID_KEY, id);
    }
  },

  clearActiveTournamentId() {
    const storage = getStorage();
    if (storage) {
      storage.removeItem(ACTIVE_TOURNAMENT_ID_KEY);
    }
  },

  /**
   * Syncs active arena state (live auction or battle state) back to tournament record
   */
  syncArenaState(tournamentId, arenaType, state) {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) return null;

    const currentArenaState = tournament.arenaState || {};
    const updatedArenaState = {
      ...currentArenaState,
      [arenaType]: state,
    };

    // Calculate percentage based on stage progress
    let percentage = tournament.progress?.percentage || 0;
    let currentStage = tournament.progress?.currentStage || 'Active';

    if (arenaType === 'auction' && state?.items) {
      const sold = state.items.filter((i) => i.status === 'sold' || i.status === 'unsold').length;
      const total = state.items.length || 1;
      percentage = Math.round((sold / total) * (tournament.gameModes.includes('battle') ? 50 : 100));
      currentStage = sold >= total ? 'Auction Finished' : `Auction Lot ${sold + 1}/${total}`;
    } else if (arenaType === 'battle' && state?.schedule) {
      const done = (state.completedMatches || []).length;
      const total = state.schedule.length || 1;
      percentage = 50 + Math.round((done / total) * 50);
      currentStage = done >= total ? 'Battle Finished' : `Match ${done + 1}/${total}`;
    }

    return this.updateTournament(tournamentId, {
      arenaState: updatedArenaState,
      status: percentage >= 100 ? 'completed' : 'active',
      progress: {
        ...tournament.progress,
        percentage,
        currentStage,
      },
    });
  },

  /**
   * Records completed tournament outcome
   */
  recordTournamentResults(tournamentId, resultsData) {
    const tournament = this.getTournamentById(tournamentId);
    if (!tournament) throw new Error('Tournament not found.');

    const logEntry = {
      id: `log-${Date.now()}`,
      timestamp: Date.now(),
      event: 'Tournament Completed',
      details: `Winner: ${resultsData.championTeamName || 'Champion'} crowned.`,
    };

    const historyLog = Array.isArray(tournament.historyLog) ? [...tournament.historyLog, logEntry] : [logEntry];

    return this.updateTournament(tournamentId, {
      status: 'completed',
      results: {
        ...resultsData,
        completedAt: new Date().toISOString(),
      },
      progress: {
        percentage: 100,
        currentStage: 'Tournament Completed',
        completedStages: ['Setup', 'Competition', 'Final Results'],
        totalStages: 3,
      },
      historyLog,
    });
  },

  /**
   * Generates initials logo from name
   */
  generateInitialsLogo(name) {
    if (!name || typeof name !== 'string') return '🏆';
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  },

  /**
   * Export JSON
   */
  exportTournaments() {
    const tournaments = this.getAllTournaments();
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      platform: 'PLAYZONE Tournament Hub',
      count: tournaments.length,
      tournaments,
    };
    return JSON.stringify(data, null, 2);
  },

  /**
   * Import JSON
   */
  importTournaments(jsonString) {
    const parsed = JSON.parse(jsonString);
    const incoming = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.tournaments) ? parsed.tournaments : null;
    if (!incoming || incoming.length === 0) {
      throw new Error('Invalid JSON format: no tournaments found.');
    }

    const current = this.getAllTournaments();
    let importedCount = 0;
    let updatedCount = 0;

    incoming.forEach((item) => {
      if (!item.name) return;
      const existingIdx = current.findIndex((t) => t.id === item.id || t.name.toLowerCase() === item.name.toLowerCase());
      if (existingIdx >= 0) {
        current[existingIdx] = {
          ...current[existingIdx],
          ...item,
          updatedAt: Date.now(),
        };
        updatedCount++;
      } else {
        current.push({
          ...item,
          id: item.id || `tourn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
        importedCount++;
      }
    });

    this._saveToStorage(current);
    notifySubscribers();

    return {
      importedCount,
      updatedCount,
      totalCount: current.length,
    };
  },

  /**
   * Reset to initial sample tournaments
   */
  resetToDefaults() {
    this._saveToStorage(DEFAULT_TOURNAMENTS);
    notifySubscribers();
    return [...DEFAULT_TOURNAMENTS];
  },

  /**
   * Internal storage serializer
   */
  _saveToStorage(tournaments) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(TOURNAMENT_STORAGE_KEY, JSON.stringify(tournaments));
      } catch (e) {
        console.error('Failed to save tournaments to storage:', e);
      }
    }
  },
};
