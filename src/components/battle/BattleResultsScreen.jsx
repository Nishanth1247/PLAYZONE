import React, { useEffect, useState, useMemo } from 'react';
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
  Users,
  Star,
  Zap,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';
import { calculateTournamentMVP, calculateBattleTournamentStats } from '../../services/battleEngine';
import { BattleReplayViewer } from './BattleReplayViewer';
import { toast } from 'sonner';

export const BattleResultsScreen = ({ onReturnHome }) => {
  const { battleState, resetBattleTournament } = useBattleArena();
  const { tournamentName, teams, squadSize, completedMatches, leaderboard } = battleState;

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'rosters' | 'history'

  const champion = leaderboard[0]?.team || teams[0];
  const championStats = leaderboard[0];

  // BIDBATTLE 7.7: Tournament MVP and Performance Stats
  const mvpData = useMemo(() => {
    return calculateTournamentMVP(completedMatches, teams);
  }, [completedMatches, teams]);

  const tournamentStats = useMemo(() => {
    return calculateBattleTournamentStats(teams, completedMatches, battleState.usedPlayerIds || []);
  }, [teams, completedMatches, battleState.usedPlayerIds]);

  // Calculate battle highlights
  let biggestWinMatch = null;
  let maxMargin = -1;
  completedMatches.forEach((m) => {
    if (!m.isDraw && m.scoreDiff > maxMargin) {
      maxMargin = m.scoreDiff;
      biggestWinMatch = m;
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

  // Export Comprehensive Battle Report as JSON (BIDBATTLE 7.7)
  const handleExportJSON = () => {
    const summary = {
      title: 'BIDBATTLE Official Battle Arena Tournament Report',
      tournamentName,
      date: new Date().toISOString(),
      podium: {
        champion: {
          rank: 1,
          name: champion.name,
          owner: champion.owner,
          color: champion.color,
          points: championStats?.points || 0,
          wins: championStats?.won || 0,
        },
        runnerUp: leaderboard[1] ? {
          rank: 2,
          name: leaderboard[1].team.name,
          owner: leaderboard[1].team.owner,
          points: leaderboard[1].points,
        } : null,
        thirdPlace: leaderboard[2] ? {
          rank: 3,
          name: leaderboard[2].team.name,
          points: leaderboard[2].points,
        } : null,
        fourthPlace: leaderboard[3] ? {
          rank: 4,
          name: leaderboard[3].team.name,
          points: leaderboard[3].points,
        } : null,
      },
      tournamentMVP: mvpData?.mvp ? {
        name: mvpData.mvp.fighter.name,
        role: mvpData.mvp.fighter.role,
        movie: mvpData.mvp.fighter.movie,
        team: mvpData.mvp.team.name,
        mvpPoints: mvpData.mvp.mvpPoints,
        matchesPlayed: mvpData.mvp.matchesPlayed,
        matchesWon: mvpData.mvp.matchesWon,
        highestScore: mvpData.mvp.highestScore,
        criteria: mvpData.criteriaExplanation,
      } : null,
      teamStandings: tournamentStats,
      matches: completedMatches.map((m) => ({
        matchNumber: m.matchNumber,
        teamA: `${m.teamAName} (${m.teamAPlayer?.name})`,
        teamB: `${m.teamBName} (${m.teamBPlayer?.name})`,
        result: m.isDraw ? 'Draw' : `${teams.find((t) => t.id === m.winnerId)?.name} Won`,
        scoreA: m.teamAScore,
        scoreB: m.teamBScore,
        scoreDiff: m.scoreDiff,
      })),
      rosters: teams.map((t) => ({
        team: t.name,
        owner: t.owner,
        purseRemaining: t.purse,
        fighters: t.squad.map((f) => ({
          name: f.name,
          role: f.role,
          rating: f.rating,
          soldPrice: f.soldPrice,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tournamentName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_battle_report.json`;
    a.click();
    toast.success('Downloaded Official Battle Arena Report (JSON)!');
  };

  const rankBadges = [
    { label: '🥇 1ST — CHAMPION', border: 'border-white', glow: 'text-[#F5F3EE] bg-white/10 border-white' },
    { label: '🥈 2ND — RUNNER-UP', border: 'border-[#39465A]', glow: 'text-[#AEB9CC] bg-[#2C394C] border-[#39465A]' },
    { label: '🥉 3RD PLACE', border: 'border-[#39465A]', glow: 'text-[#AEB9CC] bg-[#222F43] border-[#39465A]' },
    { label: '4TH PLACE', border: 'border-[#39465A]', glow: 'text-[#AEB9CC] bg-[#222F43] border-[#39465A]' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* 1. CINEMATIC CHAMPION HEADER CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="rounded-3xl bg-[#222F43] p-8 sm:p-12 border border-[#39465A] text-center relative overflow-hidden shadow-2xl space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl border border-white/20"
          style={{ backgroundColor: champion.color }}
        >
          {champion.logo}
        </div>

        <Badge variant="subtle" className="text-xs uppercase font-mono">
          👑 BATTLE ARENA CHAMPION
        </Badge>

        <h1 className="font-title text-4xl sm:text-6xl font-black text-[#F5F3EE] uppercase tracking-wider">
          {champion.name} WINS!
        </h1>

        <p className="text-sm font-mono text-[#AEB9CC] font-bold">
          {championStats?.points} Points • {championStats?.won} Wins • {championStats?.played} Matches Played
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportJSON}
            className="font-heading text-xs border border-[#39465A] text-[#F5F3EE] flex items-center gap-2 bg-[#2C394C]"
          >
            <Download className="w-4 h-4 text-[#F5F3EE]" />
            <span>DOWNLOAD BATTLE REPORT (JSON)</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={resetBattleTournament}
            className="font-heading text-xs bg-[#F5F3EE] hover:bg-white text-[#111827] font-black flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>NEW BATTLE TOURNAMENT</span>
          </Button>
        </div>
      </motion.div>

      {/* 2. DYNAMIC CHAMPIONSHIP PODIUM (2, 3 OR 4 TEAMS) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#F5F3EE]" />
          <h3 className="font-heading font-black text-xl text-[#F5F3EE] uppercase tracking-wide">
            Championship Podium ({teams.length} Franchises)
          </h3>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${teams.length === 3 ? 'lg:grid-cols-3' : teams.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-2 max-w-3xl mx-auto'} gap-4`}>
          {leaderboard.map((entry, idx) => {
            const badgeStyle = rankBadges[idx] || rankBadges[3];
            const isWinner = idx === 0;

            return (
              <motion.div
                key={entry.team.id}
                whileHover={{ y: -3 }}
                className={`p-5 rounded-3xl bg-[#222F43] border ${badgeStyle.border} relative overflow-hidden flex flex-col justify-between shadow-lg`}
              >
                <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: entry.team.color }} />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl p-2 rounded-2xl bg-battle-bg border border-battle-border">
                      {entry.team.logo}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-broadcast font-bold uppercase border ${badgeStyle.glow}`}>
                      {badgeStyle.label}
                    </span>
                  </div>

                  <h4 className="font-broadcast font-black text-xl text-white mb-0.5" style={{ color: entry.team.color }}>
                    {entry.team.name}
                  </h4>
                  <span className="text-xs text-battle-muted font-mono block mb-3">
                    @{entry.team.owner}
                  </span>

                  <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border space-y-1 mb-3 text-center">
                    <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block">
                      Tournament Score
                    </span>
                    <span className="text-2xl font-black text-brand-neon font-mono">
                      {entry.points} pts
                    </span>
                    <span className="text-[11px] text-battle-muted block font-mono">
                      {entry.won}W • {entry.drawn}D • {entry.lost}L
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-battle-border text-center text-xs font-mono text-battle-muted">
                  Net Diff: {entry.marginTotal > 0 ? `+${entry.marginTotal}` : entry.marginTotal} pts
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. TOURNAMENT MVP SPOTLIGHT CARD (BIDBATTLE 7.7) */}
      {mvpData?.mvp && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl battle-panel border-2 border-amber-500/70 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Amber Halo */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-battle-bg border-2 border-amber-500/60 shadow-xl flex items-center justify-center text-5xl overflow-hidden shadow-glow-orange">
                {mvpData.mvp.fighter.imageUrl ? (
                  <img
                    src={mvpData.mvp.fighter.imageUrl}
                    alt={mvpData.mvp.fighter.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>👑</span>
                )}
              </div>
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-black shadow-md">
                ★
              </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="gold" className="text-xs uppercase font-bold tracking-wider">
                  Tournament MVP Award
                </Badge>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {mvpData.mvp.mvpPoints} MVP Pts
                </span>
              </div>

              <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">
                {mvpData.mvp.fighter.name}
              </h3>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-mono">
                <span className="text-brand-purple font-bold">
                  {mvpData.mvp.fighter.role || 'Superstar'}
                </span>
                {mvpData.mvp.fighter.movie && (
                  <span className="text-battle-muted">• Film: {mvpData.mvp.fighter.movie}</span>
                )}
                <span className="text-brand-cyan">• Franchise: {mvpData.mvp.team.name}</span>
              </div>

              {/* Formula & Criteria explanation badge */}
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-xs text-battle-muted leading-relaxed">
                <span className="text-amber-400 font-bold block mb-0.5 font-broadcast uppercase text-[11px]">
                  Official MVP Formula & Criteria:
                </span>
                <span>
                  {mvpData.criteriaExplanation} ({mvpData.mvp.matchesWon} Wins, Combat Score: {mvpData.mvp.highestScore}).
                </span>
              </div>
            </div>

            {/* Quick Stats Column */}
            <div className="grid grid-cols-2 gap-2 text-center shrink-0 w-full md:w-48">
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Matches</span>
                <span className="font-mono font-black text-xl text-white">{mvpData.mvp.matchesPlayed}</span>
              </div>
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Wins</span>
                <span className="font-mono font-black text-xl text-emerald-400">{mvpData.mvp.matchesWon}</span>
              </div>
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Top Score</span>
                <span className="font-mono font-black text-xl text-amber-300">{mvpData.mvp.highestScore}</span>
              </div>
              <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border">
                <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">Base ★</span>
                <span className="font-mono font-black text-xl text-brand-cyan">{mvpData.mvp.fighter.rating}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. TABBED PERFORMANCE BREAKDOWN */}
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
            TEAM PERFORMANCE TABLE
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('replay')}
            className={`px-4 py-2 rounded-xl font-broadcast text-xs font-bold transition-all ${
              activeTab === 'replay'
                ? 'bg-brand-orange text-black font-black shadow-glow-orange'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            BATTLE REPLAY (PREV / NEXT)
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
            TEAM ROSTERS & REVEALED RATINGS
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

        {/* Tab 1: Comprehensive Team Performance Table (BIDBATTLE 7.7) */}
        {activeTab === 'standings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-battle-border text-battle-muted font-broadcast text-[11px] uppercase">
                  <th className="pb-3 px-2">Pos</th>
                  <th className="pb-3 px-2">Franchise</th>
                  <th className="pb-3 px-2 text-center">Played</th>
                  <th className="pb-3 px-2 text-center">Won</th>
                  <th className="pb-3 px-2 text-center">Drawn</th>
                  <th className="pb-3 px-2 text-center">Lost</th>
                  <th className="pb-3 px-2 text-center">Diff Margin</th>
                  <th className="pb-3 px-2 text-center">Remaining Fighters</th>
                  <th className="pb-3 px-2 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-battle-border/50 font-mono">
                {tournamentStats.map((entry) => (
                  <tr key={entry.team.id} className="hover:bg-battle-surface/40 transition-colors">
                    <td className="py-3 px-2 font-bold text-battle-muted">
                      #{entry.rank} {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : ''}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{entry.team.logo}</span>
                        <div>
                          <span className="font-broadcast font-bold text-white text-sm block" style={{ color: entry.team.color }}>
                            {entry.team.name}
                          </span>
                          <span className="text-[10px] text-battle-muted">@{entry.team.owner}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center text-battle-muted">{entry.matchesPlayed}</td>
                    <td className="py-3 px-2 text-center text-emerald-400 font-bold">{entry.wins}</td>
                    <td className="py-3 px-2 text-center text-battle-muted">{entry.draws}</td>
                    <td className="py-3 px-2 text-center text-rose-400">{entry.losses}</td>
                    <td className="py-3 px-2 text-center font-bold text-white">
                      {entry.marginTotal > 0 ? `+${entry.marginTotal}` : entry.marginTotal}
                    </td>
                    <td className="py-3 px-2 text-center text-amber-300">
                      {entry.remainingFighters} / {entry.totalFighters}
                    </td>
                    <td className="py-3 px-2 text-right font-black text-brand-neon text-base">
                      {entry.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Battle Replay Viewer (BIDBATTLE 8.1) */}
        {activeTab === 'replay' && (
          <BattleReplayViewer completedMatches={completedMatches} teams={teams} />
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
