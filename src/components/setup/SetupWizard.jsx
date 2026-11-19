import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { toast } from 'sonner';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  Gavel,
  Shield,
  Coins,
  DollarSign,
  Clock,
  Volume2,
  Shuffle,
  Users,
  Layers,
  FileSpreadsheet,
  Palette,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { AUCTION_PRESETS, FIXED_TEAMS } from '../../services/presets';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatCurrency } from '../common/CurrencyDisplay';
import { TeamBudgetConfig } from './TeamBudgetConfig';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { openGameRules } from '../rules/GameRules';

const CATEGORIES = ['Cricket', 'Football', 'Movies', 'Celebrities', 'Gaming', 'Friends / Custom'];

const CURRENCIES = [
  { symbol: '₹', name: 'Indian Rupee (₹)', unit: 'Cr' },
  { symbol: '$', name: 'US Dollar ($)', unit: 'M' },
  { symbol: '€', name: 'Euro (€)', unit: 'M' },
  { symbol: '£', name: 'British Pound (£)', unit: 'M' },
  { symbol: '🪙', name: 'Game Coins (🪙)', unit: 'Coins' },
];

const PRESET_COLORS = [
  '#00D9FF', // Cyan
  '#9147FF', // Purple
  '#FF8A35', // Orange
  '#B7F34A', // Neon Green
  '#FF4FA3', // Pink
  '#FFD027', // Gold
  '#2B66FF', // Blue
  '#EF4444', // Red
  '#FFFFFF', // White
  '#64748B', // Slate
];

const PRESET_EMOJIS = ['🦁', '⚡', '👑', '⚔️', '🦅', '🛡️', '🔴', '🔥', '🐯', '🐺', '🚀', '⭐', '🦈', '🎯', '🐉', '🌪️'];

export const SetupWizard = () => {
  const { createNewAuction, setActivePage, loadPresetAuction } = useAuction();

  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1 State: Details
  const [auctionName, setAuctionName] = useState('Premier Auction 2025');
  const [category, setCategory] = useState('Cricket');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [description, setDescription] = useState('High-stakes local multiplayer franchise showdown.');

  // Step 2 State: Items
  const [defaultBasePrice, setDefaultBasePrice] = useState(2.0);
  const [items, setItems] = useState([
    { id: '1', name: 'Virat Kohli', role: 'Batter', basePrice: 2.0, rating: 98, desc: 'Master run-chaser and modern batting legend' },
    { id: '2', name: 'Jasprit Bumrah', role: 'Fast Bowler', basePrice: 2.0, rating: 99, desc: 'Lethal death-over yorker specialist' },
    { id: '3', name: 'Rohit Sharma', role: 'Opening Batter', basePrice: 2.0, rating: 96, desc: '5-time champion captain and explosive opener' },
    { id: '4', name: 'Travis Head', role: 'All-Rounder', basePrice: 2.0, rating: 95, desc: 'Fearsome top-order striker and handy off-spin' },
    { id: '5', name: 'Heinrich Klaasen', role: 'Wicket-Keeper', basePrice: 2.0, rating: 94, desc: 'Devastating middle-order spin destroyer' },
    { id: '6', name: 'Rashid Khan', role: 'Spin Bowler', basePrice: 2.0, rating: 97, desc: 'World #1 mystery leg-spinner' },
  ]);
  const [singleItemName, setSingleItemName] = useState('');
  const [singleItemRole, setSingleItemRole] = useState('');
  const [singleItemPrice, setSingleItemPrice] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Step 3 State: Dynamic Franchise Selection & Purses
  const [teamCount, setTeamCount] = useState(4);
  const [selectedTeamIds, setSelectedTeamIds] = useState(FIXED_TEAMS.map((t) => t.id));
  const selectedTeams = React.useMemo(() => {
    return selectedTeamIds
      .map((id) => FIXED_TEAMS.find((t) => t.id === id))
      .filter(Boolean);
  }, [selectedTeamIds]);

  const [defaultPurse, setDefaultPurse] = useState(100);
  const [teams, setTeams] = useState(
    FIXED_TEAMS.map((t) => ({ ...t, initialPurse: 100, purse: 100 }))
  );
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#00D9FF');
  const [newTeamLogo, setNewTeamLogo] = useState('🔥');

  // Step 4 State: Rules
  const [minIncrement, setMinIncrement] = useState(0.20);
  const [customIncrements, setCustomIncrements] = useState('0.20, 0.50, 1.00, 2.00');
  const [minSquadSize, setMinSquadSize] = useState(4);
  const [maxSquadSize, setMaxSquadSize] = useState(8);
  const [countdownDuration, setCountdownDuration] = useState(20);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [antiSelfBidding, setAntiSelfBidding] = useState(true);
  const [allowReAuction, setAllowReAuction] = useState(true);
  const [randomEvents, setRandomEvents] = useState(true);
  const [hideRatingsDuringAuction, setHideRatingsDuringAuction] = useState(false);

  // Sync default base price
  const handleDefaultBasePriceChange = (newVal) => {
    const val = Number(newVal);
    setDefaultBasePrice(val);
    setItems((prev) =>
      prev.map((i) => ({
        ...i,
        basePrice: val,
      }))
    );
  };

  // Sync default purse
  const handleDefaultPurseChange = (newVal) => {
    const val = Number(newVal);
    setDefaultPurse(val);
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        purse: val,
        initialPurse: val,
      }))
    );
  };

  // Add Single Item
  const handleAddSingleItem = (e) => {
    e?.preventDefault();
    if (!singleItemName.trim()) return;

    const newItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: singleItemName.trim(),
      role: singleItemRole.trim() || 'Standard',
      basePrice: Number(singleItemPrice) || defaultBasePrice,
      rating: 90,
      desc: '',
    };

    setItems([...items, newItem]);
    setSingleItemName('');
    setSingleItemRole('');
    setSingleItemPrice('');
    toast.success(`Added ${newItem.name}`);
  };

  // Bulk Add Items
  const handleBulkAdd = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n');
    const newItems = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(',');
      const name = parts[0]?.trim();
      const role = parts[1]?.trim() || 'Standard';
      const price = parts[2] ? Number(parts[2].trim()) : defaultBasePrice;

      if (name) {
        newItems.push({
          id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          name,
          role,
          basePrice: isNaN(price) ? defaultBasePrice : price,
          rating: 90,
          desc: '',
        });
      }
    });

    setItems([...items, ...newItems]);
    setBulkText('');
    setShowBulkInput(false);
    toast.success(`Imported ${newItems.length} items in bulk!`);
  };

  // CSV Import
  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (!text) return;

      const lines = text.split('\n');
      const parsedItems = [];

      lines.forEach((line, idx) => {
        if (idx === 0 && (line.toLowerCase().includes('name') || line.toLowerCase().includes('player'))) {
          return;
        }
        const trimmed = line.trim();
        if (!trimmed) return;

        const parts = trimmed.split(',');
        const name = parts[0]?.replace(/"/g, '').trim();
        const role = parts[1]?.replace(/"/g, '').trim() || 'Standard';
        const price = parts[2] ? Number(parts[2].replace(/"/g, '').trim()) : defaultBasePrice;

        if (name) {
          parsedItems.push({
            id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name,
            role,
            basePrice: isNaN(price) ? defaultBasePrice : price,
            rating: 90,
            desc: '',
          });
        }
      });

      if (parsedItems.length > 0) {
        setItems((prev) => [...prev, ...parsedItems]);
        toast.success(`Successfully loaded ${parsedItems.length} items from CSV`);
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteItem = (id) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(
      items.map((i) => {
        if (i.id === id) {
          return {
            ...i,
            [field]: field === 'basePrice' ? Number(value) : value,
          };
        }
        return i;
      })
    );
  };

  // Add Team
  const handleAddTeam = (e) => {
    e?.preventDefault();
    if (!newTeamName.trim()) return;

    const team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: newTeamName.trim(),
      shortName: newTeamName.trim().slice(0, 3).toUpperCase(),
      color: newTeamColor,
      logo: newTeamLogo,
      purse: defaultPurse,
      initialPurse: defaultPurse,
    };

    setTeams([...teams, team]);
    setNewTeamName('');
    toast.success(`Added franchise: ${team.name}`);
  };

  const handleDeleteTeam = (id) => {
    if (teams.length <= 2) {
      toast.error('At least 2 franchises are required for an auction battle');
      return;
    }
    setTeams(teams.filter((t) => t.id !== id));
  };

  const handleUpdateTeam = (id, field, value) => {
    setTeams(
      teams.map((t) => {
        if (t.id === id) {
          const updated = { ...t, [field]: value };
          if (field === 'purse') {
            updated.initialPurse = Number(value);
          }
          return updated;
        }
        return t;
      })
    );
  };

  // Step Validation
  const validateStep = (step) => {
    setErrorMsg('');
    if (step === 1) {
      if (!auctionName.trim()) {
        setErrorMsg('Please specify a tournament name.');
        return false;
      }
    }
    if (step === 2) {
      if (items.length === 0) {
        setErrorMsg('Add at least 1 item or player for auction.');
        return false;
      }
    }
    if (step === 3) {
      if (selectedTeamIds.length !== teamCount) {
        setErrorMsg(`Please select exactly ${teamCount} franchises (${selectedTeamIds.length}/${teamCount} selected).`);
        return false;
      }
      if (teams.length < 2) {
        setErrorMsg('Select at least 2 teams for competitive bidding.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setErrorMsg('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Launch
  const handleStartAuction = () => {
    const parsedIncrements = customIncrements
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);

    const setupPayload = {
      name: auctionName,
      category,
      currency,
      description,
      rules: {
        minIncrement: Number(minIncrement) || 0.20,
        customIncrements: parsedIncrements.length > 0 ? parsedIncrements : [0.20, 0.50, 1.00, 2.00],
        minSquadSize: Number(minSquadSize) || 4,
        maxSquadSize: Number(maxSquadSize) || 15,
        countdownDuration: Number(countdownDuration) || 20,
        soundEffects,
        autoNext,
        antiSelfBidding,
        allowReAuction,
        randomEvents,
        hideRatingsDuringAuction,
      },
      teams,
      items,
    };

    createNewAuction(setupPayload);
    toast.success('Live Arena initialized! Game on.');
  };

  const steps = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Auction Items' },
    { num: 3, title: 'Teams & Purse' },
    { num: 4, title: 'Rules & Timing' },
    { num: 5, title: 'Launch Arena' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => setActivePage('home')}
            className="text-xs text-battle-muted hover:text-white flex items-center gap-1.5 mb-2 transition-colors font-broadcast font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wider flex items-center gap-3">
            <Gavel className="w-8 h-8 text-brand-cyan" />
            Tournament Setup Wizard
          </h1>
        </div>

        {/* Quick Presets Picker & Rulebook */}
        <div className="flex items-center gap-2">
          <Button
            variant="champagne"
            size="sm"
            onClick={() => openGameRules('auction')}
            className="font-heading text-xs flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Official Rules</span>
          </Button>

          <select
            onChange={(e) => {
              if (e.target.value) {
                loadPresetAuction(e.target.value);
                toast.success('Loaded preset tournament!');
              }
            }}
            defaultValue=""
            className="text-xs bg-battle-surface border border-battle-border rounded-xl px-3 py-2 text-battle-text focus:outline-none focus:border-brand-purple font-broadcast font-bold"
          >
            <option value="" disabled>Load Instant Preset...</option>
            {AUCTION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-battle-surface -z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-neon transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;

            return (
              <div
                key={step.num}
                onClick={() => {
                  if (isCompleted || validateStep(currentStep)) {
                    setCurrentStep(step.num);
                  }
                }}
                className="flex flex-col items-center cursor-pointer group z-10"
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all duration-300 font-broadcast ${
                    isCompleted
                      ? 'bg-brand-neon text-dark-950 shadow-glow-neon'
                      : isCurrent
                      ? 'bg-gradient-to-tr from-brand-purple to-brand-cyan text-white shadow-glow-cyan scale-110'
                      : 'bg-battle-surface text-battle-muted border border-battle-border'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : step.num}
                </div>
                <span
                  className={`text-[11px] font-bold mt-2 font-broadcast tracking-wider transition-colors hidden sm:block ${
                    isCurrent ? 'text-brand-cyan' : isCompleted ? 'text-battle-text' : 'text-battle-muted'
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error notification if any */}
      {errorMsg && (
        <div className="mb-6 p-3 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-battle-border shadow-2xl min-h-[480px] flex flex-col justify-between">
        
        {/* STEP 1: DETAILS */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                Step 1: Tournament Identity
              </h2>
              <p className="text-xs text-battle-muted">Define the theme, format and currency of your showdown.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-battle-text mb-1.5 font-broadcast uppercase tracking-wide">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder="e.g. IPL Mega Auction 2025"
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-battle-text mb-1.5 font-broadcast uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-battle-text mb-1.5 font-broadcast uppercase tracking-wide">
                  Currency System
                </label>
                <select
                  value={currency.symbol}
                  onChange={(e) => {
                    const sel = CURRENCIES.find((c) => c.symbol === e.target.value) || CURRENCIES[0];
                    setCurrency(sel);
                  }}
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-battle-text mb-1.5 font-broadcast uppercase tracking-wide">
                  Description / League Tagline
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. High-stakes franchise bidding war"
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-battle-surface/80 border border-battle-border text-xs text-battle-muted flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>Format Note:</strong> When ₹ currency is chosen, bids are handled in Crores & Lakhs (e.g. 2.0 = 2 Crore, 0.20 = 20 Lakhs).
              </span>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ADD ITEMS */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                  Step 2: Auction Items ({items.length})
                </h2>
                <p className="text-xs text-battle-muted">Add names individually, bulk paste, or import CSV.</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-battle-surface border border-battle-border px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-battle-muted font-broadcast font-bold">COMMON BASE:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={defaultBasePrice}
                    onChange={(e) => handleDefaultBasePriceChange(e.target.value)}
                    className="w-16 bg-transparent text-amber-400 font-mono font-bold text-xs focus:outline-none"
                  />
                  <span className="text-xs text-battle-muted">{currency.unit}</span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowBulkInput(!showBulkInput)}
                >
                  <Layers className="w-3.5 h-3.5 text-brand-cyan" />
                  {showBulkInput ? 'Close Bulk' : 'Bulk Paste'}
                </Button>

                <label className="cursor-pointer text-xs font-bold px-3 py-1.5 rounded-xl bg-battle-surface hover:bg-battle-card text-battle-text border border-battle-border flex items-center gap-1.5 font-broadcast">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-brand-neon" />
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                </label>
              </div>
            </div>

            {/* Bulk Drawer */}
            {showBulkInput && (
              <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white font-broadcast uppercase">Paste Names (One per line):</span>
                  <span className="text-[11px] text-battle-muted font-mono">e.g. MS Dhoni, Wicket-Keeper, 2.0</span>
                </div>
                <textarea
                  rows="4"
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={`Virat Kohli, Batter, 2.0\nJasprit Bumrah, Bowler, 2.0\nBen Stokes, All-Rounder, 1.5`}
                  className="w-full bg-battle-bg border border-battle-border rounded-xl p-3 text-xs text-white focus:outline-none font-mono"
                />
                <Button variant="primary" size="sm" onClick={handleBulkAdd}>
                  Add All Pasted Names
                </Button>
              </div>
            )}

            {/* Single Add Input */}
            <form onSubmit={handleAddSingleItem} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={singleItemName}
                onChange={(e) => setSingleItemName(e.target.value)}
                placeholder="Item / Player Name *"
                className="sm:col-span-2 bg-battle-surface border border-battle-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              />
              <input
                type="text"
                value={singleItemRole}
                onChange={(e) => setSingleItemRole(e.target.value)}
                placeholder="Role (e.g. Batter)"
                className="bg-battle-surface border border-battle-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={singleItemPrice}
                  onChange={(e) => setSingleItemPrice(e.target.value)}
                  placeholder={`Base (${defaultBasePrice})`}
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-cyan hover:bg-cyan-400 text-dark-950 font-black rounded-xl text-xs flex items-center justify-center shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Items Table */}
            <div className="max-h-64 overflow-y-auto rounded-2xl border border-battle-border bg-battle-surface/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-battle-surface/90 text-battle-muted uppercase tracking-wider text-[10px] sticky top-0 font-broadcast">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Base Price ({currency.symbol})</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-battle-border/60">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-battle-card/50 transition-colors">
                      <td className="py-2 px-3 text-battle-muted font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-white">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-battle-border focus:border-brand-cyan focus:outline-none text-white w-full"
                        />
                      </td>
                      <td className="py-2 px-3 text-battle-muted">
                        <input
                          type="text"
                          value={item.role}
                          onChange={(e) => handleUpdateItem(item.id, 'role', e.target.value)}
                          className="bg-transparent border-b border-transparent hover:border-battle-border focus:border-brand-cyan focus:outline-none text-battle-muted w-full"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1 font-mono">
                          <span className="text-battle-muted">{currency.symbol}</span>
                          <input
                            type="number"
                            step="0.1"
                            value={item.basePrice}
                            onChange={(e) => handleUpdateItem(item.id, 'basePrice', e.target.value)}
                            className="bg-battle-bg border border-battle-border rounded px-1.5 py-0.5 text-amber-400 font-bold w-20 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-battle-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TEAMS & PURSE */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                Step 3: Contending Franchises & Starting Purse ({selectedTeams.length})
              </h2>
              <p className="text-xs text-battle-muted">
                Select participating franchises (2, 3, or 4 teams) and configure their starting auction purse.
              </p>
            </div>

            {/* Dynamic Team Selector */}
            <FranchiseSelector
              teamCount={teamCount}
              onTeamCountChange={setTeamCount}
              selectedTeamIds={selectedTeamIds}
              onSelectedTeamsChange={setSelectedTeamIds}
              arenaType="auction"
              showCountSelector={true}
            />

            <TeamBudgetConfig
              initialTeams={selectedTeams}
              currency={currency}
              onChange={(cfg) => {
                if (cfg.isValid) {
                  setTeams(cfg.teams);
                }
              }}
            />
          </motion.div>
        )}

        {/* STEP 4: RULES */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                Step 4: Auction Rules & Timing
              </h2>
              <p className="text-xs text-battle-muted">Configure bid increments, squad limits, countdown clock, and fun mode.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border space-y-3">
                <label className="block text-xs font-bold text-white font-broadcast uppercase flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Min Bid Increment ({currency.symbol})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.05"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(e.target.value)}
                    className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-2 text-xs text-white font-mono"
                  />
                  <span className="text-xs text-battle-muted">{currency.unit}</span>
                </div>

                <label className="block text-[11px] font-bold text-battle-muted uppercase tracking-wider mt-2 font-broadcast">
                  Quick Increment Shortcut Buttons:
                </label>
                <input
                  type="text"
                  value={customIncrements}
                  onChange={(e) => setCustomIncrements(e.target.value)}
                  className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border space-y-3">
                <label className="block text-xs font-bold text-white font-broadcast uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-cyan" />
                  Countdown Duration (Seconds)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={countdownDuration}
                    onChange={(e) => setCountdownDuration(Number(e.target.value))}
                    className="w-full accent-brand-cyan"
                  />
                  <span className="font-mono font-bold text-white text-base w-14 text-center bg-battle-bg py-1 rounded-xl border border-battle-border">
                    {countdownDuration}s
                  </span>
                </div>
                <p className="text-[11px] text-battle-muted">
                  Timer resets automatically every time a valid bid is made.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border space-y-3">
                <label className="block text-xs font-bold text-white font-broadcast uppercase flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-purple" />
                  Squad Constraints
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-battle-muted uppercase font-bold block mb-1">Min Squad</span>
                    <input
                      type="number"
                      value={minSquadSize}
                      onChange={(e) => setMinSquadSize(e.target.value)}
                      className="w-full bg-battle-bg border border-battle-border rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-battle-muted uppercase font-bold block mb-1">Max Squad</span>
                    <input
                      type="number"
                      value={maxSquadSize}
                      onChange={(e) => setMaxSquadSize(e.target.value)}
                      className="w-full bg-battle-bg border border-battle-border rounded-xl px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border space-y-2.5">
                <label className="block text-xs font-bold text-white font-broadcast uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-neon" />
                  Gameplay Options
                </label>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={antiSelfBidding}
                      onChange={(e) => setAntiSelfBidding(e.target.checked)}
                      className="rounded accent-brand-purple"
                    />
                    <span className="text-battle-text">Anti-Self Bidding (prevents bidding against yourself)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowReAuction}
                      onChange={(e) => setAllowReAuction(e.target.checked)}
                      className="rounded accent-brand-purple"
                    />
                    <span className="text-battle-text">Re-Auction Pool enabled for unsold lots</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomEvents}
                      onChange={(e) => setRandomEvents(e.target.checked)}
                      className="rounded accent-brand-purple"
                    />
                    <span className="text-amber-400 font-bold">
                      Fun Mode (Random sponsor boosts & frenzy challenges)
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hideRatingsDuringAuction}
                      onChange={(e) => setHideRatingsDuringAuction(e.target.checked)}
                      className="rounded accent-brand-cyan"
                    />
                    <span className="text-brand-cyan font-bold">
                      Surprise-Reveal Mode (Hide hero ratings during live bidding, reveal in final podium)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 5: REVIEW */}
        {currentStep === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                Step 5: Review & Launch Arena
              </h2>
              <p className="text-xs text-battle-muted">Tournament is ready! Confirm details before entering the live stage.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-battle-surface border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block mb-1 font-broadcast">Tournament</span>
                <h3 className="font-bold text-white text-base font-broadcast">{auctionName}</h3>
                <Badge variant="purple" className="mt-1">{category}</Badge>
              </div>

              <div className="p-5 rounded-2xl bg-battle-surface border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block mb-1 font-broadcast">Items for Auction</span>
                <h3 className="font-black text-brand-cyan text-xl font-broadcast">{items.length} Lots</h3>
                <span className="text-xs text-battle-muted">Base: {currency.symbol} {defaultBasePrice} {currency.unit}</span>
              </div>

              <div className="p-5 rounded-2xl bg-battle-surface border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block mb-1 font-broadcast">Participating Teams</span>
                <h3 className="font-black text-brand-neon text-xl font-broadcast">{teams.length} Franchises</h3>
                <span className="text-xs text-battle-muted">Default Purse: {currency.symbol} {defaultPurse} {currency.unit}</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-purple/20 via-brand-cyan/20 to-brand-orange/20 border border-brand-purple/40 text-center">
              <p className="text-base font-bold text-white mb-1 font-broadcast uppercase tracking-wider">
                Ready for the Bidding War?
              </p>
              <p className="text-xs text-battle-muted">
                All data persists locally in your browser. Gather your friends and take turns bidding on this screen!
              </p>
            </div>
          </motion.div>
        )}

        {/* BOTTOM STEP CONTROLS */}
        <div className="flex items-center justify-between pt-6 border-t border-battle-border mt-6">
          <Button
            variant="secondary"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="danger"
              size="lg"
              onClick={handleStartAuction}
              className="shadow-xl shadow-red-600/30"
            >
              <Gavel className="w-5 h-5 fill-current" />
              START LIVE AUCTION
            </Button>
          )}
        </div>

      </div>
    </div>
  );
};
