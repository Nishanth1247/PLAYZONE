import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Coins, 
  Users, 
  Layers, 
  Clock, 
  Sliders, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Gavel, 
  Shield, 
  Trophy, 
  RotateCcw,
  Swords
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { FIXED_TEAMS } from '../../services/presets';
import { validateImportTournamentConfig, buildRuntimeTournamentConfig } from '../../services/importConfigService';
import { AUCTION_MODES } from '../../services/auctionEngine';

const PURSE_PRESETS = [50, 75, 100, 150, 200];

export const ImportConfigForm = ({
  importedData,
  defaults,
  arenaType = 'auction', // 'auction' | 'battle'
  onBackToUpload,
  onLaunch,
  onSaveOnly,
}) => {
  // Navigation: 'configure' | 'review'
  const [step, setStep] = useState('configure');

  // Form State initialized from Priority 2 (Imported JSON) / Priority 3 (Defaults)
  const [name, setName] = useState(defaults.name);
  const [category, setCategory] = useState(defaults.category);
  const [description, setDescription] = useState(defaults.description);

  // Teams & Franchise Selection
  const [teamCount, setTeamCount] = useState(defaults.teamCount);
  const [selectedTeamIds, setSelectedTeamIds] = useState(defaults.selectedTeamIds);

  // Purses
  const [purseMode, setPurseMode] = useState(defaults.purseMode); // 'equal' | 'individual'
  const [defaultPurse, setDefaultPurse] = useState(defaults.defaultPurse);
  const [individualMap, setIndividualMap] = useState(defaults.individualMap);

  // Squad Settings
  const [minSquadSize, setMinSquadSize] = useState(defaults.minSquadSize);
  const [maxSquadSize, setMaxSquadSize] = useState(defaults.maxSquadSize);
  const [bestItemsCount, setBestItemsCount] = useState(defaults.bestItemsCount);
  const [battleSquadSize, setBattleSquadSize] = useState(defaults.minSquadSize || 3);

  // Auction Settings
  const [defaultBasePrice, setDefaultBasePrice] = useState(defaults.defaultBasePrice);
  const [overrideBasePrice, setOverrideBasePrice] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState(defaults.countdownDuration);
  const [surpriseReveal, setSurpriseReveal] = useState(defaults.surpriseReveal);
  const [auctionMode, setAuctionMode] = useState(defaults.auctionMode);

  // Scoring Settings
  const [metricName, setMetricName] = useState(defaults.metricName);
  const [minScore, setMinScore] = useState(defaults.minScore);
  const [maxScore, setMaxScore] = useState(defaults.maxScore);

  const entriesCount = defaults.entriesCount || 0;

  // Selected teams metadata
  const selectedTeams = useMemo(() => {
    return selectedTeamIds
      .map((id) => FIXED_TEAMS.find((t) => t.id === id))
      .filter(Boolean)
      .map((t) => ({
        ...t,
        initialPurse: purseMode === 'equal' ? Number(defaultPurse) : Number(individualMap[t.id] || defaultPurse),
        purse: purseMode === 'equal' ? Number(defaultPurse) : Number(individualMap[t.id] || defaultPurse),
      }));
  }, [selectedTeamIds, purseMode, defaultPurse, individualMap]);

  // Validation
  const validation = useMemo(() => {
    return validateImportTournamentConfig({
      name,
      teamCount,
      selectedTeamIds,
      teamsWithPurses: selectedTeams,
      minSquadSize,
      maxSquadSize,
      bestItemsCount,
      defaultBasePrice,
      countdownDuration,
      entriesCount,
      arenaType,
      squadSize: battleSquadSize,
    });
  }, [
    name,
    teamCount,
    selectedTeamIds,
    selectedTeams,
    minSquadSize,
    maxSquadSize,
    bestItemsCount,
    defaultBasePrice,
    countdownDuration,
    entriesCount,
    arenaType,
    battleSquadSize,
  ]);

  // Handle individual purse change
  const handleIndividualPurseChange = (teamId, valStr) => {
    const num = Number(valStr);
    setIndividualMap((prev) => ({
      ...prev,
      [teamId]: valStr === '' ? '' : isNaN(num) ? prev[teamId] : num,
    }));
  };

  // Compile final runtime config
  const handleCompileAndProceed = (actionType) => {
    if (!validation.isValid) return;

    const runtimeConfig = buildRuntimeTournamentConfig({
      importedData,
      userConfig: {
        name,
        category,
        description,
        teamCount,
        selectedTeamIds,
        purseMode,
        defaultPurse: Number(defaultPurse),
        individualMap,
        minSquadSize: Number(minSquadSize),
        maxSquadSize: Number(maxSquadSize),
        bestItemsCount: Number(bestItemsCount),
        squadSize: Number(battleSquadSize),
        defaultBasePrice: Number(defaultBasePrice),
        overrideBasePrice,
        countdownDuration: Number(countdownDuration),
        surpriseReveal,
        auctionMode,
        metricName,
        minScore: Number(minScore),
        maxScore: Number(maxScore),
      },
      arenaType,
    });

    if (actionType === 'launch' && onLaunch) {
      onLaunch(runtimeConfig);
    } else if (actionType === 'save' && onSaveOnly) {
      onSaveOnly(runtimeConfig);
    }
  };

  const isBattle = arenaType === 'battle';
  const themeColor = isBattle ? '#FF8A35' : '#9147FF';

  return (
    <div className="space-y-6">
      
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between pb-3 border-b border-battle-border">
        <div className="flex items-center gap-2">
          <Badge variant={isBattle ? 'orange' : 'purple'} className="uppercase font-mono text-[10px]">
            {isBattle ? 'Battle Arena Import' : 'Auction Arena Import'}
          </Badge>
          <span className="text-xs text-battle-muted font-mono">
            {step === 'configure' ? 'Step 2 of 3: Tournament Configuration' : 'Step 3 of 3: Review & Launch'}
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded-lg bg-battle-surface border border-battle-border">
          {entriesCount} Lots Loaded
        </span>
      </div>

      {/* ================= STEP 2: CONFIGURE TOURNAMENT ================= */}
      {step === 'configure' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* SECTION A: TOURNAMENT INFORMATION */}
          <div className="p-5 rounded-3xl bg-battle-surface/40 border border-battle-border space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                A
              </span>
              <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                Tournament Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tournament Name"
                  className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-2 text-xs text-white font-broadcast font-bold focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Category / Topic
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category or Topic"
                  className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-purple"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-[11px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the tournament..."
                  className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-brand-purple"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: TEAM COUNT & FRANCHISE SELECTION (Reusing FranchiseSelector) */}
          <FranchiseSelector
            teamCount={teamCount}
            onTeamCountChange={(cnt) => setTeamCount(cnt)}
            selectedTeamIds={selectedTeamIds}
            onSelectedTeamsChange={(ids) => setSelectedTeamIds(ids)}
            arenaType={arenaType}
            showCountSelector={true}
            title="Participating Teams & Franchise Selection"
            description="Select whether 2, 3, or 4 teams will compete, and pick the exact franchises."
          />

          {/* SECTION C: STARTING PURSE CONFIGURATION */}
          <div className="p-5 rounded-3xl bg-battle-surface/40 border border-battle-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                  C
                </span>
                <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                  Starting Purse Configuration
                </h3>
              </div>

              {/* Purse Mode Toggle: Equal vs Individual */}
              <div className="flex gap-1 p-1 bg-battle-bg rounded-xl border border-battle-border">
                <button
                  type="button"
                  onClick={() => setPurseMode('equal')}
                  className={`px-3 py-1 rounded-lg text-xs font-broadcast font-bold transition-all ${
                    purseMode === 'equal'
                      ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                      : 'text-battle-muted hover:text-white'
                  }`}
                >
                  Equal Purse
                </button>
                <button
                  type="button"
                  onClick={() => setPurseMode('individual')}
                  className={`px-3 py-1 rounded-lg text-xs font-broadcast font-bold transition-all ${
                    purseMode === 'individual'
                      ? 'bg-battle-surface text-amber-400 border border-amber-500/40 shadow-sm'
                      : 'text-battle-muted hover:text-white'
                  }`}
                >
                  Individual Budgets
                </button>
              </div>
            </div>

            {/* EQUAL PURSE MODE */}
            {purseMode === 'equal' ? (
              <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-broadcast font-bold text-white block">
                      Common Starting Purse (Per Team)
                    </span>
                    <span className="text-[11px] text-battle-muted">
                      All {teamCount} franchises will start with this exact balance.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-mono">₹</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={defaultPurse}
                      onChange={(e) => setDefaultPurse(e.target.value)}
                      className="w-28 bg-battle-surface border border-battle-border rounded-xl px-3 py-1.5 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                    <span className="text-xs font-mono text-battle-muted">Cr</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-battle-border/60">
                  <span className="text-[10px] font-mono text-battle-muted uppercase font-bold">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PURSE_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setDefaultPurse(p)}
                        className={`px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold border transition-all ${
                          Number(defaultPurse) === p
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                            : 'bg-battle-surface border-battle-border text-battle-muted hover:text-white'
                        }`}
                      >
                        ₹{p} Cr
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* INDIVIDUAL PURSE MODE */
              <div className="space-y-3">
                <p className="text-xs text-battle-muted">
                  Configure starting budgets independently for each selected franchise:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedTeams.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 rounded-xl bg-battle-surface border border-battle-border">
                          {t.logo}
                        </span>
                        <div>
                          <h4 className="font-broadcast font-bold text-xs text-white" style={{ color: t.color }}>
                            {t.name}
                          </h4>
                          <span className="text-[10px] text-battle-muted font-mono">@{t.owner}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-mono">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          value={individualMap[t.id] !== undefined ? individualMap[t.id] : defaultPurse}
                          onChange={(e) => handleIndividualPurseChange(t.id, e.target.value)}
                          className="w-24 bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-[10px] font-mono text-battle-muted">Cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION D: SQUAD CONFIGURATION */}
          <div className="p-5 rounded-3xl bg-battle-surface/40 border border-battle-border space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                D
              </span>
              <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                {isBattle ? 'Battle Squad Size' : 'Squad Configuration & Limits'}
              </h3>
            </div>

            {isBattle ? (
              /* Battle Arena Squad Configuration */
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-battle-bg border border-battle-border">
                  <div>
                    <span className="text-xs font-broadcast font-bold text-white block">
                      Squad Size (Fighters per Franchise)
                    </span>
                    <span className="text-[11px] text-battle-muted">
                      Total lots required = {teamCount} Teams × {battleSquadSize} Squad = {teamCount * battleSquadSize} Lots.
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={battleSquadSize}
                      onChange={(e) => setBattleSquadSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 bg-battle-surface border border-battle-border rounded-xl px-3 py-1.5 text-center font-mono font-bold text-white text-sm"
                    />
                    <span className="text-xs text-battle-muted font-mono">fighters</span>
                  </div>
                </div>

                {/* Live Sufficiency Check */}
                <div className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                  entriesCount >= teamCount * battleSquadSize
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800 text-rose-300'
                }`}>
                  <span>
                    Roster Check: {entriesCount} entries available (Need min {teamCount * battleSquadSize})
                  </span>
                  <span className="font-bold">
                    {entriesCount >= teamCount * battleSquadSize ? '✓ Sufficient' : '⚠️ Deficit'}
                  </span>
                </div>
              </div>
            ) : (
              /* Auction Arena Squad Configuration */
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                    <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                      Max Squad Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxSquadSize}
                      onChange={(e) => setMaxSquadSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-white"
                    />
                    <span className="text-[9px] text-battle-muted block mt-1">Cap on total acquisitions</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                    <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                      Min Squad Size
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxSquadSize}
                      value={minSquadSize}
                      onChange={(e) => setMinSquadSize(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-white"
                    />
                    <span className="text-[9px] text-battle-muted block mt-1">Required quota per team</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                    <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                      Best Items Counted
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={maxSquadSize}
                      value={bestItemsCount}
                      onChange={(e) => setBestItemsCount(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-amber-300"
                    />
                    <span className="text-[9px] text-battle-muted block mt-1">Counted for final standings score</span>
                  </div>
                </div>

                {/* Live Sufficiency Check */}
                <div className={`p-3 rounded-2xl border text-xs font-mono flex items-center justify-between ${
                  entriesCount >= teamCount * minSquadSize
                    ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800 text-rose-300'
                }`}>
                  <span>
                    Catalog Check: {entriesCount} entries available (Need min {teamCount * minSquadSize} for {teamCount} teams × {minSquadSize} min squad)
                  </span>
                  <span className="font-bold">
                    {entriesCount >= teamCount * minSquadSize ? '✓ Sufficient' : '⚠️ Deficit'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION E: AUCTION SETTINGS */}
          <div className="p-5 rounded-3xl bg-battle-surface/40 border border-battle-border space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                E
              </span>
              <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                Auction Settings & Rules
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Default Base Price (₹ Cr)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={defaultBasePrice}
                  onChange={(e) => setDefaultBasePrice(Number(e.target.value) || 1.0)}
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-amber-400"
                />
                <label className="flex items-center gap-1.5 mt-2 text-[10px] text-battle-muted cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideBasePrice}
                    onChange={(e) => setOverrideBasePrice(e.target.checked)}
                    className="rounded bg-battle-surface border-battle-border text-brand-purple"
                  />
                  <span>Override entry base prices</span>
                </label>
              </div>

              <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Countdown Clock (Seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={countdownDuration}
                  onChange={(e) => setCountdownDuration(Math.max(5, parseInt(e.target.value) || 20))}
                  className="w-full bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1 text-sm font-mono font-bold text-white"
                />
                <span className="text-[9px] text-battle-muted block mt-1">Timer per lot</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border">
                <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                  Ratings Surprise Reveal
                </label>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-white font-broadcast font-bold">
                    {surpriseReveal ? 'Hidden in Auction' : 'Visible'}
                  </span>
                  <input
                    type="checkbox"
                    checked={surpriseReveal}
                    onChange={(e) => setSurpriseReveal(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-cyan bg-battle-surface border-battle-border cursor-pointer"
                  />
                </div>
                <span className="text-[9px] text-battle-muted block mt-1">Revealed at podium clash</span>
              </div>
            </div>
          </div>

          {/* SECTION F: SCORING CONFIGURATION (Auction Arena only) */}
          {!isBattle && (
            <div className="p-5 rounded-3xl bg-battle-surface/40 border border-battle-border space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                  F
                </span>
                <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                  Scoring Configuration
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                    Rating Metric Name
                  </label>
                  <input
                    type="text"
                    value={metricName}
                    onChange={(e) => setMetricName(e.target.value)}
                    placeholder="e.g. Overall Rating, IMDb"
                    className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                    Min Score
                  </label>
                  <input
                    type="number"
                    value={minScore}
                    onChange={(e) => setMinScore(e.target.value)}
                    className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-battle-muted uppercase font-bold block mb-1">
                    Max Score
                  </label>
                  <input
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                    className="w-full bg-battle-bg border border-battle-border rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Bottom Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-battle-border">
            <Button
              variant="secondary"
              size="md"
              onClick={onBackToUpload}
              className="text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Upload</span>
            </Button>

            <Button
              variant="accent"
              size="lg"
              disabled={!validation.isValid}
              onClick={() => setStep('review')}
              className="font-broadcast text-xs shadow-glow-orange"
            >
              <span>Review Summary & Launch</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* ================= STEP 3: REVIEW SUMMARY & LAUNCH ================= */}
      {step === 'review' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Summary Preview Box */}
          <div className="p-6 rounded-3xl bg-battle-surface/60 border border-brand-purple/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-battle-border">
              <div>
                <Badge variant={isBattle ? 'orange' : 'purple'} className="uppercase font-mono text-[10px] mb-1">
                  Ready to Launch
                </Badge>
                <h3 className="font-broadcast text-2xl font-black text-white uppercase">
                  {name}
                </h3>
                <span className="text-xs text-battle-muted font-mono">{category}</span>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-brand-neon font-mono block">
                  {entriesCount} Lots
                </span>
                <span className="text-[10px] text-battle-muted font-mono uppercase">Imported Catalog</span>
              </div>
            </div>

            {/* Config Specs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Format</span>
                <span className="font-bold text-brand-cyan text-sm">{teamCount} Teams</span>
              </div>

              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Squad Target</span>
                <span className="font-bold text-white text-sm">
                  {isBattle ? `${battleSquadSize} Fighters` : `Min ${minSquadSize} / Max ${maxSquadSize}`}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Purse Model</span>
                <span className="font-bold text-amber-300 text-sm capitalize">
                  {purseMode === 'equal' ? `₹${defaultPurse} Cr Each` : 'Individual Budgets'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Clock & Mode</span>
                <span className="font-bold text-emerald-400 text-sm">{countdownDuration}s • {auctionMode}</span>
              </div>
            </div>

            {/* Participating Franchises Summary Cards */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
                Selected Franchises ({selectedTeams.length}):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedTeams.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-2xl bg-battle-bg border flex items-center justify-between"
                    style={{ borderColor: `${t.color}60` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{t.logo}</span>
                      <span className="font-broadcast font-bold text-xs text-white" style={{ color: t.color }}>
                        {t.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-xs text-amber-400">
                      ₹{t.initialPurse} Cr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Validation Checklist Banner */}
            <div className={`p-4 rounded-2xl border text-xs font-mono ${
              validation.isValid
                ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800 text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-1">
                {validation.isValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Configuration Validated & Verified for Launch</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    <span>Configuration Validation Errors:</span>
                  </>
                )}
              </div>
              {validation.isValid ? (
                <p className="text-[11px] opacity-90">
                  {isBattle
                    ? `✓ Roster sufficiency confirmed: ${entriesCount} lots ready for ${teamCount} teams × ${battleSquadSize} squad.`
                    : `✓ Roster sufficiency confirmed: ${entriesCount} lots ready for ${teamCount} teams × ${minSquadSize} min squad.`}
                </p>
              ) : (
                <ul className="list-disc list-inside space-y-0.5 mt-1 text-[11px]">
                  {validation.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Step 3 Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStep('configure')}
              className="w-full sm:w-auto text-xs"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span>Back to Configuration</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onSaveOnly && (
                <Button
                  variant="outline"
                  size="md"
                  disabled={!validation.isValid}
                  onClick={() => handleCompileAndProceed('save')}
                  className="w-full sm:w-auto text-xs border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10"
                >
                  <span>Save to My Tournaments</span>
                </Button>
              )}

              {onLaunch && (
                <Button
                  variant="accent"
                  size="lg"
                  disabled={!validation.isValid}
                  onClick={() => handleCompileAndProceed('launch')}
                  className="w-full sm:w-auto font-broadcast text-xs shadow-glow-orange flex items-center justify-center gap-2"
                >
                  <span>{isBattle ? 'START ROUND 1: TEAM AUCTION' : 'LAUNCH AUCTION ARENA NOW'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
