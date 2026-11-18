import React from 'react';
import { motion } from 'framer-motion';
import { 
  Swords, 
  Trophy, 
  Users, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Calendar, 
  Flame 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';

export const BattleTransitionModal = () => {
  const { battleState, enterBattleArenaStage } = useBattleArena();
  const { tournamentName, teams, squadSize, schedule, leaderboard } = battleState;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Big Cinematic Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-brand-orange/60 shadow-2xl text-center relative overflow-hidden space-y-4"
      >
        {/* Glow halo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-orange/20 blur-[130px] pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-battle-bg border border-brand-orange/40 text-xs font-mono font-bold text-brand-orange shadow-glow-orange">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          <span>ROUND 2 UNLOCKED • HEAD-TO-HEAD BATTLES</span>
        </div>

        <h1 className="font-broadcast text-4xl sm:text-6xl font-black text-white uppercase tracking-wider">
          {tournamentName}
        </h1>

        <p className="text-sm sm:text-base text-battle-muted max-w-2xl mx-auto leading-relaxed">
          The squads are locked with {squadSize} fighters each. Each match, opposing franchises release one fighter. Only victories earn battle points!
        </p>

        {/* Participating Teams Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {teams.map((t) => (
            <div
              key={t.id}
              className="px-4 py-2 rounded-2xl bg-battle-bg border border-battle-border flex items-center gap-2.5 shadow-md"
            >
              <span className="text-xl">{t.logo}</span>
              <div className="text-left">
                <span className="font-broadcast font-bold text-sm text-white block leading-none">
                  {t.name}
                </span>
                <span className="text-[10px] font-mono text-battle-muted">
                  Purse Left: ₹{t.purse} Cr
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Button
            variant="primary"
            size="xl"
            onClick={enterBattleArenaStage}
            className="font-broadcast text-lg shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black font-black px-10 py-4 flex items-center gap-2 mx-auto"
          >
            <Swords className="w-6 h-6 fill-current" />
            <span>ENTER THE BATTLE ARENA</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* Two Column Grid: Scheduled Matches & Current Standings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Scheduled Battles Bracket */}
        <div className="battle-panel rounded-3xl p-6 border border-battle-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-battle-border">
            <span className="font-broadcast font-bold text-sm text-white uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-cyan" />
              <span>Battle Schedule ({schedule.length} Matches)</span>
            </span>
            <span className="text-xs font-mono text-brand-cyan font-bold">Round-Robin</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {schedule.map((match, idx) => (
              <div
                key={match.id}
                className="p-3 rounded-2xl bg-battle-bg border border-battle-border flex items-center justify-between"
              >
                <span className="text-[10px] font-mono font-bold text-battle-muted">
                  MATCH #{idx + 1}
                </span>

                <div className="flex items-center gap-3">
                  <span className="font-broadcast font-bold text-xs" style={{ color: match.teamAColor }}>
                    {match.teamAName}
                  </span>
                  <span className="text-xs font-mono font-bold text-battle-muted">VS</span>
                  <span className="font-broadcast font-bold text-xs" style={{ color: match.teamBColor }}>
                    {match.teamBName}
                  </span>
                </div>

                <Badge variant="purple" className="text-[9px] px-2 py-0">
                  Ready
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Initial Standings Table */}
        <div className="battle-panel rounded-3xl p-6 border border-battle-border shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-battle-border">
            <span className="font-broadcast font-bold text-sm text-white uppercase flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Initial Points Table</span>
            </span>
            <span className="text-xs font-mono text-brand-neon font-bold">Win = +3 • Draw = +1</span>
          </div>

          <div className="divide-y divide-battle-border/60">
            {leaderboard.map((entry) => (
              <div
                key={entry.team.id}
                className="py-2.5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-bold text-battle-muted">#{entry.rank}</span>
                  <span className="text-lg">{entry.team.logo}</span>
                  <span className="font-broadcast font-bold text-white">
                    {entry.team.name}
                  </span>
                </div>

                <div className="flex items-center gap-4 font-mono">
                  <span className="text-battle-muted">{entry.played} Played</span>
                  <span className="text-brand-neon font-black text-sm">
                    {entry.points} Pts
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-battle-muted italic pt-2 border-t border-battle-border/60">
            Every victory awards +3 points. Tie-breakers: Total Points → Wins → Score Margin → Head-to-Head.
          </p>
        </div>

      </div>
    </div>
  );
};
