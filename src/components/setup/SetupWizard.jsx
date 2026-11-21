import React, { useState, useMemo, useEffect } from 'react';
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
  Clock, 
  Users, 
  Layers, 
  BookOpen,
  EyeOff,
  Flame,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { AUCTION_PRESETS, FIXED_TEAMS } from '../../services/presets';
import { franchiseService } from '../../services/franchiseService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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

const SQUAD_SIZE_PRESETS = [3, 5, 7, 10, 12, 15];

export const SetupWizard = () => {
  const { createNewAuction, setActivePage, loadPresetAuction } = useAuction();

  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: Details
  const [auctionName, setAuctionName] = useState('Premier Auction 2026');
  const [category, setCategory] = useState('Cricket');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [description, setDescription] = useState('High-stakes local multiplayer franchise auction showdown.');

  // Step 2: Items / Player Pool
  const [defaultBasePrice, setDefaultBasePrice] = useState(2.0);
  const [items, setItems] = useState([
    { id: '1', name: 'Virat Kohli', role: 'Batter', basePrice: 2.0, rating: 98, desc: 'Master run-chaser and modern batting legend' },
    { id: '2', name: 'Jasprit Bumrah', role: 'Fast Bowler', basePrice: 2.0, rating: 99, desc: 'Lethal death-over yorker specialist' },
    { id: '3', name: 'Rohit Sharma', role: 'Opening Batter', basePrice: 2.0, rating: 96, desc: '5-time champion captain and explosive opener' },
    { id: '4', name: 'Travis Head', role: 'All-Rounder', basePrice: 2.0, rating: 95, desc: 'Fearsome top-order striker and handy off-spin' },
    { id: '5', name: 'Heinrich Klaasen', role: 'Wicket-Keeper', basePrice: 2.0, rating: 94, desc: 'Devastating middle-order spin destroyer' },
    { id: '6', name: 'Rashid Khan', role: 'Spin Bowler', basePrice: 2.0, rating: 97, desc: 'World #1 mystery leg-spinner' },
    { id: '7', name: 'Ben Stokes', role: 'All-Rounder', basePrice: 2.0, rating: 96, desc: 'Clutch match-winner in high pressure finales' },
    { id: '8', name: 'Pat Cummins', role: 'Fast Bowler', basePrice: 2.0, rating: 97, desc: 'World Cup winning strike leader' },
    { id: '9', name: 'Suryakumar Yadav', role: 'Batter', basePrice: 2.0, rating: 95, desc: '360-degree boundary specialist' },
    { id: '10', name: 'Glenn Maxwell', role: 'All-Rounder', basePrice: 2.0, rating: 93, desc: 'Explosive middle-overs aggressor' },
    { id: '11', name: 'Mitchell Starc', role: 'Fast Bowler', basePrice: 2.0, rating: 95, desc: 'Inswinging yorker demon' },
    { id: '12', name: 'Kagiso Rabada', role: 'Fast Bowler', basePrice: 2.0, rating: 94, desc: 'Fierce pace spearhead' },
  ]);
  const [singleItemName, setSingleItemName] = useState('');
  const [singleItemRole, setSingleItemRole] = useState('');
  const [singleItemPrice, setSingleItemPrice] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  // Step 3: Franchises & Purses
  const [selectedTeamIds, setSelectedTeamIds] = useState(() => {
    const saved = franchiseService.getSelectedFranchiseIds('auction');
    if (saved && saved.length >= 2) return saved;
    const active = franchiseService.getActiveFranchises();
    return active.slice(0, Math.min(4, active.length)).map((f) => f.id);
  });
  const [teamCount, setTeamCount] = useState(() => {
    const saved = franchiseService.getSelectedFranchiseIds('auction');
    return saved && saved.length >= 2 ? saved.length : 4;
  });

  const selectedTeams = useMemo(() => {
    return selectedTeamIds
      .map((id) => franchiseService.getFranchiseById(id))
      .filter(Boolean);
  }, [selectedTeamIds]);

  const [defaultPurse, setDefaultPurse] = useState(100);
  const [teams, setTeams] = useState(() => {
    const active = franchiseService.getActiveFranchises();
    const source = active.length >= 2 ? active.slice(0, 4) : FIXED_TEAMS;
    return source.map((t) => ({ ...t, initialPurse: 100, purse: 100 }));
  });

  // Step 4: Rules & Squad Capacity
  const [squadSize, setSquadSize] = useState(4);
  const [customSquadSizeInput, setCustomSquadSizeInput] = useState('');
  const [minIncrement, setMinIncrement] = useState(0.20);
  const [countdownDuration, setCountdownDuration] = useState(20);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [antiSelfBidding, setAntiSelfBidding] = useState(true);
  const [allowReAuction, setAllowReAuction] = useState(true);
  const [randomEvents, setRandomEvents] = useState(true);
  // Strict rating concealment globally enforced
  const hideRatingsDuringAuction = true;

  // Total squad capacity
  const totalSquadCapacity = teamCount * squadSize;
  const isPoolSufficient = items.length >= totalSquadCapacity;

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

  const handleDeleteItem = (id) => {
    setItems(items.filter((i) => i.id !== id));
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
    if (step === 4) {
      if (!isPoolSufficient) {
        setErrorMsg(`Insufficient player pool! Need at least ${totalSquadCapacity} items for ${teamCount} franchises with squad size ${squadSize} (current pool has ${items.length} items).`);
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

  // Launch Auction
  const handleStartAuction = () => {
    if (!validateStep(4)) return;

    const setupPayload = {
      name: auctionName,
      category,
      currency,
      description,
      rules: {
        minIncrement: Number(minIncrement) || 0.20,
        customIncrements: [0.50, 1.00, 2.00, 5.00, 10.00],
        minSquadSize: squadSize,
        maxSquadSize: squadSize,
        countdownDuration: Number(countdownDuration) || 20,
        soundEffects,
        autoNext,
        antiSelfBidding,
        allowReAuction,
        randomEvents,
        hideRatingsDuringAuction: true,
      },
      teams,
      items,
    };

    createNewAuction(setupPayload);
    toast.success('Emerald & Ivory Auction Arena initialized! Game on.');
  };

  const steps = [
    { num: 1, title: 'Details' },
    { num: 2, title: 'Player Pool' },
    { num: 3, title: 'Teams & Purse' },
    { num: 4, title: 'Squad & Rules' },
    { num: 5, title: 'Review & Launch' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => setActivePage('home')}
            className="text-xs flex items-center gap-1.5 mb-2 transition-colors font-heading font-bold uppercase tracking-wider text-[#B6C5B5] hover:text-[#F5F0E5]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </button>
          <h1 className="text-3xl sm:text-4xl font-black font-title uppercase tracking-wider flex items-center gap-3 text-[#F5F0E5]">
            <Gavel className="w-8 h-8 text-[#C5A46D]" />
            Auction Arena Setup
          </h1>
          <p className="text-xs text-[#B6C5B5] mt-1">
            Configure participating franchises, squad capacity, purses, and bidding rules.
          </p>
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
            className="text-xs rounded-xl px-3 py-2 font-heading font-bold bg-[#193B33] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
          >
            <option value="" disabled>Load Instant Preset...</option>
            {AUCTION_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-[#244A40] -z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gradient-to-r from-[#C5A46D] to-[#D77A54] transition-all duration-300 -z-0"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />

          {steps.map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all border-2 ${
                    isDone
                      ? 'bg-[#C5A46D] border-[#C5A46D] text-[#102C27]'
                      : isCurrent
                      ? 'bg-[#193B33] border-[#C5A46D] text-[#F5F0E5] shadow-lg shadow-[#C5A46D]/20 scale-110'
                      : 'bg-[#102C27] border-[#35574B] text-[#B6C5B5]'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-[11px] font-heading font-bold mt-2 uppercase tracking-wide hidden sm:block ${
                    isCurrent ? 'text-[#C5A46D]' : isDone ? 'text-[#F5F0E5]' : 'text-[#B6C5B5]'
                  }`}
                >
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Feedback Banner */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Step Panel in Emerald & Ivory */}
      <div className="rounded-3xl p-6 sm:p-8 border shadow-2xl min-h-[480px] flex flex-col justify-between bg-[#193B33] border-[#35574B] text-[#F5F0E5]">
        
        {/* STEP 1: IDENTITY */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-title uppercase tracking-wide text-[#F5F0E5]">
                Step 1: Tournament Identity
              </h2>
              <p className="text-xs text-[#B6C5B5]">Define title, category, and currency.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#F5F0E5] mb-1.5 font-heading uppercase tracking-wide">
                  Tournament Title *
                </label>
                <input
                  type="text"
                  value={auctionName}
                  onChange={(e) => setAuctionName(e.target.value)}
                  placeholder="e.g. Tamil Cinema Super Auction 2026"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E5] mb-1.5 font-heading uppercase tracking-wide">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E5] mb-1.5 font-heading uppercase tracking-wide">
                  Currency System
                </label>
                <select
                  value={currency.symbol}
                  onChange={(e) => {
                    const sel = CURRENCIES.find((c) => c.symbol === e.target.value) || CURRENCIES[0];
                    setCurrency(sel);
                  }}
                  className="w-full rounded-xl px-4 py-3 text-sm bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.symbol} value={c.symbol}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#F5F0E5] mb-1.5 font-heading uppercase tracking-wide">
                  Description / League Tagline
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. High-stakes franchise bidding war"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#244A40] border border-[#35574B] text-xs text-[#B6C5B5] flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C5A46D] shrink-0" />
              <span>
                <strong>Format Note:</strong> When ₹ currency is chosen, bids are handled in Crores & Lakhs (e.g. 2.0 = 2 Crore, 0.50 = 50 Lakhs).
              </span>
            </div>
          </motion.div>
        )}

        {/* STEP 2: PLAYER POOL */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black font-title uppercase tracking-wide text-[#F5F0E5]">
                  Step 2: Player Pool ({items.length} Lots Available)
                </h2>
                <p className="text-xs text-[#B6C5B5]">Add players individually, paste bulk text, or use preloaded lots.</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkInput(!showBulkInput)}
                  className="text-xs border-[#35574B] text-[#B6C5B5] hover:text-[#F5F0E5]"
                >
                  {showBulkInput ? 'Close Bulk Input' : 'Bulk Text Paste'}
                </Button>
              </div>
            </div>

            {showBulkInput && (
              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B] space-y-3">
                <textarea
                  rows={4}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="Paste one per line: Player Name, Role, BasePrice&#10;e.g. Rajinikanth, Superstar, 2.5&#10;Kamal Haasan, Ulaganayagan, 2.5"
                  className="w-full rounded-xl p-3 text-xs font-mono bg-[#193B33] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                />
                <Button variant="primary" size="sm" onClick={handleBulkAdd} className="bg-[#D77A54]">
                  Process Bulk Lots
                </Button>
              </div>
            )}

            {/* Single Add Form */}
            <form onSubmit={handleAddSingleItem} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={singleItemName}
                onChange={(e) => setSingleItemName(e.target.value)}
                placeholder="Player / Lot Name *"
                className="sm:col-span-2 rounded-xl px-3 py-2 text-xs bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
              />
              <input
                type="text"
                value={singleItemRole}
                onChange={(e) => setSingleItemRole(e.target.value)}
                placeholder="Role / Category"
                className="rounded-xl px-3 py-2 text-xs bg-[#102C27] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={singleItemPrice}
                  onChange={(e) => setSingleItemPrice(e.target.value)}
                  placeholder={`Base (${defaultBasePrice})`}
                  className="w-full rounded-xl px-3 py-2 text-xs bg-[#102C27] border border-[#35574B] text-[#F5F0E5] font-mono focus:outline-none focus:border-[#C5A46D]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 font-bold rounded-xl text-xs flex items-center justify-center shrink-0 bg-[#C5A46D] text-[#102C27]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Items Table */}
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-[#35574B] bg-[#102C27]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#244A40] text-[#B6C5B5] uppercase tracking-wider text-[10px] sticky top-0 font-heading">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Player Name</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Base Price</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#35574B]/60">
                  {items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-[#193B33] transition-colors">
                      <td className="py-2 px-3 text-[#B6C5B5] font-mono">{idx + 1}</td>
                      <td className="py-2 px-3 font-semibold text-[#F5F0E5]">{item.name}</td>
                      <td className="py-2 px-3 text-[#B6C5B5]">{item.role}</td>
                      <td className="py-2 px-3 font-mono font-bold text-[#C5A46D]">
                        {currency.symbol}{item.basePrice} {currency.unit}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-[#B6C5B5] hover:text-rose-400 transition-colors"
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

        {/* STEP 3: FRANCHISES & PURSE */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-title uppercase tracking-wide text-[#F5F0E5]">
                Step 3: Contending Franchises & Purses ({selectedTeams.length} Selected)
              </h2>
              <p className="text-xs text-[#B6C5B5]">
                Choose 2, 3, 4, 5, 6, 8, 10 or more franchises and configure their individual purse budgets.
              </p>
            </div>

            {/* Dynamic Franchise Selector */}
            <FranchiseSelector
              teamCount={teamCount}
              onTeamCountChange={setTeamCount}
              selectedTeamIds={selectedTeamIds}
              onSelectedTeamsChange={setSelectedTeamIds}
              arenaType="auction"
              showCountSelector={true}
            />

            {/* Team Budget Configurator */}
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

        {/* STEP 4: SQUAD & RULES */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-title uppercase tracking-wide text-[#F5F0E5]">
                Step 4: Squad Capacity & Auction Rules
              </h2>
              <p className="text-xs text-[#B6C5B5]">
                Configure maximum squad size per franchise, countdown clock, and settlement protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Squad Size Configuration (PART 4.1.B) */}
              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B] space-y-3">
                <label className="text-xs font-bold text-[#F5F0E5] font-heading uppercase flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5A46D]" />
                    Max Squad Size Per Team
                  </span>
                  <span className="font-mono font-black text-sm text-[#C5A46D]">{squadSize} Players</span>
                </label>

                {/* Presets */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {SQUAD_SIZE_PRESETS.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => {
                        setSquadSize(sz);
                        setCustomSquadSizeInput('');
                      }}
                      className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all text-center ${
                        squadSize === sz
                          ? 'bg-[#C5A46D] text-[#102C27] border-[#C5A46D]'
                          : 'bg-[#193B33] text-[#B6C5B5] hover:text-[#F5F0E5] border-[#35574B]'
                      }`}
                    >
                      {sz} Slots
                    </button>
                  ))}
                </div>

                {/* Custom Squad Size */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-[#B6C5B5] font-heading">Custom squad size:</span>
                  <input
                    type="number"
                    min={2}
                    max={25}
                    value={customSquadSizeInput}
                    onChange={(e) => {
                      setCustomSquadSizeInput(e.target.value);
                      const num = Number(e.target.value);
                      if (num >= 2 && num <= 25) setSquadSize(num);
                    }}
                    placeholder="e.g. 8"
                    className="w-20 rounded-xl px-2.5 py-1 text-xs font-mono bg-[#193B33] border border-[#35574B] text-[#F5F0E5] focus:outline-none focus:border-[#C5A46D]"
                  />
                </div>

                {/* Squad Capacity Telemetry & Validation */}
                <div className="p-3 rounded-xl bg-[#244A40] border border-[#35574B] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C5B5]">Total Squad Capacity Needed:</span>
                    <span className="font-mono font-bold text-[#F5F0E5]">{totalSquadCapacity} Players ({teamCount} × {squadSize})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#B6C5B5]">Player Pool Lots Available:</span>
                    <span className={`font-mono font-bold ${isPoolSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {items.length} Lots
                    </span>
                  </div>
                  {!isPoolSufficient && (
                    <p className="text-[11px] text-rose-300 font-bold pt-1">
                      ⚠️ Pool has fewer players than total capacity! Add at least {totalSquadCapacity - items.length} more players in Step 2.
                    </p>
                  )}
                </div>
              </div>

              {/* Auction Countdown & Timer */}
              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B] space-y-3">
                <label className="text-xs font-bold text-[#F5F0E5] font-heading uppercase flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C5A46D]" />
                    Countdown Clock Duration
                  </span>
                  <span className="font-mono font-black text-sm text-[#C5A46D]">{countdownDuration}s</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={countdownDuration}
                    onChange={(e) => setCountdownDuration(Number(e.target.value))}
                    className="w-full accent-[#C5A46D]"
                  />
                </div>
                <p className="text-[11px] text-[#B6C5B5]">
                  Countdown resets to {countdownDuration}s whenever a new leading bid is submitted.
                </p>

                {/* Progressive Increments Indicator */}
                <div className="pt-2 border-t border-[#35574B]/60 space-y-1 text-xs">
                  <span className="font-heading font-bold text-[#F5F0E5] block">
                    Automatic Progressive Increment Tiers:
                  </span>
                  <ul className="text-[11px] font-mono text-[#B6C5B5] space-y-0.5">
                    <li>• &lt; ₹5 Cr: <strong className="text-[#C5A46D]">+₹0.50 Cr</strong></li>
                    <li>• ₹5 Cr – ₹10 Cr: <strong className="text-[#C5A46D]">+₹1.00 Cr</strong></li>
                    <li>• ₹10 Cr – ₹25 Cr: <strong className="text-[#C5A46D]">+₹2.00 Cr</strong></li>
                    <li>• ₹25 Cr – ₹50 Cr: <strong className="text-[#C5A46D]">+₹5.00 Cr</strong></li>
                    <li>• ≥ ₹50 Cr: <strong className="text-[#C5A46D]">+₹10.00 Cr</strong></li>
                  </ul>
                </div>
              </div>

              {/* Strict Rating Concealment & Settlement Rules */}
              <div className="sm:col-span-2 p-4 rounded-2xl bg-[#102C27] border border-[#35574B] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F0E5] font-heading uppercase flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-[#C5A46D]" />
                    Strict Rating Concealment Protocol
                  </span>
                  <Badge variant="theme-accent" className="text-[10px]">ENFORCED</Badge>
                </div>
                <p className="text-xs text-[#B6C5B5] leading-relaxed">
                  All official ratings, combat scores, and stars remain <strong>strictly concealed</strong> during active bidding.
                  Ratings are revealed only after the entire auction officially completes in the final results podium.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[#35574B]/60">
                  <span className="text-xs font-bold text-[#F5F0E5] font-heading uppercase flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#D77A54]" />
                    Mandatory Last-Bidder Base-Price Settlement
                  </span>
                  <Badge variant="theme-action" className="text-[10px]">ENFORCED</Badge>
                </div>
                <p className="text-xs text-[#B6C5B5] leading-relaxed">
                  If an opening bid is placed and countdown expires without further bids, the lot is <strong>mandatorily awarded</strong> to that franchise at base price. Mark UNSOLD is only permitted if 0 bids were made.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* STEP 5: REVIEW & LAUNCH (PART 4.1.E) */}
        {currentStep === 5 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div>
              <h2 className="text-2xl font-black font-title uppercase tracking-wide text-[#F5F0E5]">
                Step 5: Pre-Launch Review Summary
              </h2>
              <p className="text-xs text-[#B6C5B5]">Verify all tournament configurations before entering the live auction arena.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B]">
                <span className="text-[10px] text-[#B6C5B5] uppercase font-bold block mb-1">Tournament</span>
                <h3 className="font-bold text-base text-[#F5F0E5] truncate">{auctionName}</h3>
                <span className="text-xs text-[#C5A46D]">{category}</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B]">
                <span className="text-[10px] text-[#B6C5B5] uppercase font-bold block mb-1">Contending Teams</span>
                <h3 className="font-black text-xl text-[#F5F0E5]">{teams.length} Franchises</h3>
                <span className="text-xs text-[#B6C5B5]">Squad: {squadSize} slots each</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B]">
                <span className="text-[10px] text-[#B6C5B5] uppercase font-bold block mb-1">Player Pool Size</span>
                <h3 className="font-black text-xl text-[#C5A46D]">{items.length} Lots</h3>
                <span className="text-xs text-[#B6C5B5]">Capacity: {totalSquadCapacity} needed</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B]">
                <span className="text-[10px] text-[#B6C5B5] uppercase font-bold block mb-1">Total Tournament Purse</span>
                <h3 className="font-black text-xl text-[#D77A54]">
                  {currency.symbol}{teams.reduce((acc, t) => acc + (t.initialPurse || t.purse || 100), 0)} {currency.unit}
                </h3>
                <span className="text-xs text-[#B6C5B5]">Solvency Guard active</span>
              </div>
            </div>

            {/* Franchises Roster Strip */}
            <div className="p-4 rounded-2xl bg-[#102C27] border border-[#35574B] space-y-3">
              <span className="text-xs font-bold text-[#F5F0E5] font-heading uppercase block">
                Franchise Purse Allocations:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {teams.map((t) => (
                  <div key={t.id} className="p-2.5 rounded-xl bg-[#193B33] border border-[#35574B] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: t.color, color: franchiseService.getContrastTextColor(t.color) }}
                      >
                        {t.logo && !t.logo.startsWith('http') ? t.logo : t.shortName || t.name.slice(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-[#F5F0E5] truncate max-w-[90px]">{t.name}</span>
                    </div>
                    <span className="font-mono font-bold text-xs text-[#C5A46D]">
                      {currency.symbol}{t.initialPurse || t.purse || 100} {currency.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Banner */}
            <div className={`p-4 rounded-2xl border text-center ${
              isPoolSufficient 
                ? 'bg-[#244A40] border-[#35574B]' 
                : 'bg-rose-950/40 border-rose-800'
            }`}>
              <p className="text-sm font-bold uppercase tracking-wider text-[#F5F0E5] mb-1">
                {isPoolSufficient ? 'Ready for the Live Auction Showdown!' : 'Cannot Launch: Pool Size Deficit'}
              </p>
              <p className="text-xs text-[#B6C5B5]">
                {isPoolSufficient 
                  ? 'All franchises, purse balances, and squad constraints are verified. Entering Emerald & Ivory Live Arena.'
                  : `Add at least ${totalSquadCapacity - items.length} more players to your pool before launching.`}
              </p>
            </div>
          </motion.div>
        )}

        {/* BOTTOM CONTROLS */}
        <div className="flex items-center justify-between pt-6 border-t border-[#35574B] mt-6">
          <Button
            variant="secondary"
            size="md"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="border-[#35574B] text-[#B6C5B5] hover:text-[#F5F0E5]"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {currentStep < 5 ? (
            <Button
              variant="primary"
              size="md"
              onClick={handleNext}
              className="bg-[#D77A54] hover:bg-[#c26844] text-[#F5F0E5]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartAuction}
              disabled={!isPoolSufficient}
              className="bg-[#C5A46D] hover:bg-[#b8955a] text-[#102C27] font-black shadow-xl shadow-[#C5A46D]/20"
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
