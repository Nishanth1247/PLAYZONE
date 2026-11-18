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
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { PassTheLaptopScreen } from '../party/common/PassTheLaptopScreen';

export const BattleArenaMatch = () => {
  const {
    battleState,
    selectPrivateFighter,
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
  } = battleState;

  const currentMatch = schedule[currentMatchIndex];

  // Which team is currently picking privately:
  // If Team A hasn't picked: 'teamA'
  // If Team A picked but Team B hasn't: 'teamB'
  // If both picked: 'faceoff'
  const teamA = teams.find((t) => t.id === currentMatch.teamAId);
  const teamB = teams.find((t) => t.id === currentMatch.teamBId);

  const teamAPickId = privateFighterSelection[teamA.id];
  const teamBPickId = privateFighterSelection[teamB.id];

  // Unused squad members for each team
  const availableSquadA = teamA.squad.filter((p) => !usedPlayerIds.includes(p.id));
  const availableSquadB = teamB.squad.filter((p) => !usedPlayerIds.includes(p.id));

  // Handle Team A selection
  const handleSelectTeamA = (playerId) => {
    selectPrivateFighter(teamA.id, playerId);
  };

  // Handle Team B selection
  const handleSelectTeamB = (playerId) => {
    selectPrivateFighter(teamB.id, playerId);
  };

  const isEvaluated = Boolean(currentMatchEvaluation);

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
          
          {/* STEP 1: TEAM A PRIVATE FIGHTER SELECTION */}
          {!teamAPickId && (
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
                  <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                    Choose 1 Fighter from Your Acquired Squad:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSquadA.map((fighter) => (
                      <button
                        key={fighter.id}
                        type="button"
                        onClick={() => handleSelectTeamA(fighter.id)}
                        className="p-4 rounded-2xl border border-battle-border hover:border-brand-purple bg-battle-surface hover:bg-battle-surface/80 text-left transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">🎬</span>
                            <Badge variant="purple" className="text-[10px]">
                              {fighter.role || 'Contender'}
                            </Badge>
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

                        <span className="mt-3 text-xs font-mono font-bold text-brand-purple">
                          DEPLOY FIGHTER →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </PassTheLaptopScreen>
            </motion.div>
          )}

          {/* STEP 2: TEAM B PRIVATE FIGHTER SELECTION */}
          {teamAPickId && !teamBPickId && (
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
                  <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                    Choose 1 Fighter from Your Acquired Squad:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableSquadB.map((fighter) => (
                      <button
                        key={fighter.id}
                        type="button"
                        onClick={() => handleSelectTeamB(fighter.id)}
                        className="p-4 rounded-2xl border border-battle-border hover:border-brand-cyan bg-battle-surface hover:bg-battle-surface/80 text-left transition-all group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xl">⚡</span>
                            <Badge variant="cyan" className="text-[10px]">
                              {fighter.role || 'Contender'}
                            </Badge>
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

                        <span className="mt-3 text-xs font-mono font-bold text-brand-cyan">
                          DEPLOY FIGHTER →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </PassTheLaptopScreen>
            </motion.div>
          )}

          {/* STEP 3: BOTH FIGHTERS REVEALED & EVALUATED */}
          {isEvaluated && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="battle-panel rounded-3xl p-6 sm:p-8 border-2 border-brand-orange/60 shadow-2xl space-y-8 text-center"
            >
              {/* Top Faceoff Header */}
              <div className="flex items-center justify-center gap-3">
                <Swords className="w-8 h-8 text-brand-orange animate-pulse" />
                <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                  ARENA CLASH SETTLED!
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

              {/* Advance Button */}
              <Button
                variant="primary"
                size="xl"
                onClick={advanceToNextBattle}
                className="w-full font-broadcast text-base shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black font-black flex items-center justify-center gap-2"
              >
                <span>{currentMatchIndex + 1 < schedule.length ? 'NEXT MATCH' : 'VIEW TOURNAMENT CHAMPION PODIUM'}</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
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
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
