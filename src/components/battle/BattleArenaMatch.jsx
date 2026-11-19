import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Trophy, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Flame, 
  AlertTriangle,
  RotateCcw,
  Lock,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { PassTheLaptopScreen } from '../party/common/PassTheLaptopScreen';

export const BattleArenaMatch = () => {
  const {
    battleState,
    startFighterSelection,
    selectTeamAFighter,
    proceedToTeamB,
    selectTeamBFighter,
    confirmMatchResult,
    advanceToNextBattle,
  } = useBattleArena();

  const {
    schedule,
    currentMatchIndex,
    teams,
    usedPlayerIds,
    privateFighterSelection,
    currentMatchEvaluation,
    leaderboard,
    completedMatches,
  } = battleState;

  const currentMatch = schedule[currentMatchIndex];
  if (!currentMatch) return null;

  const teamA = teams.find((t) => t.id === currentMatch.teamAId);
  const teamB = teams.find((t) => t.id === currentMatch.teamBId);
  if (!teamA || !teamB) return null;

  const teamAPickId = privateFighterSelection?.[teamA.id];
  const teamBPickId = privateFighterSelection?.[teamB.id];

  // Head-to-Head history between Team A and Team B in earlier rounds of this tournament
  const h2hMatches = (completedMatches || []).filter(
    (m) =>
      (m.teamAId === teamA.id && m.teamBId === teamB.id) ||
      (m.teamAId === teamB.id && m.teamBId === teamA.id)
  );

  // Tournament Points for each team
  const pointsTeamA = leaderboard.find((l) => l.team.id === teamA.id)?.points || 0;
  const pointsTeamB = leaderboard.find((l) => l.team.id === teamB.id)?.points || 0;

  // Available (undeployed) squad members
  const availableSquadA = teamA.squad.filter((p) => !usedPlayerIds.includes(p.id));
  const availableSquadB = teamB.squad.filter((p) => !usedPlayerIds.includes(p.id));

  // Determine stage safely with reload resilience
  const stage = battleState.matchStage || (
    currentMatchEvaluation?.status === 'completed' ? 'confirmed' :
    currentMatchEvaluation ? 'evaluated' :
    teamBPickId ? 'evaluated' :
    teamAPickId ? 'teamA_locked' :
    'faceoff'
  );

  return (
    <div className="max-w-[1500px] mx-auto px-4 py-6 space-y-6">
      
      {/* Top Match Progress Strip */}
      <div className="battle-panel rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-md">
        <div className="flex items-center gap-3">
          <Badge variant="orange" className="font-mono text-xs font-bold">
            MATCH {currentMatchIndex + 1} OF {schedule.length}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs font-broadcast font-bold text-white">
            <span style={{ color: teamA.color }}>{teamA.name}</span> VS <span style={{ color: teamB.color }}>{teamB.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neon" className="font-mono text-xs">
            Win = +3 Pts • Draw = +1 Pt
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* MAIN BATTLE STAGE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STAGE 1: BROADCAST PRE-MATCH FACE-OFF SCREEN (BIDBATTLE 7.7) */}
          {stage === 'faceoff' && (
            <motion.div
              key="faceoff_screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="battle-panel rounded-3xl p-6 sm:p-8 border-2 border-brand-purple/50 shadow-2xl relative overflow-hidden"
            >
              {/* Ambient lighting halo */}
              <div 
                className="absolute -top-24 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: teamA.color }}
              />
              <div 
                className="absolute -top-24 right-1/4 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none"
                style={{ backgroundColor: teamB.color }}
              />

              <div className="text-center mb-8 relative z-10">
                <Badge variant="orange" pulse className="mb-2 uppercase tracking-wider font-broadcast">
                  Round 2 Broadcast Face-Off
                </Badge>
                <h2 className="text-3xl sm:text-5xl font-black text-white font-broadcast uppercase tracking-wide">
                  Match #{currentMatchIndex + 1} Head-to-Head
                </h2>
                <p className="text-xs text-battle-muted mt-1">
                  Private fighter deployment required. Review matchup intelligence before selection.
                </p>
              </div>

              {/* Face-off Duel Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center mb-8 relative z-10">
                {/* Team A Card */}
                <div 
                  className="md:col-span-5 p-6 rounded-3xl bg-battle-bg border-2 text-center space-y-3 relative overflow-hidden shadow-lg"
                  style={{ borderColor: teamA.color }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: teamA.color }} />
                  <span className="text-5xl p-3 rounded-2xl bg-battle-surface border border-battle-border inline-block shadow-md">
                    {teamA.logo}
                  </span>
                  <div>
                    <h3 className="font-broadcast text-2xl font-black text-white" style={{ color: teamA.color }}>
                      {teamA.name}
                    </h3>
                    <span className="text-xs text-battle-muted font-mono font-bold block">
                      @{teamA.owner}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-battle-border text-left">
                    <div className="p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block">Points</span>
                      <span className="font-mono font-black text-lg text-brand-neon">{pointsTeamA} pts</span>
                    </div>
                    <div className="p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block">Fighters Ready</span>
                      <span className="font-mono font-black text-lg text-amber-300">{availableSquadA.length} / {teamA.squad.length}</span>
                    </div>
                  </div>
                </div>

                {/* Center VS Clash Emblem */}
                <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
                  <div className="w-14 h-14 rounded-full bg-battle-surface border-2 border-brand-orange text-brand-orange flex items-center justify-center shadow-glow-orange font-broadcast font-black text-lg">
                    VS
                  </div>
                  <Swords className="w-5 h-5 text-battle-muted mt-1" />
                </div>

                {/* Team B Card */}
                <div 
                  className="md:col-span-5 p-6 rounded-3xl bg-battle-bg border-2 text-center space-y-3 relative overflow-hidden shadow-lg"
                  style={{ borderColor: teamB.color }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: teamB.color }} />
                  <span className="text-5xl p-3 rounded-2xl bg-battle-surface border border-battle-border inline-block shadow-md">
                    {teamB.logo}
                  </span>
                  <div>
                    <h3 className="font-broadcast text-2xl font-black text-white" style={{ color: teamB.color }}>
                      {teamB.name}
                    </h3>
                    <span className="text-xs text-battle-muted font-mono font-bold block">
                      @{teamB.owner}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-battle-border text-left">
                    <div className="p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block">Points</span>
                      <span className="font-mono font-black text-lg text-brand-neon">{pointsTeamB} pts</span>
                    </div>
                    <div className="p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block">Fighters Ready</span>
                      <span className="font-mono font-black text-lg text-amber-300">{availableSquadB.length} / {teamB.squad.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Head-to-Head History Box */}
              <div className="mb-8 p-4 rounded-2xl bg-battle-bg border border-battle-border relative z-10">
                <div className="flex items-center justify-between mb-2 pb-1 border-b border-battle-border text-xs font-broadcast font-bold uppercase text-battle-muted">
                  <span>Head-to-Head Record:</span>
                  <span className="text-brand-cyan">{h2hMatches.length === 0 ? 'First Meeting' : `${h2hMatches.length} Previous Clash`}</span>
                </div>
                {h2hMatches.length === 0 ? (
                  <p className="text-xs text-battle-muted italic">
                    These two franchises have not clashed yet in this tournament. A critical battle for points!
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {h2hMatches.map((m, idx) => (
                      <div key={m.id || idx} className="flex items-center justify-between text-xs font-mono">
                        <span className="text-battle-muted">Clash #{idx + 1}:</span>
                        <span className="text-white">
                          {m.isDraw ? 'Tied Battle (+1 pt each)' : `${teams.find((t) => t.id === m.winnerId)?.name || 'Winner'} won (+3 pts)`}
                        </span>
                        <span className="text-brand-cyan">Diff: {m.scoreDiff || 0} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Action Button */}
              <Button
                variant="accent"
                size="xl"
                onClick={startFighterSelection}
                className="w-full font-broadcast text-lg shadow-glow-orange flex items-center justify-center gap-3 py-4"
              >
                <span>PROCEED TO FIGHTER SELECTION</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* STAGE 2: TEAM A PRIVATE FIGHTER SELECTION */}
          {stage === 'teamA_select' && (
            <motion.div
              key={`pick_${teamA.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <PassTheLaptopScreen
                player={teamA}
                phaseTitle="Private Fighter Selection (Team A)"
                subInstruction={`Pass the laptop to ${teamA.name} to choose one fighter. Keep your pick hidden from ${teamB.name}!`}
                revealButtonText="Open Available Squad"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-battle-muted uppercase">
                    <span>Choose 1 Fighter from Your Acquired Squad:</span>
                    <span className="text-brand-cyan">{availableSquadA.length} available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamA.squad.map((fighter) => {
                      const isDeployed = usedPlayerIds.includes(fighter.id);

                      return (
                        <button
                          key={fighter.id}
                          type="button"
                          disabled={isDeployed}
                          onClick={() => selectTeamAFighter(fighter.id)}
                          className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                            isDeployed
                              ? 'bg-battle-surface/30 border-battle-border opacity-40 cursor-not-allowed'
                              : 'border-battle-border hover:border-brand-purple bg-battle-surface hover:bg-battle-surface/80 cursor-pointer shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xl">🎬</span>
                              {isDeployed ? (
                                <Badge variant="secondary" className="text-[9px] uppercase">
                                  Already Deployed
                                </Badge>
                              ) : (
                                <Badge variant="purple" className="text-[10px]">
                                  {fighter.role || 'Contender'}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-broadcast font-bold text-sm text-white group-hover:text-brand-purple">
                              {fighter.name}
                            </h4>
                            {fighter.movie && (
                              <span className="text-[11px] text-battle-muted block">
                                {fighter.movie}
                              </span>
                            )}
                          </div>

                          <span className={`mt-3 text-xs font-mono font-bold ${isDeployed ? 'text-battle-muted' : 'text-brand-purple'}`}>
                            {isDeployed ? 'UNAVAILABLE' : 'DEPLOY FIGHTER →'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PassTheLaptopScreen>
            </motion.div>
          )}

          {/* STAGE 3: PRIVACY SHIELD SCREEN (SELECTION LOCKED) (BIDBATTLE 7.7) */}
          {stage === 'teamA_locked' && (
            <motion.div
              key="teamA_locked_screen"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="battle-panel rounded-3xl p-8 border-2 border-brand-purple/60 shadow-2xl text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-purple/20 border border-brand-purple/40 text-brand-purple flex items-center justify-center shadow-glow-purple">
                <Lock className="w-10 h-10" />
              </div>

              <div>
                <Badge variant="purple" className="mb-2 uppercase tracking-wider font-broadcast">
                  Secret Selection Confirmed
                </Badge>
                <h3 className="text-3xl font-black text-white font-broadcast uppercase tracking-wide">
                  {teamA.name}'s Fighter Locked!
                </h3>
                <p className="text-sm text-battle-muted max-w-md mx-auto mt-2">
                  The selection has been encrypted. Hand the laptop over to <strong>{teamB.name}</strong> to make their pick.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border max-w-sm mx-auto text-xs text-battle-muted">
                🛡️ Screen Privacy Active: {teamA.name}'s fighter remains hidden until simultaneous reveal.
              </div>

              <Button
                variant="primary"
                size="xl"
                onClick={proceedToTeamB}
                className="font-broadcast text-base shadow-glow-cyan bg-brand-cyan hover:bg-cyan-400 text-black font-black px-8"
              >
                <span>I AM {teamB.name} — SELECT FIGHTER</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* STAGE 4: TEAM B PRIVATE FIGHTER SELECTION */}
          {stage === 'teamB_select' && (
            <motion.div
              key={`pick_${teamB.id}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
            >
              <PassTheLaptopScreen
                player={teamB}
                phaseTitle="Private Fighter Selection (Team B)"
                subInstruction={`Pass the laptop to ${teamB.name} to choose one fighter. Keep your pick hidden from ${teamA.name}!`}
                revealButtonText="Open Available Squad"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-battle-muted uppercase">
                    <span>Choose 1 Fighter from Your Acquired Squad:</span>
                    <span className="text-brand-cyan">{availableSquadB.length} available</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teamB.squad.map((fighter) => {
                      const isDeployed = usedPlayerIds.includes(fighter.id);

                      return (
                        <button
                          key={fighter.id}
                          type="button"
                          disabled={isDeployed}
                          onClick={() => selectTeamBFighter(fighter.id)}
                          className={`p-4 rounded-2xl border text-left transition-all group flex flex-col justify-between ${
                            isDeployed
                              ? 'bg-battle-surface/30 border-battle-border opacity-40 cursor-not-allowed'
                              : 'border-battle-border hover:border-brand-cyan bg-battle-surface hover:bg-battle-surface/80 cursor-pointer shadow-md'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xl">⚡</span>
                              {isDeployed ? (
                                <Badge variant="secondary" className="text-[9px] uppercase">
                                  Already Deployed
                                </Badge>
                              ) : (
                                <Badge variant="cyan" className="text-[10px]">
                                  {fighter.role || 'Contender'}
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-broadcast font-bold text-sm text-white group-hover:text-brand-cyan">
                              {fighter.name}
                            </h4>
                            {fighter.movie && (
                              <span className="text-[11px] text-battle-muted block">
                                {fighter.movie}
                              </span>
                            )}
                          </div>

                          <span className={`mt-3 text-xs font-mono font-bold ${isDeployed ? 'text-battle-muted' : 'text-brand-cyan'}`}>
                            {isDeployed ? 'UNAVAILABLE' : 'DEPLOY FIGHTER →'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PassTheLaptopScreen>
            </motion.div>
          )}

          {/* STAGE 5 & 6: SIMULTANEOUS REVEAL, EVALUATION & RESULT CONFIRMATION (BIDBATTLE 7.7) */}
          {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="battle-panel rounded-3xl p-6 sm:p-8 border-2 border-brand-orange/60 shadow-2xl space-y-8 text-center"
            >
              {/* Top Faceoff Header */}
              <div className="flex items-center justify-center gap-3">
                <Swords className="w-8 h-8 text-brand-orange animate-pulse" />
                <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                  {stage === 'confirmed' ? 'ARENA CLASH SETTLED!' : 'SIMULTANEOUS FIGHTER REVEAL!'}
                </h3>
              </div>

              {/* Fighter 1 vs Fighter 2 Clash Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
                
                {/* Team A Fighter Card */}
                <div
                  className={`p-6 rounded-3xl border text-center space-y-4 relative overflow-hidden transition-all ${
                    currentMatchEvaluation.winnerId === teamA.id
                      ? 'bg-battle-surface border-brand-neon shadow-glow-neon ring-2 ring-brand-neon/40'
                      : 'bg-battle-bg border-battle-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-broadcast font-black text-xs" style={{ color: teamA.color }}>
                      {teamA.name}
                    </span>
                    {currentMatchEvaluation.winnerId === teamA.id && (
                      <Badge variant="neon" className="px-2 py-0 text-xs">
                        VICTORY (+3 PTS)
                      </Badge>
                    )}
                  </div>

                  <div className="w-24 h-24 mx-auto rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-center text-5xl shadow-md overflow-hidden">
                    {currentMatchEvaluation.playerA.imageUrl ? (
                      <img
                        src={currentMatchEvaluation.playerA.imageUrl}
                        alt={currentMatchEvaluation.playerA.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>🎭</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-broadcast text-2xl font-black text-white">
                      {currentMatchEvaluation.playerA.name}
                    </h4>
                    <span className="text-xs text-brand-purple font-mono block mt-0.5">
                      {currentMatchEvaluation.playerA.role || currentMatchEvaluation.playerA.movie}
                    </span>
                  </div>

                  {/* Revealed Battle Score & Internal Rating */}
                  <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border space-y-1">
                    <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
                      Battle Combat Rating:
                    </span>
                    <span className="font-mono text-3xl font-black text-amber-300">
                      {currentMatchEvaluation.scoreA}
                    </span>
                    <span className="text-[10px] font-mono text-brand-cyan block">
                      (Base Rating: ★ {currentMatchEvaluation.baseRatingA})
                    </span>
                  </div>
                </div>

                {/* Team B Fighter Card */}
                <div
                  className={`p-6 rounded-3xl border text-center space-y-4 relative overflow-hidden transition-all ${
                    currentMatchEvaluation.winnerId === teamB.id
                      ? 'bg-battle-surface border-brand-neon shadow-glow-neon ring-2 ring-brand-neon/40'
                      : 'bg-battle-bg border-battle-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-broadcast font-black text-xs" style={{ color: teamB.color }}>
                      {teamB.name}
                    </span>
                    {currentMatchEvaluation.winnerId === teamB.id && (
                      <Badge variant="neon" className="px-2 py-0 text-xs">
                        VICTORY (+3 PTS)
                      </Badge>
                    )}
                  </div>

                  <div className="w-24 h-24 mx-auto rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-center text-5xl shadow-md overflow-hidden">
                    {currentMatchEvaluation.playerB.imageUrl ? (
                      <img
                        src={currentMatchEvaluation.playerB.imageUrl}
                        alt={currentMatchEvaluation.playerB.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>⚡</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-broadcast text-2xl font-black text-white">
                      {currentMatchEvaluation.playerB.name}
                    </h4>
                    <span className="text-xs text-brand-cyan font-mono block mt-0.5">
                      {currentMatchEvaluation.playerB.role || currentMatchEvaluation.playerB.movie}
                    </span>
                  </div>

                  {/* Revealed Battle Score & Internal Rating */}
                  <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border space-y-1">
                    <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
                      Battle Combat Rating:
                    </span>
                    <span className="font-mono text-3xl font-black text-amber-300">
                      {currentMatchEvaluation.scoreB}
                    </span>
                    <span className="text-[10px] font-mono text-brand-cyan block">
                      (Base Rating: ★ {currentMatchEvaluation.baseRatingB})
                    </span>
                  </div>
                </div>

              </div>

              {/* Match Result Verdict Strip */}
              <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border flex items-center justify-center gap-3">
                {currentMatchEvaluation.isDraw ? (
                  <span className="font-broadcast text-lg font-black text-amber-400">
                    MATCH TIED! (+1 PT TO EACH FRANCHISE)
                  </span>
                ) : (
                  <span className="font-broadcast text-lg font-black text-brand-neon">
                    {teams.find((t) => t.id === currentMatchEvaluation.winnerId)?.name} WINS THE BATTLE (+3 PTS)!
                  </span>
                )}
              </div>

              {/* STEP 8: EXPLICIT CONFIRMATION BUTTON vs ADVANCE BUTTON */}
              {stage === 'evaluated' ? (
                <div className="space-y-2">
                  <Button
                    variant="accent"
                    size="xl"
                    onClick={confirmMatchResult}
                    className="w-full font-broadcast text-base shadow-glow-orange bg-emerald-500 hover:bg-emerald-600 text-black font-black flex items-center justify-center gap-2 py-4"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>CONFIRM MATCH RESULT & UPDATE STANDINGS</span>
                  </Button>
                  <p className="text-[11px] text-battle-muted">
                    Click to permanently record battle outcome, award points, and mark fighters as deployed.
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="xl"
                  onClick={advanceToNextBattle}
                  className="w-full font-broadcast text-base shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black font-black flex items-center justify-center gap-2 py-4"
                >
                  <span>{currentMatchIndex + 1 < schedule.length ? 'NEXT MATCH' : 'VIEW TOURNAMENT CHAMPION PODIUM'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              )}
            </motion.div>
          )}

        </div>

        {/* RIGHT COLUMN: LIVE POINTS TABLE (4 COLS) */}
        <div className="lg:col-span-4 battle-panel rounded-3xl p-6 border border-battle-border shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-battle-border">
            <span className="font-broadcast font-bold text-sm text-white uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Live Points Table</span>
            </span>
            <span className="text-xs font-mono font-bold text-brand-neon">
              Round 2
            </span>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-battle-border text-battle-muted font-broadcast text-[10px] uppercase">
                  <th className="pb-2">Pos</th>
                  <th className="pb-2">Team</th>
                  <th className="pb-2 text-center">P</th>
                  <th className="pb-2 text-center">W</th>
                  <th className="pb-2 text-center">D</th>
                  <th className="pb-2 text-center">L</th>
                  <th className="pb-2 text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-battle-border/50 font-mono">
                {leaderboard.map((entry) => (
                  <tr key={entry.team.id} className="hover:bg-battle-surface/40">
                    <td className="py-2.5 font-bold text-battle-muted">
                      #{entry.rank}
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{entry.team.logo}</span>
                        <span className="font-broadcast font-bold text-white text-[11px] truncate max-w-[80px]">
                          {entry.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-battle-muted">{entry.played}</td>
                    <td className="py-2.5 text-center text-emerald-400 font-bold">{entry.won}</td>
                    <td className="py-2.5 text-center text-battle-muted">{entry.drawn}</td>
                    <td className="py-2.5 text-center text-rose-400">{entry.lost}</td>
                    <td className="py-2.5 text-right font-black text-brand-neon text-sm">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Completed Match Mini History */}
          <div className="pt-2 border-t border-battle-border/60 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-battle-muted block">
              Match Log:
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {battleState.completedMatches.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-2 rounded-xl bg-battle-bg border border-battle-border/80 flex items-center justify-between text-[11px] font-mono"
                >
                  <span className="text-battle-muted">#{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <span style={{ color: m.teamAColor }} className="font-bold font-broadcast">{m.teamAName}</span>
                    <span className="text-battle-muted">vs</span>
                    <span style={{ color: m.teamBColor }} className="font-bold font-broadcast">{m.teamBName}</span>
                  </div>
                  <span className="text-brand-neon font-black">
                    {m.isDraw ? 'Tied' : m.winnerId === m.teamAId ? `${m.teamAName} W` : `${m.teamBName} W`}
                  </span>
                </div>
              ))}
              {battleState.completedMatches.length === 0 && (
                <div className="py-4 text-center text-battle-muted text-[11px] italic">
                  No matches completed yet.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
