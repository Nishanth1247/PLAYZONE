/**
 * PLAYZONE BROADCAST SERVICE
 * Manages broadcast mode presentation settings, audio triggers,
 * and unified state extraction for tournaments and standalone arenas.
 * Zero state mutation of gameplay or tournament records.
 */

import { soundService } from './soundService.js';

const BROADCAST_SETTINGS_KEY = 'playzone_broadcast_settings_v1';

export const DEFAULT_BROADCAST_SETTINGS = {
  animationIntensity: 'normal', // 'normal' | 'reduced'
  soundEnabled: true,
  autoAdvance: false,
  slideDuration: 8, // in seconds
  scoreboardStyle: 'compact', // 'compact' | 'expanded'
  showExtraStats: true,
};

class BroadcastService {
  constructor() {
    this.settings = this.loadSettings();
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(BROADCAST_SETTINGS_KEY);
      if (saved) {
        return { ...DEFAULT_BROADCAST_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to load broadcast settings, using defaults', e);
    }
    return { ...DEFAULT_BROADCAST_SETTINGS };
  }

  getSettings() {
    return { ...this.settings };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(BROADCAST_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.warn('Failed to persist broadcast settings', e);
    }
    return this.getSettings();
  }

  resetSettings() {
    this.settings = { ...DEFAULT_BROADCAST_SETTINGS };
    try {
      localStorage.removeItem(BROADCAST_SETTINGS_KEY);
    } catch (e) {
      console.warn('Failed to clear broadcast settings', e);
    }
    return this.getSettings();
  }

  // Audio effects dispatcher (respects user's soundEnabled setting and soundService mute state)
  playAudio(effectName) {
    if (!this.settings.soundEnabled) return;
    try {
      switch (effectName) {
        case 'intro':
        case 'chime':
          soundService.playBid();
          break;
        case 'countdown':
        case 'tick':
          soundService.playTick();
          break;
        case 'urgent_countdown':
          soundService.playUrgentTick();
          break;
        case 'sold':
        case 'gavel':
          soundService.playSold();
          break;
        case 'unsold':
        case 'buzzer':
          soundService.playUnsold();
          break;
        case 'victory':
        case 'fanfare':
          soundService.playEvent();
          break;
        default:
          soundService.play(effectName);
          break;
      }
    } catch (e) {
      console.warn('Broadcast sound trigger error:', e);
    }
  }

  /**
   * Derive ranking / standings from tournament or standalone battle/auction state.
   * Handles ties and joint champions cleanly without inventing fake tiebreaks.
   */
  getStandings(tournament, auctionState, battleState) {
    // 1. If tournament already has official results:
    if (tournament?.results?.standings && tournament.results.standings.length > 0) {
      return tournament.results.standings;
    }

    // 2. If battle arena active or finished:
    if (battleState?.teams && battleState.teams.length > 0) {
      const teams = [...battleState.teams];
      // Sort by points desc, then wins desc, then net goal/score differential
      teams.sort((a, b) => {
        const ptsA = Number(a.points) || 0;
        const ptsB = Number(b.points) || 0;
        if (ptsB !== ptsA) return ptsB - ptsA;
        const winsA = Number(a.wins) || 0;
        const winsB = Number(b.wins) || 0;
        if (winsB !== winsA) return winsB - winsA;
        return (Number(b.purse) || 0) - (Number(a.purse) || 0);
      });

      return teams.map((t, idx) => ({
        rank: idx + 1,
        teamId: t.id,
        teamName: t.name,
        color: t.color,
        logo: t.logo || t.avatar,
        matchesPlayed: (t.wins || 0) + (t.draws || 0) + (t.losses || 0),
        wins: t.wins || 0,
        draws: t.draws || 0,
        losses: t.losses || 0,
        points: t.points || 0,
        purseRemaining: t.purse || 0,
        squadCount: t.squad?.length || 0,
      }));
    }

    // 3. If live auction state:
    if (auctionState?.teams && auctionState.teams.length > 0) {
      const teams = [...auctionState.teams];
      teams.sort((a, b) => (b.squad?.length || 0) - (a.squad?.length || 0));
      return teams.map((t, idx) => ({
        rank: idx + 1,
        teamId: t.id,
        teamName: t.name,
        color: t.color,
        logo: t.logo,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: t.squad?.length || 0,
        purseRemaining: t.purse || 0,
        squadCount: t.squad?.length || 0,
      }));
    }

    // 4. Fallback to tournament franchise snapshots
    if (tournament?.franchisesSnapshot && tournament.franchisesSnapshot.length > 0) {
      return tournament.franchisesSnapshot.map((f, idx) => ({
        rank: idx + 1,
        teamId: f.id,
        teamName: f.name,
        color: f.color,
        logo: f.logo,
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        points: 0,
        purseRemaining: f.startingPurse || f.purse || 100,
        squadCount: 0,
      }));
    }

    return [];
  }

  /**
   * Identify champions (supports joint champions if top teams share identical points).
   */
  getChampions(standings) {
    if (!standings || standings.length === 0) return [];
    const topPoints = standings[0].points;
    // All teams sharing the top score are joint champions
    return standings.filter((s) => s.points === topPoints);
  }
}

export const broadcastService = new BroadcastService();
