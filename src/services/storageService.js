// Storage Service for LocalStorage persistence
import { 
  exportTournamentToJSON, 
  downloadJSONFile, 
  SAMPLE_TOURNAMENT_JSON,
  generateUniqueId 
} from './tournamentSchema';

const STORAGE_KEYS = {
  ACTIVE_AUCTION: 'bidbattle_active_auction',
  AUCTION_HISTORY: 'bidbattle_auction_history',
  CUSTOM_TOURNAMENTS: 'bidbattle_custom_tournaments',
  APP_SETTINGS: 'bidbattle_settings',
  GLOBAL_STATS: 'bidbattle_global_stats',
  SCHEMA_VERSION: 'bidbattle_schema_version',
};

export const storageService = {
  // Save current live auction state
  saveActiveAuction(auctionData) {
    try {
      if (!auctionData) {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_AUCTION);
        return;
      }
      localStorage.setItem(STORAGE_KEYS.ACTIVE_AUCTION, JSON.stringify(auctionData));
      this.updateGlobalStats(auctionData);
    } catch (e) {
      console.error('Failed to save active auction to localStorage:', e);
    }
  },

  // Load current active auction state
  loadActiveAuction() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_AUCTION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to parse active auction:', e);
      return null;
    }
  },

  // Clear current active auction
  clearActiveAuction() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_AUCTION);
    } catch (e) {
      console.error('Failed to clear active auction:', e);
    }
  },

  // Archive finished auction to history
  saveToHistory(auctionData) {
    try {
      const history = this.getAuctionHistory();
      const existingIdx = history.findIndex((a) => a.id === auctionData.id);
      
      const record = {
        ...auctionData,
        savedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        history[existingIdx] = record;
      } else {
        history.unshift(record);
      }

      // Limit to 20 past tournaments
      const trimmed = history.slice(0, 20);
      localStorage.setItem(STORAGE_KEYS.AUCTION_HISTORY, JSON.stringify(trimmed));
      this.updateGlobalStats(auctionData);
      return trimmed;
    } catch (e) {
      console.error('Failed to save to history:', e);
      return [];
    }
  },

  // Get all archived tournaments
  getAuctionHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUCTION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to read auction history:', e);
      return [];
    }
  },

  // Delete a specific tournament from history
  deleteFromHistory(id) {
    try {
      const history = this.getAuctionHistory().filter((a) => a.id !== id);
      localStorage.setItem(STORAGE_KEYS.AUCTION_HISTORY, JSON.stringify(history));
      return history;
    } catch (e) {
      console.error('Failed to delete tournament:', e);
      return [];
    }
  },

  // ==========================================
  // CUSTOM TOURNAMENT PRESETS MANAGEMENT (BIDBATTLE 6.0)
  // ==========================================

  // Get all saved custom tournaments
  getCustomTournaments() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOURNAMENTS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to read custom tournaments from localStorage:', e);
      return [];
    }
  },

  // Check if a tournament ID already exists among custom tournaments or built-in presets
  isTournamentIdDuplicate(id) {
    if (!id) return false;
    const list = this.getCustomTournaments();
    return list.some((t) => t.id === id);
  },

  // Save or update a custom tournament preset
  saveCustomTournament(tournament) {
    try {
      if (!tournament || !tournament.name) return false;
      const list = this.getCustomTournaments();
      const existingIdx = list.findIndex((t) => t.id === tournament.id);

      const record = {
        ...tournament,
        isCustom: true,
        updatedAt: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        list[existingIdx] = record;
      } else {
        list.unshift(record);
      }

      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOURNAMENTS, JSON.stringify(list));
      return record;
    } catch (e) {
      console.error('Failed to save custom tournament:', e);
      return false;
    }
  },

  // Delete a custom tournament preset (does NOT delete running auctions or history)
  deleteCustomTournament(id) {
    try {
      const list = this.getCustomTournaments().filter((t) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOURNAMENTS, JSON.stringify(list));
      return list;
    } catch (e) {
      console.error('Failed to delete custom tournament:', e);
      return this.getCustomTournaments();
    }
  },

  // Duplicate a custom tournament preset
  duplicateCustomTournament(id) {
    try {
      const list = this.getCustomTournaments();
      const target = list.find((t) => t.id === id);
      if (!target) return null;

      const newId = generateUniqueId('custom_tourn');
      const duplicated = {
        ...target,
        id: newId,
        name: `${target.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: (target.items || []).map((item, idx) => ({
          ...item,
          id: `${newId}_item_${idx + 1}`,
        })),
      };

      list.unshift(duplicated);
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOURNAMENTS, JSON.stringify(list));
      return duplicated;
    } catch (e) {
      console.error('Failed to duplicate custom tournament:', e);
      return null;
    }
  },

  // Export a custom tournament as JSON
  exportCustomTournament(tournament) {
    try {
      const exportData = exportTournamentToJSON(tournament);
      const filename = `bidbattle_${(tournament.name || 'custom_tournament').replace(/\s+/g, '_').toLowerCase()}.json`;
      return downloadJSONFile(exportData, filename);
    } catch (e) {
      console.error('Failed to export custom tournament:', e);
      return false;
    }
  },

  // Export all custom tournaments as backup JSON
  exportAllCustomTournaments() {
    try {
      const list = this.getCustomTournaments();
      const exportList = list.map((t) => exportTournamentToJSON(t));
      const backupData = {
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        type: 'bidbattle_custom_tournaments_backup',
        count: exportList.length,
        tournaments: exportList,
      };
      const filename = `bidbattle_custom_tournaments_backup_${Date.now()}.json`;
      return downloadJSONFile(backupData, filename);
    } catch (e) {
      console.error('Failed to export all custom tournaments:', e);
      return false;
    }
  },

  // Download official sample tournament JSON template
  downloadSampleTemplate() {
    return downloadJSONFile(SAMPLE_TOURNAMENT_JSON, 'bidbattle_sample_tournament_template.json');
  },

  // Global aggregate metrics (total auctions, players sold, biggest sale, teams created)
  getGlobalStats() {
    try {
      const stats = localStorage.getItem(STORAGE_KEYS.GLOBAL_STATS);
      if (stats) return JSON.parse(stats);

      return {
        totalAuctionsStarted: 0,
        totalItemsAuctioned: 0,
        totalItemsSold: 0,
        totalTeamsCreated: 0,
        highestSaleAmount: 0,
        highestSalePlayer: null,
        highestSaleCurrency: '₹',
      };
    } catch (e) {
      return {
        totalAuctionsStarted: 0,
        totalItemsAuctioned: 0,
        totalItemsSold: 0,
        totalTeamsCreated: 0,
        highestSaleAmount: 0,
        highestSalePlayer: null,
        highestSaleCurrency: '₹',
      };
    }
  },

  updateGlobalStats(auction) {
    if (!auction) return;
    try {
      const stats = this.getGlobalStats();
      const history = this.getAuctionHistory();
      
      // Calculate from history and active
      const allTournaments = [auction, ...history.filter(h => h.id !== auction.id)];
      
      let itemsSold = 0;
      let highestSale = stats.highestSaleAmount || 0;
      let highestPlayer = stats.highestSalePlayer;
      let highestCurr = stats.highestSaleCurrency || '₹';

      allTournaments.forEach(t => {
        if (t.items) {
          t.items.forEach(item => {
            if (item.status === 'sold') {
              itemsSold++;
              if (item.soldPrice && item.soldPrice > highestSale) {
                highestSale = item.soldPrice;
                highestPlayer = `${item.name} (${t.name})`;
                highestCurr = t.currency?.symbol || '₹';
              }
            }
          });
        }
      });

      const updated = {
        totalAuctionsStarted: allTournaments.length,
        totalItemsAuctioned: allTournaments.reduce((acc, t) => acc + (t.items?.length || 0), 0),
        totalItemsSold: itemsSold,
        totalTeamsCreated: allTournaments.reduce((acc, t) => acc + (t.teams?.length || 0), 0),
        highestSaleAmount: highestSale,
        highestSalePlayer: highestPlayer,
        highestSaleCurrency: highestCurr,
      };

      localStorage.setItem(STORAGE_KEYS.GLOBAL_STATS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update stats:', e);
    }
  },

  // Export auction as JSON file download
  exportAuctionJSON(auctionData) {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auctionData, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `bidbattle_${(auctionData.name || 'auction').replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      return true;
    } catch (e) {
      console.error('JSON export error:', e);
      return false;
    }
  },

  // Parse imported JSON
  parseImportedJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.name || !Array.isArray(parsed.items) || !Array.isArray(parsed.teams)) {
        throw new Error('Invalid auction file format. Missing name, items, or teams.');
      }
      return { success: true, data: parsed };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
