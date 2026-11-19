import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Swords, 
  CheckCircle2, 
  ArrowRight, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Shuffle, 
  EyeOff, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { soundService } from '../../services/soundService';

/**
 * BIDBATTLE 8.4 — Tactical Battle Draft Board (Round 2)
 * Replaces turn-by-turn fighter selection with an upfront secret tactical draft:
 * 1. Team A Private Draft (orders fighters into sequential match slots, no ratings visible)
 * 2. Privacy Shield / Handoff Screen (Pass device to Team B)
 * 3. Team B Private Draft (independent selection, zero visibility of Team A)
 * 4. Final Lineup Lock (both lineups locked & persisted, neutral classified preview)
 */
export const TacticalDraftBoard = () => {
  const {
    battleState,
    saveTeamLineup,
    proceedToNextTeamDraft,
    startBattlePhaseFromLineups,
  } = useBattleArena();

  const {
    teams,
    schedule,
    squadSize,
    tacticalDraft = {
      isLocked: false,
      draftingTeamIndex: 0,
      draftStage: 'drafting',
      lineups: {},
    },
  } = battleState;

  const currentTeamIndex = tacticalDraft.draftingTeamIndex || 0;
  const currentTeam = teams[currentTeamIndex] || teams[0];
  const draftStage = tacticalDraft.draftStage || 'drafting';

  // Compute matches specifically contested by this team
  const teamMatches = (schedule || []).filter(
    (m) => m.teamAId === currentTeam?.id || m.teamBId === currentTeam?.id
  );
  const totalSlots = teamMatches.length > 0 ? teamMatches.length : squadSize;

  // Local state for slots in current team's private draft
  // Array of fighter objects or null: [fighter1, fighter2, ...]
  const [assignedSlots, setAssignedSlots] = useState(() => {
    const existing = tacticalDraft.lineups?.[currentTeam?.id];
    if (existing && Array.isArray(existing)) {
      return existing.map((id) => currentTeam.squad.find((p) => p.id === id) || null);
    }
    return Array(totalSlots).fill(null);
  });

  // Reset local slots whenever draftingTeamIndex changes
  useEffect(() => {
    if (currentTeam) {
      const existing = tacticalDraft.lineups?.[currentTeam.id];
      if (existing && Array.isArray(existing)) {
        setAssignedSlots(existing.map((id) => currentTeam.squad.find((p) => p.id === id) || null));
      } else {
        setAssignedSlots(Array(totalSlots).fill(null));
      }
    }
  }, [currentTeamIndex, currentTeam?.id, totalSlots]);

  // Fighters currently assigned to slots
  const assignedFighterIds = assignedSlots.filter(Boolean).map((f) => f.id);

  // Available fighters in this team's squad not yet assigned
  const availableFighters = (currentTeam?.squad || []).filter(
    (f) => !assignedFighterIds.includes(f.id)
  );

  const isLineupComplete = assignedSlots.every(Boolean);

  // Slot handlers
  const handleAssignToSlot = (fighter, slotIdx) => {
    soundService?.playBid?.();
    setAssignedSlots((prev) => {
      const next = [...prev];
      // If fighter already in another slot, clear that slot
      const existingIdx = next.findIndex((f) => f?.id === fighter.id);
      if (existingIdx !== -1) {
        next[existingIdx] = null;
      }
      next[slotIdx] = fighter;
      return next;
    });
  };

  const handleQuickAdd = (fighter) => {
    // Find first empty slot
    const firstEmpty = assignedSlots.findIndex((s) => s === null);
    if (firstEmpty !== -1) {
      handleAssignToSlot(fighter, firstEmpty);
    }
  };

  const handleRemoveFromSlot = (slotIdx) => {
    soundService?.playTick?.();
    setAssignedSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const handleSwapSlots = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= assignedSlots.length) return;
    soundService?.playTick?.();
    setAssignedSlots((prev) => {
      const next = [...prev];
      const temp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = temp;
      return next;
    });
  };

  const handleAutoFill = () => {
    soundService?.playBid?.();
    setAssignedSlots((prev) => {
      const currentAssignedIds = prev.filter(Boolean).map((f) => f.id);
      const unassigned = (currentTeam?.squad || []).filter(
        (f) => !currentAssignedIds.includes(f.id)
      );
      const next = [...prev];
      for (let i = 0; i < next.length; i++) {
        if (!next[i] && unassigned.length > 0) {
          next[i] = unassigned.shift();
        }
      }
      return next;
    });
  };

  const handleClearAll = () => {
    soundService?.playTick?.();
    setAssignedSlots(Array(totalSlots).fill(null));
  };

  const handleConfirmLineup = () => {
    if (!isLineupComplete) return;
    const orderedIds = assignedSlots.map((f) => f.id);
    saveTeamLineup(currentTeam.id, orderedIds);
  };

  // =========================================================================
  // VIEW 1: PRIVACY SHIELD / HANDOFF SCREEN
  // =========================================================================
  if (draftStage === 'privacy_shield') {
    const prevTeam = teams[currentTeamIndex];
    const nextTeam = teams[currentTeamIndex + 1] || teams[1];

    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full bg-pine border-2 border-charcoal rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Franchise Glow */}
          <div 
            className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: nextTeam?.color || '#C66A45' }}
          />

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-forest border border-charcoal mx-auto flex items-center justify-center mb-5 text-gold shadow-lg">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-gold" />
          </div>

          <Badge variant="gold" className="font-mono text-xs uppercase px-3 py-1 font-bold mb-3">
            Tactical Privacy Shield Active
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-broadcast font-black text-ivory tracking-wide mb-2">
            LINEUP LOCKED & SECURED
          </h2>

          <p className="text-sage text-sm leading-relaxed mb-6">
            <span style={{ color: prevTeam?.color }} className="font-bold">{prevTeam?.name}</span>'s tactical order is now encrypted and sealed. No opposing franchise can view this deployment.
          </p>

          <div className="p-4 rounded-2xl bg-forest border border-charcoal mb-6 text-center">
            <span className="text-xs uppercase tracking-widest text-sage font-bold block mb-1">
              DEVICE HANDOFF REQUIRED
            </span>
            <p className="text-ivory font-broadcast text-lg sm:text-xl font-black">
              Please hand the device to <span style={{ color: nextTeam?.color }}>{nextTeam?.name}</span> ({nextTeam?.owner})
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={proceedToNextTeamDraft}
            className="w-full text-base font-broadcast font-bold tracking-wider py-4 shadow-xl flex items-center justify-center gap-2"
            style={{
              backgroundColor: nextTeam?.color || '#C66A45',
              color: '#18251F',
            }}
          >
            <span>I AM READY TO DRAFT ({nextTeam?.name})</span>
            <ArrowRight className="w-5 h-5" />
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-sage">
            <EyeOff className="w-3.5 h-3.5 text-gold" />
            <span>Combat ratings & opponent choices remain strictly hidden</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FINAL LINEUP LOCK (Neutral Match Preview with Classified Fighters)
  // =========================================================================
  if (draftStage === 'lineups_locked' || (tacticalDraft.isLocked && draftStage !== 'active_matches')) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl w-full bg-pine border border-charcoal rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-forest border border-gold/40 mx-auto flex items-center justify-center text-gold shadow-md">
              <CheckCircle2 className="w-7 h-7 text-gold" />
            </div>
            <Badge variant="gold" className="font-mono text-xs uppercase px-3 py-1 font-bold">
              Round 2 Draft Phase Complete
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-broadcast font-black text-ivory tracking-wide">
              BOTH LINEUPS LOCKED & CLASSIFIED
            </h2>
            <p className="text-sage text-xs sm:text-sm max-w-lg mx-auto">
              All tactical lineups have been secretly recorded. Fighters will be revealed sequentially during active match combat.
            </p>
          </div>

          {/* Neutral Classified Match Preview List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {schedule.map((match, idx) => {
              const teamA = teams.find((t) => t.id === match.teamAId);
              const teamB = teams.find((t) => t.id === match.teamBId);

              return (
                <div
                  key={match.id || idx}
                  className="p-3 rounded-2xl bg-forest border border-charcoal flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-sage">
                    <span className="w-6 h-6 rounded-lg bg-pine flex items-center justify-center text-ivory border border-charcoal">
                      {idx + 1}
                    </span>
                    <span className="uppercase text-[11px]">MATCH {idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6 font-broadcast font-bold text-sm">
                    {/* Team A Slot */}
                    <div className="flex items-center gap-1.5" style={{ color: teamA?.color }}>
                      <span>{teamA?.name}</span>
                      <span className="px-2 py-0.5 rounded bg-pine text-sage border border-charcoal font-mono text-[10px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-gold" />
                        <span>CLASSIFIED</span>
                      </span>
                    </div>

                    <span className="text-sage font-mono text-xs font-black">VS</span>

                    {/* Team B Slot */}
                    <div className="flex items-center gap-1.5" style={{ color: teamB?.color }}>
                      <span className="px-2 py-0.5 rounded bg-pine text-sage border border-charcoal font-mono text-[10px] flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-gold" />
                        <span>CLASSIFIED</span>
                      </span>
                      <span>{teamB?.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action to Start Active Battles */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={startBattlePhaseFromLineups}
              className="w-full text-base font-broadcast font-bold tracking-wider py-4 shadow-xl flex items-center justify-center gap-2"
            >
              <Swords className="w-5 h-5 text-gold" />
              <span>START BATTLE PHASE (ROUND 1)</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE PRIVATE TEAM DRAFT BOARD (Team A or Team B)
  // =========================================================================
  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-2 sm:p-4 max-w-[1750px] mx-auto select-none space-y-3">
      
      {/* 1. TOP HEADER: CURRENT FRANCHISE TURN */}
      <div className="battle-panel rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-charcoal shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-xl border flex items-center justify-center text-lg font-bold shadow-md"
            style={{ 
              borderColor: currentTeam?.color, 
              backgroundColor: `${currentTeam?.color}25`,
              color: currentTeam?.color 
            }}
          >
            {currentTeam?.logo || '🛡️'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="font-mono text-xs font-bold py-0.5 border"
                style={{ borderColor: currentTeam?.color, color: currentTeam?.color }}
              >
                TEAM {currentTeamIndex + 1} OF {teams.length} PRIVATE DRAFT
              </Badge>
              <span className="text-sage text-xs">•</span>
              <span className="text-sm sm:text-base font-broadcast font-black text-ivory">
                <span style={{ color: currentTeam?.color }}>{currentTeam?.name}</span> ({currentTeam?.owner})
              </span>
            </div>
            <p className="text-[11px] text-sage">
              Assign and order your fighters into sequential match slots. Ratings remain strictly secret.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleAutoFill}
            className="text-xs font-mono text-sage hover:text-ivory"
            title="Auto-fill open slots with remaining fighters"
          >
            <Shuffle className="w-3.5 h-3.5 mr-1 text-gold" />
            <span>Auto-Fill</span>
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleClearAll}
            className="text-xs font-mono text-sage hover:text-red-400"
            title="Clear all assigned slots"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* 2. MAIN SPLIT STAGE: AVAILABLE FIGHTERS (LEFT) & MATCH SLOTS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 overflow-hidden">
        
        {/* LEFT COLUMN: AVAILABLE SQUAD ROSTER (5 cols) */}
        <div className="lg:col-span-5 battle-panel rounded-2xl p-3.5 flex flex-col justify-between border border-charcoal overflow-hidden space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-broadcast font-bold text-sage mb-2">
              <span className="uppercase tracking-wider">AVAILABLE SQUAD ({availableFighters.length})</span>
              <span className="text-[11px] font-mono text-gold">Click to assign to next slot</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto pr-1">
              {availableFighters.length === 0 ? (
                <div className="col-span-full p-6 text-center rounded-2xl bg-forest border border-charcoal text-sage text-xs">
                  <UserCheck className="w-8 h-8 text-gold mx-auto mb-2 opacity-80" />
                  <span>All squad fighters have been deployed to match slots!</span>
                </div>
              ) : (
                availableFighters.map((fighter) => (
                  <div
                    key={fighter.id}
                    onClick={() => handleQuickAdd(fighter)}
                    className="p-2.5 rounded-xl bg-forest border border-charcoal hover:border-gold/60 cursor-pointer transition-all flex items-center gap-2.5 group shadow-sm"
                  >
                    {/* Image */}
                    <div className="w-12 h-12 rounded-lg bg-pine overflow-hidden shrink-0 border border-charcoal">
                      {fighter.imageUrl ? (
                        <img 
                          src={fighter.imageUrl} 
                          alt={fighter.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-sage">
                          ⚔️
                        </div>
                      )}
                    </div>

                    {/* Details (Strictly NO rating!) */}
                    <div className="min-w-0 flex-1">
                      <div className="font-broadcast font-bold text-xs sm:text-sm text-ivory truncate">
                        {fighter.name}
                      </div>
                      <div className="text-[10px] text-sage truncate">
                        {fighter.category || fighter.role || 'Superstar Fighter'}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-mono font-bold text-gold">
                          ₹{fighter.basePrice} Cr
                        </span>
                        <span className="text-[9px] font-mono text-sage flex items-center gap-0.5">
                          <Lock className="w-2.5 h-2.5 text-gold" /> Hidden
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-forest border border-charcoal text-[11px] text-sage flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-gold shrink-0" />
            <span>Combat ratings remain concealed to guarantee pure tactical strategy.</span>
          </div>
        </div>

        {/* RIGHT COLUMN: SEQUENTIAL MATCH SLOTS (7 cols) */}
        <div className="lg:col-span-7 battle-panel rounded-2xl p-3.5 flex flex-col justify-between border border-charcoal overflow-hidden space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-broadcast font-bold text-sage mb-2">
              <span className="uppercase tracking-wider">TACTICAL MATCH LINEUP ({assignedFighterIds.length} / {totalSlots})</span>
              <span className="text-[11px] font-mono text-terracotta">
                {isLineupComplete ? '✓ Ready to Lock' : `${totalSlots - assignedFighterIds.length} slots empty`}
              </span>
            </div>

            {/* Slots List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {assignedSlots.map((fighter, slotIdx) => {
                const matchInfo = teamMatches[slotIdx];
                const opponentId = matchInfo?.teamAId === currentTeam.id ? matchInfo?.teamBId : matchInfo?.teamAId;
                const opponent = teams.find((t) => t.id === opponentId);

                return (
                  <div
                    key={slotIdx}
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      fighter
                        ? 'bg-forest border-charcoal hover:border-gold/50'
                        : 'bg-forest/50 border-dashed border-charcoal'
                    }`}
                  >
                    {/* Slot Badge & Opponent Context */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="w-7 h-7 rounded-lg bg-pine border border-charcoal font-mono text-xs font-black flex items-center justify-center text-ivory">
                        {slotIdx + 1}
                      </span>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase text-sage block leading-none">
                          SLOT {slotIdx + 1}
                        </span>
                        {opponent && (
                          <span className="text-[10px] text-sage font-medium">
                            vs <span style={{ color: opponent.color }} className="font-bold">{opponent.name}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Fighter Card or Empty Placeholder */}
                    <div className="flex-1 min-w-0">
                      {fighter ? (
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-pine border border-charcoal overflow-hidden shrink-0">
                            {fighter.imageUrl ? (
                              <img src={fighter.imageUrl} alt={fighter.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">⚔️</div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-broadcast font-bold text-xs sm:text-sm text-ivory block truncate">
                              {fighter.name}
                            </span>
                            <span className="text-[10px] text-sage truncate block">
                              {fighter.category || 'Fighter'} • <span className="font-mono text-gold">Hidden Rating</span>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sage text-xs italic font-mono flex items-center gap-1.5 py-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />
                          <span>Empty slot — select a fighter from available squad</span>
                        </div>
                      )}
                    </div>

                    {/* Slot Controls (Reorder up/down, Remove) */}
                    {fighter && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSwapSlots(slotIdx, slotIdx - 1)}
                          disabled={slotIdx === 0}
                          className="p-1 rounded-md bg-pine border border-charcoal text-sage hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwapSlots(slotIdx, slotIdx + 1)}
                          disabled={slotIdx === totalSlots - 1}
                          className="p-1 rounded-md bg-pine border border-charcoal text-sage hover:text-ivory disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromSlot(slotIdx)}
                          className="p-1 rounded-md bg-pine border border-charcoal text-sage hover:text-red-400"
                          title="Unassign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2 border-t border-charcoal">
            <Button
              variant="primary"
              size="lg"
              disabled={!isLineupComplete}
              onClick={handleConfirmLineup}
              className={`w-full font-broadcast font-bold tracking-wider py-3.5 flex items-center justify-center gap-2 ${
                isLineupComplete
                  ? 'bg-terracotta text-ivory hover:brightness-110 shadow-lg'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-gold" />
              <span>CONFIRM TACTICAL LINEUP ({currentTeam?.name})</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
};
