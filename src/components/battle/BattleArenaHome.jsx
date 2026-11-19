import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Swords, 
  Users, 
  Trophy, 
  Sparkles, 
  Shield, 
  Coins, 
  Play, 
  AlertTriangle, 
  Upload, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FIXED_TEAMS, AUCTION_PRESETS } from '../../services/presets';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { useBattleArena } from '../../context/BattleArenaContext';
import { storageService } from '../../services/storageService';
import { BattleImportModal } from './BattleImportModal';
import { toast } from 'sonner';

const BATTLE_TEAMS_STORAGE_KEY = 'bidbattle_battle_teams_selection';

export const BattleArenaHome = ({ onSwitchToAuction, onSwitchToParty }) => {
  const { initializeBattleTournament } = useBattleArena();

  // Restore team count & selected team IDs independently from Battle LocalStorage
  const [teamCount, setTeamCount] = useState(() => {
    try {
      const saved = localStorage.getItem(BATTLE_TEAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if ([2, 3, 4].includes(parsed.teamCount)) return parsed.teamCount;
      }
    } catch (e) {}
    return 4;
  });

  const [selectedTeamIds, setSelectedTeamIds] = useState(() => {
    try {
      const saved = localStorage.getItem(BATTLE_TEAMS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.selectedTeamIds) && parsed.selectedTeamIds.length > 0) {
          const valid = parsed.selectedTeamIds.filter((id) =>
            FIXED_TEAMS.some((ft) => ft.id === id)
          );
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {}
    return FIXED_TEAMS.map((t) => t.id);
  });

  // Save battle selection to independent LocalStorage key
  React.useEffect(() => {
    try {
      localStorage.setItem(
        BATTLE_TEAMS_STORAGE_KEY,
        JSON.stringify({ teamCount, selectedTeamIds })
      );
    } catch (e) {}
  }, [teamCount, selectedTeamIds]);

  const [squadSize, setSquadSize] = useState(3);
  const [startingPurse, setStartingPurse] = useState(100);
  const [selectedPresetId, setSelectedPresetId] = useState(AUCTION_PRESETS[0].id);
  const [importedTournament, setImportedTournament] = useState(null);
  const [customFileItems, setCustomFileItems] = useState(null);
  const [customTournamentName, setCustomTournamentName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected teams based on user choice
  const activeTeams = React.useMemo(() => {
    return selectedTeamIds
      .map((id) => FIXED_TEAMS.find((t) => t.id === id))
      .filter(Boolean);
  }, [selectedTeamIds]);

  const isSelectionValid = selectedTeamIds.length === teamCount;

  // Selected preset
  const selectedPreset = AUCTION_PRESETS.find((p) => p.id === selectedPresetId) || AUCTION_PRESETS[0];
  const activePool = importedTournament?.items || customFileItems || selectedPreset.items;

  const requiredPoolLots = teamCount * squadSize;
  const isPoolSufficient = activePool.length >= requiredPoolLots;

  const handleStartTournament = () => {
    if (!isSelectionValid) {
      toast.error(`Please select exactly ${teamCount} franchises before starting (${selectedTeamIds.length}/${teamCount} selected).`);
      return;
    }
    if (!isPoolSufficient) {
      toast.error(`Not enough lots in pool! Need at least ${requiredPoolLots} items for ${teamCount} teams of ${squadSize}.`);
      return;
    }

    const success = initializeBattleTournament({
      preset: selectedPreset,
      teamCount,
      selectedTeams: activeTeams,
      squadSize,
      startingPurse: Number(startingPurse) || 100,
      customItems: importedTournament?.items || customFileItems,
      customTournament: importedTournament,
    });

    if (success) {
      toast.success('Entering Round 1: Team Auction!');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-grid-pattern pb-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-brand-orange/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-brand-purple/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[320px] bg-brand-cyan/15 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10">
        
        {/* HERO TITLE SECTION */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-battle-surface/90 border border-brand-orange/40 text-xs font-bold text-brand-orange shadow-glow-orange">
            <Swords className="w-4 h-4 text-brand-orange" />
            <span className="text-battle-text">BIDBATTLE 7.3 • Competitive Esports System</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon" />
            <span className="text-brand-neon font-black tracking-wider">ROUND 1: AUCTION → ROUND 2: BATTLES</span>
          </div>

          <h1 className="font-broadcast text-5xl sm:text-7xl font-black tracking-wider uppercase text-white leading-none">
            BATTLE <span className="neon-text-orange">ARENA</span>
          </h1>

          <p className="text-sm sm:text-base text-battle-muted max-w-2xl mx-auto leading-relaxed">
            Acquire your superstar roster through a strategic high-stakes auction, then clash head-to-head in tactical arena battles to crown the undisputed champion!
          </p>
        </div>

        {/* DYNAMIC FRANCHISE SELECTION (STEP 1 & 2) */}
        <div className="max-w-5xl mx-auto">
          <FranchiseSelector
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            selectedTeamIds={selectedTeamIds}
            onSelectedTeamsChange={setSelectedTeamIds}
            arenaType="battle"
            showCountSelector={true}
          />
        </div>

        {/* SETUP CONFIGURATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
          
          {/* LEFT: SQUAD & PURSE SETTINGS (6 COLS) */}
          <div className="lg:col-span-6 battle-panel rounded-3xl p-6 sm:p-8 border border-brand-orange/40 shadow-xl space-y-6">
            
            {/* Squad Size Selector */}
            <div>
              <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3 flex items-center justify-between">
                <span>Required Squad Size Per Team</span>
                <span className="text-brand-neon font-mono font-black">{squadSize} Players</span>
              </label>

              <div className="grid grid-cols-4 gap-2.5">
                {[3, 5, 8].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSquadSize(size)}
                    className={`py-2.5 rounded-2xl border font-mono text-xs transition-all text-center ${
                      squadSize === size
                        ? 'bg-brand-cyan text-dark-950 font-black border-brand-cyan shadow-glow-cyan'
                        : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                    }`}
                  >
                    <span className="block text-sm font-black">{size} Lots</span>
                    <span className="text-[10px] font-broadcast block opacity-80">Equal Squad</span>
                  </button>
                ))}

                {/* Custom size input */}
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={squadSize}
                    onChange={(e) => setSquadSize(Math.max(2, Math.min(12, Number(e.target.value) || 2)))}
                    className="w-full h-full py-2 px-2 text-center rounded-2xl bg-battle-surface border border-battle-border text-white text-xs font-mono font-bold focus:border-brand-neon focus:outline-none"
                    placeholder="Custom"
                  />
                  <span className="text-[9px] text-battle-muted font-mono block text-center mt-1">
                    Custom Cap
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-battle-muted mt-2 italic">
                Every team must acquire exactly {squadSize} players during Round 1 before battles can begin.
              </p>
            </div>

            {/* Starting Purse Configuration */}
            <div className="pt-2">
              <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-2 flex items-center justify-between">
                <span>Equal Starting Purse</span>
                <span className="text-amber-400 font-mono font-bold">₹{startingPurse} Cr / Team</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[50, 100, 150].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setStartingPurse(amount)}
                    className={`py-2 rounded-xl border font-mono text-xs transition-all ${
                      startingPurse === amount
                        ? 'bg-amber-400 text-dark-950 font-black border-amber-300 shadow-glow-orange'
                        : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                    }`}
                  >
                    ₹{amount} Cr
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: TOURNAMENT ROSTER SELECTION (6 COLS) */}
          <div className="lg:col-span-6 battle-panel rounded-3xl p-6 sm:p-8 border border-brand-purple/40 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block">
                4. Select Tournament Roster
              </label>

              {/* Preset Cards Selector */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {AUCTION_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id && !importedTournament && !customFileItems;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedPresetId(preset.id);
                        setImportedTournament(null);
                        setCustomFileItems(null);
                        setCustomTournamentName('');
                      }}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-battle-surface border-brand-purple shadow-glow-purple'
                          : 'bg-battle-surface/40 border-battle-border hover:border-battle-borderLight text-battle-muted hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <h4 className="font-broadcast font-bold text-xs text-white truncate">
                          {preset.name}
                        </h4>
                        <span className="text-[10px] font-mono text-battle-muted block">
                          {preset.category} • {preset.items.length} Entries
                        </span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-brand-purple flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dedicated Import Tournament Button */}
              <div className="pt-2 border-t border-battle-border/60 space-y-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="w-full py-3 px-4 rounded-2xl border border-dashed border-brand-orange/60 hover:border-brand-orange bg-battle-bg/80 hover:bg-brand-orange/10 transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-battle-surface border border-brand-orange/40 flex items-center justify-center text-brand-orange shadow-sm group-hover:scale-105 transition-transform">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-broadcast font-bold text-white block">
                        Import Tournament JSON
                      </span>
                      <span className="text-[10px] text-battle-muted font-mono block">
                        Upload custom player roster (.json)
                      </span>
                    </div>
                  </div>
                  <Badge variant="orange" className="text-[10px]">
                    IMPORT
                  </Badge>
                </button>

                {/* Active Imported Tournament Card */}
                {importedTournament && (
                  <div className="p-3.5 rounded-2xl border-2 border-brand-orange bg-brand-orange/10 relative shadow-glow-orange space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="orange" className="text-[9px]">
                        ACTIVE IMPORTED TOURNAMENT
                      </Badge>
                      <button
                        type="button"
                        onClick={() => {
                          setImportedTournament(null);
                          setCustomFileItems(null);
                          setCustomTournamentName('');
                        }}
                        className="text-[10px] text-battle-muted hover:text-rose-400 font-mono transition-colors"
                      >
                        Revert to Preset
                      </button>
                    </div>
                    <div>
                      <h4 className="font-broadcast font-bold text-sm text-white truncate">
                        {importedTournament.name}
                      </h4>
                      <p className="text-[11px] text-battle-muted font-mono truncate">
                        {importedTournament.category} • {importedTournament.items.length} Entries
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-brand-orange/20">
                      <span className="text-[10px] text-brand-orange font-mono font-medium">
                        ✓ Loaded for Round 1 Auction
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="text-[10px] text-brand-cyan hover:underline font-mono font-bold"
                      >
                        Re-import / Replace
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pool Validation Status Card */}
              <div className={`p-4 rounded-2xl border text-xs font-mono ${
                isPoolSufficient
                  ? 'bg-emerald-950/30 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-800 text-rose-300'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold">Lot Pool Status:</span>
                  <span>{activePool.length} Lots Available</span>
                </div>
                <p className="text-[11px] opacity-90">
                  {isPoolSufficient
                    ? `✓ Pool verified. Requires ${requiredPoolLots} sold lots for ${teamCount} teams.`
                    : `⚠️ Deficit! Requires at least ${requiredPoolLots} lots (Need +${requiredPoolLots - activePool.length} more).`}
                </p>
              </div>
            </div>

            {/* Launch Round 1 Auction Button */}
            <div className="pt-4 space-y-2">
              {!isSelectionValid && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-broadcast font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Select exactly {teamCount} franchises to start ({selectedTeamIds.length}/{teamCount} selected).</span>
                </div>
              )}
              <Button
                variant="primary"
                size="xl"
                disabled={!isPoolSufficient || !isSelectionValid}
                onClick={handleStartTournament}
                className="w-full font-broadcast text-base shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-dark-950 font-black flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START ROUND 1: TEAM AUCTION</span>
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Battle Tournament Import Modal */}
      <BattleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        teamCount={teamCount}
        squadSize={squadSize}
        onImportSuccess={({ tournament, items, runtimeConfig }) => {
          setImportedTournament(tournament);
          setCustomFileItems(items);
          setCustomTournamentName(tournament.name);
          if (runtimeConfig) {
            if (runtimeConfig.teams && runtimeConfig.teams.length >= 2 && runtimeConfig.teams.length <= 4) {
              setTeamCount(runtimeConfig.teams.length);
              setSelectedTeamIds(runtimeConfig.teams.map((t) => t.id));
            }
            if (runtimeConfig.squadSize) {
              setSquadSize(runtimeConfig.squadSize);
            }
            if (runtimeConfig.teamBudgets?.defaultPurse) {
              setStartingPurse(runtimeConfig.teamBudgets.defaultPurse);
            }
          }
        }}
      />
    </div>
  );
};
