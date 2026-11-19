import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Swords, 
  Crown, 
  Flame, 
  Download, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  Award,
  Sparkles,
  Users
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { toast } from 'sonner';

export const BattleResultsScreen = ({ onReturnHome }) => {
  const { battleState, resetBattleTournament } = useBattleArena();
  const { tournamentName, teams, squadSize, completedMatches, leaderboard } = battleState;

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'rosters' | 'history'

  const champion = leaderboard[0]?.team || teams[0];
  const championStats = leaderboard[0];

  // Calculate battle highlights:
  // 1. Biggest battle win by margin
  let biggestWinMatch = null;
  let maxMargin = -1;
  completedMatches.forEach((m) => {
    if (!m.isDraw && m.scoreDiff > maxMargin) {
      maxMargin = m.scoreDiff;
      biggestWinMatch = m;
    }
  });

  // 2. Best individual performer (highest combat score)
  let bestPerformer = null;
  let highestScore = -1;
  completedMatches.forEach((m) => {
    if (m.teamAScore > highestScore) {
      highestScore = m.teamAScore;
      bestPerformer = { player: m.teamAPlayer, score: m.teamAScore, team: teams.find((t) => t.id === m.teamAId) };
    }
    if (m.teamBScore > highestScore) {
      highestScore = m.teamBScore;
      bestPerformer = { player: m.teamBPlayer, score: m.teamBScore, team: teams.find((t) => t.id === m.teamBId) };
    }
  });

  useEffect(() => {
    // Launch celebratory confetti bursts
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
  }, []);

  const handleExport = () => {
    const summary = {
      tournament: tournamentName,
      date: new Date().toLocaleDateString(),
      champion: champion.name,
      leaderboard: leaderboard.map((e) => ({
        rank: e.rank,
        team: e.team.name,
        played: e.played,
        won: e.won,
        drawn: e.drawn,
        lost: e.lost,
        points: e.points,
      })),
      matches: completedMatches.map((m) => ({
        match: m.matchNumber,
        teamA: `${m.teamAName} (${m.teamAPlayer?.name})`,
        teamB: `${m.teamBName} (${m.teamBPlayer?.name})`,
        result: m.isDraw ? 'Draw' : `${teams.find((t) => t.id === m.winnerId)?.name} Won`,
        scoreA: m.teamAScore,
        scoreB: m.teamBScore,
      })),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battle_arena_results_${Date.now()}.json`;
    a.click();
    toast.success('Tournament results exported to JSON!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* 1. CINEMATIC CHAMPION PRESENTATION */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-brand-orange/60 text-center relative overflow-hidden shadow-2xl space-y-4"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[140px] opacity-25 pointer-events-none rounded-full"
          style={{ backgroundColor: champion.color }}
        />

        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-glow-orange border-2 border-white/20"
          style={{ backgroundColor: champion.color }}
        >
          {champion.logo}
        </div>

        <Badge variant="gold" className="text-xs uppercase font-mono">
          👑 BATTLE ARENA CHAMPION
        </Badge>

        <h1 className="font-broadcast text-4xl sm:text-6xl font-black text-white uppercase tracking-wider">
          {champion.name} WINS!
        </h1>

        <p className="text-sm font-mono text-brand-neon font-black">
          {championStats?.points} Points • {championStats?.won} Wins • {championStats?.played} Matches Played
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExport}
            className="font-broadcast text-xs border-battle-border hover:border-brand-cyan text-white flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-brand-cyan" />
            <span>EXPORT SUMMARY</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={resetBattleTournament}
            className="font-broadcast text-xs shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black font-black flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NEW BATTLE TOURNAMENT</span>
          </Button>
        </div>
      </motion.div>

      {/* 2. TOURNAMENT HIGHLIGHT STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Highlight 1: Best Individual Performer */}
        <div className="battle-panel rounded-2xl p-5 border border-battle-border text-center space-y-1">
          <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
            ⭐ Top Match Performer
          </span>
          <h4 className="font-broadcast font-black text-lg text-white">
            {bestPerformer?.player?.name || '—'}
          </h4>
          <span className="text-xs font-mono text-brand-neon font-black block">
            {bestPerformer ? `Combat Score: ${bestPerformer.score}` : ''}
          </span>
          <span className="text-[10px] font-mono text-battle-muted">
            {bestPerformer?.team?.name}
          </span>
        </div>

        {/* Highlight 2: Biggest Margin Victory */}
        <div className="battle-panel rounded-2xl p-5 border border-battle-border text-center space-y-1">
          <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
            🔥 Biggest Victory Margin
          </span>
          <h4 className="font-broadcast font-black text-lg text-amber-300">
            {biggestWinMatch ? `+${biggestWinMatch.scoreDiff} Pts Margin` : '—'}
          </h4>
          <span className="text-xs font-mono text-white block">
            {biggestWinMatch ? `${teams.find((t) => t.id === biggestWinMatch.winnerId)?.name} Win` : ''}
          </span>
          <span className="text-[10px] font-mono text-battle-muted">
            {biggestWinMatch ? `Match #${biggestWinMatch.matchNumber}` : ''}
          </span>
        </div>

        {/* Highlight 3: Purse Efficiency */}
        <div className="battle-panel rounded-2xl p-5 border border-battle-border text-center space-y-1">
          <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
            💰 Champion Purse Left
          </span>
          <h4 className="font-broadcast font-black text-lg text-brand-cyan">
            ₹{champion.purse} Cr
          </h4>
          <span className="text-xs font-mono text-battle-muted block">
            Spent: ₹{(champion.initialPurse - champion.purse).toFixed(2)} Cr
          </span>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">
            {champion.squad.length} Fighters Acquired
          </span>
        </div>
      </div>

      {/* 3. TABBED VIEW: STANDINGS / TEAM ROSTERS / BATTLE HISTORY */}
      <div className="battle-panel rounded-3xl border border-battle-border overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center gap-2 border-b border-battle-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl font-broadcast text-xs font-bold transition-all ${
              activeTab === 'standings'
                ? 'bg-brand-orange text-black font-black shadow-glow-orange'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            FINAL POINTS TABLE
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rosters')}
            className={`px-4 py-2 rounded-xl font-broadcast text-xs font-bold transition-all ${
              activeTab === 'rosters'
                ? 'bg-brand-orange text-black font-black shadow-glow-orange'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            TEAM ROSTERS & RATINGS
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl font-broadcast text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-brand-orange text-black font-black shadow-glow-orange'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            BATTLE LOG ({completedMatches.length})
          </button>
        </div>

        {/* Tab 1: Final Standings Table */}
        {activeTab === 'standings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-battle-border text-battle-muted font-broadcast text-[11px] uppercase">
                  <th className="pb-3">Pos</th>
                  <th className="pb-3">Franchise</th>
                  <th className="pb-3 text-center">Played</th>
                  <th className="pb-3 text-center">Won</th>
                  <th className="pb-3 text-center">Drawn</th>
                  <th className="pb-3 text-center">Lost</th>
                  <th className="pb-3 text-center">Diff</th>
                  <th className="pb-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-battle-border/50 font-mono">
                {leaderboard.map((entry) => (
                  <tr key={entry.team.id} className="hover:bg-battle-surface/40">
                    <td className="py-3 font-bold text-battle-muted">
                      #{entry.rank} {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : ''}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.team.logo}</span>
                        <span className="font-broadcast font-bold text-white text-sm" style={{ color: entry.team.color }}>
                          {entry.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-battle-muted">{entry.played}</td>
                    <td className="py-3 text-center text-emerald-400 font-bold">{entry.won}</td>
                    <td className="py-3 text-center text-battle-muted">{entry.drawn}</td>
                    <td className="py-3 text-center text-rose-400">{entry.lost}</td>
                    <td className="py-3 text-center text-battle-muted">{entry.marginTotal > 0 ? `+${entry.marginTotal}` : entry.marginTotal}</td>
                    <td className="py-3 text-right font-black text-brand-neon text-base">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Full Team Rosters (Revealing ratings now that tournament has ended) */}
        {activeTab === 'rosters' && (
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${teams.length === 3 ? 'lg:grid-cols-3' : teams.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4`}>
            {teams.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl bg-battle-bg border border-battle-border space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-battle-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{t.logo}</span>
                    <h4 className="font-broadcast font-bold text-sm text-white" style={{ color: t.color }}>
                      {t.name}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-battle-muted">
                    Purse: ₹{t.purse} Cr
                  </span>
                </div>

                <div className="space-y-1.5">
                  {t.squad.map((player) => (
                    <div
                      key={player.id}
                      className="p-2 rounded-xl bg-battle-surface border border-battle-border/60 flex items-center justify-between text-xs"
                    >
                      <span className="font-broadcast font-bold text-white truncate max-w-[180px]">
                        {player.name}
                      </span>
                      <span className="font-mono text-amber-300 font-bold text-[11px]">
                        ★ Rating: {player.rating} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Detailed Battle Match History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {completedMatches.map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-battle-muted font-bold">MATCH #{m.matchNumber}</span>
                  <div>
                    <span style={{ color: m.teamAColor }} className="font-broadcast font-bold">{m.teamAName}</span>
                    <span className="text-battle-muted mx-1.5">({m.teamAPlayer?.name} • ★{m.teamAScore})</span>
                    <span className="text-battle-muted font-bold">VS</span>
                    <span style={{ color: m.teamBColor }} className="font-broadcast font-bold ml-1.5">{m.teamBName}</span>
                    <span className="text-battle-muted mx-1.5">({m.teamBPlayer?.name} • ★{m.teamBScore})</span>
                  </div>
                </div>

                <span className="text-brand-neon font-black font-broadcast">
                  {m.isDraw ? 'TIED MATCH (+1 PT EACH)' : `${teams.find((t) => t.id === m.winnerId)?.name} WON (+3 PTS)`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
