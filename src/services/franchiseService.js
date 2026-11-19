/**
 * PLAYZONE — Centralized Franchise Management Service
 * Manages franchise creation, editing, deletion, duplication, archiving,
 * independent game selection persistence, import/export, and contract validation.
 */

export const FRANCHISE_STORAGE_KEY = 'playzone_franchises_v1';
export const AUCTION_SELECTION_KEY = 'playzone_auction_selected_franchises_v1';
export const BATTLE_SELECTION_KEY = 'playzone_battle_selected_franchises_v1';

export const DEFAULT_FRANCHISES = [
  {
    id: 'team-nishanth',
    name: 'Nishanth',
    shortName: 'NIS',
    color: '#8875A8',
    secondaryColor: '#5C4A7A',
    logo: '👑',
    owner: 'Nishanth',
    description: 'Tactical mastermind and calculating bidder with championship instincts.',
    isDefault: true,
    isArchived: false,
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
  },
  {
    id: 'team-ajmal',
    name: 'Ajmal',
    shortName: 'AJM',
    color: '#71999B',
    secondaryColor: '#4A6E70',
    logo: '⚡',
    owner: 'Ajmal',
    description: 'High-octane auction specialist known for lightning-fast bid escalation.',
    isDefault: true,
    isArchived: false,
    createdAt: 1700000000001,
    updatedAt: 1700000000001,
  },
  {
    id: 'team-praneeth',
    name: 'Praneeth',
    shortName: 'PRA',
    color: '#B68B68',
    secondaryColor: '#7A5436',
    logo: '🔥',
    owner: 'Praneeth',
    description: 'Persistent powerhouse franchise with an eagle eye for star MVP value.',
    isDefault: true,
    isArchived: false,
    createdAt: 1700000000002,
    updatedAt: 1700000000002,
  },
  {
    id: 'team-nagulan',
    name: 'Nagulan',
    shortName: 'NAG',
    color: '#84977B',
    secondaryColor: '#55664D',
    logo: '🛡️',
    owner: 'Nagulan',
    description: 'Disciplined defensive anchor focused on budget longevity and tactical depth.',
    isDefault: true,
    isArchived: false,
    createdAt: 1700000000003,
    updatedAt: 1700000000003,
  },
];

/**
 * Validates a HEX color format
 */
export const isValidHexColor = (color) => {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
};

/**
 * Calculates accessible foreground contrast text color (black vs white)
 */
export const getContrastTextColor = (hexColor) => {
  if (!isValidHexColor(hexColor)) return '#F5F3EE';
  let hex = hexColor.trim().replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  // Perceived luminance formula (ITU-R BT.709)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#111827' : '#F5F3EE';
};

/**
 * Generates an initials-based avatar text from name
 */
export const generateInitialsLogo = (name) => {
  if (!name || typeof name !== 'string') return '🛡️';
  const clean = name.trim();
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return clean.slice(0, 2).toUpperCase();
  }
  return words.slice(0, 3).map((w) => w[0]).join('').toUpperCase();
};

/**
 * Safe LocalStorage accessor compatible with browser and Node test environments
 */
const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
};
const notifySubscribers = () => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('playzone_franchises_updated'));
    } catch {
      // Ignore if event dispatch fails in test environments
    }
  }
};

export const franchiseService = {
  /**
   * Initializes and returns all franchises from LocalStorage.
   * Performs safe auto-migration from default franchises without duplicate creation.
   */
  getAllFranchises({ includeArchived = true } = {}) {
    const storage = getStorage();
    try {
      if (!storage) {
        return includeArchived ? [...DEFAULT_FRANCHISES] : DEFAULT_FRANCHISES.filter((f) => !f.isArchived);
      }

      const raw = storage.getItem(FRANCHISE_STORAGE_KEY);
      if (!raw) {
        // First-time initialization
        this._saveToStorage(DEFAULT_FRANCHISES);
        return includeArchived ? [...DEFAULT_FRANCHISES] : DEFAULT_FRANCHISES.filter((f) => !f.isArchived);
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        this._saveToStorage(DEFAULT_FRANCHISES);
        return includeArchived ? [...DEFAULT_FRANCHISES] : DEFAULT_FRANCHISES.filter((f) => !f.isArchived);
      }

      // Ensure all 4 default franchises exist if never deleted
      const existingIds = new Set(parsed.map((f) => f.id));
      let needsSave = false;
      const merged = [...parsed];

      DEFAULT_FRANCHISES.forEach((def) => {
        if (!existingIds.has(def.id) && parsed.length < 2) {
          merged.push(def);
          needsSave = true;
        }
      });

      if (needsSave) {
        this._saveToStorage(merged);
      }

      return includeArchived ? merged : merged.filter((f) => !f.isArchived);
    } catch (e) {
      console.error('Failed to load franchises from storage:', e);
      return includeArchived ? [...DEFAULT_FRANCHISES] : DEFAULT_FRANCHISES.filter((f) => !f.isArchived);
    }
  },

  /**
   * Returns all active, unarchived franchises
   */
  getActiveFranchises() {
    return this.getAllFranchises({ includeArchived: false });
  },

  /**
   * Finds a single franchise by unique ID
   */
  getFranchiseById(id) {
    if (!id) return null;
    const all = this.getAllFranchises({ includeArchived: true });
    return all.find((f) => f.id === id) || null;
  },

  /**
   * Validates franchise data before create/update
   */
  validateFranchise(data, currentId = null) {
    const errors = {};
    const name = String(data?.name || '').trim();
    const shortName = String(data?.shortName || '').trim();
    const color = String(data?.color || '').trim();
    const secondaryColor = String(data?.secondaryColor || '').trim();

    if (!name) {
      errors.name = 'Franchise name is required';
    } else if (name.length < 2) {
      errors.name = 'Franchise name must be at least 2 characters';
    } else {
      // Check case-insensitive uniqueness
      const all = this.getAllFranchises({ includeArchived: true });
      const duplicateName = all.some(
        (f) => f.id !== currentId && f.name.toLowerCase() === name.toLowerCase()
      );
      if (duplicateName) {
        errors.name = `A franchise named "${name}" already exists`;
      }
    }

    if (!shortName) {
      errors.shortName = 'Abbreviation / Short Name is required';
    } else if (shortName.length > 6) {
      errors.shortName = 'Abbreviation must be 6 characters or fewer';
    } else {
      // Check abbreviation uniqueness
      const all = this.getAllFranchises({ includeArchived: true });
      const duplicateAbbrev = all.some(
        (f) => f.id !== currentId && f.shortName.toLowerCase() === shortName.toLowerCase()
      );
      if (duplicateAbbrev) {
        errors.shortName = `Abbreviation "${shortName}" is already in use`;
      }
    }

    if (!color) {
      errors.color = 'Primary color is required';
    } else if (!isValidHexColor(color)) {
      errors.color = 'Primary color must be a valid HEX code (e.g. #8875A8)';
    }

    if (secondaryColor && !isValidHexColor(secondaryColor)) {
      errors.secondaryColor = 'Secondary color must be a valid HEX code';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },

  /**
   * Creates a new franchise
   */
  createFranchise(data) {
    const validation = this.validateFranchise(data);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const name = data.name.trim();
    const shortName = data.shortName.trim().toUpperCase();
    const color = data.color.trim();
    const secondaryColor = (data.secondaryColor || '').trim();
    const logo = data.logo ? String(data.logo).trim() : generateInitialsLogo(name);
    const description = (data.description || '').trim();
    const owner = (data.owner || name).trim();

    // Generate stable unique ID
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const id = `team-${slug || 'franchise'}-${Date.now().toString(36)}`;

    const newFranchise = {
      id,
      name,
      shortName,
      color,
      secondaryColor: secondaryColor || null,
      logo,
      owner,
      description,
      isDefault: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const all = this.getAllFranchises({ includeArchived: true });
    all.push(newFranchise);
    this._saveToStorage(all);
    notifySubscribers();

    return newFranchise;
  },

  /**
   * Updates an existing franchise
   */
  updateFranchise(id, data) {
    const existing = this.getFranchiseById(id);
    if (!existing) {
      throw new Error(`Franchise with ID "${id}" not found.`);
    }

    const validation = this.validateFranchise(data, id);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0];
      throw new Error(firstError);
    }

    const all = this.getAllFranchises({ includeArchived: true });
    const idx = all.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('Franchise not found');

    const updated = {
      ...all[idx],
      name: data.name.trim(),
      shortName: data.shortName.trim().toUpperCase(),
      color: data.color.trim(),
      secondaryColor: data.secondaryColor ? data.secondaryColor.trim() : null,
      logo: data.logo ? String(data.logo).trim() : generateInitialsLogo(data.name),
      owner: (data.owner || data.name).trim(),
      description: (data.description || '').trim(),
      updatedAt: Date.now(),
    };

    all[idx] = updated;
    this._saveToStorage(all);
    notifySubscribers();

    return updated;
  },

  /**
   * Duplicates an existing franchise with suggested unique name and abbreviation
   */
  duplicateFranchise(id) {
    const source = this.getFranchiseById(id);
    if (!source) {
      throw new Error(`Franchise with ID "${id}" not found.`);
    }

    const all = this.getAllFranchises({ includeArchived: true });

    // Suggest new unique name
    let copyName = `${source.name} Copy`;
    let counter = 2;
    while (all.some((f) => f.name.toLowerCase() === copyName.toLowerCase())) {
      copyName = `${source.name} Copy ${counter++}`;
    }

    // Suggest new unique abbreviation
    let copyShort = `${source.shortName.slice(0, 3)}C`;
    let abbrevCounter = 2;
    while (all.some((f) => f.shortName.toLowerCase() === copyShort.toLowerCase())) {
      copyShort = `${source.shortName.slice(0, 2)}C${abbrevCounter++}`;
      if (copyShort.length > 5) {
        copyShort = `C${Date.now().toString(36).slice(-3).toUpperCase()}`;
      }
    }

    return this.createFranchise({
      name: copyName,
      shortName: copyShort,
      color: source.color,
      secondaryColor: source.secondaryColor,
      logo: source.logo,
      owner: source.owner,
      description: source.description ? `${source.description} (Duplicate)` : '',
    });
  },

  /**
   * Archives a franchise so it cannot be selected for future tournaments,
   * while preserving historical results
   */
  archiveFranchise(id) {
    const all = this.getAllFranchises({ includeArchived: true });
    const target = all.find((f) => f.id === id);
    if (!target) throw new Error('Franchise not found');

    const activeRemaining = all.filter((f) => !f.isArchived && f.id !== id);
    if (activeRemaining.length < 2) {
      throw new Error('Cannot archive franchise: At least 2 active franchises are required for tournaments.');
    }

    target.isArchived = true;
    target.updatedAt = Date.now();
    this._saveToStorage(all);

    // Remove from active game selections if present
    this._cleanFromGameSelections(id);
    notifySubscribers();

    return target;
  },

  /**
   * Restores an archived franchise
   */
  unarchiveFranchise(id) {
    const all = this.getAllFranchises({ includeArchived: true });
    const target = all.find((f) => f.id === id);
    if (!target) throw new Error('Franchise not found');

    target.isArchived = false;
    target.updatedAt = Date.now();
    this._saveToStorage(all);
    notifySubscribers();

    return target;
  },

  /**
   * Checks whether a franchise is currently participating in an active live tournament
   */
  isFranchiseInActiveTournament(id) {
    const storage = getStorage();
    if (!storage) return false;
    try {
      // 1. Check active auction
      const activeAuctionRaw = storage.getItem('bidbattle_active_auction');
      if (activeAuctionRaw) {
        const activeAuction = JSON.parse(activeAuctionRaw);
        const inAuction = (activeAuction?.teams || []).some((t) => t.id === id || t.name === id);
        if (inAuction) return true;
      }

      // 2. Check active battle
      const activeBattleRaw = storage.getItem('bidbattle_battle_arena_v1');
      if (activeBattleRaw) {
        const activeBattle = JSON.parse(activeBattleRaw);
        if (activeBattle?.phase && activeBattle.phase !== 'results') {
          const inBattle = (activeBattle?.teams || []).some((t) => t.id === id || t.name === id);
          if (inBattle) return true;
        }
      }
    } catch (e) {
      console.warn('Error checking active tournament for franchise:', e);
    }
    return false;
  },

  /**
   * Returns tournament participation count across auction history
   */
  getTournamentParticipationCount(id) {
    const storage = getStorage();
    if (!storage) return 0;
    let count = 0;
    try {
      const historyRaw = storage.getItem('bidbattle_auction_history');
      if (historyRaw) {
        const history = JSON.parse(historyRaw);
        if (Array.isArray(history)) {
          history.forEach((h) => {
            const hasTeam = (h.teams || []).some((t) => t.id === id || t.name === id);
            if (hasTeam) count++;
          });
        }
      }
    } catch {
      // Ignore count calculation errors
    }
    return count;
  },

  /**
   * Deletes a franchise.
   * Safety checks:
   * - Cannot delete if used in an active tournament.
   * - Cannot delete if fewer than 2 franchises would remain.
   */
  deleteFranchise(id) {
    const all = this.getAllFranchises({ includeArchived: true });
    const target = all.find((f) => f.id === id);
    if (!target) throw new Error('Franchise not found');

    if (this.isFranchiseInActiveTournament(id)) {
      throw new Error(
        `Cannot delete "${target.name}" because it is currently participating in an active live tournament. Complete or reset the tournament first.`
      );
    }

    const remainingActive = all.filter((f) => f.id !== id && !f.isArchived);
    if (remainingActive.length < 2) {
      throw new Error(
        'Cannot delete franchise: A minimum of 2 active franchises must always remain available.'
      );
    }

    const filtered = all.filter((f) => f.id !== id);
    this._saveToStorage(filtered);

    // Remove from saved game selections
    this._cleanFromGameSelections(id);
    notifySubscribers();

    return true;
  },

  /**
   * Gets selected franchise IDs for a specific game ('auction' | 'battle')
   */
  getSelectedFranchiseIds(game = 'auction') {
    const storageKey = game === 'battle' ? BATTLE_SELECTION_KEY : AUCTION_SELECTION_KEY;
    const active = this.getActiveFranchises();
    const activeIds = new Set(active.map((f) => f.id));
    const storage = getStorage();

    try {
      if (storage) {
        const raw = storage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            // Keep only IDs that are currently active
            const valid = parsed.filter((id) => activeIds.has(id));
            if (valid.length >= 2) {
              return valid;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to read selected franchise IDs:', e);
    }

    // Default to first 4 active franchises or all active if fewer
    return active.slice(0, Math.min(4, active.length)).map((f) => f.id);
  },

  /**
   * Saves selected franchise IDs independently for a specific game ('auction' | 'battle')
   */
  saveSelectedFranchiseIds(game = 'auction', ids) {
    if (!Array.isArray(ids)) return;
    const storageKey = game === 'battle' ? BATTLE_SELECTION_KEY : AUCTION_SELECTION_KEY;
    const storage = getStorage();
    try {
      if (storage) {
        storage.setItem(storageKey, JSON.stringify(ids));
      }
    } catch (e) {
      console.error('Failed to save selected franchise IDs:', e);
    }
  },

  /**
   * Gets full franchise objects for the selected IDs of a game
   */
  getSelectedFranchises(game = 'auction') {
    const ids = this.getSelectedFranchiseIds(game);
    const active = this.getActiveFranchises();
    const map = new Map(active.map((f) => [f.id, f]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  },

  /**
   * Exports all franchises as a clean JSON format
   */
  exportFranchises() {
    const franchises = this.getAllFranchises({ includeArchived: true });
    const payload = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      generator: 'PLAYZONE Franchise Manager',
      franchises,
    };
    return JSON.stringify(payload, null, 2);
  },

  /**
   * Imports franchises from JSON with conflict resolution and validation
   */
  importFranchises(jsonString) {
    let parsed;
    try {
      parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
    } catch {
      throw new Error('Invalid JSON format. Please upload a valid JSON file.');
    }

    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.franchises)
      ? parsed.franchises
      : null;

    if (!candidates || candidates.length === 0) {
      throw new Error('No valid franchise records found in the uploaded file.');
    }

    const current = this.getAllFranchises({ includeArchived: true });
    const existingById = new Map(current.map((f) => [f.id, f]));
    const existingByName = new Map(current.map((f) => [f.name.toLowerCase(), f]));

    let importedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    candidates.forEach((cand) => {
      const name = String(cand.name || '').trim();
      if (!name) {
        skippedCount++;
        return;
      }

      const shortName = String(cand.shortName || generateInitialsLogo(name)).trim().toUpperCase().slice(0, 6);
      const color = isValidHexColor(cand.color) ? cand.color.trim() : '#71999B';
      const secondaryColor = isValidHexColor(cand.secondaryColor) ? cand.secondaryColor.trim() : null;
      const logo = cand.logo ? String(cand.logo).trim() : generateInitialsLogo(name);

      const existing = existingById.get(cand.id) || existingByName.get(name.toLowerCase());

      if (existing) {
        // Update existing record
        existing.shortName = shortName;
        existing.color = color;
        existing.secondaryColor = secondaryColor;
        existing.logo = logo;
        existing.description = cand.description || existing.description;
        existing.updatedAt = Date.now();
        updatedCount++;
      } else {
        // Create new record
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newId = `team-${slug || 'franchise'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
        const newRecord = {
          id: newId,
          name,
          shortName,
          color,
          secondaryColor,
          logo,
          owner: cand.owner || name,
          description: cand.description || '',
          isDefault: false,
          isArchived: Boolean(cand.isArchived),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        current.push(newRecord);
        existingById.set(newId, newRecord);
        existingByName.set(name.toLowerCase(), newRecord);
        importedCount++;
      }
    });

    this._saveToStorage(current);
    notifySubscribers();

    return {
      importedCount,
      updatedCount,
      skippedCount,
      totalCount: current.length,
    };
  },

  /**
   * Resets franchises back to the 4 default franchises (safe development/recovery fallback)
   */
  resetToDefaults() {
    this._saveToStorage(DEFAULT_FRANCHISES);
    this.saveSelectedFranchiseIds('auction', DEFAULT_FRANCHISES.map((t) => t.id));
    this.saveSelectedFranchiseIds('battle', DEFAULT_FRANCHISES.map((t) => t.id));
    notifySubscribers();
    return [...DEFAULT_FRANCHISES];
  },

  /**
   * Internal helper to clean deleted/archived ID from selection keys
   */
  _cleanFromGameSelections(franchiseId) {
    ['auction', 'battle'].forEach((game) => {
      const selected = this.getSelectedFranchiseIds(game);
      if (selected.includes(franchiseId)) {
        const filtered = selected.filter((id) => id !== franchiseId);
        // Ensure at least 2 are selected if possible
        if (filtered.length < 2) {
          const active = this.getActiveFranchises();
          const fallback = active.slice(0, Math.min(4, active.length)).map((f) => f.id);
          this.saveSelectedFranchiseIds(game, fallback);
        } else {
          this.saveSelectedFranchiseIds(game, filtered);
        }
      }
    });
  },

  getContrastTextColor,
  generateInitialsLogo,
  isValidHexColor,

  /**
   * Internal storage serializer
   */
  _saveToStorage(franchises) {
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(FRANCHISE_STORAGE_KEY, JSON.stringify(franchises));
      } catch (e) {
        console.error('Failed to save franchises to localStorage:', e);
      }
    }
  },
};
