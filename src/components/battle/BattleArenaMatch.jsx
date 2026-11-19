import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Trophy, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Shield, 
  Users, 
  Sparkles, 
  Flame, 
  RotateCcw,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { BattleReplayViewer } from './BattleReplayViewer';
import { soundService } from '../../services/soundService';

/**
 * BIDBATTLE 8.3 - Screen-Fit Three-Column Battle Arena
 * - Left Column: Team Information, Points & Deployed/Available Fighters
 * - Centre Column: Main Game Stage (Symmetrical Versus Fighter Cards, VS Element, Ratings, Scorecard)
 * - Right Column: Actions and Controls (Fighter Selection, Privacy Shield, Reveal, Result Confirmation)
 * - Fits within standard 1366x768 and 1920x1080 desktop viewports without unnecessary vertical scrolling
 */
export const BattleArenaMatch = () => {
  const [preMatchCountdown, setPreMatchCountdown] = useState(null);
  const [revealCountdown, setRevealCountdown] = useState(null);
  const [pendingTeamBPick, setPendingTeamBPick] = useState(null);
  const [showReplay, setShowReplay] = useState(false);

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

  const fighterAPick = teamA.squad.find((p) => p.id === teamAPickId);
  const fighterBPick = teamB.squad.find((p) => p.id === teamBPickId);

  // Head-to-Head history between Team A and Team B
  const h2hMatches = (completedMatches || []).filter(
    (m) =>
      (m.teamAId === teamA.id && m.teamBId === teamB.id) ||
      (m.teamAId === teamB.id && m.teamBId === teamA.id)
  );

  // Available squad members
  const availableSquadA = teamA.squad.filter((p) => !usedPlayerIds.includes(p.id));
  const availableSquadB = teamB.squad.filter((p) => !usedPlayerIds.includes(p.id));

  // Determine stage safely
  const stage = battleState.matchStage || (
    currentMatchEvaluation?.status === 'completed' ? 'confirmed' :
    currentMatchEvaluation ? 'evaluated' :
    teamBPickId ? 'evaluated' :
    teamAPickId ? 'teamA_locked' :
    'faceoff'
  );

  // Pre-match countdown handler
  useEffect(() => {
    let timer = null;
    if (preMatchCountdown !== null && preMatchCountdown > 0) {
      soundService?.play?.('countdown_tick');
      timer = setTimeout(() => {
        setPreMatchCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (preMatchCountdown === 0) {
      soundService?.play?.('round_start');
      setPreMatchCountdown(null);
      startFighterSelection();
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [preMatchCountdown, startFighterSelection]);

  // Cinematic 3-2-1 Reveal Countdown handler
  useEffect(() => {
    let timer = null;
    if (revealCountdown !== null && revealCountdown > 0) {
      soundService?.play?.('countdown_tick');
      timer = setTimeout(() => {
        setRevealCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (revealCountdown === 0 && pendingTeamBPick) {
      soundService?.play?.('round_start');
      selectTeamBFighter(pendingTeamBPick);
      setRevealCountdown(null);
      setPendingTeamBPick(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [revealCountdown, pendingTeamBPick, selectTeamBFighter]);

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-2 sm:p-4 max-w-[1750px] mx-auto select-none space-y-2.5">
      
      {/* 1. TOP BROADCAST MATCH BAR */}
      <div className="battle-panel rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="orange" className="font-mono text-xs font-bold py-0.5">
            MATCH {currentMatchIndex + 1} OF {schedule.length}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs sm:text-sm font-broadcast font-bold text-white">
            <span style={{ color: teamA.color }}>{teamA.name}</span> VS <span style={{ color: teamB.color }}>{teamB.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completedMatches.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowReplay(!showReplay)}
              className="text-xs font-mono text-battle-muted hover:text-brand-orange"
            >
              <span>{showReplay ? 'Hide Replay' : `Replay (${completedMatches.length})`}</span>
            </Button>
          )}
          <Badge variant="neon" className="font-mono text-[10px] py-0.5">
            Win = +3 Pts • Draw = +1 Pt
          </Badge>
        </div>
      </div>

      {/* REPLAY VIEWER MODAL IF TOGGLED */}
      {showReplay && completedMatches.length > 0 && (
        <BattleReplayViewer
          completedMatches={completedMatches}
          teams={teams}
          onClose={() => setShowReplay(false)}
        />
      )}

      {/* 2. MAIN 3-COLUMN SCREEN-FIT ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
        
        {/* LEFT COLUMN: TEAM INFORMATION & TOURNAMENT STANDINGS (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-battle-border overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-battle-border">
            <span className="text-xs font-black text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              Tournament Teams ({teams.length})
            </span>
            <span className="text-[10px] font-mono text-brand-neon font-bold">
              Round 2 Standings
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {leaderboard.map((entry) => {
              const isMatchContender = entry.team.id === teamA.id || entry.team.id === teamB.id;
              const availableFighters = entry.team.squad.filter((p) => !usedPlayerIds.includes(p.id)).length;

              return (
                <div
                  key={entry.team.id}
                  className={`p-2.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isMatchContender
                      ? 'bg-battle-surface border-brand-cyan ring-1 ring-brand-cyan/60 shadow-glow-cyan'
                      : 'bg-battle-surface/60 border-battle-border'
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: entry.team.color }}
                  />

                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1 rounded-xl bg-battle-bg border border-battle-border">
                        {entry.team.logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-broadcast font-bold text-xs text-white truncate max-w-[90px]" style={{ color: entry.team.color }}>
                            {entry.team.name}
                          </h4>
                          {isMatchContender && (
                            <Badge variant="cyan" pulse className="px-1 py-0 text-[8px]">
                              IN CLASH
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-battle-muted font-mono block">
                          Record: {entry.won}W-{entry.drawn}D-{entry.lost}L (P:{entry.played})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-brand-neon block">
                        {entry.points} pts
                      </span>
                      <span className="text-[9px] font-mono text-amber-300 block">
                        {availableFighters}/{entry.team.squad.length} ready
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTRE COLUMN: MAIN GAME STAGE (Symmetrical Fighter Cards, VS, Ratings, Scorecard) (6 cols) */}
        <div className="lg:col-span-6 battle-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between border-2 border-brand-purple/40 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Arena Glow */}
          <div 
            className="absolute -top-24 left-1/4 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: teamA.color }}
          />
          <div 
            className="absolute -top-24 right-1/4 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: teamB.color }}
          />

          {/* Stage State Pill */}
          <div className="flex items-center justify-between mb-2 z-10 shrink-0">
            <span className="px-3 py-1 rounded-xl bg-battle-bg border border-battle-border text-xs font-broadcast font-bold text-white shadow-inner">
              MATCH #{currentMatchIndex + 1} ARENA CLASH
            </span>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-broadcast font-bold uppercase bg-brand-purple/20 text-purple-300 border-brand-purple/40">
              <Swords className="w-3.5 h-3.5" />
              <span>
                {stage === 'confirmed' ? 'RESULT SETTLED' :
                 stage === 'evaluated' ? 'CARDS REVEALED' :
                 revealCountdown !== null ? 'REVEAL COUNTDOWN' :
                 stage === 'teamB_select' ? 'TEAM B SELECTION' :
                 stage === 'teamA_locked' ? 'SELECTION ENCRYPTED' :
                 stage === 'teamA_select' ? 'TEAM A SELECTION' :
                 'PRE-MATCH FACE-OFF'}
              </span>
            </div>
          </div>

          {/* Main Symmetrical Versus Cards Stage */}
          <div className="relative my-auto py-2 z-10 flex-1 flex flex-col justify-center">
            
            {/* Reveal Countdown Screen Overlay */}
            {revealCountdown !== null ? (
              <div className="p-8 rounded-3xl bg-battle-bg border-2 border-brand-orange text-center space-y-3 shadow-glow-orange/30 my-auto">
                <Badge variant="orange" pulse className="uppercase tracking-widest font-broadcast text-xs">
                  Simultaneous Fighter Reveal
                </Badge>
                <h3 className="font-broadcast text-2xl sm:text-3xl font-black text-white uppercase">
                  CLASH IMMINENT IN
                </h3>
                <div className="font-broadcast text-7xl sm:text-8xl font-black text-brand-orange animate-bounce">
                  {revealCountdown}
                </div>
                <p className="text-xs font-mono text-battle-muted">
                  Decrypting fighter ratings and calculating victory points...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-11 gap-2 sm:gap-3 items-center">
                
                {/* TEAM A FIGHTER CARD (Left Symmetrical) */}
                <div
                  className={`col-span-5 p-3 sm:p-4 rounded-2xl border-2 text-center space-y-2 relative overflow-hidden transition-all ${
                    currentMatchEvaluation && currentMatchEvaluation.winnerId === teamA.id
                      ? 'bg-battle-surface border-brand-neon ring-2 ring-brand-neon/50 shadow-glow-neon'
                      : 'bg-battle-bg border-battle-border'
                  }`}
                  style={{
                    borderColor: currentMatchEvaluation && currentMatchEvaluation.winnerId === teamA.id ? '#B7F34A' : `${teamA.color}80`,
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-battle-border/80">
                    <span className="font-broadcast font-bold text-xs truncate" style={{ color: teamA.color }}>
                      {teamA.name}
                    </span>
                    {currentMatchEvaluation ? (
                      currentMatchEvaluation.winnerId === teamA.id ? (
                        <Badge variant="neon" className="text-[9px] px-1 py-0">WIN (+3)</Badge>
                      ) : currentMatchEvaluation.isDraw ? (
                        <Badge variant="orange" className="text-[9px] px-1 py-0">DRAW (+1)</Badge>
                      ) : (
                        <span className="text-[9px] font-mono text-battle-muted">0 PTS</span>
                      )
                    ) : teamAPickId ? (
                      <Badge variant="purple" className="text-[9px] px-1 py-0">LOCKED</Badge>
                    ) : (
                      <span className="text-[9px] font-mono text-battle-muted">READY</span>
                    )}
                  </div>

                  {/* Artwork / Encrypted State Container */}
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-battle-bg border border-battle-border relative flex items-center justify-center shadow-inner group">
                    {stage === 'evaluated' || stage === 'confirmed' ? (
                      currentMatchEvaluation?.playerA?.imageUrl ? (
                        <img
                          src={currentMatchEvaluation.playerA.imageUrl}
                          alt={currentMatchEvaluation.playerA.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl p-2 rounded-2xl bg-battle-surface/40 border border-battle-border">🎭</span>
                      )
                    ) : teamAPickId ? (
                      <div className="text-center space-y-1 p-2">
                        <Lock className="w-8 h-8 text-brand-purple mx-auto animate-pulse" />
                        <span className="text-[10px] font-mono text-brand-purple font-bold block">
                          ENCRYPTED
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 p-2">
                        <span className="text-3xl block">🛡️</span>
                        <span className="text-[10px] font-mono text-battle-muted block">
                          Awaiting Pick
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent pointer-events-none" />

                    {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                      <div className="absolute bottom-1.5 left-2 right-2 text-left z-10">
                        <span className="font-broadcast font-black text-xs text-white truncate block">
                          {currentMatchEvaluation.playerA.name}
                        </span>
                        <span className="text-[9px] text-battle-muted font-mono truncate block">
                          {currentMatchEvaluation.playerA.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating Capsule */}
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
                    <div className="p-1.5 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[8px] text-battle-muted uppercase font-broadcast font-bold block">COMBAT RATING</span>
                      <span className="font-mono text-sm sm:text-base font-black text-amber-400">
                        ★ {currentMatchEvaluation.scoreA}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl bg-battle-surface/40 border border-battle-border text-battle-muted text-[10px] font-mono">
                      Rating: ???
                    </div>
                  )}
                </div>

                {/* CENTRE VS ELEMENT */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-battle-surface border-2 border-brand-orange text-brand-orange flex items-center justify-center shadow-glow-orange font-broadcast font-black text-sm">
                    VS
                  </div>
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                    <span className="mt-1 px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-battle-bg border border-brand-cyan text-brand-cyan text-center whitespace-nowrap">
                      {currentMatchEvaluation.scoreDiff} PTS
                    </span>
                  )}
                </div>

                {/* TEAM B FIGHTER CARD (Right Symmetrical) */}
                <div
                  className={`col-span-5 p-3 sm:p-4 rounded-2xl border-2 text-center space-y-2 relative overflow-hidden transition-all ${
                    currentMatchEvaluation && currentMatchEvaluation.winnerId === teamB.id
                      ? 'bg-battle-surface border-brand-neon ring-2 ring-brand-neon/50 shadow-glow-neon'
                      : 'bg-battle-bg border-battle-border'
                  }`}
                  style={{
                    borderColor: currentMatchEvaluation && currentMatchEvaluation.winnerId === teamB.id ? '#B7F34A' : `${teamB.color}80`,
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-battle-border/80">
                    <span className="font-broadcast font-bold text-xs truncate" style={{ color: teamB.color }}>
                      {teamB.name}
                    </span>
                    {currentMatchEvaluation ? (
                      currentMatchEvaluation.winnerId === teamB.id ? (
                        <Badge variant="neon" className="text-[9px] px-1 py-0">WIN (+3)</Badge>
                      ) : currentMatchEvaluation.isDraw ? (
                        <Badge variant="orange" className="text-[9px] px-1 py-0">DRAW (+1)</Badge>
                      ) : (
                        <span className="text-[9px] font-mono text-battle-muted">0 PTS</span>
                      )
                    ) : teamBPickId ? (
                      <Badge variant="cyan" className="text-[9px] px-1 py-0">LOCKED</Badge>
                    ) : (
                      <span className="text-[9px] font-mono text-battle-muted">READY</span>
                    )}
                  </div>

                  {/* Artwork / Encrypted State Container */}
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-battle-bg border border-battle-border relative flex items-center justify-center shadow-inner group">
                    {stage === 'evaluated' || stage === 'confirmed' ? (
                      currentMatchEvaluation?.playerB?.imageUrl ? (
                        <img
                          src={currentMatchEvaluation.playerB.imageUrl}
                          alt={currentMatchEvaluation.playerB.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl p-2 rounded-2xl bg-battle-surface/40 border border-battle-border">⚡</span>
                      )
                    ) : teamBPickId ? (
                      <div className="text-center space-y-1 p-2">
                        <Lock className="w-8 h-8 text-brand-cyan mx-auto animate-pulse" />
                        <span className="text-[10px] font-mono text-brand-cyan font-bold block">
                          ENCRYPTED
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-1 p-2">
                        <span className="text-3xl block">🛡️</span>
                        <span className="text-[10px] font-mono text-battle-muted block">
                          Awaiting Pick
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent pointer-events-none" />

                    {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                      <div className="absolute bottom-1.5 left-2 right-2 text-left z-10">
                        <span className="font-broadcast font-black text-xs text-white truncate block">
                          {currentMatchEvaluation.playerB.name}
                        </span>
                        <span className="text-[9px] text-battle-muted font-mono truncate block">
                          {currentMatchEvaluation.playerB.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating Capsule */}
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
                    <div className="p-1.5 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-[8px] text-battle-muted uppercase font-broadcast font-bold block">COMBAT RATING</span>
                      <span className="font-mono text-sm sm:text-base font-black text-amber-400">
                        ★ {currentMatchEvaluation.scoreB}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl bg-battle-surface/40 border border-battle-border text-battle-muted text-[10px] font-mono">
                      Rating: ???
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Bottom Match Result Verdict Strip */}
          {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
            <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border flex items-center justify-between text-xs z-10 shrink-0">
              <div className="font-broadcast font-bold text-white">
                <span style={{ color: teamA.color }}>{teamA.name} ({currentMatchEvaluation.scoreA})</span>
                <span className="text-battle-muted mx-1.5">—</span>
                <span style={{ color: teamB.color }}>({currentMatchEvaluation.scoreB}) {teamB.name}</span>
              </div>
              <div>
                {currentMatchEvaluation.isDraw ? (
                  <span className="font-broadcast font-bold text-amber-400">
                    MATCH TIED (+1 PT EACH)
                  </span>
                ) : (
                  <span className="font-broadcast font-bold text-brand-neon">
                    {teams.find((t) => t.id === currentMatchEvaluation.winnerId)?.name} WINS (+3 PTS)!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-2xl bg-battle-bg/60 border border-battle-border/60 text-center text-[10px] text-battle-muted font-mono z-10 shrink-0">
              Pass the laptop for private deployment. Fighters reveal simultaneously on countdown.
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIONS AND CONTROLS (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-battle-border overflow-hidden space-y-2.5">
          
          {/* Phase-Specific Action Panel */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* 1. Pre-Match Faceoff Action */}
            {stage === 'faceoff' && (
              <div className="space-y-3 my-auto">
                <div className="text-center space-y-1">
                  <Badge variant="orange" className="text-[10px] uppercase font-broadcast">
                    Pre-Match Briefing
                  </Badge>
                  <h4 className="font-broadcast font-bold text-sm text-white">
                    Fighter Deployment
                  </h4>
                  <p className="text-[11px] text-battle-muted">
                    Head-to-head record: {h2hMatches.length === 0 ? 'First Meeting' : `${h2hMatches.length} previous clashes`}.
                  </p>
                </div>

                {preMatchCountdown !== null ? (
                  <div className="p-4 rounded-2xl bg-battle-bg border border-brand-orange text-center space-y-1">
                    <span className="text-[10px] font-mono text-brand-orange uppercase">STARTING IN</span>
                    <div className="font-broadcast text-4xl font-black text-brand-orange animate-pulse">
                      {preMatchCountdown}
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="accent"
                    size="lg"
                    onClick={() => setPreMatchCountdown(3)}
                    className="w-full font-broadcast text-xs font-bold shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black py-3 flex items-center justify-center gap-1.5"
                  >
                    <span>START FIGHTER SELECTION</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* 2. Team A Selection Action */}
            {stage === 'teamA_select' && (
              <div className="space-y-2 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="pb-1 border-b border-battle-border">
                  <span className="text-xs font-broadcast font-bold text-white block">
                    Choose Fighter for <span style={{ color: teamA.color }}>{teamA.name}</span>
                  </span>
                  <span className="text-[10px] text-battle-muted">
                    Keep pick hidden from opponents!
                  </span>
                </div>

                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-56">
                  {teamA.squad.map((fighter) => {
                    const isDeployed = usedPlayerIds.includes(fighter.id);
                    return (
                      <button
                        key={fighter.id}
                        type="button"
                        disabled={isDeployed}
                        onClick={() => selectTeamAFighter(fighter.id)}
                        className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                          isDeployed
                            ? 'bg-battle-surface/30 border-battle-border opacity-40 cursor-not-allowed'
                            : 'border-battle-border hover:border-brand-purple bg-battle-surface hover:bg-battle-card cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-broadcast font-bold text-white block truncate">
                            {fighter.name}
                          </span>
                          <span className="text-[9px] text-battle-muted font-mono block truncate">
                            {fighter.movie || fighter.role}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold shrink-0 ${isDeployed ? 'text-battle-muted' : 'text-brand-purple'}`}>
                          {isDeployed ? 'DEPLOYED' : 'DEPLOY →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Team A Locked (Privacy Screen Continuation) */}
            {stage === 'teamA_locked' && (
              <div className="space-y-3 my-auto text-center">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-purple/20 border border-brand-purple/40 text-brand-purple flex items-center justify-center shadow-glow-purple">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-broadcast font-bold text-sm text-white">
                    {teamA.name}'s Pick Encrypted!
                  </h4>
                  <p className="text-[11px] text-battle-muted mt-1">
                    Pass laptop to <strong style={{ color: teamB.color }}>{teamB.name}</strong> to make their selection.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={proceedToTeamB}
                  className="w-full font-broadcast text-xs font-bold shadow-glow-cyan bg-brand-cyan hover:bg-cyan-400 text-black py-3 flex items-center justify-center gap-1.5"
                >
                  <span>I AM {teamB.name} — SELECT</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 4. Team B Selection Action */}
            {stage === 'teamB_select' && (
              <div className="space-y-2 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="pb-1 border-b border-battle-border">
                  <span className="text-xs font-broadcast font-bold text-white block">
                    Choose Fighter for <span style={{ color: teamB.color }}>{teamB.name}</span>
                  </span>
                  <span className="text-[10px] text-battle-muted">
                    Click to lock in and trigger reveal!
                  </span>
                </div>

                <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-56">
                  {teamB.squad.map((fighter) => {
                    const isDeployed = usedPlayerIds.includes(fighter.id);
                    return (
                      <button
                        key={fighter.id}
                        type="button"
                        disabled={isDeployed}
                        onClick={() => {
                          setPendingTeamBPick(fighter.id);
                          setRevealCountdown(3);
                        }}
                        className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs ${
                          isDeployed
                            ? 'bg-battle-surface/30 border-battle-border opacity-40 cursor-not-allowed'
                            : 'border-battle-border hover:border-brand-cyan bg-battle-surface hover:bg-battle-card cursor-pointer'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="font-broadcast font-bold text-white block truncate">
                            {fighter.name}
                          </span>
                          <span className="text-[9px] text-battle-muted font-mono block truncate">
                            {fighter.movie || fighter.role}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold shrink-0 ${isDeployed ? 'text-battle-muted' : 'text-brand-cyan'}`}>
                          {isDeployed ? 'DEPLOYED' : 'DEPLOY →'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Result Confirmation Action */}
            {stage === 'evaluated' && (
              <div className="space-y-3 my-auto">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={confirmMatchResult}
                  className="w-full font-broadcast text-xs font-black shadow-glow-neon bg-emerald-500 hover:bg-emerald-600 text-black py-3.5 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CONFIRM & UPDATE STANDINGS</span>
                </Button>
                <p className="text-[10px] text-battle-muted text-center font-mono">
                  Awards 3 pts for win or 1 pt each for draw, marking fighters as deployed.
                </p>
              </div>
            )}

            {/* 6. Confirmed Next Match Action */}
            {stage === 'confirmed' && (
              <div className="space-y-3 my-auto">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={advanceToNextBattle}
                  className="w-full font-broadcast text-xs font-black shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black py-3.5 flex items-center justify-center gap-1.5"
                >
                  <span>{currentMatchIndex + 1 < schedule.length ? 'PROCEED TO NEXT MATCH' : 'VIEW TOURNAMENT PODIUM'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

          </div>

          {/* Bottom Match Log Mini Widget */}
          <div className="pt-2 border-t border-battle-border/60 shrink-0">
            <span className="text-[9px] font-mono font-bold uppercase text-battle-muted block mb-1">
              Match Log ({completedMatches.length} completed):
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto pr-1 text-[10px] font-mono">
              {completedMatches.map((m, idx) => (
                <div key={m.id || idx} className="p-1 rounded bg-battle-bg border border-battle-border/60 flex items-center justify-between">
                  <span className="text-battle-muted">#{idx + 1}</span>
                  <span className="truncate max-w-[120px] text-white">
                    {m.teamAName} vs {m.teamBName}
                  </span>
                  <span className="text-brand-neon font-bold">
                    {m.isDraw ? 'Tie' : m.winnerId === m.teamAId ? `${m.teamAName} W` : `${m.teamBName} W`}
                  </span>
                </div>
              ))}
              {completedMatches.length === 0 && (
                <span className="text-battle-muted italic text-[10px] block py-1">
                  No matches completed yet.
                </span>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
