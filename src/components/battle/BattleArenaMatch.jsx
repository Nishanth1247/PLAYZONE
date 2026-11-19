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
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { BattleReplayViewer } from './BattleReplayViewer';
import { soundService } from '../../services/soundService';
import { getTeamMatchSlotIndex } from '../../services/battleEngine';

/**
 * BIDBATTLE 8.4 — Symmetrical Battle Arena Match Stage
 * - If tactical draft is incomplete: renders TacticalDraftBoard
 * - In active matches:
 *   1. Left Column: Tournament Standings (Points, W-D-L, Squad deployment)
 *   2. Centre Column: Symmetrical Versus Stage (Secret classified cards -> 3-2-1 Reveal -> Ratings revealed & Scorecard)
 *   3. Right Column: Match Controls (Initiate 3-2-1 Reveal, Confirm Result & Update Standings, Advance to Next Match)
 * - Fits within standard 1366x768 and 1920x1080 desktop viewports without unnecessary vertical scrolling
 * - Distinctive Championship Editorial visual identity (Forest Ink, Deep Pine, Warm Ivory, Terracotta, Antique Gold)
 */
export const BattleArenaMatch = () => {
  const [revealCountdown, setRevealCountdown] = useState(null);
  const [showReplay, setShowReplay] = useState(false);

  const {
    battleState,
    initiateMatchReveal,
    confirmMatchResult,
    advanceToNextBattle,
  } = useBattleArena();

  // Cinematic 3-2-1 Reveal Countdown handler (called unconditionally at top of component)
  useEffect(() => {
    let timer = null;
    if (revealCountdown !== null && revealCountdown > 0) {
      soundService?.playTick?.();
      timer = setTimeout(() => {
        setRevealCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (revealCountdown === 0) {
      soundService?.playSold?.();
      initiateMatchReveal();
      setRevealCountdown(null);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [revealCountdown, initiateMatchReveal]);

  const {
    schedule,
    currentMatchIndex,
    teams,
    usedPlayerIds,
    privateFighterSelection,
    currentMatchEvaluation,
    leaderboard,
    completedMatches,
    tacticalDraft,
  } = battleState;

  const currentMatch = schedule[currentMatchIndex];
  if (!currentMatch) return null;

  const teamA = teams.find((t) => t.id === currentMatch.teamAId);
  const teamB = teams.find((t) => t.id === currentMatch.teamBId);
  if (!teamA || !teamB) return null;

  // Determine slot indices for both teams from the schedule
  const slotA = getTeamMatchSlotIndex(schedule, currentMatchIndex, teamA.id);
  const slotB = getTeamMatchSlotIndex(schedule, currentMatchIndex, teamB.id);

  // Retrieve assigned fighters from tactical draft lineups
  const fighterAId = tacticalDraft?.lineups?.[teamA.id]?.[slotA];
  const fighterBId = tacticalDraft?.lineups?.[teamB.id]?.[slotB];

  const fighterA = teamA.squad.find((p) => p.id === fighterAId) || teamA.squad[slotA];
  const fighterB = teamB.squad.find((p) => p.id === fighterBId) || teamB.squad[slotB];

  // Head-to-Head history between Team A and Team B
  const h2hMatches = (completedMatches || []).filter(
    (m) =>
      (m.teamAId === teamA.id && m.teamBId === teamB.id) ||
      (m.teamAId === teamB.id && m.teamBId === teamA.id)
  );

  // Determine match stage
  const stage = battleState.matchStage || (
    currentMatchEvaluation?.status === 'completed' ? 'confirmed' :
    currentMatchEvaluation ? 'evaluated' :
    'faceoff'
  );

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-2 sm:p-4 max-w-[1750px] mx-auto select-none space-y-2.5">
      
      {/* 1. TOP BROADCAST MATCH BAR */}
      <div className="battle-panel rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 border border-[#303030] shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <Badge variant="subtle" className="font-mono text-xs font-bold py-0.5">
            MATCH {currentMatchIndex + 1} OF {schedule.length}
          </Badge>
          <span className="text-[#737373] text-xs">•</span>
          <span className="text-xs sm:text-sm font-heading font-bold text-[#F2F2F0]">
            <span style={{ color: teamA.color }}>{teamA.name}</span> VS <span style={{ color: teamB.color }}>{teamB.name}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completedMatches.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setShowReplay(!showReplay)}
              className="text-xs font-mono text-[#A3A3A3] hover:text-[#F2F2F0]"
            >
              <span>{showReplay ? 'Hide Replay' : `Replay (${completedMatches.length})`}</span>
            </Button>
          )}
          <Badge variant="outline" className="font-mono text-[10px] py-0.5 border-[#303030] text-[#A3A3A3]">
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
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-[#303030] overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#303030]">
            <span className="text-xs font-black text-[#A3A3A3] uppercase tracking-wider font-heading flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#F2F2F0]" />
              Tournament Standings
            </span>
            <span className="text-[10px] font-mono text-[#A3A3A3] font-bold">
              Round 2 Clash
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
            {leaderboard.map((entry) => {
              const isMatchContender = entry.team.id === teamA.id || entry.team.id === teamB.id;
              const remainingFighters = entry.team.squad.filter((p) => !usedPlayerIds.includes(p.id)).length;

              return (
                <div
                  key={entry.team.id}
                  className={`p-2.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isMatchContender
                      ? 'bg-[#191919] border-[#F2F2F0] shadow-md ring-1 ring-[#F2F2F0]/20'
                      : 'bg-[#111111] border-[#303030]'
                  }`}
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: entry.team.color }}
                  />

                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1 rounded-xl bg-[#111111] border border-[#303030]">
                        {entry.team.logo}
                      </span>
                      <div>
                        <div className="flex items-center gap-1">
                          <h4 className="font-heading font-bold text-xs text-[#F2F2F0] truncate max-w-[95px]" style={{ color: entry.team.color }}>
                            {entry.team.name}
                          </h4>
                          {isMatchContender && (
                            <Badge variant="subtle" className="px-1 py-0 text-[8px] uppercase">
                              CLASH
                            </Badge>
                          )}
                        </div>
                        <span className="text-[9px] text-[#737373] font-mono block">
                          Record: {entry.won}W-{entry.drawn}D-{entry.lost}L
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-sm text-[#F2F2F0] block">
                        {entry.points} pts
                      </span>
                      <span className="text-[9px] font-mono text-[#737373] block">
                        {remainingFighters}/{entry.team.squad.length} ready
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-[#303030] text-[11px] text-[#A3A3A3] font-mono flex items-center justify-between">
            <span>Match: {currentMatchIndex + 1}/{schedule.length}</span>
            <span className="text-[#F2F2F0] font-bold">Standard 3-1-0</span>
          </div>
        </div>

        {/* CENTRE COLUMN: MAIN GAME STAGE (Symmetrical Fighter Cards, VS, Ratings, Scorecard) (6 cols) */}
        <div className="lg:col-span-6 battle-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between border-2 border-[#303030] shadow-2xl relative overflow-hidden bg-[#191919]">
          
          {/* Broadcast Header Badge */}
          <div className="flex items-center justify-between border-b border-[#303030] pb-2.5 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2F2F0] animate-ping" />
              <span className="text-xs font-heading font-bold text-[#F2F2F0] tracking-wider uppercase">
                ARENA FACE-OFF • SLOT {slotA + 1}
              </span>
            </div>
            <div className="font-mono text-xs text-[#A3A3A3]">
              {stage === 'faceoff' ? (
                <span className="text-[#F2F2F0] flex items-center gap-1 font-bold">
                  <Lock className="w-3.5 h-3.5" /> Secret Lineup
                </span>
              ) : (
                <span className="text-[#F2F2F0] font-bold">Combat Revealed</span>
              )}
            </div>
          </div>

          {/* Symmetrical Fighter Versus Area */}
          <div className="my-auto py-3">
            {revealCountdown !== null ? (
              /* CINEMATIC 3-2-1 REVEAL SCREEN */
              <div className="py-12 text-center space-y-4">
                <Badge variant="subtle" className="font-mono text-xs uppercase px-3 py-1 font-bold animate-pulse">
                  SIMULTANEOUS FIGHTER REVEAL
                </Badge>
                <div className="font-title text-7xl sm:text-8xl font-black text-[#F2F2F0] animate-bounce tracking-widest drop-shadow-lg">
                  {revealCountdown === 0 ? 'FIGHT!' : revealCountdown}
                </div>
                <p className="text-xs font-mono text-[#A3A3A3]">
                  Decrypting tactical fighter deployments & calculating battle points...
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-11 items-center gap-2 sm:gap-3">
                
                {/* TEAM A FIGHTER CARD (Left Symmetrical) */}
                <div
                  className={`col-span-5 p-3 sm:p-4 rounded-2xl border-2 text-center space-y-2 relative overflow-hidden transition-all ${
                    currentMatchEvaluation && currentMatchEvaluation.winnerId === teamA.id
                      ? 'bg-[#222222] border-white ring-2 ring-white/30 shadow-xl'
                      : 'bg-[#111111] border-[#303030]'
                  }`}
                  style={{
                    borderColor: currentMatchEvaluation && currentMatchEvaluation.winnerId === teamA.id ? '#F2F2F0' : `${teamA.color}80`,
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#303030]">
                    <span className="font-heading font-bold text-xs truncate" style={{ color: teamA.color }}>
                      {teamA.name}
                    </span>
                    {currentMatchEvaluation ? (
                      currentMatchEvaluation.winnerId === teamA.id ? (
                        <Badge variant="primary" className="text-[9px] px-1 py-0 font-bold">WIN (+3)</Badge>
                      ) : currentMatchEvaluation.isDraw ? (
                        <Badge variant="subtle" className="text-[9px] px-1 py-0">DRAW (+1)</Badge>
                      ) : (
                        <span className="text-[9px] font-mono text-[#737373]">0 PTS</span>
                      )
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-[#303030] text-[#A3A3A3] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> SEALED
                      </Badge>
                    )}
                  </div>

                  {/* Artwork / Encrypted State Container */}
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-[#191919] border border-[#303030] relative flex items-center justify-center shadow-inner group">
                    {stage === 'evaluated' || stage === 'confirmed' ? (
                      currentMatchEvaluation?.playerA?.imageUrl ? (
                        <img
                          src={currentMatchEvaluation.playerA.imageUrl}
                          alt={currentMatchEvaluation.playerA.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl p-2 rounded-2xl bg-[#111111] border border-[#303030]">⚔️</span>
                      )
                    ) : (
                      <div className="text-center space-y-1.5 p-2">
                        <Lock className="w-8 h-8 text-[#A3A3A3] mx-auto animate-pulse" />
                        <span className="text-[11px] font-mono text-[#F2F2F0] font-bold block uppercase tracking-wider">
                          TACTICAL SECRET
                        </span>
                        <span className="text-[9px] text-[#737373] font-mono block">
                          Slot {slotA + 1} Deployed
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                      <div className="absolute bottom-1.5 left-2 right-2 text-left z-10">
                        <span className="font-heading font-black text-xs text-[#F2F2F0] truncate block">
                          {currentMatchEvaluation.playerA.name}
                        </span>
                        <span className="text-[9px] text-[#A3A3A3] font-mono truncate block">
                          {currentMatchEvaluation.playerA.category || currentMatchEvaluation.playerA.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating Capsule (Revealed ONLY during active evaluated/confirmed match) */}
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
                    <div className="p-1.5 rounded-xl bg-[#191919] border border-[#303030]">
                      <span className="text-[8px] text-[#737373] uppercase font-heading font-bold block">COMBAT RATING</span>
                      <span className="font-mono text-sm sm:text-base font-black text-[#F2F2F0]">
                        ★ {currentMatchEvaluation.scoreA}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl bg-[#191919]/60 border border-[#303030] text-[#737373] text-[10px] font-mono flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-[#A3A3A3]" />
                      <span>Rating: Encrypted</span>
                    </div>
                  )}
                </div>

                {/* CENTRE VS ELEMENT (#111111 with white typography) */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-[#111111] border-2 border-[#303030] text-[#F2F2F0] flex items-center justify-center shadow-lg font-heading font-black text-sm">
                    VS
                  </div>
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                    <span className="mt-1 px-1 py-0.5 rounded text-[8px] font-mono font-bold bg-[#191919] border border-[#303030] text-[#F2F2F0] text-center whitespace-nowrap">
                      {currentMatchEvaluation.scoreDiff} PTS
                    </span>
                  )}
                </div>

                {/* TEAM B FIGHTER CARD (Right Symmetrical) */}
                <div
                  className={`col-span-5 p-3 sm:p-4 rounded-2xl border-2 text-center space-y-2 relative overflow-hidden transition-all ${
                    currentMatchEvaluation && currentMatchEvaluation.winnerId === teamB.id
                      ? 'bg-[#222222] border-white ring-2 ring-white/30 shadow-xl'
                      : 'bg-[#111111] border-[#303030]'
                  }`}
                  style={{
                    borderColor: currentMatchEvaluation && currentMatchEvaluation.winnerId === teamB.id ? '#F2F2F0' : `${teamB.color}80`,
                  }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-[#303030]">
                    <span className="font-heading font-bold text-xs truncate" style={{ color: teamB.color }}>
                      {teamB.name}
                    </span>
                    {currentMatchEvaluation ? (
                      currentMatchEvaluation.winnerId === teamB.id ? (
                        <Badge variant="primary" className="text-[9px] px-1 py-0 font-bold">WIN (+3)</Badge>
                      ) : currentMatchEvaluation.isDraw ? (
                        <Badge variant="subtle" className="text-[9px] px-1 py-0">DRAW (+1)</Badge>
                      ) : (
                        <span className="text-[9px] font-mono text-[#737373]">0 PTS</span>
                      )
                    ) : (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 border-[#303030] text-[#A3A3A3] flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> SEALED
                      </Badge>
                    )}
                  </div>

                  {/* Artwork / Encrypted State Container */}
                  <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-[#191919] border border-[#303030] relative flex items-center justify-center shadow-inner group">
                    {stage === 'evaluated' || stage === 'confirmed' ? (
                      currentMatchEvaluation?.playerB?.imageUrl ? (
                        <img
                          src={currentMatchEvaluation.playerB.imageUrl}
                          alt={currentMatchEvaluation.playerB.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className="text-4xl p-2 rounded-2xl bg-[#111111] border border-[#303030]">⚔️</span>
                      )
                    ) : (
                      <div className="text-center space-y-1.5 p-2">
                        <Lock className="w-8 h-8 text-[#A3A3A3] mx-auto animate-pulse" />
                        <span className="text-[11px] font-mono text-[#F2F2F0] font-bold block uppercase tracking-wider">
                          TACTICAL SECRET
                        </span>
                        <span className="text-[9px] text-[#737373] font-mono block">
                          Slot {slotB + 1} Deployed
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation && (
                      <div className="absolute bottom-1.5 left-2 right-2 text-left z-10">
                        <span className="font-heading font-black text-xs text-[#F2F2F0] truncate block">
                          {currentMatchEvaluation.playerB.name}
                        </span>
                        <span className="text-[9px] text-[#A3A3A3] font-mono truncate block">
                          {currentMatchEvaluation.playerB.category || currentMatchEvaluation.playerB.role}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Rating Capsule */}
                  {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
                    <div className="p-1.5 rounded-xl bg-[#191919] border border-[#303030]">
                      <span className="text-[8px] text-[#737373] uppercase font-heading font-bold block">COMBAT RATING</span>
                      <span className="font-mono text-sm sm:text-base font-black text-[#F2F2F0]">
                        ★ {currentMatchEvaluation.scoreB}
                      </span>
                    </div>
                  ) : (
                    <div className="p-1.5 rounded-xl bg-[#191919]/60 border border-[#303030] text-[#737373] text-[10px] font-mono flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-[#A3A3A3]" />
                      <span>Rating: Encrypted</span>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Bottom Match Result Verdict Strip */}
          {(stage === 'evaluated' || stage === 'confirmed') && currentMatchEvaluation ? (
            <div className="p-2.5 rounded-2xl bg-[#111111] border border-[#303030] flex items-center justify-between text-xs z-10 shrink-0">
              <div className="font-heading font-bold text-[#F2F2F0]">
                <span style={{ color: teamA.color }}>{teamA.name} ({currentMatchEvaluation.scoreA})</span>
                <span className="text-[#737373] mx-1.5">—</span>
                <span style={{ color: teamB.color }}>({currentMatchEvaluation.scoreB}) {teamB.name}</span>
              </div>
              <div>
                {currentMatchEvaluation.isDraw ? (
                  <span className="font-heading font-bold text-[#F2F2F0]">
                    MATCH TIED (+1 PT EACH)
                  </span>
                ) : (
                  <span className="font-heading font-bold text-[#F2F2F0]">
                    <span style={{ color: teams.find((t) => t.id === currentMatchEvaluation.winnerId)?.color }}>
                      {teams.find((t) => t.id === currentMatchEvaluation.winnerId)?.name}
                    </span> WINS (+3 PTS)!
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-2xl bg-[#111111]/60 border border-[#303030] text-center text-[10px] text-[#A3A3A3] font-mono z-10 shrink-0">
              Both lineups locked from tactical draft. Click Initiate Battle to start 3-2-1 reveal.
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: ACTIONS AND CONTROLS (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-[#303030] overflow-hidden space-y-2.5 bg-[#191919]">
          
          {/* Phase-Specific Action Panel */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            
            {/* 1. Pre-Match Faceoff Action */}
            {stage === 'faceoff' && (
              <div className="space-y-3 my-auto">
                <div className="text-center space-y-1">
                  <Badge variant="subtle" className="text-[10px] uppercase font-heading">
                    Pre-Match Briefing
                  </Badge>
                  <h4 className="font-heading font-bold text-sm text-[#F2F2F0]">
                    Tactical Clash Ready
                  </h4>
                  <p className="text-[11px] text-[#A3A3A3]">
                    Head-to-head record: {h2hMatches.length === 0 ? 'First Meeting' : `${h2hMatches.length} previous clashes`}.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111111] border border-[#303030] text-center space-y-2">
                  <span className="text-xs font-mono font-bold text-[#A3A3A3] uppercase block">
                    SECRECY PROTOCOL ACTIVE
                  </span>
                  <p className="text-[11px] text-[#737373]">
                    Fighter identities and combat ratings are sealed until reveal.
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setRevealCountdown(3)}
                  className="w-full font-heading text-xs font-bold shadow-lg bg-[#F2F2F0] hover:bg-white text-[#090909] py-3.5 flex items-center justify-center gap-1.5"
                >
                  <Swords className="w-4 h-4 text-[#090909]" />
                  <span>INITIATE BATTLE (3-2-1 REVEAL)</span>
                </Button>
              </div>
            )}

            {/* 2. Match Evaluated (Awaiting Explicit Result Confirmation) */}
            {stage === 'evaluated' && (
              <div className="space-y-3 my-auto">
                <div className="text-center space-y-1">
                  <Badge variant="subtle" className="text-[10px] uppercase font-heading">
                    Match Result Decided
                  </Badge>
                  <h4 className="font-heading font-bold text-sm text-[#F2F2F0]">
                    Confirm Tournament Points
                  </h4>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#111111] border border-[#303030] text-center space-y-2">
                  <span className="text-xs font-heading font-bold text-[#F2F2F0] block">
                    {currentMatchEvaluation.isDraw ? 'Points Split: +1 Pt Each' : `Winner Award: +3 Pts`}
                  </span>
                  <span className="text-[10px] font-mono text-[#A3A3A3] block">
                    Score differential: {currentMatchEvaluation.diff} combat points
                  </span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={confirmMatchResult}
                  className="w-full font-heading text-xs font-bold shadow-lg bg-[#F2F2F0] hover:bg-white text-[#090909] py-3.5 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#090909]" />
                  <span>CONFIRM & UPDATE STANDINGS</span>
                </Button>
              </div>
            )}

            {/* 3. Match Confirmed (Standings Updated, Advance to Next Battle) */}
            {stage === 'confirmed' && (
              <div className="space-y-3 my-auto">
                <div className="text-center space-y-1">
                  <Badge variant="subtle" className="text-[10px] uppercase font-heading">
                    Match Finalized
                  </Badge>
                  <h4 className="font-heading font-bold text-sm text-[#F2F2F0]">
                    Standings Updated
                  </h4>
                  <p className="text-[11px] text-[#A3A3A3]">
                    {currentMatchIndex + 1 < schedule.length
                      ? `Proceed to Match ${currentMatchIndex + 2} of ${schedule.length}`
                      : 'All matches completed! Proceed to podium.'}
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={advanceToNextBattle}
                  className="w-full font-heading text-xs font-bold shadow-lg bg-[#F2F2F0] hover:bg-white text-[#090909] py-3.5 flex items-center justify-center gap-1.5"
                >
                  {currentMatchIndex + 1 < schedule.length ? (
                    <>
                      <span>NEXT MATCH ({currentMatchIndex + 2}/{schedule.length})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 text-[#090909]" />
                      <span>VIEW TOURNAMENT PODIUM</span>
                    </>
                  )}
                </Button>
              </div>
            )}

          </div>

          {/* Quick Schedule Status Strip */}
          <div className="p-2.5 rounded-2xl bg-[#111111] border border-[#303030] text-[11px] text-[#A3A3A3] flex items-center justify-between font-mono shrink-0">
            <span>Next: {currentMatchIndex + 2 <= schedule.length ? `Match ${currentMatchIndex + 2}` : 'Finals'}</span>
            <span className="text-[#F2F2F0] font-bold">Classified</span>
          </div>

        </div>

      </div>

    </div>
  );
};
