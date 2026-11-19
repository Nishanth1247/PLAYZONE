import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, AlertCircle, Shield, Sparkles, X } from 'lucide-react';
import { FIXED_TEAMS } from '../../services/presets';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

/**
 * FranchiseSelector — Dynamic Team Selection for Auction Arena & Battle Arena
 * Allows choosing:
 * 1. Number of participating teams (2, 3, or 4 teams)
 * 2. Specific participating franchises (from Nishanth, Ajmal, Praneeth, Nagulan)
 */
export const FranchiseSelector = ({
  teamCount = 4,
  onTeamCountChange,
  selectedTeamIds = FIXED_TEAMS.map((t) => t.id),
  onSelectedTeamsChange,
  arenaType = 'auction', // 'auction' | 'battle'
  showCountSelector = true,
  title = 'Select Participating Franchises',
  description = 'Choose how many teams and which specific contenders will battle in this arena.',
}) => {
  const isAuction = arenaType === 'auction';
  const primaryAccent = isAuction ? '#00D9FF' : '#FF8A35';

  // Handle team count switch (2, 3, or 4)
  const handleCountClick = (newCount) => {
    if (newCount === teamCount) return;
    if (onTeamCountChange) {
      onTeamCountChange(newCount);
    }

    if (onSelectedTeamsChange) {
      if (selectedTeamIds.length > newCount) {
        // Trim to new count
        onSelectedTeamsChange(selectedTeamIds.slice(0, newCount));
      } else if (selectedTeamIds.length < newCount) {
        // Fill up to new count with remaining available fixed teams
        const missingCount = newCount - selectedTeamIds.length;
        const availableTeams = FIXED_TEAMS.filter((t) => !selectedTeamIds.includes(t.id));
        const toAdd = availableTeams.slice(0, missingCount).map((t) => t.id);
        onSelectedTeamsChange([...selectedTeamIds, ...toAdd]);
      }
    }
  };

  // Handle toggling an individual team card
  const handleTeamToggle = (teamId) => {
    const isSelected = selectedTeamIds.includes(teamId);

    if (isSelected) {
      // Allow deselecting so user can replace with another franchise
      const updated = selectedTeamIds.filter((id) => id !== teamId);
      onSelectedTeamsChange(updated);
    } else {
      // Check if limit is reached
      if (selectedTeamIds.length >= teamCount) {
        toast.warning(
          `Franchise limit reached (${teamCount} Teams). Deselect one of your active teams first to choose this franchise.`,
          { duration: 2500 }
        );
        return;
      }
      // Add team
      onSelectedTeamsChange([...selectedTeamIds, teamId]);
    }
  };

  const isComplete = selectedTeamIds.length === teamCount;
  const remainingCount = teamCount - selectedTeamIds.length;

  return (
    <div className="rounded-3xl battle-panel p-5 sm:p-6 border border-battle-border space-y-6">
      
      {/* Step 1: Select Number of Teams */}
      {showCountSelector && (
        <div className="space-y-3 pb-4 border-b border-battle-border/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold flex items-center justify-center">
                  1
                </span>
                <label className="text-xs font-black font-broadcast uppercase text-white tracking-wider">
                  Select Number of Teams
                </label>
              </div>
              <p className="text-[11px] text-battle-muted mt-0.5">
                Choose how many franchises will compete in this tournament.
              </p>
            </div>

            <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-battle-surface border border-battle-border text-brand-cyan self-start sm:self-auto">
              Format: {teamCount} Teams
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[2, 3, 4].map((cnt) => {
              const isSelected = teamCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => handleCountClick(cnt)}
                  className={`py-3.5 px-3 rounded-2xl border font-broadcast transition-all text-center relative overflow-hidden group ${
                    isSelected
                      ? isAuction
                        ? 'bg-brand-cyan text-dark-950 font-black border-cyan-300 shadow-glow-cyan'
                        : 'bg-brand-orange text-dark-950 font-black border-orange-300 shadow-glow-orange'
                      : 'bg-battle-surface/60 hover:bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                  }`}
                >
                  <span className="block font-black text-sm sm:text-base tracking-wide">
                    {cnt} TEAMS
                  </span>
                  <span className="text-[10px] opacity-80 block font-mono mt-0.5">
                    {cnt === 2 ? 'Head-to-Head Duel' : cnt === 3 ? 'Triple Threat Clash' : '4-Way Championship'}
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
              <span className="w-5 h-5 rounded-full bg-brand-purple/20 text-brand-purple text-xs font-mono font-bold flex items-center justify-center">
                {showCountSelector ? '2' : '1'}
              </span>
              <label className="text-xs font-black font-broadcast uppercase text-white tracking-wider">
                Select Participating Franchises
              </label>
            </div>
            <p className="text-[11px] text-battle-muted mt-0.5">
              Click any franchise card to toggle selection. Exactly {teamCount} teams must be selected.
            </p>
          </div>

          {/* Live Selection Counter Badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-mono font-bold text-battle-muted font-broadcast uppercase">
              Roster:
            </span>
            <div
              className={`px-3 py-1 rounded-full text-xs font-broadcast font-black tracking-wide border flex items-center gap-1.5 transition-all ${
                isComplete
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-glow-neon'
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse'
              }`}
            >
              {isComplete ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedTeamIds.length} / {teamCount} Teams Selected (Ready)</span>
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

        {/* 4 Predefined Franchise Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {FIXED_TEAMS.map((team) => {
            const isSelected = selectedTeamIds.includes(team.id);
            const isAtLimit = selectedTeamIds.length >= teamCount;
            const isClickDisabled = !isSelected && isAtLimit;

            return (
              <motion.div
                key={team.id}
                whileHover={{ y: isClickDisabled ? 0 : -3 }}
                whileTap={{ scale: isClickDisabled ? 1 : 0.98 }}
                onClick={() => handleTeamToggle(team.id)}
                className={`p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-battle-surface/90 shadow-lg'
                    : isClickDisabled
                    ? 'bg-battle-surface/30 border-battle-border/40 opacity-50 cursor-not-allowed'
                    : 'bg-battle-surface/40 border-battle-border hover:border-battle-borderLight hover:bg-battle-surface/70'
                }`}
                style={{
                  borderColor: isSelected ? team.color : undefined,
                  boxShadow: isSelected ? `0 0 20px -3px ${team.color}35` : undefined,
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
                  {/* Team Logo & Selection Checkmark */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-2xl p-2 rounded-xl bg-battle-bg border shadow-inner flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{
                        borderColor: isSelected ? `${team.color}60` : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      {team.logo}
                    </span>

                    {/* Status Pill */}
                    <div
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-broadcast font-bold uppercase tracking-wider border flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'text-white border-transparent shadow-sm'
                          : isClickDisabled
                          ? 'bg-battle-bg/60 text-battle-muted border-battle-border/60'
                          : 'bg-battle-bg text-battle-muted border-battle-border hover:text-white'
                      }`}
                      style={{
                        backgroundColor: isSelected ? team.color : undefined,
                        color: isSelected ? (team.color === '#B7F34A' || team.color === '#00D9FF' ? '#0b0f17' : '#ffffff') : undefined,
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
                    className="font-broadcast font-black text-lg tracking-wide transition-colors"
                    style={{ color: isSelected ? team.color : '#e2e8f0' }}
                  >
                    {team.name}
                  </h4>

                  <div className="flex items-center gap-2 text-[11px] text-battle-muted mt-0.5">
                    <span className="font-semibold text-white/80">Owner:</span>
                    <span className="font-broadcast font-bold text-white">{team.owner || team.name}</span>
                  </div>
                </div>

                {/* Footer details */}
                <div className="mt-3 pt-2.5 border-t border-battle-border/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-battle-muted flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: team.color }}
                    />
                    {team.shortName}
                  </span>
                  <span className={isSelected ? 'text-white font-bold' : 'text-battle-muted'}>
                    {isSelected ? 'Active Franchise' : 'Standby'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Validation Error / Helper Hint */}
        {!isComplete && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-broadcast font-bold mt-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Please select exactly {teamCount} franchises to participate. ({selectedTeamIds.length}/{teamCount} currently selected).
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
