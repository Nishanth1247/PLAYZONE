import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Sparkles, 
  X, 
  Plus, 
  Settings, 
  CheckSquare, 
  Square,
  ArrowRight
} from 'lucide-react';
import { franchiseService } from '../../services/franchiseService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { toast } from 'sonner';

/**
 * FranchiseSelector — Dynamic Team Selection for Auction Arena & Battle Arena
 * Dynamically loads franchises from franchiseService.
 * Supports selecting any number of teams from 2 up to available count (2, 3, 4, 5, 6, 8, 10...).
 * Features Select All, Clear All, direct link to Franchise Manager, and clear validation feedback.
 */
export const FranchiseSelector = ({
  teamCount = 4,
  onTeamCountChange,
  selectedTeamIds = [],
  onSelectedTeamsChange,
  arenaType = 'auction', // 'auction' | 'battle'
  showCountSelector = true,
  title = 'Select Participating Franchises',
  description = 'Choose how many teams and which specific contenders will battle in this arena.',
}) => {
  const isAuction = arenaType === 'auction';

  // Load active franchises dynamically
  const [activeFranchises, setActiveFranchises] = useState(() => franchiseService.getActiveFranchises());

  useEffect(() => {
    const handleUpdate = () => {
      setActiveFranchises(franchiseService.getActiveFranchises());
    };
    window.addEventListener('playzone_franchises_updated', handleUpdate);
    return () => window.removeEventListener('playzone_franchises_updated', handleUpdate);
  }, []);

  // Compute available quick count options based on total active franchises
  const countOptions = useMemo(() => {
    const total = activeFranchises.length;
    const standard = [2, 3, 4, 5, 6, 8, 10, 12, 16];
    const options = standard.filter((c) => c <= total);
    if (!options.includes(total) && total >= 2) {
      options.push(total);
      options.sort((a, b) => a - b);
    }
    return options.length > 0 ? options : [2];
  }, [activeFranchises.length]);

  // Handle changing target team count
  const handleCountClick = (newCount) => {
    if (newCount === teamCount) return;
    if (onTeamCountChange) {
      onTeamCountChange(newCount);
    }

    if (onSelectedTeamsChange) {
      if (selectedTeamIds.length > newCount) {
        // Trim selection to new count
        onSelectedTeamsChange(selectedTeamIds.slice(0, newCount));
      } else if (selectedTeamIds.length < newCount) {
        // Fill up to new count with remaining available franchises
        const missingCount = newCount - selectedTeamIds.length;
        const available = activeFranchises.filter((f) => !selectedTeamIds.includes(f.id));
        const toAdd = available.slice(0, missingCount).map((f) => f.id);
        onSelectedTeamsChange([...selectedTeamIds, ...toAdd]);
      }
    }
  };

  // Select All convenience action
  const handleSelectAll = () => {
    const allIds = activeFranchises.map((f) => f.id);
    if (onTeamCountChange) {
      onTeamCountChange(allIds.length);
    }
    if (onSelectedTeamsChange) {
      onSelectedTeamsChange(allIds);
    }
    toast.success(`Selected all ${allIds.length} franchises.`);
  };

  // Clear All convenience action
  const handleClearAll = () => {
    if (onSelectedTeamsChange) {
      onSelectedTeamsChange([]);
    }
    toast.info('Cleared franchise selection. Select at least 2 teams to compete.');
  };

  // Handle toggling an individual team card
  const handleTeamToggle = (teamId) => {
    const isSelected = selectedTeamIds.includes(teamId);

    if (isSelected) {
      const updated = selectedTeamIds.filter((id) => id !== teamId);
      onSelectedTeamsChange?.(updated);
    } else {
      if (selectedTeamIds.length >= teamCount) {
        toast.warning(
          `Franchise limit reached (${teamCount} Teams). Deselect an active team or choose a larger format to add this franchise.`,
          { duration: 2500 }
        );
        return;
      }
      onSelectedTeamsChange?.([...selectedTeamIds, teamId]);
    }
  };

  // Open Franchise Manager page
  const handleOpenManager = () => {
    window.dispatchEvent(new CustomEvent('bidbattle_open_franchises'));
  };

  const isComplete = selectedTeamIds.length === teamCount && teamCount >= 2;
  const remainingCount = teamCount - selectedTeamIds.length;
  const isBelowMinimum = selectedTeamIds.length < 2;

  return (
    <div className="rounded-3xl bg-[#222F43] p-5 sm:p-6 border border-[#39465A] shadow-xl space-y-6">
      
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#39465A]">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D4B879]" />
            <h3 className="text-base sm:text-lg font-black font-title uppercase tracking-wider text-[#F5F3EE]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#AEB9CC] mt-0.5">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[11px] font-heading font-bold text-[#F5F3EE] transition-all flex items-center gap-1.5"
            title="Select all active franchises"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#D4B879]" />
            <span>Select All ({activeFranchises.length})</span>
          </button>

          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1.5 rounded-lg bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[11px] font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] transition-all flex items-center gap-1.5"
            title="Deselect all franchises"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>

          <button
            type="button"
            onClick={handleOpenManager}
            className="px-2.5 py-1.5 rounded-lg bg-[#D4B879]/15 hover:bg-[#D4B879]/25 border border-[#D4B879]/40 text-[11px] font-heading font-black text-[#D4B879] transition-all flex items-center gap-1.5"
            title="Manage or create custom franchises"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Franchise Manager</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Step 1: Select Format / Number of Teams */}
      {showCountSelector && (
        <div className="space-y-3 pb-4 border-b border-[#39465A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4B879]/20 text-[#D4B879] text-xs font-mono font-bold flex items-center justify-center">
                  1
                </span>
                <label className="text-xs font-black font-heading uppercase text-[#F5F3EE] tracking-wider">
                  Select Format (Number of Teams)
                </label>
              </div>
              <p className="text-[11px] text-[#AEB9CC] mt-0.5">
                Choose how many franchises will compete in this tournament.
              </p>
            </div>

            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-[#D4B879] self-start sm:self-auto">
              Format: {teamCount} Teams
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {countOptions.map((cnt) => {
              const isSelected = teamCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleCountClick(cnt)}
                  className={`py-2 px-3 sm:px-4 rounded-xl border font-heading transition-all text-center relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#D4B879] text-[#111827] font-black border-[#F5F3EE] shadow-lg shadow-[#D4B879]/20 scale-105'
                      : 'bg-[#2C394C]/60 hover:bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE] border-[#39465A]'
                  }`}
                >
                  <span className="block font-black text-xs sm:text-sm tracking-wide">
                    {cnt} TEAMS
                  </span>
                  <span className="text-[9px] opacity-80 block font-mono">
                    {cnt === 2
                      ? 'Duel'
                      : cnt === 3
                      ? 'Tri-Series'
                      : cnt === 4
                      ? 'Championship'
                      : `${cnt}-Way Clash`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Select Participating Teams */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#AEB9CC]/20 text-[#AEB9CC] text-xs font-mono font-bold flex items-center justify-center">
                {showCountSelector ? '2' : '1'}
              </span>
              <label className="text-xs font-black font-heading uppercase text-[#F5F3EE] tracking-wider">
                Select Participating Franchises
              </label>
            </div>
            <p className="text-[11px] text-[#AEB9CC] mt-0.5">
              Click any franchise to toggle. Exactly {teamCount} franchises must be selected.
            </p>
          </div>

          {/* Live Selection Counter Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-[#AEB9CC] font-heading uppercase">
              Roster:
            </span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-heading font-black tracking-wide border flex items-center gap-1.5 transition-all ${
                isComplete
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse'
              }`}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedTeamIds.length} / {teamCount} Selected (Ready)</span>
                </>
              ) : isBelowMinimum ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{selectedTeamIds.length} Selected (Minimum 2 Required)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{selectedTeamIds.length} / {teamCount} Selected (Need {remainingCount} More)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Franchise Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-1">
          {activeFranchises.map((team) => {
            const isSelected = selectedTeamIds.includes(team.id);
            const isAtLimit = selectedTeamIds.length >= teamCount;
            const isClickDisabled = !isSelected && isAtLimit;
            const contrastTextColor = franchiseService.getContrastTextColor(team.color);

            return (
              <motion.div
                key={team.id}
                whileHover={{ y: isClickDisabled ? 0 : -3 }}
                whileTap={{ scale: isClickDisabled ? 1 : 0.98 }}
                onClick={() => handleTeamToggle(team.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#2C394C] shadow-lg'
                    : isClickDisabled
                    ? 'bg-[#222F43]/40 border-[#39465A]/50 opacity-50 cursor-not-allowed'
                    : 'bg-[#222F43] border-[#39465A] hover:border-[#AEB9CC]/40 hover:bg-[#2C394C]/70'
                }`}
                style={{
                  borderColor: isSelected ? team.color : undefined,
                  boxShadow: isSelected ? `0 0 20px -4px ${team.color}40` : undefined,
                }}
              >
                {/* Top Accent Stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5 transition-all"
                  style={{
                    backgroundColor: team.color,
                    opacity: isSelected ? 1 : 0.4,
                  }}
                />

                <div>
                  {/* Team Logo & Selection Status */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-xl border flex items-center justify-center overflow-hidden font-heading font-black text-base shadow-sm"
                      style={{
                        backgroundColor: team.color,
                        borderColor: isSelected ? '#F5F3EE' : `${team.color}80`,
                        color: contrastTextColor,
                      }}
                    >
                      {team.logo && (team.logo.startsWith('http') || team.logo.startsWith('data:')) ? (
                        <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{team.logo || franchiseService.generateInitialsLogo(team.name)}</span>
                      )}
                    </div>

                    {/* Status Pill */}
                    <div
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'border-transparent shadow-sm'
                          : isClickDisabled
                          ? 'bg-[#111827]/60 text-[#AEB9CC]/60 border-[#39465A]/60'
                          : 'bg-[#111827] text-[#AEB9CC] border-[#39465A] hover:text-[#F5F3EE]'
                      }`}
                      style={{
                        backgroundColor: isSelected ? team.color : undefined,
                        color: isSelected ? contrastTextColor : undefined,
                      }}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SELECTED</span>
                        </>
                      ) : isClickDisabled ? (
                        <span>SLOTS FULL</span>
                      ) : (
                        <span>TAP TO ADD</span>
                      )}
                    </div>
                  </div>

                  {/* Team Identity */}
                  <h4
                    className="font-heading font-black text-base tracking-wide transition-colors truncate"
                    style={{ color: isSelected ? team.color : '#F5F3EE' }}
                    title={team.name}
                  >
                    {team.name}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-[#AEB9CC] mt-0.5">
                    <span className="font-semibold text-[#AEB9CC]/80">Owner:</span>
                    <span className="font-heading font-bold text-[#F5F3EE] truncate">{team.owner || team.name}</span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-3 pt-2.5 border-t border-[#39465A]/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#AEB9CC] flex items-center gap-1.5 font-bold">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.shortName || team.name.slice(0, 3).toUpperCase()}
                  </span>
                  <span className={isSelected ? 'text-[#F5F3EE] font-bold' : 'text-[#AEB9CC]'}>
                    {isSelected ? 'Active Franchise' : 'Standby'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Validation Warning / Helpful Hint */}
        {isBelowMinimum && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-heading font-bold mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Minimum 2 franchises required to conduct an arena tournament. Currently selected: {selectedTeamIds.length}.
            </span>
          </div>
        )}

        {!isBelowMinimum && !isComplete && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-heading font-bold mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Please select exactly {teamCount} franchises to match the tournament format ({selectedTeamIds.length}/{teamCount} currently selected).
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
