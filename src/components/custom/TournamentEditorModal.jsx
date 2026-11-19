import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Layers, 
  Coins, 
  Sliders, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Upload,
  Eye,
  EyeOff,
  Clock,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { TeamBudgetConfig } from '../setup/TeamBudgetConfig';
import { FIXED_TEAMS } from '../../services/presets';
import { franchiseService } from '../../services/franchiseService';
import { generateUniqueId } from '../../services/tournamentSchema';
import { toast } from 'sonner';

export const TournamentEditorModal = ({
  isOpen,
  tournament = null, // null means creating a new tournament from scratch
  initialMode = 'edit_only', // 'edit_only' | 'edit_and_play'
  onClose,
  onSave,
  onSaveAndLaunch,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'roster' | 'budgets'
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Form State
  const [tourneyId, setTourneyId] = useState(() => tournament?.id || generateUniqueId('custom_tourney'));
  const [name, setName] = useState(() => tournament?.name || 'My Custom Tournament');
  const [category, setCategory] = useState(() => tournament?.category || 'Custom Tournament');
  const [description, setDescription] = useState(() => tournament?.description || 'Curated tournament for auction battle.');
  const [scoreLabel, setScoreLabel] = useState(() => tournament?.scoreLabel || 'Power Rating');
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    const s = tournament?.currency?.symbol ?? tournament?.currency;
    return typeof s === 'string' ? s : '₹';
  });
  const [currencyUnit, setCurrencyUnit] = useState(() => {
    const u = tournament?.currency?.unit ?? tournament?.currencyUnit;
    return typeof u === 'string' ? u : 'Cr';
  });
  const [currencyName, setCurrencyName] = useState(() => {
    const n = tournament?.currency?.name ?? tournament?.currency;
    return typeof n === 'string' ? n : 'INR';
  });

  // Rules
  const [minSquadSize, setMinSquadSize] = useState(() => tournament?.rules?.minSquadSize || 2);
  const [maxSquadSize, setMaxSquadSize] = useState(() => tournament?.rules?.maxSquadSize || 8);
  const [countdownDuration, setCountdownDuration] = useState(() => tournament?.rules?.countdownDuration || 20);
  const [hideRatings, setHideRatings] = useState(() => Boolean(tournament?.rules?.hideRatingsDuringAuction));

  // Entries State
  const [entries, setEntries] = useState(() => {
    const raw = tournament?.items || tournament?.entries || [];
    if (raw.length > 0) {
      return raw.map((item, idx) => ({
        id: item.id || `lot_${idx + 1}`,
        name: item.name || `Lot ${idx + 1}`,
        role: item.role || item.category || 'Contender',
        category: item.category || 'General',
        basePrice: Number(item.basePrice) || 1.0,
        rating: Number(item.rating) || 85,
        desc: item.desc || '',
        imageUrl: item.imageUrl || '',
      }));
    }
    // Default starter lots for a fresh tournament
    return [
      { id: 'lot_1', name: 'Elite Champion', role: 'Hero', category: 'Gold', basePrice: 2.0, rating: 95, desc: 'Proven leader' },
      { id: 'lot_2', name: 'Tactical Striker', role: 'Hero', category: 'Silver', basePrice: 1.5, rating: 88, desc: 'High impact player' },
      { id: 'lot_3', name: 'Mastermind Specialist', role: 'Hero', category: 'Silver', basePrice: 1.0, rating: 84, desc: 'Strategic anchor' },
      { id: 'lot_4', name: 'Rising Star', role: 'Hero', category: 'Bronze', basePrice: 0.5, rating: 78, desc: 'Emerging talent' },
    ];
  });

  // Team Budgets State
  const [budgetConfigState, setBudgetConfigState] = useState(() => {
    const defaultPurse = tournament?.teamBudgets?.defaultPurse || 100;
    const activeFranchises = franchiseService.getActiveFranchises();
    const sourceFranchises = activeFranchises.length >= 2 ? activeFranchises : FIXED_TEAMS;
    const baseTeams = sourceFranchises.map((ft) => {
      const existing = tournament?.teamBudgets?.teams?.find(
        (t) => t.id === ft.id || t.name?.toLowerCase() === ft.name.toLowerCase()
      ) || tournament?.teams?.find(
        (t) => t.id === ft.id || t.name?.toLowerCase() === ft.name.toLowerCase()
      );
      const p = Number(existing?.purse || existing?.initialPurse || defaultPurse);
      return {
        ...ft,
        initialPurse: p,
        purse: p,
      };
    });
    return {
      isValid: true,
      teams: baseTeams,
      totalPurse: baseTeams.reduce((sum, t) => sum + t.purse, 0),
    };
  });

  // Quick lot adding state
  const [newLotName, setNewLotName] = useState('');
  const [newLotRole, setNewLotRole] = useState('Hero');
  const [newLotBasePrice, setNewLotBasePrice] = useState('1.0');
  const [newLotRating, setNewLotRating] = useState('85');

  const handleAddLot = () => {
    if (!newLotName.trim()) {
      toast.error('Lot name is required');
      return;
    }
    const baseP = parseFloat(newLotBasePrice);
    const r = parseFloat(newLotRating);
    if (isNaN(baseP) || baseP <= 0) {
      toast.error('Base price must be positive');
      return;
    }
    if (isNaN(r) || r < 0 || r > 100) {
      toast.error('Rating must be between 0 and 100');
      return;
    }

    const newEntry = {
      id: generateUniqueId('lot'),
      name: newLotName.trim(),
      role: newLotRole.trim() || 'Lot',
      category: category || 'Custom',
      basePrice: baseP,
      rating: r,
      desc: '',
      imageUrl: '',
    };

    setEntries((prev) => [...prev, newEntry]);
    setNewLotName('');
    setNewLotRole('Hero');
    setNewLotBasePrice('1.0');
    setNewLotRating('85');
    toast.success(`Added lot: ${newEntry.name}`);
  };

  const handleDeleteLot = (idx) => {
    if (entries.length <= 1) {
      toast.error('Tournament must have at least one lot');
      return;
    }
    setEntries((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDuplicateLot = (idx) => {
    const original = entries[idx];
    const clone = {
      ...original,
      id: generateUniqueId('lot'),
      name: `${original.name} (Copy)`,
    };
    const next = [...entries];
    next.splice(idx + 1, 0, clone);
    setEntries(next);
    toast.success(`Duplicated lot: ${original.name}`);
  };

  const handleMoveLot = (idx, direction) => {
    if (
      (direction === -1 && idx === 0) ||
      (direction === 1 && idx === entries.length - 1)
    ) {
      return;
    }
    const next = [...entries];
    const temp = next[idx];
    next[idx] = next[idx + direction];
    next[idx + direction] = temp;
    setEntries(next);
  };

  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;
    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const addedLots = [];

    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length > 0 && parts[0]) {
        const lotName = parts[0];
        const lotRole = parts[1] || 'Hero';
        const lotBasePrice = parseFloat(parts[2]) || 1.0;
        const lotRating = parseFloat(parts[3]) || 85;

        addedLots.push({
          id: generateUniqueId('lot'),
          name: lotName,
          role: lotRole,
          category: category || 'Custom',
          basePrice: lotBasePrice > 0 ? lotBasePrice : 1.0,
          rating: lotRating >= 0 && lotRating <= 100 ? lotRating : 85,
          desc: '',
          imageUrl: '',
        });
      }
    }

    if (addedLots.length > 0) {
      setEntries((prev) => [...prev, ...addedLots]);
      setBulkText('');
      setShowBulkAdd(false);
      toast.success(`Added ${addedLots.length} lots from bulk input!`);
    } else {
      toast.error('No valid lines parsed. Format: Name, Category, BasePrice, Rating');
    }
  };

  const compileTournamentObject = () => {
    if (!name.trim()) {
      toast.error('Tournament name cannot be empty');
      return null;
    }
    if (entries.length === 0) {
      toast.error('Tournament must contain at least 1 lot');
      return null;
    }
    if (!budgetConfigState.isValid) {
      toast.error('Please resolve budget configuration errors');
      return null;
    }

    const defaultPurse = budgetConfigState.teams?.[0]?.initialPurse || 100;

    return {
      id: tourneyId,
      name: name.trim(),
      category: category.trim() || 'Custom Tournament',
      description: description.trim(),
      scoreLabel: scoreLabel.trim() || 'Power Rating',
      currency: {
        symbol: (typeof currencySymbol === 'string' ? currencySymbol.trim() : currencySymbol?.symbol || '₹') || '₹',
        name: (typeof currencyName === 'string' ? currencyName.trim() : currencyName?.name || 'INR') || 'INR',
        unit: (typeof currencyUnit === 'string' ? currencyUnit.trim() : currencyUnit?.unit || 'Cr') || 'Cr',
        factor: 1,
      },
      rules: {
        minSquadSize: Number(minSquadSize) || 2,
        maxSquadSize: Number(maxSquadSize) || 8,
        countdownDuration: Number(countdownDuration) || 20,
        hideRatingsDuringAuction: Boolean(hideRatings),
        minIncrement: 1.0,
        soundEffects: true,
        antiSelfBidding: true,
        allowReAuction: true,
        randomEvents: true,
      },
      teamBudgets: {
        defaultPurse: Number(defaultPurse),
        teams: budgetConfigState.teams.map((t) => ({
          id: t.id,
          name: t.name,
          color: t.color,
          logo: t.logo,
          purse: Number(t.initialPurse || t.purse || defaultPurse),
          initialPurse: Number(t.initialPurse || t.purse || defaultPurse),
        })),
      },
      items: entries.map((e, idx) => ({
        ...e,
        id: e.id || `lot_${idx + 1}`,
        basePrice: Number(e.basePrice) || 1.0,
        rating: Number(e.rating) || 80,
      })),
      createdAt: tournament?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSaveOnly = () => {
    const compiled = compileTournamentObject();
    if (!compiled) return;
    if (onSave) {
      onSave(compiled);
    }
    toast.success(`Saved changes for "${compiled.name}"!`);
    onClose();
  };

  const handleSaveAndLaunch = () => {
    const compiled = compileTournamentObject();
    if (!compiled) return;
    if (onSaveAndLaunch) {
      onSaveAndLaunch(compiled);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl rounded-3xl battle-panel border border-brand-purple/50 shadow-2xl p-6 sm:p-8 overflow-hidden my-8 max-h-[92vh] flex flex-col"
      >
        {/* Glow ambient background halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-brand-cyan" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-battle-border relative z-10 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-cyan" />
                <span>Custom Tournament Editor</span>
              </Badge>
              <Badge variant="outline" className="border-battle-border text-battle-muted text-[10px] font-mono">
                {entries.length} Lots
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-broadcast uppercase tracking-wide">
              {name || 'Tournament Editor'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-battle-border/60 pb-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-broadcast tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'details'
                ? 'bg-brand-purple text-white shadow-glow-purple'
                : 'bg-battle-surface text-battle-muted hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Details & Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-broadcast tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'roster'
                ? 'bg-brand-purple text-white shadow-glow-purple'
                : 'bg-battle-surface text-battle-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Lots Roster ({entries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-broadcast tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'budgets'
                ? 'bg-brand-purple text-white shadow-glow-purple'
                : 'bg-battle-surface text-battle-muted hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Franchise Budgets</span>
          </button>
        </div>

        {/* Tab Contents: Scrollable area */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">

          {/* TAB 1: DETAILS & RULES */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Tournament Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tamil Heroes Auction"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Cinema / Football / Gaming"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your tournament rules, lore, and fun theme..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-sm focus:outline-none focus:border-brand-purple resize-none"
                />
              </div>

              {/* Currency & Scoring Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-battle-surface/40 border border-battle-border/60">
                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="₹"
                    className="w-full px-3 py-2 rounded-xl bg-battle-surface border border-battle-border text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Currency Unit
                  </label>
                  <input
                    type="text"
                    value={currencyUnit}
                    onChange={(e) => setCurrencyUnit(e.target.value)}
                    placeholder="Cr"
                    className="w-full px-3 py-2 rounded-xl bg-battle-surface border border-battle-border text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Scoring Metric Name
                  </label>
                  <input
                    type="text"
                    value={scoreLabel}
                    onChange={(e) => setScoreLabel(e.target.value)}
                    placeholder="Fanbase Rating / Power Rating"
                    className="w-full px-3 py-2 rounded-xl bg-battle-surface border border-battle-border text-white text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              {/* Squad & Timer Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Min Squad Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={minSquadSize}
                    onChange={(e) => setMinSquadSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Max Squad Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={maxSquadSize}
                    onChange={(e) => setMaxSquadSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block mb-1">
                    Timer Duration (Sec)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={countdownDuration}
                    onChange={(e) => setCountdownDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white font-mono text-sm focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              {/* Surprise Reveal toggle */}
              <div className="p-4 rounded-2xl bg-battle-surface/40 border border-battle-border/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">
                    Surprise Reveal (Blind Auction)
                  </span>
                  <span className="text-xs text-battle-muted">
                    Hide ratings and star power during bidding. Revealed dramatically upon lot sold!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHideRatings(!hideRatings)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    hideRatings ? 'bg-brand-purple' : 'bg-battle-card border border-battle-border'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      hideRatings ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: LOTS ROSTER */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              {/* Add lot bar & Bulk import button */}
              <div className="p-4 rounded-2xl bg-battle-surface/60 border border-battle-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-battle-muted font-broadcast">
                    Add Single Lot
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowBulkAdd(!showBulkAdd)}
                    className="text-xs border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10"
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    <span>{showBulkAdd ? 'Hide Bulk Paste' : 'Bulk Paste Lots'}</span>
                  </Button>
                </div>

                {showBulkAdd && (
                  <div className="p-3 rounded-xl bg-black/40 border border-brand-cyan/30 space-y-2">
                    <p className="text-[11px] text-battle-muted">
                      Paste lots line by line in format: <code className="text-brand-cyan">Name, Role/Category, BasePrice, Rating</code>
                    </p>
                    <textarea
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                      placeholder={"Thalapathy Vijay, Hero, 2.0, 99\nSuperstar Rajinikanth, Hero, 2.0, 98\nKamal Haasan, Hero, 1.8, 97"}
                      rows={4}
                      className="w-full p-2.5 rounded-lg bg-battle-surface border border-battle-border text-xs font-mono text-white focus:outline-none focus:border-brand-cyan"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setShowBulkAdd(false)}>
                        Cancel
                      </Button>
                      <Button variant="cyan" size="sm" onClick={handleBulkAdd}>
                        Add Parsed Lots
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={newLotName}
                    onChange={(e) => setNewLotName(e.target.value)}
                    placeholder="Lot Name (e.g. Iron Man)"
                    className="sm:col-span-2 px-3 py-2 rounded-xl bg-battle-card border border-battle-border text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                  <input
                    type="text"
                    value={newLotRole}
                    onChange={(e) => setNewLotRole(e.target.value)}
                    placeholder="Role/Category"
                    className="px-3 py-2 rounded-xl bg-battle-card border border-battle-border text-xs text-white focus:outline-none focus:border-brand-purple"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={newLotBasePrice}
                    onChange={(e) => setNewLotBasePrice(e.target.value)}
                    placeholder="Base Price (Cr)"
                    className="px-3 py-2 rounded-xl bg-battle-card border border-battle-border text-xs text-white font-mono focus:outline-none focus:border-brand-purple"
                  />
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={newLotRating}
                      onChange={(e) => setNewLotRating(e.target.value)}
                      placeholder="Rating (1-100)"
                      className="w-full px-3 py-2 rounded-xl bg-battle-card border border-battle-border text-xs text-white font-mono focus:outline-none focus:border-brand-purple"
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddLot}
                      className="px-3 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lots List Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-battle-muted px-3 uppercase">
                  <span># & Lot Details</span>
                  <div className="flex items-center gap-6">
                    <span>Base Price</span>
                    <span>Rating</span>
                    <span>Actions</span>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                  {entries.map((lot, idx) => (
                    <div
                      key={lot.id || idx}
                      className="p-2.5 rounded-xl bg-battle-surface/80 border border-battle-border hover:border-brand-purple/40 transition-colors flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="font-mono text-battle-muted text-[10px] w-5 text-right flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={lot.name}
                            onChange={(e) => {
                              const next = [...entries];
                              next[idx].name = e.target.value;
                              setEntries(next);
                            }}
                            className="bg-transparent font-bold text-white hover:bg-black/30 px-1.5 py-0.5 rounded focus:bg-black/60 focus:outline-none truncate w-44 sm:w-56"
                          />
                          <input
                            type="text"
                            value={lot.role || ''}
                            onChange={(e) => {
                              const next = [...entries];
                              next[idx].role = e.target.value;
                              setEntries(next);
                            }}
                            placeholder="Role"
                            className="bg-transparent text-[11px] text-battle-muted hover:bg-black/30 px-1.5 py-0.5 rounded focus:bg-black/60 focus:outline-none truncate w-32 block"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-battle-muted">{currencySymbol}</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            value={lot.basePrice}
                            onChange={(e) => {
                              const next = [...entries];
                              next[idx].basePrice = Number(e.target.value) || 0.1;
                              setEntries(next);
                            }}
                            className="w-14 bg-black/40 border border-battle-border rounded px-1.5 py-0.5 text-brand-cyan text-right font-bold focus:outline-none"
                          />
                          <span className="text-[10px] text-battle-muted">{currencyUnit}</span>
                        </div>

                        <div className="flex items-center gap-1 font-mono">
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={lot.rating}
                            onChange={(e) => {
                              const next = [...entries];
                              next[idx].rating = Number(e.target.value) || 1;
                              setEntries(next);
                            }}
                            className="w-12 bg-black/40 border border-battle-border rounded px-1.5 py-0.5 text-brand-neon text-right font-bold focus:outline-none"
                          />
                          <span className="text-[10px] text-battle-muted">★</span>
                        </div>

                        {/* Order & Management buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveLot(idx, -1)}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-battle-card text-battle-muted hover:text-white disabled:opacity-20"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveLot(idx, 1)}
                            disabled={idx === entries.length - 1}
                            className="p-1 rounded hover:bg-battle-card text-battle-muted hover:text-white disabled:opacity-20"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateLot(idx)}
                            className="p-1 rounded hover:bg-battle-card text-brand-cyan hover:text-white"
                            title="Duplicate Lot"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLot(idx)}
                            className="p-1 rounded hover:bg-battle-card text-red-400 hover:text-red-300"
                            title="Delete Lot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FRANCHISE BUDGETS */}
          {activeTab === 'budgets' && (
            <div className="space-y-4">
              <p className="text-xs text-battle-muted">
                Configure starting purse amounts for the 4 fixed franchises. These budgets will be saved with this tournament preset.
              </p>
              <TeamBudgetConfig
                initialTeams={budgetConfigState.teams}
                currency={{ symbol: currencySymbol, unit: currencyUnit }}
                onChange={setBudgetConfigState}
              />
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-battle-border flex-shrink-0 mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={handleSaveOnly}
              className="border-brand-purple/40 hover:border-brand-purple"
            >
              <Save className="w-4 h-4 mr-1.5 text-brand-purple" />
              <span>SAVE CHANGES</span>
            </Button>

            <Button
              variant="primary"
              onClick={handleSaveAndLaunch}
              className="shadow-glow-purple group"
            >
              <Play className="w-4 h-4 mr-1.5 text-brand-neon fill-brand-neon group-hover:scale-110 transition-transform" />
              <span>SAVE & LAUNCH</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
