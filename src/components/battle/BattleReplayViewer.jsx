import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Swords, 
  History, 
  Trophy, 
  Award, 
  ShieldAlert, 
  CheckCircle2, 
  Scale 
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * BIDBATTLE 8.1 - Historical Battle Replay Viewer
 * Strictly read-only viewer for navigating and inspecting completed arena battles.
 * Displays match number, participating teams, fighters deployed, combat ratings, winner, score difference, and points.
 * Never modifies tournament state or match results.
 */
export const BattleReplayViewer = ({ completedMatches = [], teams = [], onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!completedMatches || completedMatches.length === 0) {
    return (
      <div className="p-8 rounded-3xl battle-panel text-center space-y-4 border border-battle-border">
        <History className="w-10 h-10 text-battle-muted mx-auto" />
        <h3 className="font-broadcast text-lg font-bold text-white uppercase">No Completed Matches Yet</h3>
        <p className="text-xs text-battle-muted max-w-sm mx-auto font-mono">
          Battle replay becomes active once matches are settled in Round 2.
        </p>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Back to Arena
          </Button>
        )}
      </div>
    );
  }

  const match = completedMatches[currentIndex] || completedMatches[0];
  const teamA = teams.find((t) => t.id === match.teamAId);
  const teamB = teams.find((t) => t.id === match.teamBId);
  const winnerTeam = teams.find((t) => t.id === match.winnerId);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : completedMatches.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < completedMatches.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-brand-orange/40 relative overflow-hidden shadow-2xl space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-battle-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange/15 border border-brand-orange/40 text-brand-orange flex items-center justify-center">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-broadcast font-bold text-lg text-white">
                BATTLE REPLAY VIEWER
              </span>
              <Badge variant="orange" className="text-[10px] py-0 font-mono">
                READ-ONLY
              </Badge>
            </div>
            <span className="text-xs font-mono text-battle-muted">
              Match {currentIndex + 1} of {completedMatches.length} Completed Matches
            </span>
          </div>
        </div>

        {/* Previous / Next Match Navigation */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            className="font-broadcast text-xs flex items-center gap-1 border-battle-border hover:border-brand-orange text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV MATCH</span>
          </Button>

          <span className="px-3 py-1 rounded-xl bg-battle-bg border border-battle-border font-mono text-xs text-battle-muted">
            {currentIndex + 1} / {completedMatches.length}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNext}
            className="font-broadcast text-xs flex items-center gap-1 border-battle-border hover:border-brand-orange text-white"
          >
            <span>NEXT MATCH</span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-battle-muted hover:text-white ml-2"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Match Spotlight & Combatant Clash Presentation */}
      <div className="space-y-6">
        {/* Match Header Badge */}
        <div className="text-center space-y-1">
          <Badge variant="neon" className="font-mono text-xs">
            MATCH #{match.matchNumber || currentIndex + 1} SETTLED OUTCOME
          </Badge>
          <h2 className="font-broadcast text-2xl sm:text-3xl font-black text-white uppercase tracking-wide">
            {match.isDraw ? (
              <span className="text-amber-400">HONORABLE DRAW (+1 PT EACH)</span>
            ) : (
              <span>
                <span style={{ color: winnerTeam?.color }}>{winnerTeam?.name || 'Winner'}</span> VICTORY (+3 PTS)
              </span>
            )}
          </h2>
          <span className="text-xs font-mono text-battle-muted block">
            Score Difference: <strong>{match.scoreDiff || 0} pts</strong>
          </span>
        </div>

        {/* 1v1 Fighter Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
          
          {/* Team A Fighter Card */}
          <div
            className={`md:col-span-5 p-6 rounded-3xl border text-center space-y-4 relative overflow-hidden transition-all ${
              match.winnerId === match.teamAId
                ? 'bg-battle-surface border-brand-neon shadow-glow-neon ring-2 ring-brand-neon/40'
                : 'bg-battle-bg border-battle-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-broadcast font-black text-xs" style={{ color: match.teamAColor }}>
                {match.teamAName}
              </span>
              {match.winnerId === match.teamAId && (
                <Badge variant="neon" className="text-[10px]">VICTOR (+3 PTS)</Badge>
              )}
            </div>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-center text-4xl shadow-md overflow-hidden">
              {match.teamAPlayer?.imageUrl ? (
                <img
                  src={match.teamAPlayer.imageUrl}
                  alt={match.teamAPlayer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>🎭</span>
              )}
            </div>

            <div>
              <h3 className="font-broadcast font-bold text-xl text-white">
                {match.teamAPlayer?.name}
              </h3>
              {match.teamAPlayer?.movie && (
                <span className="text-xs font-mono text-battle-muted block">
                  {match.teamAPlayer.movie}
                </span>
              )}
            </div>

            {/* Combat Rating Score */}
            <div className="pt-2 border-t border-battle-border/80">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">COMBAT RATING</span>
              <span className="font-broadcast text-3xl font-black text-brand-orange">
                ★ {match.teamAScore}
              </span>
            </div>
          </div>

          {/* VS Divider (1 COL) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center text-center py-2">
            <span className="font-broadcast text-xl font-black text-brand-orange italic">VS</span>
            <span className="text-[10px] font-mono text-battle-muted mt-1">CLASH</span>
          </div>

          {/* Team B Fighter Card */}
          <div
            className={`md:col-span-5 p-6 rounded-3xl border text-center space-y-4 relative overflow-hidden transition-all ${
              match.winnerId === match.teamBId
                ? 'bg-battle-surface border-brand-neon shadow-glow-neon ring-2 ring-brand-neon/40'
                : 'bg-battle-bg border-battle-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-broadcast font-black text-xs" style={{ color: match.teamBColor }}>
                {match.teamBName}
              </span>
              {match.winnerId === match.teamBId && (
                <Badge variant="neon" className="text-[10px]">VICTOR (+3 PTS)</Badge>
              )}
            </div>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-center text-4xl shadow-md overflow-hidden">
              {match.teamBPlayer?.imageUrl ? (
                <img
                  src={match.teamBPlayer.imageUrl}
                  alt={match.teamBPlayer.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>⚡</span>
              )}
            </div>

            <div>
              <h3 className="font-broadcast font-bold text-xl text-white">
                {match.teamBPlayer?.name}
              </h3>
              {match.teamBPlayer?.movie && (
                <span className="text-xs font-mono text-battle-muted block">
                  {match.teamBPlayer.movie}
                </span>
              )}
            </div>

            {/* Combat Rating Score */}
            <div className="pt-2 border-t border-battle-border/80">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">COMBAT RATING</span>
              <span className="font-broadcast text-3xl font-black text-brand-cyan">
                ★ {match.teamBScore}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
