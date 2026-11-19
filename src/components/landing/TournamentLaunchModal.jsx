import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Trophy, Flame, Sparkles, AlertCircle, Clock, Zap, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TeamBudgetConfig } from '../setup/TeamBudgetConfig';
import { FranchiseSelector } from '../common/FranchiseSelector';
import { FIXED_TEAMS } from '../../services/presets';
import { franchiseService } from '../../services/franchiseService';
import { AUCTION_MODES } from '../../services/auctionEngine';
import { toast } from 'sonner';

export const TournamentLaunchModal = ({
  preset,
  isOpen,
  onClose,
  onLaunch,
}) => {
  if (!isOpen || !preset) return null;

  // Restore team count & selected team IDs using franchiseService
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

  // Save selection preference to franchiseService
  useEffect(() => {
    if (selectedTeamIds && selectedTeamIds.length > 0) {
      franchiseService.saveSelectedFranchiseIds('auction', selectedTeamIds);
    }
  }, [selectedTeamIds]);

  const [selectedMode, setSelectedMode] = useState('standard');

  // Compute selected team objects dynamically via franchiseService
  const selectedTeams = useMemo(() => {
    return selectedTeamIds
      .map((id) => franchiseService.getFranchiseById(id))
      .filter(Boolean);
  }, [selectedTeamIds]);

  const [budgetConfigState, setBudgetConfigState] = useState({
    isValid: true,
    teams: selectedTeams,
    totalPurse: selectedTeams.length * 100,
  });

  const isTeamSelectionValid = selectedTeamIds.length === teamCount;

  const handleModeChange = (modeKey) => {
    setSelectedMode(modeKey);
    const modeConfig = AUCTION_MODES[modeKey];
    if (modeConfig?.defaultPurse) {
      const adjustedTeams = selectedTeams.map((t) => ({
        ...t,
        initialPurse: modeConfig.defaultPurse,
        purse: modeConfig.defaultPurse,
      }));
      setBudgetConfigState({
        isValid: true,
        teams: adjustedTeams,
        totalPurse: modeConfig.defaultPurse * adjustedTeams.length,
      });
    }
  };

  const handleLaunch = () => {
    if (!isTeamSelectionValid) {
      toast.error(`Please select exactly ${teamCount} franchises before launching.`);
      return;
    }
    if (!budgetConfigState.isValid) {
      toast.error('Please fix invalid team purse values before launching.');
      return;
    }
    onLaunch(budgetConfigState.teams, selectedMode);
  };

  const primaryColor = preset.theme?.primary || '#9147FF';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl rounded-3xl battle-panel border border-brand-purple/50 shadow-2xl p-6 sm:p-8 overflow-hidden my-8 space-y-6"
      >
        {/* Glow ambient background halo */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: primaryColor }}
        />

        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="purple">
                {preset.category}
              </Badge>
              <Badge variant="gold">
                {preset.scoreLabel} (1-100)
              </Badge>
              <span className="text-xs font-mono font-bold text-brand-neon">
                {preset.items.length} Entries
              </span>
              <span className="text-xs font-mono font-bold text-brand-cyan">
                {teamCount} Franchises
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wide">
              {preset.name}
            </h2>
            <p className="text-xs text-battle-muted mt-1 max-w-xl">
              {preset.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Dynamic Team Selection */}
        <div className="relative z-10">
          <FranchiseSelector
            teamCount={teamCount}
            onTeamCountChange={setTeamCount}
            selectedTeamIds={selectedTeamIds}
            onSelectedTeamsChange={setSelectedTeamIds}
            arenaType="auction"
            showCountSelector={true}
          />
        </div>

        {/* Section 2: Auction Mode Selection Strip */}
        <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border relative z-10 space-y-2.5">
          <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-brand-orange" />
            <span>Select Auction Pace & Arena Mode:</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {Object.values(AUCTION_MODES).map((mode) => {
              const isSelected = selectedMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => handleModeChange(mode.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-battle-surface border-brand-orange shadow-glow-orange'
                      : 'bg-battle-surface/40 border-battle-border hover:border-battle-borderLight text-battle-muted hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-broadcast font-black text-xs text-white">
                      {mode.name}
                    </span>
                    <Badge variant={mode.badgeVariant || 'purple'} className="text-[9px] px-1.5 py-0">
                      {mode.timerDuration}s
                    </Badge>
                  </div>
                  <p className="text-[10px] text-battle-muted leading-tight line-clamp-2">
                    {mode.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Dedicated Team Budget Configuration for Selected Franchises */}
        <div className="relative z-10">
          <TeamBudgetConfig
            initialTeams={selectedTeams}
            currency={preset.currency}
            onChange={(cfg) => setBudgetConfigState(cfg)}
          />
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-battle-border relative z-10">
          <div className="text-xs text-battle-muted">
            {!isTeamSelectionValid ? (
              <span className="text-amber-400 font-broadcast font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Select exactly {teamCount} franchises to launch ({selectedTeamIds.length}/{teamCount} selected).
              </span>
            ) : budgetConfigState.isValid ? (
              <span className="text-emerald-400 font-broadcast font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {selectedTeams.length} franchise budgets verified. Ready to enter the broadcast arena.
              </span>
            ) : (
              <span className="text-rose-400 font-broadcast font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Fix invalid budget fields above before launching.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!isTeamSelectionValid || !budgetConfigState.isValid}
              onClick={handleLaunch}
              className="w-full sm:w-auto shadow-glow-purple font-broadcast tracking-wide flex items-center gap-2 justify-center"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>LAUNCH ARENA</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
