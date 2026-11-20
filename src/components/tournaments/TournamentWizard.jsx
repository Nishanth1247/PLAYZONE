import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Users, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Sparkles, 
  Calendar, 
  Layers, 
  Save, 
  Clock, 
  Coins, 
  ShieldCheck,
  CheckCircle2,
  Settings
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { franchiseService } from '../../services/franchiseService';
import { tournamentHubService } from '../../services/tournamentHubService';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { AUCTION_PRESETS } from '../../services/presets';
import { toast } from 'sonner';

const CATEGORIES = [
  'Cinema',
  'Cricket',
  'Football',
  'Superheroes',
  'Gaming',
  'Custom',
];

const PRESET_COLORS = [
  '#D4B879', // Champagne Gold
  '#00D9FF', // Cyan
  '#FF8A35', // Orange
  '#9147FF', // Purple
  '#B7F34A', // Lime
  '#E5C158', // Yellow
  '#71999B', // Teal
  '#8875A8', // Lavender
];

const EMOJI_LOGOS = ['🏆', '👑', '⚡', '🔥', '🛡️', '🎬', '🏏', '⚽', '🎮', '🌟'];

export const TournamentWizard = ({ onCancel, onCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Active franchises
  const activeFranchises = useMemo(() => franchiseService.getActiveFranchises(), []);

  // Step 1: Tournament Identity
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Cinema');
  const [customCategory, setCustomCategory] = useState('');
  const [logo, setLogo] = useState('🏆');
  const [themeColor, setThemeColor] = useState('#D4B879');
  const [season, setSeason] = useState('Season 1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2: Franchises
  const [selectedFranchiseIds, setSelectedFranchiseIds] = useState(() => {
    return activeFranchises.slice(0, Math.min(4, activeFranchises.length)).map((f) => f.id);
  });
  const [teamCount, setTeamCount] = useState(() => selectedFranchiseIds.length || 4);

  // Step 3: Game Modes
  const [gameModes, setGameModes] = useState(['auction', 'battle']);

  // Mode Specific Configurations
  // Auction Config
  const [auctionPresetId, setAuctionPresetId] = useState(AUCTION_PRESETS[0].id);
  const [auctionPurse, setAuctionPurse] = useState(100);
  const [auctionBasePrice, setAuctionBasePrice] = useState(1.0);
  const [auctionMaxSquad, setAuctionMaxSquad] = useState(5);
  const [auctionTimer, setAuctionTimer] = useState(20);
  const [auctionAntiSelfBidding, setAuctionAntiSelfBidding] = useState(true);

  // Battle Config
  const [battleSquadSize, setBattleSquadSize] = useState(3);
  const [battlePurse, setBattlePurse] = useState(100);

  // Party Config
  const [partyGames, setPartyGames] = useState(['party_dumb_charades', 'party_who_am_i']);
  const [partyRoundTimer, setPartyRoundTimer] = useState(60);
  const [partyTotalRounds, setPartyTotalRounds] = useState(5);

  // Errors state
  const [errors, setErrors] = useState({});

  // Final category value
  const resolvedCategory = category === 'Custom' && customCategory.trim() ? customCategory.trim() : category;

  // Step Navigation Validation
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = 'Tournament name is required.';
      } else if (name.trim().length < 3) {
        newErrors.name = 'Name must be at least 3 characters.';
      } else if (name.trim().length > 60) {
        newErrors.name = 'Name cannot exceed 60 characters.';
      } else {
        const all = tournamentHubService.getAllTournaments();
        const dup = all.find((t) => t.name.toLowerCase() === name.trim().toLowerCase());
        if (dup) {
          newErrors.name = 'A tournament with this name already exists.';
        }
      }
    }

    if (step === 2) {
      if (selectedFranchiseIds.length < 2) {
        newErrors.franchises = 'Please select at least 2 franchises to participate.';
      } else if (selectedFranchiseIds.length !== teamCount) {
        newErrors.franchises = `Please select exactly ${teamCount} franchises to match the chosen format.`;
      }
    }

    if (step === 3) {
      if (gameModes.length === 0) {
        newErrors.gameModes = 'At least one arena mode must be selected.';
      }
      if (gameModes.includes('party') && partyGames.length === 0) {
        newErrors.partyGames = 'Please select at least one party game.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Toggle Game Mode
  const toggleGameMode = (mode) => {
    if (gameModes.includes(mode)) {
      if (gameModes.length === 1) {
        toast.warning('A tournament must include at least one arena mode.');
        return;
      }
      setGameModes(gameModes.filter((m) => m !== mode));
    } else {
      setGameModes([...gameModes, mode]);
    }
  };

  // Toggle Party Game
  const togglePartyGame = (gId) => {
    if (partyGames.includes(gId)) {
      if (partyGames.length === 1) {
        toast.warning('At least one party game must remain selected.');
        return;
      }
      setPartyGames(partyGames.filter((id) => id !== gId));
    } else {
      setPartyGames([...partyGames, gId]);
    }
  };

  // Final Submission
  const handleFinalSubmit = (statusToSet = 'upcoming') => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error('Please resolve configuration errors before creating tournament.');
      return;
    }

    const selectedPreset = AUCTION_PRESETS.find((p) => p.id === auctionPresetId) || AUCTION_PRESETS[0];

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: resolvedCategory,
      logo,
      themeColor,
      season: season.trim(),
      startDate: startDate || null,
      endDate: endDate || null,
      status: statusToSet, // 'draft' or 'upcoming'
      franchiseIds: selectedFranchiseIds,
      gameModes,
      auctionConfig: gameModes.includes('auction')
        ? {
            presetId: selectedPreset.id,
            presetName: selectedPreset.name,
            defaultPurse: Number(auctionPurse) || 100,
            basePrice: Number(auctionBasePrice) || 1.0,
            maxSquadSize: Number(auctionMaxSquad) || 5,
            minSquadSize: 3,
            timerDuration: Number(auctionTimer) || 20,
            antiSelfBidding: auctionAntiSelfBidding,
          }
        : null,
      battleConfig: gameModes.includes('battle')
        ? {
            squadSize: Number(battleSquadSize) || 3,
            startingPurse: Number(battlePurse) || 100,
            scheduleType: 'round_robin',
            scoringSystem: '3_1_0',
          }
        : null,
      partyConfig: gameModes.includes('party')
        ? {
            selectedGames: partyGames,
            roundDuration: Number(partyRoundTimer) || 60,
            totalRounds: Number(partyTotalRounds) || 5,
          }
        : null,
    };

    try {
      const created = tournamentHubService.createTournament(payload);
      toast.success(
        statusToSet === 'draft'
          ? `Tournament saved as Draft: "${created.name}"`
          : `Tournament created and ready to launch: "${created.name}"`
      );
      onCreated?.(created);
    } catch (e) {
      toast.error(e.message || 'Failed to create tournament.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 space-y-8">
      {/* Wizard Header & Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#39465A]">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#AEB9CC] hover:text-[#F5F3EE] mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel & Return to Hub</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-wide text-[#F5F3EE] uppercase">
            Create Tournament Wizard
          </h1>
          <p className="text-xs text-[#AEB9CC] mt-1">
            Configure tournament identity, contenders, arena game modes, and competitive rules.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          {[
            { num: 1, label: 'Identity' },
            { num: 2, label: 'Franchises' },
            { num: 3, label: 'Game Modes' },
            { num: 4, label: 'Review' },
          ].map((st) => (
            <div key={st.num} className="flex items-center gap-1.5">
              <div
                className={`w-7 h-7 rounded-xl font-heading font-black text-xs flex items-center justify-center transition-all ${
                  currentStep === st.num
                    ? 'bg-[#D4B879] text-[#111827] shadow-md shadow-[#D4B879]/30 scale-105'
                    : currentStep > st.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#222F43] text-[#AEB9CC] border border-[#39465A]'
                }`}
              >
                {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
              </div>
              <span className="hidden md:inline text-[11px] font-heading font-bold text-[#AEB9CC]">
                {st.label}
              </span>
              {st.num < 4 && <span className="text-[#39465A] hidden md:inline">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Tournament Identity */}
      {currentStep === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="border-b border-[#39465A] pb-3">
            <h2 className="text-lg font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
              Step 1: Tournament Identity
            </h2>
            <p className="text-xs text-[#AEB9CC] mt-0.5">
              Give your tournament a memorable title, category, branding, and season name.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tournament Name */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Tournament Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="e.g. Tamil Cinema Super Clash 2026"
                className={`w-full py-2.5 px-4 rounded-xl bg-[#111827] border text-sm text-[#F5F3EE] focus:outline-none transition-all ${
                  errors.name
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-[#39465A] focus:border-[#D4B879]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-400 font-heading font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Description / Narrative
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the tournament storyline and stakes..."
                className="w-full py-2.5 px-4 rounded-xl bg-[#111827] border border-[#39465A] text-xs text-[#F5F3EE] focus:border-[#D4B879] focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-2 rounded-xl text-xs font-heading font-bold border transition-all text-center ${
                      category === cat
                        ? 'bg-[#D4B879] text-[#111827] border-[#F5F3EE] shadow-sm font-black'
                        : 'bg-[#111827] text-[#AEB9CC] border-[#39465A] hover:text-[#F5F3EE]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {category === 'Custom' && (
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category..."
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-[#111827] border border-[#39465A] text-xs text-[#F5F3EE] focus:border-[#D4B879] focus:outline-none"
                />
              )}
            </div>

            {/* Season Association */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Season / Series Name
              </label>
              <input
                type="text"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                placeholder="e.g. Season 1, Winter Series, IPL 2026"
                className="w-full py-2.5 px-4 rounded-xl bg-[#111827] border border-[#39465A] text-xs text-[#F5F3EE] focus:border-[#D4B879] focus:outline-none"
              />
            </div>

            {/* Logo / Emoji */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Tournament Logo / Icon
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {EMOJI_LOGOS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setLogo(em)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all ${
                      logo === em
                        ? 'bg-[#D4B879]/20 border-[#D4B879] scale-110'
                        : 'bg-[#111827] border-[#39465A] hover:bg-[#2C394C]'
                    }`}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Accent Color */}
            <div className="space-y-1.5">
              <label className="text-xs font-heading font-bold text-[#F5F3EE] uppercase tracking-wider block">
                Theme Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setThemeColor(col)}
                    className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                      themeColor === col ? 'scale-115 border-white shadow-md' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Franchises Selection */}
      {currentStep === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <FranchiseSelector
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            selectedTeamIds={selectedFranchiseIds}
            onSelectedTeamsChange={setSelectedFranchiseIds}
            title="Tournament Contending Franchises"
            description="Choose which franchises will participate in this championship. Supports any format from 2 to 10+ teams."
          />
          {errors.franchises && (
            <p className="text-xs text-rose-400 font-heading font-semibold flex items-center gap-1 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.franchises}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* Step 3: Game Modes & Arena Configuration */}
      {currentStep === 3 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="border-b border-[#39465A] pb-3">
              <h2 className="text-lg font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
                Step 3: Select Game Modes & Arenas
              </h2>
              <p className="text-xs text-[#AEB9CC] mt-0.5">
                Enable which arenas are included in this tournament. Configure starting parameters for each enabled arena.
              </p>
            </div>

            {/* Arena Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Auction Arena */}
              <div
                onClick={() => toggleGameMode('auction')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  gameModes.includes('auction')
                    ? 'bg-[#2C394C] border-[#00D9FF] shadow-lg shadow-[#00D9FF]/10'
                    : 'bg-[#111827] border-[#39465A] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Gavel className="w-6 h-6 text-[#00D9FF]" />
                  <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                    gameModes.includes('auction') ? 'bg-[#00D9FF] text-[#111827] font-black border-transparent' : 'border-[#39465A]'
                  }`}>
                    {gameModes.includes('auction') && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
                <h3 className="font-heading font-black text-base text-[#F5F3EE]">Auction Arena</h3>
                <p className="text-[11px] text-[#AEB9CC] mt-1 leading-relaxed">
                  Live bidding, purse management, progressive increments, and squad building.
                </p>
              </div>

              {/* Battle Arena */}
              <div
                onClick={() => toggleGameMode('battle')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  gameModes.includes('battle')
                    ? 'bg-[#2C394C] border-[#FF8A35] shadow-lg shadow-[#FF8A35]/10'
                    : 'bg-[#111827] border-[#39465A] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Swords className="w-6 h-6 text-[#FF8A35]" />
                  <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                    gameModes.includes('battle') ? 'bg-[#FF8A35] text-[#111827] font-black border-transparent' : 'border-[#39465A]'
                  }`}>
                    {gameModes.includes('battle') && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
                <h3 className="font-heading font-black text-base text-[#F5F3EE]">Battle Arena</h3>
                <p className="text-[11px] text-[#AEB9CC] mt-1 leading-relaxed">
                  Round 1 auction followed by tactical draft matchups and 3-1-0 combat points table.
                </p>
              </div>

              {/* Party Arena */}
              <div
                onClick={() => toggleGameMode('party')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  gameModes.includes('party')
                    ? 'bg-[#2C394C] border-[#9147FF] shadow-lg shadow-[#9147FF]/10'
                    : 'bg-[#111827] border-[#39465A] opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Gamepad2 className="w-6 h-6 text-[#9147FF]" />
                  <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs ${
                    gameModes.includes('party') ? 'bg-[#9147FF] text-white font-black border-transparent' : 'border-[#39465A]'
                  }`}>
                    {gameModes.includes('party') && <Check className="w-3.5 h-3.5" />}
                  </span>
                </div>
                <h3 className="font-heading font-black text-base text-[#F5F3EE]">Party Arena</h3>
                <p className="text-[11px] text-[#AEB9CC] mt-1 leading-relaxed">
                  Local pass-and-play party games: Dumb Charades and Who Am I? with custom timers.
                </p>
              </div>
            </div>

            {errors.gameModes && (
              <p className="text-xs text-rose-400 font-heading font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.gameModes}</span>
              </p>
            )}

            {/* Mode-Specific Settings: Auction Arena */}
            {gameModes.includes('auction') && (
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#00D9FF]/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-[#00D9FF]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#00D9FF]">
                    Auction Arena Rules & Settings
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block mb-1">
                      Starting Purse (Cr)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      value={auctionPurse}
                      onChange={(e) => setAuctionPurse(Number(e.target.value) || 100)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block mb-1">
                      Max Squad Size
                    </label>
                    <input
                      type="number"
                      min={2}
                      max={15}
                      value={auctionMaxSquad}
                      onChange={(e) => setAuctionMaxSquad(Number(e.target.value) || 5)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block mb-1">
                      Countdown Timer (sec)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={60}
                      value={auctionTimer}
                      onChange={(e) => setAuctionTimer(Number(e.target.value) || 20)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode-Specific Settings: Battle Arena */}
            {gameModes.includes('battle') && (
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#FF8A35]/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Swords className="w-4 h-4 text-[#FF8A35]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#FF8A35]">
                    Battle Arena Rules & Settings
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block mb-1">
                      Squad Size (Lots Per Team)
                    </label>
                    <div className="flex items-center gap-2">
                      {[3, 5, 8].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setBattleSquadSize(sz)}
                          className={`flex-1 py-1.5 rounded-lg border font-mono font-bold text-xs ${
                            battleSquadSize === sz
                              ? 'bg-[#FF8A35] text-[#111827] border-white font-black'
                              : 'bg-[#222F43] text-[#AEB9CC] border-[#39465A]'
                          }`}
                        >
                          {sz} Lots
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block mb-1">
                      Battle Purse (₹ Cr)
                    </label>
                    <input
                      type="number"
                      min={20}
                      max={500}
                      value={battlePurse}
                      onChange={(e) => setBattlePurse(Number(e.target.value) || 100)}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Mode-Specific Settings: Party Arena */}
            {gameModes.includes('party') && (
              <div className="p-4 rounded-2xl bg-[#111827] border border-[#9147FF]/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4 text-[#9147FF]" />
                  <h4 className="text-xs font-heading font-black uppercase tracking-wider text-[#9147FF]">
                    Party Arena Games & Rules
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div
                    onClick={() => togglePartyGame('party_dumb_charades')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                      partyGames.includes('party_dumb_charades')
                        ? 'bg-[#222F43] border-[#9147FF]'
                        : 'bg-[#111827] border-[#39465A] opacity-60'
                    }`}
                  >
                    <div>
                      <span className="font-heading font-bold text-xs text-[#F5F3EE] block">
                        Dumb Charades
                      </span>
                      <span className="text-[10px] text-[#AEB9CC]">Act it out with custom prompts</span>
                    </div>
                    {partyGames.includes('party_dumb_charades') && <Check className="w-4 h-4 text-[#9147FF]" />}
                  </div>

                  <div
                    onClick={() => togglePartyGame('party_who_am_i')}
                    className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between ${
                      partyGames.includes('party_who_am_i')
                        ? 'bg-[#222F43] border-[#9147FF]'
                        : 'bg-[#111827] border-[#39465A] opacity-60'
                    }`}
                  >
                    <div>
                      <span className="font-heading font-bold text-xs text-[#F5F3EE] block">
                        Who Am I?
                      </span>
                      <span className="text-[10px] text-[#AEB9CC]">20 Questions secret identity guessing</span>
                    </div>
                    {partyGames.includes('party_who_am_i') && <Check className="w-4 h-4 text-[#9147FF]" />}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Step 4: Review and Create */}
      {currentStep === 4 && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 sm:p-8 space-y-6 shadow-xl"
        >
          <div className="border-b border-[#39465A] pb-3">
            <h2 className="text-lg font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
              Step 4: Review & Finalize
            </h2>
            <p className="text-xs text-[#AEB9CC] mt-0.5">
              Review all tournament parameters before creating. You can launch immediately or save as a draft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Identity Summary */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2">
              <span className="font-heading font-bold text-[10px] text-[#D4B879] uppercase tracking-wider block">
                Tournament Identity
              </span>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{logo}</span>
                <div>
                  <h4 className="font-heading font-black text-base text-[#F5F3EE]">{name}</h4>
                  <span className="text-[11px] text-[#AEB9CC]">{resolvedCategory} • {season}</span>
                </div>
              </div>
              {description && (
                <p className="text-[11px] text-[#AEB9CC] italic pt-1">{description}</p>
              )}
            </div>

            {/* Franchises Summary */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2">
              <span className="font-heading font-bold text-[10px] text-[#D4B879] uppercase tracking-wider block">
                Contending Franchises ({selectedFranchiseIds.length})
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedFranchiseIds.map((fId) => {
                  const f = franchiseService.getFranchiseById(fId);
                  if (!f) return null;
                  return (
                    <span
                      key={fId}
                      className="px-2 py-1 rounded-lg border text-[11px] font-heading font-bold"
                      style={{
                        backgroundColor: `${f.color}20`,
                        borderColor: f.color,
                        color: '#F5F3EE',
                      }}
                    >
                      {f.logo || '🛡️'} {f.name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Arenas Summary */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2 md:col-span-2">
              <span className="font-heading font-bold text-[10px] text-[#D4B879] uppercase tracking-wider block">
                Enabled Arenas & Game Modes
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {gameModes.includes('auction') && (
                  <div className="p-2.5 rounded-xl bg-[#222F43] border border-[#00D9FF]/40 text-[#AEB9CC]">
                    <span className="font-heading font-bold text-xs text-[#00D9FF] block">
                      Auction Arena
                    </span>
                    <span>Purse: ₹{auctionPurse} Cr • Cap: {auctionMaxSquad} Lots • {auctionTimer}s Clock</span>
                  </div>
                )}
                {gameModes.includes('battle') && (
                  <div className="p-2.5 rounded-xl bg-[#222F43] border border-[#FF8A35]/40 text-[#AEB9CC]">
                    <span className="font-heading font-bold text-xs text-[#FF8A35] block">
                      Battle Arena
                    </span>
                    <span>Squad: {battleSquadSize} Fighters • Round-Robin Schedule • 3-1-0 Pts</span>
                  </div>
                )}
                {gameModes.includes('party') && (
                  <div className="p-2.5 rounded-xl bg-[#222F43] border border-[#9147FF]/40 text-[#AEB9CC]">
                    <span className="font-heading font-bold text-xs text-[#9147FF] block">
                      Party Arena
                    </span>
                    <span>{partyGames.length} Games • {partyRoundTimer}s Timer • {partyTotalRounds} Rounds</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Navigation Toolbar */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#39465A]">
        <div>
          {currentStep > 1 && (
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleBack}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {currentStep < 4 ? (
            <Button
              type="button"
              variant="champagne"
              size="md"
              onClick={handleNext}
              className="flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => handleFinalSubmit('draft')}
                className="flex items-center gap-1.5 border-[#39465A]"
              >
                <Save className="w-4 h-4 text-[#AEB9CC]" />
                <span>Save as Draft</span>
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => handleFinalSubmit('upcoming')}
                className="flex items-center gap-1.5 bg-[#D4B879] hover:bg-[#c9ad6a] text-[#111827] font-black shadow-lg shadow-[#D4B879]/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Tournament</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
