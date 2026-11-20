import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Shield, 
  Trophy, 
  Crown, 
  Clock, 
  Users, 
  AlertCircle, 
  Flame, 
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { broadcastService } from '../../services/broadcastService';

export const BattleBroadcast = ({
  battleState,
  tournament,
  standings = [],
}) => {
  const [revealCountdown, setRevealCountdown] = useState(null);

  const phase = battleState?.phase || 'battles';
  const teams = battleState?.teams || [];
  const matches = battleState?.schedule || [];
  const currentMatchIndex = battleState?.currentMatchIndex || 0;
  const currentMatch = matches[currentMatchIndex] || null;

  // Resolve Team A and Team B
  const teamA = teams.find((t) => t.id === currentMatch?.teamAId);
  const teamB = teams.find((t) => t.id === currentMatch?.teamBId);

  // Tactical draft state
  const isDraftLocked = battleState?.tacticalDraft?.isLocked;
  const draftStage = battleState?.tacticalDraft?.draftStage;
  const matchStage = battleState?.matchStage; // 'faceoff' | 'reveal' | 'result'
  const matchEvaluation = battleState?.currentMatchEvaluation;

  // Trigger sound effect on match reveal
  useEffect(() => {
    if (matchStage === 'reveal') {
      broadcastService.playAudio('fanfare');
    }
  }, [matchStage]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between relative z-10">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#39465A]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 text-[#00D9FF] text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5" />
            <span>BATTLE ARENA BROADCAST</span>
          </div>
          {currentMatch && (
            <span className="text-xs font-mono text-[#AEB9CC]">
              MATCH #{currentMatchIndex + 1} OF {matches.length || 1}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-heading">
          <span className="text-[#AEB9CC]">PHASE:</span>
          <span className="font-mono font-bold text-[#D4B879] uppercase">
            {phase === 'auction' ? 'Squad Auction Stage' : isDraftLocked ? 'Combat Faceoff' : 'Tactical Draft'}
          </span>
        </div>
      </div>

      {/* 2. MAIN BATTLE STAGE */}
      <div className="my-auto py-6">
        {/* IF TACTICAL DRAFT IN PROGRESS BUT NOT LOCKED: SHOW BROADCAST PREVIEW WHILE RESPECTING PRIVACY */}
        {!isDraftLocked && phase === 'battles' ? (
          <div className="max-w-2xl mx-auto text-center space-y-6 p-8 rounded-3xl bg-[#192231] border border-[#39465A] shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-[#00D9FF]/20 border border-[#00D9FF]/40 mx-auto flex items-center justify-center text-[#00D9FF]">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F5F3EE]">
                SECRET TACTICAL DRAFT IN PROGRESS
              </h2>
              <p className="text-xs text-[#AEB9CC] font-sans max-w-md mx-auto">
                Fighters are currently being drafted in strict secrecy behind the pass-and-play privacy shield. Opponent lineups remain fully hidden.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 pt-2">
              {teams.map((t) => (
                <div
                  key={t.id}
                  className="px-4 py-2 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center gap-2"
                >
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-heading font-bold text-xs text-[#F5F3EE]">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE MATCH FACEOFF OR REVEAL */
          <div className="space-y-6">
            {/* CLASH BANNER: TEAM A VS TEAM B */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
              {/* TEAM A CARD (5 Cols) */}
              <div
                className="md:col-span-5 rounded-3xl p-6 sm:p-8 border bg-[#192231] shadow-2xl relative overflow-hidden text-center md:text-left flex flex-col justify-between min-h-[300px]"
                style={{
                  borderColor: teamA?.color || '#39465A',
                  boxShadow: teamA ? `0 0 35px ${teamA.color}20` : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: teamA?.color }} />
                
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
                    TEAM BLUE / HOME
                  </span>
                  <span className="font-mono text-xs font-bold text-[#AEB9CC]">
                    {teamA?.points || 0} PTS
                  </span>
                </div>

                <div className="my-auto py-4">
                  <div className="w-20 h-20 rounded-2xl mx-auto md:mx-0 mb-3 flex items-center justify-center font-heading font-black text-3xl border shadow-xl overflow-hidden bg-[#111827]"
                    style={{ borderColor: teamA?.color, color: teamA?.color }}
                  >
                    {teamA?.logo ? (
                      <img src={teamA.logo} alt={teamA.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{teamA?.name?.slice(0, 2).toUpperCase() || 'TA'}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#F5F3EE] tracking-tight">
                    {teamA?.name || 'Team A'}
                  </h3>
                  <p className="text-xs text-[#AEB9CC] font-sans mt-1">
                    Record: {teamA?.wins || 0}W - {teamA?.draws || 0}D - {teamA?.losses || 0}L
                  </p>
                </div>

                {/* Selected Fighter Spotlight (if revealed) */}
                {matchEvaluation?.fighterA && (
                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center justify-between">
                    <span className="text-xs font-heading text-[#AEB9CC]">Fighter:</span>
                    <span className="font-heading font-bold text-sm text-[#00D9FF]">
                      {matchEvaluation.fighterA.name}
                    </span>
                    <span className="font-mono text-xs font-black text-[#D4B879] px-2 py-0.5 rounded-lg bg-[#222F43]">
                      PWR {matchEvaluation.fighterA.rating || matchEvaluation.fighterA.combatScore || 85}
                    </span>
                  </div>
                )}
              </div>

              {/* CENTER VS BADGE (1 Col) */}
              <div className="md:col-span-1 flex flex-col items-center justify-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#111827] border-2 border-[#D4B879] flex items-center justify-center shadow-glow-orange">
                  <Swords className="w-7 h-7 text-[#D4B879]" />
                </div>
                <span className="text-xs font-mono font-black text-[#D4B879] mt-2 tracking-widest">
                  VS
                </span>
              </div>

              {/* TEAM B CARD (5 Cols) */}
              <div
                className="md:col-span-5 rounded-3xl p-6 sm:p-8 border bg-[#192231] shadow-2xl relative overflow-hidden text-center md:text-right flex flex-col justify-between min-h-[300px]"
                style={{
                  borderColor: teamB?.color || '#39465A',
                  boxShadow: teamB ? `0 0 35px ${teamB.color}20` : undefined,
                }}
              >
                <div className="absolute top-0 left-0 right-0 h-2" style={{ backgroundColor: teamB?.color }} />

                <div className="flex items-center justify-between flex-row-reverse">
                  <span className="px-3 py-1 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
                    TEAM RED / AWAY
                  </span>
                  <span className="font-mono text-xs font-bold text-[#AEB9CC]">
                    {teamB?.points || 0} PTS
                  </span>
                </div>

                <div className="my-auto py-4">
                  <div className="w-20 h-20 rounded-2xl mx-auto md:ml-auto md:mr-0 mb-3 flex items-center justify-center font-heading font-black text-3xl border shadow-xl overflow-hidden bg-[#111827]"
                    style={{ borderColor: teamB?.color, color: teamB?.color }}
                  >
                    {teamB?.logo ? (
                      <img src={teamB.logo} alt={teamB.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{teamB?.name?.slice(0, 2).toUpperCase() || 'TB'}</span>
                    )}
                  </div>
                  <h3 className="font-heading font-black text-3xl text-[#F5F3EE] tracking-tight">
                    {teamB?.name || 'Team B'}
                  </h3>
                  <p className="text-xs text-[#AEB9CC] font-sans mt-1">
                    Record: {teamB?.wins || 0}W - {teamB?.draws || 0}D - {teamB?.losses || 0}L
                  </p>
                </div>

                {/* Selected Fighter Spotlight (if revealed) */}
                {matchEvaluation?.fighterB && (
                  <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center justify-between flex-row-reverse">
                    <span className="text-xs font-heading text-[#AEB9CC]">Fighter:</span>
                    <span className="font-heading font-bold text-sm text-[#D97858]">
                      {matchEvaluation.fighterB.name}
                    </span>
                    <span className="font-mono text-xs font-black text-[#D4B879] px-2 py-0.5 rounded-lg bg-[#222F43]">
                      PWR {matchEvaluation.fighterB.rating || matchEvaluation.fighterB.combatScore || 85}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* MATCH RESULT ANNOUNCEMENT (IF COMPLETED) */}
            {matchEvaluation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 rounded-3xl bg-[#222F43] border border-[#D4B879] shadow-2xl text-center space-y-2"
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111827] border border-[#D4B879] text-xs font-mono font-bold text-[#D4B879]">
                  <Crown className="w-4 h-4 text-[#D4B879]" />
                  <span>MATCH RESULT</span>
                </div>
                <h4 className="font-heading font-black text-2xl sm:text-3xl text-[#F5F3EE]">
                  {matchEvaluation.winnerId 
                    ? `${teams.find((t) => t.id === matchEvaluation.winnerId)?.name || 'Winner'} TAKES THE VICTORY (+3 PTS)` 
                    : 'TACTICAL DRAW (1 POINT EACH)'}
                </h4>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* 3. BOTTOM STANDINGS LEADERBOARD */}
      <div className="pt-3 border-t border-[#39465A] space-y-2">
        <div className="flex items-center justify-between text-xs font-heading">
          <span className="font-bold text-[#AEB9CC] flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
            <span>CURRENT TOURNAMENT STANDINGS (3-1-0 SCORING)</span>
          </span>
          <span className="text-[11px] font-mono text-[#AEB9CC]">
            {standings.length} Competitors
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {standings.map((s, idx) => (
            <div
              key={s.teamId || idx}
              className="p-2.5 rounded-xl bg-[#111827] border border-[#39465A] flex items-center justify-between text-xs font-heading"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-black text-[#D4B879]">#{s.rank || idx + 1}</span>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="font-bold text-[#F5F3EE] truncate">{s.teamName}</span>
              </div>
              <span className="font-mono font-black text-sm text-[#00D9FF]">
                {s.points} PTS
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
