import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowRight,
  BookOpen,
  Calendar,
  Lock
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AUCTION_PRESETS } from '../../services/presets';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { franchiseService } from '../../services/franchiseService';
import { useBattleArena } from '../../context/BattleArenaContext';
import { storageService } from '../../services/storageService';
import { BattleImportModal } from './BattleImportModal';
import { TeamBudgetConfig } from '../setup/TeamBudgetConfig';
import { openGameRules } from '../rules/GameRules';
import { toast } from 'sonner';

const BATTLE_SQUAD_PRESETS = [3, 5, 7, 10];

export const BattleArenaHome = ({ onSwitchToAuction, onSwitchToParty }) => {
  const { initializeBattleTournament } = useBattleArena();

  // 1. Independent team count & franchise selection (saved under 'battle')
  const [selectedTeamIds, setSelectedTeamIds] = useState(() => {
    const saved = franchiseService.getSelectedFranchiseIds('battle');
    if (saved && saved.length >= 2) return saved;
    const active = franchiseService.getActiveFranchises();
    return active.slice(0, Math.min(4, active.length)).map((f) => f.id);
  });

  const [teamCount, setTeamCount] = useState(() => {
    const saved = franchiseService.getSelectedFranchiseIds('battle');
    return saved && saved.length >= 2 ? saved.length : 4;
  });

  // Save battle selection to independent storage
  useEffect(() => {
    if (selectedTeamIds && selectedTeamIds.length > 0) {
      franchiseService.saveSelectedFranchiseIds('battle', selectedTeamIds);
    }
  }, [selectedTeamIds]);

  // 2. Squad Size Configuration
  const [squadSize, setSquadSize] = useState(3);
  const [customSquadSize, setCustomSquadSize] = useState('');

  // 3. Independent Starting Purse Configuration
  const [purseMode, setPurseMode] = useState('equal'); // 'equal' | 'custom'
  const [startingPurse, setStartingPurse] = useState(100);
  const [configuredTeams, setConfiguredTeams] = useState([]);

  // 4. Tournament Pool & Presets
  const [selectedPresetId, setSelectedPresetId] = useState(AUCTION_PRESETS[0].id);
  const [importedTournament, setImportedTournament] = useState(null);
  const [customFileItems, setCustomFileItems] = useState(null);
  const [customTournamentName, setCustomTournamentName] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Selected teams dynamically resolved from franchiseService
  const activeTeams = useMemo(() => {
    return selectedTeamIds
      .map((id) => franchiseService.getFranchiseById(id))
      .filter(Boolean);
  }, [selectedTeamIds]);

  const isSelectionValid = selectedTeamIds.length === teamCount;

  // Selected preset
  const selectedPreset = AUCTION_PRESETS.find((p) => p.id === selectedPresetId) || AUCTION_PRESETS[0];
  const activePool = importedTournament?.items || customFileItems || selectedPreset.items;

  // Pool capacity validation
  const requiredPoolLots = teamCount * squadSize;
  const isPoolSufficient = activePool.length >= requiredPoolLots;

  // Estimated matches calculation for round-robin
  const estimatedMatches = useMemo(() => {
    if (teamCount === 2) return squadSize;
    if (teamCount === 3) return Math.max(1, Math.floor(squadSize / 2)) * 3;
    if (teamCount === 4) return (squadSize >= 6 ? Math.floor(squadSize / 3) : 1) * 6;
    return Math.floor((teamCount * (teamCount - 1)) / 2);
  }, [teamCount, squadSize]);

  const handleStartTournament = () => {
    if (!isSelectionValid) {
      toast.error(`Please select exactly ${teamCount} franchises before starting (${selectedTeamIds.length}/${teamCount} selected).`);
      return;
    }
    if (!isPoolSufficient) {
      toast.error(`Not enough lots in pool! Need at least ${requiredPoolLots} items for ${teamCount} teams of ${squadSize}.`);
      return;
    }

    const finalTeamsToLaunch = configuredTeams.length === teamCount ? configuredTeams : activeTeams.map(t => ({
      ...t,
      initialPurse: startingPurse,
      purse: startingPurse,
    }));

    const success = initializeBattleTournament({
      preset: selectedPreset,
      teamCount,
      selectedTeams: finalTeamsToLaunch,
      squadSize,
      startingPurse: Number(startingPurse) || 100,
      customItems: importedTournament?.items || customFileItems,
      customTournament: importedTournament,
    });

    if (success) {
      toast.success('Entering Round 1: Team Auction (Cobalt & Silver)!');
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#101B32] text-[#F0F3F8] pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10">
        
        {/* HERO TITLE SECTION */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#1C2D4B] border border-[#394C69] text-xs font-heading font-bold text-[#B7C3D4] shadow-sm">
            <Swords className="w-4 h-4 text-[#6198E8]" />
            <span className="text-[#F0F3F8]">Competitive Battle Arena</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#394C69]" />
            <span className="text-[#B7C3D4] font-mono tracking-wider">ROUND 1: AUCTION → ROUND 2: TACTICAL CLASH</span>
          </div>

          <h1 className="font-title text-5xl sm:text-7xl font-black tracking-wider uppercase text-[#F0F3F8] leading-none">
            BATTLE ARENA
          </h1>

          <p className="text-sm sm:text-base text-[#B7C3D4] max-w-2xl mx-auto leading-relaxed">
            Acquire your superstar roster through a strategic blind auction, draft fighters secretly behind the pass-and-play curtain, then clash head-to-head in tactical arena bouts!
          </p>

          <div className="flex items-center justify-center gap-3 pt-1">
            <Button
              variant="champagne"
              size="md"
              onClick={() => openGameRules('battle')}
              className="font-heading text-xs flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Battle Arena Rulebook</span>
            </Button>
          </div>
        </div>

        {/* 1. DYNAMIC FRANCHISE SELECTION */}
        <div className="max-w-5xl mx-auto">
          <FranchiseSelector
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            selectedTeamIds={selectedTeamIds}
            onSelectedTeamsChange={setSelectedTeamIds}
            arenaType="battle"
            showCountSelector={true}
            title="1. Select Contending Franchises"
            description="Choose how many franchises will compete (2, 3, 4, 5, 6, 8, 10+) in this battle tournament."
          />
        </div>

        {/* 2. SETUP CONFIGURATION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
          
          {/* LEFT: SQUAD & INDEPENDENT PURSE CONFIGURATION (6 COLS) */}
          <div className="lg:col-span-6 bg-[#1C2D4B] rounded-3xl p-6 sm:p-8 border border-[#394C69] shadow-xl space-y-6">
            
            {/* Squad Size Selector */}
            <div>
              <label className="text-xs font-bold font-heading uppercase text-[#B7C3D4] tracking-wider mb-3 flex items-center justify-between">
                <span>2. Required Squad Size Per Team</span>
                <span className="text-[#F0F3F8] font-mono font-black">{squadSize} Fighters</span>
              </label>

              <div className="grid grid-cols-4 gap-2.5">
                {BATTLE_SQUAD_PRESETS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSquadSize(size);
                      setCustomSquadSize('');
                    }}
                    className={`py-2.5 rounded-2xl border font-mono text-xs transition-all text-center ${
                      squadSize === size
                        ? 'bg-[#6198E8] text-[#101B32] font-black border-[#6198E8]'
                        : 'bg-[#293D5C] text-[#B7C3D4] hover:text-[#F0F3F8] border-[#394C69]'
                    }`}
                  >
                    <span className="block text-sm font-black">{size} Lots</span>
                    <span className="text-[10px] font-heading block opacity-80">Preset</span>
                  </button>
                ))}
              </div>

              {/* Custom size input */}
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] text-[#B7C3D4] font-heading">Custom squad size:</span>
                <input
                  type="number"
                  min={2}
                  max={15}
                  value={customSquadSize}
                  onChange={(e) => {
                    setCustomSquadSize(e.target.value);
                    const val = Number(e.target.value);
                    if (val >= 2 && val <= 15) setSquadSize(val);
                  }}
                  className="w-20 rounded-xl px-2.5 py-1 text-xs font-mono bg-[#293D5C] border border-[#394C69] text-[#F0F3F8] focus:outline-none focus:border-[#6198E8]"
                  placeholder="e.g. 6"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#293D5C] border border-[#394C69] text-xs mt-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#B7C3D4]">Total Fighters Needed:</span>
                  <span className="font-mono font-bold text-[#F0F3F8]">{requiredPoolLots} ({teamCount} × {squadSize})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#B7C3D4]">Fighter Pool Lots:</span>
                  <span className={`font-mono font-bold ${isPoolSufficient ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {activePool.length} Lots
                  </span>
                </div>
                {!isPoolSufficient && (
                  <p className="text-[11px] text-rose-300 font-bold pt-1">
                    ⚠️ Pool requires at least {requiredPoolLots} fighters!
                  </p>
                )}
              </div>
            </div>

            {/* Starting Purse Configuration (Independent from Auction) */}
            <div className="pt-2 border-t border-[#394C69]">
              <label className="text-xs font-bold font-heading uppercase text-[#B7C3D4] tracking-wider mb-2 flex items-center justify-between">
                <span>3. Franchise Purse Budget</span>
                <span className="text-[#6198E8] font-mono font-bold">₹{startingPurse} Cr / Team</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[50, 75, 100, 150].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setStartingPurse(amount)}
                    className={`py-2 rounded-xl border font-mono text-xs transition-all ${
                      startingPurse === amount
                        ? 'bg-[#6198E8] text-[#101B32] font-black border-[#6198E8]'
                        : 'bg-[#293D5C] text-[#B7C3D4] hover:text-[#F0F3F8] border-[#394C69]'
                    }`}
                  >
                    ₹{amount} Cr
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-[#B7C3D4] mt-2 italic">
                Independent Battle budget used exclusively for Round 1 auction bidding.
              </p>
            </div>

          </div>

          {/* RIGHT: TOURNAMENT ROSTER SELECTION (6 COLS) */}
          <div className="lg:col-span-6 bg-[#1C2D4B] rounded-3xl p-6 sm:p-8 border border-[#394C69] shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <label className="text-xs font-bold font-heading uppercase text-[#B7C3D4] tracking-wider block">
                4. Select Fighter Pool
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
                          ? 'bg-[#293D5C] border-[#6198E8] shadow-sm'
                          : 'bg-[#101B32] border-[#394C69] hover:border-[#6198E8]/50 text-[#B7C3D4] hover:text-[#F0F3F8]'
                      }`}
                    >
                      <div>
                        <span className="font-heading font-bold text-xs text-[#F0F3F8] block">
                          {preset.name}
                        </span>
                        <span className="text-[10px] text-[#B7C3D4] block">
                          {preset.category} • {preset.items.length} Fighters Available
                        </span>
                      </div>
                      <Badge variant={isSelected ? 'theme-accent' : 'outline'} className="text-[9px]">
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </Badge>
                    </button>
                  );
                })}
              </div>

              {/* Custom JSON Import Action */}
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-dashed border-[#6198E8]/40 hover:border-[#6198E8] text-[#6198E8] text-xs font-heading font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Custom JSON / TXT Roster</span>
              </button>
            </div>

            {/* PRE-LAUNCH REVIEW SUMMARY (PART 6.1.E) */}
            <div className="p-4 rounded-2xl bg-[#101B32] border border-[#394C69] space-y-2">
              <span className="text-[11px] font-heading font-bold text-[#F0F3F8] uppercase tracking-wider block">
                Tournament Pre-Launch Preview:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#B7C3D4] font-mono">
                <div>• Contenders: <strong className="text-[#F0F3F8]">{teamCount} Teams</strong></div>
                <div>• Squad Target: <strong className="text-[#F0F3F8]">{squadSize} Lots</strong></div>
                <div>• Est. Matches: <strong className="text-[#6198E8]">~{estimatedMatches} Bouts</strong></div>
                <div>• Team Purse: <strong className="text-[#C5A46D]">₹{startingPurse} Cr</strong></div>
              </div>

              <div className="pt-2 border-t border-[#394C69]/60 flex items-center justify-between text-[11px]">
                <span className="text-[#B7C3D4]">Rating Concealment:</span>
                <span className="text-emerald-400 font-bold">Encrypted until bout reveal</span>
              </div>
            </div>

            {/* LAUNCH BUTTON */}
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartTournament}
              disabled={!isSelectionValid || !isPoolSufficient}
              className="w-full py-3.5 bg-[#6198E8] hover:bg-[#4d86db] text-[#101B32] font-black uppercase tracking-wider text-sm shadow-xl shadow-[#6198E8]/20"
            >
              <Swords className="w-5 h-5 mr-1" />
              <span>Launch Battle Tournament</span>
            </Button>

          </div>

        </div>

      </div>

      {/* Battle Import Modal */}
      <BattleImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={(customItems, name, parsedTournament) => {
          setCustomFileItems(customItems);
          setCustomTournamentName(name || 'Custom Roster');
          setImportedTournament(parsedTournament || null);
          setIsImportModalOpen(false);
          toast.success(`Imported ${customItems.length} custom fighters!`);
        }}
      />
    </div>
  );
};
