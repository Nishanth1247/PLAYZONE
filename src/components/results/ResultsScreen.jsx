import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { exportService } from '../../services/exportService';
import { storageService } from '../../services/storageService';
import { calculateTeamRankings } from '../../services/scoringEngine';
import { getScoreMetricLabel } from '../../services/presets';
import { toast } from 'sonner';
import { 
  Trophy, 
  Award, 
  Download, 
  Printer, 
  RotateCcw, 
  PlusCircle, 
  Users, 
  Sparkles, 
  Flame, 
  DollarSign, 
  ShieldAlert,
  Archive,
  CheckCircle2,
  FileSpreadsheet,
  FileJson,
  Medal,
  Crown,
  HelpCircle,
  Zap,
  Star
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatCurrency } from '../common/CurrencyDisplay';
import { AuctionReplayViewer } from '../auction/AuctionReplayViewer';
import { History } from 'lucide-react';

export const ResultsScreen = () => {
  const { auction, setActivePage, resetAuction, restartTournamentFresh } = useAuction();
  const [showReplay, setShowReplay] = useState(false);

  if (!auction) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl battle-panel text-center">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white font-broadcast uppercase mb-2">No Results Available</h2>
        <p className="text-xs text-battle-muted mb-6">Complete an auction tournament to view the official championship podium.</p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setActivePage('setup')}
        >
          Create New Auction
        </Button>
      </div>
    );
  }

  const { name, category, currency, teams, items, rules } = auction;
  const scoreMetricLabel = auction.scoreLabel || getScoreMetricLabel(category);
  const maxSquadSize = rules?.maxSquadSize || 8;

  // Calculate official competitive rankings using the scoring engine
  const { 
    rankedTeams, 
    champion, 
    runnerUp, 
    winningMargin, 
    explanation,
    conclusion 
  } = calculateTeamRankings(teams, items, maxSquadSize);

  const soldItems = items.filter((i) => i.status === 'sold');
  const unsoldItems = items.filter((i) => i.status === 'unsold');
  const totalLeagueSpent = soldItems.reduce((acc, i) => acc + (Number(i.soldPrice) || 0), 0);

  const highestValueBuy = [...soldItems].sort((a, b) => Number(b.soldPrice) - Number(a.soldPrice))[0];
  const cheapestBuy = [...soldItems].sort((a, b) => Number(a.soldPrice) - Number(b.soldPrice))[0];

  // Recharts data comparing total score
  const scoreChartData = rankedTeams.map((t) => ({
    name: t.name,
    score: t.totalScore,
    color: t.color,
  }));

  // BIDBATTLE 7.7: Auction Completion Report JSON exporter
  const handleDownloadCompletionReportJSON = () => {
    const reportData = {
      title: 'BIDBATTLE 7.7 Official Auction Completion Report',
      tournamentId: auction.id,
      tournamentName: auction.name,
      category: auction.category,
      generatedAt: new Date().toISOString(),
      marketSummary: {
        totalLots: items.length,
        soldLots: soldItems.length,
        unsoldLots: unsoldItems.length,
        normalSoldLots: soldItems.filter((i) => i.settlementType === 'normal_sold').length,
        specialSettlementLots: soldItems.filter((i) => i.settlementType === 'last_bidder_base_price_settlement').length,
        clearanceRatePct: Number(((soldItems.length / (items.length || 1)) * 100).toFixed(1)),
        totalLeagueSpent: Number(totalLeagueSpent.toFixed(2)),
        averagePurchasePrice: soldItems.length ? Number((totalLeagueSpent / soldItems.length).toFixed(2)) : 0,
        highestSale: highestValueBuy ? {
          name: highestValueBuy.name,
          soldPrice: highestValueBuy.soldPrice,
          buyer: teams.find((t) => t.id === highestValueBuy.soldTo)?.name,
        } : null,
        cheapestSale: cheapestBuy ? {
          name: cheapestBuy.name,
          soldPrice: cheapestBuy.soldPrice,
          buyer: teams.find((t) => t.id === cheapestBuy.soldTo)?.name,
        } : null,
      },
      franchises: rankedTeams.map((t) => ({
        rank: t.rank,
        name: t.name,
        totalScore: t.totalScore,
        averageRating: t.averageRating,
        squadCount: t.heroesCount,
        maxSquadSize,
        remainingPurse: t.remainingPurse,
        totalSpent: t.totalSpent,
        purseUtilizationPct: Math.round(((t.totalSpent / ((t.remainingPurse + t.totalSpent) || 100)) * 100)),
        squad: (t.squad || []).map((s) => ({
          name: s.name,
          rating: s.rating,
          soldPrice: s.soldPrice,
          basePrice: s.basePrice,
          highestBid: s.highestBid,
          settlementType: s.settlementType || 'normal_sold',
          role: s.role,
        })),
      })),
      activityTimeline: auction.activityTimeline || [],
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${auction.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_completion_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded Auction Completion Report (JSON)!');
  };

  const rankBadges = [
    { label: '1ST PLACE — CHAMPION', color: 'gold', glow: 'shadow-glow-orange border-amber-500/80 text-amber-400' },
    { label: '2ND PLACE — RUNNER UP', color: 'cyan', glow: 'shadow-glow-cyan border-brand-cyan/80 text-brand-cyan' },
    { label: '3RD PLACE', color: 'purple', glow: 'shadow-glow-purple border-brand-purple/80 text-brand-purple' },
    { label: '4TH PLACE', color: 'neon', glow: 'border-brand-neon/80 text-brand-neon' },
  ];

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 print:p-0">
      
      {/* 1. CINEMATIC CHAMPION HEADER */}
      <div className="text-center max-w-4xl mx-auto mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/40 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-glow-orange font-broadcast"
        >
          <Trophy className="w-4 h-4" />
          <span>OFFICIAL TOURNAMENT PODIUM & SCORING SUMMARY</span>
        </motion.div>

        <h1 className="text-5xl sm:text-7xl font-black text-white font-broadcast uppercase tracking-wider mb-2">
          {name}
        </h1>
        <p className="text-sm text-battle-muted">
          Scoring Mode: <strong>{scoreMetricLabel}</strong> • Best {maxSquadSize} Heroes Counted
        </p>

        {/* CHAMPION PODIUM SPOTLIGHT CARD (BIDBATTLE 8.2) */}
        {conclusion?.isSharedChampion ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-8 rounded-3xl battle-panel border-2 border-amber-500/70 shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-broadcast">
                OFFICIAL JOINT CHAMPIONS (TRUE TIE)
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white font-broadcast uppercase tracking-wide mb-3">
              {conclusion.champions.map((c) => c.name).join(' & ')}
            </h2>

            <p className="text-xs sm:text-sm text-battle-text max-w-2xl mx-auto mb-6 leading-relaxed">
              {conclusion.conclusionNarrative}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
              {conclusion.champions.map((champ) => (
                <div
                  key={champ.id}
                  className="p-4 rounded-2xl bg-battle-bg border-2 text-center space-y-2"
                  style={{ borderColor: champ.color }}
                >
                  <span className="text-4xl p-2 rounded-2xl bg-battle-surface inline-block shadow">
                    {champ.logo}
                  </span>
                  <h3 className="font-broadcast font-bold text-xl text-white" style={{ color: champ.color }}>
                    {champ.name}
                  </h3>
                  <div className="flex justify-around text-xs font-mono pt-1 border-t border-battle-border">
                    <div>
                      <span className="text-battle-muted block text-[10px]">POINTS</span>
                      <span className="font-bold text-amber-300 text-sm">{champ.totalPoints} pts</span>
                    </div>
                    <div>
                      <span className="text-battle-muted block text-[10px]">PURSE</span>
                      <span className="font-bold text-brand-cyan text-sm">{formatCurrency(champ.remainingPurse, currency)}</span>
                    </div>
                    <div>
                      <span className="text-battle-muted block text-[10px]">MVP RATING</span>
                      <span className="font-bold text-brand-neon text-sm">{champ.highestRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : champion ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-8 p-8 rounded-3xl battle-panel border-2 border-amber-500/70 shadow-2xl relative overflow-hidden"
          >
            <div 
              className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-35 pointer-events-none"
              style={{ backgroundColor: champion.color || '#FFD027' }}
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">
              <div className="relative">
                <span className="text-7xl p-5 rounded-3xl bg-battle-bg border-2 border-amber-500/60 shadow-2xl inline-block">
                  {champion.logo}
                </span>
                <Crown className="w-10 h-10 text-amber-400 absolute -top-5 -right-4 animate-bounce-subtle" />
              </div>

              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-broadcast">
                    TOURNAMENT CHAMPION & SQUAD LEADER
                  </span>
                  {conclusion?.tiebreakerUsed && conclusion.tiebreakerUsed !== 'None (Decided by Total Points)' && (
                    <Badge variant="orange" className="text-[10px] uppercase font-mono">
                      Decided by Tiebreaker: {conclusion.tiebreakerUsed}
                    </Badge>
                  )}
                </div>
                
                <h2 className="text-4xl sm:text-6xl font-black text-white font-broadcast tracking-wide" style={{ color: champion.color }}>
                  {champion.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-battle-bg border border-battle-border">
                    <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">TOTAL TEAM SCORE</span>
                    <span className="text-2xl font-black text-amber-400 font-broadcast font-mono">
                      {champion.totalPoints} PTS
                    </span>
                  </div>

                  {winningMargin > 0 && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-battle-bg border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">WINNING MARGIN</span>
                      <span className="text-lg font-black text-brand-neon font-broadcast font-mono">
                        +{winningMargin} PTS vs 2nd
                      </span>
                    </div>
                  )}

                  {champion.strongestHero && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-battle-bg border border-battle-border">
                      <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">STRONGEST HERO (MVP)</span>
                      <span className="text-sm font-bold text-white font-broadcast">
                        {champion.strongestHero.name} (★ {champion.highestRating})
                      </span>
                    </div>
                  )}

                  <div className="px-3.5 py-1.5 rounded-xl bg-battle-bg border border-battle-border">
                    <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">COMBINED SQUAD RATING</span>
                    <span className="text-sm font-bold text-brand-cyan font-mono">
                      {champion.combinedSquadRating} PTS
                    </span>
                  </div>
                </div>

                {conclusion?.conclusionNarrative ? (
                  <p className="text-xs text-battle-text mt-3 max-w-xl leading-relaxed">
                    {conclusion.conclusionNarrative}
                  </p>
                ) : (
                  <p className="text-xs text-battle-text mt-3">
                    Secured <strong>{champion.squad.length} superstars</strong> with <strong>{formatCurrency(champion.remainingPurse, currency)}</strong> remaining in purse.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8 print:hidden">
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              exportService.exportPlayersCSV(auction);
              toast.success('Downloaded Players CSV');
            }}
          >
            <FileSpreadsheet className="w-4 h-4 text-brand-neon" />
            <span>Export Players (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              exportService.exportTeamsCSV(auction);
              toast.success('Downloaded Teams CSV');
            }}
          >
            <Users className="w-4 h-4 text-brand-cyan" />
            <span>Export Teams (CSV)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              storageService.exportAuctionJSON(auction);
              toast.success('Downloaded Tournament JSON');
            }}
          >
            <FileJson className="w-4 h-4 text-brand-purple" />
            <span>Download JSON</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={handleDownloadCompletionReportJSON}
            className="border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10"
          >
            <Download className="w-4 h-4 text-brand-cyan" />
            <span>Completion Report (JSON)</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => setShowReplay(!showReplay)}
            className="border-brand-purple/50 text-brand-purple hover:bg-brand-purple/10"
          >
            <History className="w-4 h-4 text-brand-purple" />
            <span>{showReplay ? 'Hide Replay' : 'Auction Replay (Lot by Lot)'}</span>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => exportService.printSummary()}
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Report</span>
          </Button>

          <Button
            variant="accent"
            size="md"
            onClick={() => {
              if (window.confirm('Restart this tournament with a fresh Fisher-Yates shuffle and reset purses?')) {
                restartTournamentFresh();
                toast.success('Tournament reshuffled & restarted fresh!');
              }
            }}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again (New Shuffle)</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (window.confirm('Launch a brand new tournament?')) {
                resetAuction();
                setActivePage('setup');
              }
            }}
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Tournament</span>
          </Button>
        </div>
      </div>

      {/* AUCTION REPLAY VIEWER (BIDBATTLE 8.1) */}
      {showReplay && (
        <div className="mb-10">
          <AuctionReplayViewer auction={auction} onClose={() => setShowReplay(false)} />
        </div>
      )}

      {/* 2. EXPLANATION OF RANKING FORMULA */}
      <div className="mb-10 p-4 rounded-2xl bg-battle-surface border border-battle-border flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
        <div className="text-xs text-battle-muted leading-relaxed">
          <strong className="text-white block font-broadcast uppercase text-sm mb-0.5">
            Competitive Scoring Formula & Tie-Breaker Rules:
          </strong>
          <span>
            {explanation} Teams are ranked strictly by Total Rating Score (sum of ratings of top eligible heroes) — <strong>NOT</strong> by money spent. In case of equal scores, <strong>Tie-Breaker 1: Higher remaining purse</strong> determines the winner. If still tied, <strong>Tie-Breaker 2: Higher single-hero rating (MVP)</strong> wins.
          </span>
        </div>
      </div>

      {/* 3. PODIUM RANKING CARDS */}
      <div className="mb-12">
        <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wider mb-5 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-brand-cyan" />
          Official Standings (1st — {rankedTeams.length === 2 ? '2nd' : rankedTeams.length === 3 ? '3rd' : '4th'} Position)
        </h3>

        <div className={`grid grid-cols-1 sm:grid-cols-2 ${rankedTeams.length === 2 ? 'lg:grid-cols-2 max-w-4xl mx-auto' : rankedTeams.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-5`}>
          {rankedTeams.map((team, idx) => {
            const badgeInfo = rankBadges[idx] || rankBadges[3];
            const isChamp = idx === 0;

            return (
              <motion.div
                key={team.id}
                whileHover={{ y: -4 }}
                className={`p-6 rounded-3xl battle-panel border relative overflow-hidden flex flex-col justify-between ${
                  isChamp ? 'border-amber-500/80 shadow-glow-orange' : 'border-battle-border'
                }`}
              >
                {/* Accent top stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: team.color }}
                />

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl p-2 rounded-2xl bg-battle-bg border border-battle-border shadow-md">
                      {team.logo}
                    </span>
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-broadcast font-bold tracking-wider uppercase border ${badgeInfo.glow}`}>
                      {team.rank === 1 ? '🥇 1ST PLACE' : team.rank === 2 ? '🥈 2ND PLACE' : team.rank === 3 ? '🥉 3RD PLACE' : `${team.rank}TH PLACE`}
                    </span>
                  </div>

                  <h4 className="font-broadcast font-black text-2xl text-white mb-1" style={{ color: team.color }}>
                    {team.name}
                  </h4>
                  <p className="text-xs text-battle-muted mb-4 font-broadcast font-bold">
                    {team.heroesCount} / {maxSquadSize} Superstars Acquired
                  </p>

                  {/* SCORE SPOTLIGHT */}
                  <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border mb-4 text-center">
                    <span className="text-[10px] text-battle-muted uppercase font-bold block font-broadcast">
                      TOTAL TEAM SCORE
                    </span>
                    <span className="text-3xl font-black text-amber-400 font-broadcast font-mono">
                      {team.totalScore}
                    </span>
                    <span className="text-[11px] text-battle-muted block font-mono">
                      Avg: {team.averageRating} pts / hero
                    </span>
                  </div>

                  {/* STATS BREAKDOWN */}
                  <div className="space-y-2 text-xs font-broadcast mb-4">
                    <div className="flex justify-between p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-battle-muted">Strongest Hero:</span>
                      <span className="font-bold text-white truncate max-w-[120px]">
                        {team.strongestHero ? `${team.strongestHero.name} (${team.strongestHero.rating})` : '—'}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-battle-muted">Remaining Purse:</span>
                      <span className="font-bold text-brand-neon font-mono">
                        {formatCurrency(team.remainingPurse, currency)}
                      </span>
                    </div>

                    <div className="flex justify-between p-2 rounded-xl bg-battle-surface border border-battle-border">
                      <span className="text-battle-muted">Total Spent:</span>
                      <span className="font-bold text-battle-text font-mono">
                        {formatCurrency(team.totalSpent, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-battle-border text-center">
                  <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast">
                    {team.rank === 1 ? '👑 League Winner' : team.rank === 2 ? '⚡ Vice Champion' : team.rank === 3 ? 'Bronze Finish' : 'Contender'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 4. RECHARTS SCORE COMPARISON */}
      <div className="mb-12 p-6 rounded-3xl battle-panel border border-battle-border">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-battle-muted font-broadcast">
            Franchise Score Comparison ({scoreMetricLabel})
          </h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scoreChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#9299B0" fontSize={12} fontFamily="Rajdhani" />
              <YAxis stroke="#9299B0" fontSize={11} fontFamily="JetBrains Mono" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#101321', 
                  border: '1px solid #232A44', 
                  borderRadius: '12px',
                  color: '#F5F6FF',
                  fontFamily: 'Inter',
                  fontSize: '12px'
                }} 
              />
              <Bar dataKey="score" name="Team Score (Points)" radius={[8, 8, 0, 0]}>
                {scoreChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#9147FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4.5 AUCTION COMPLETION REPORT & MARKET ANALYSIS (BIDBATTLE 7.7) */}
      <div className="mb-12 p-6 sm:p-8 rounded-3xl battle-panel border border-brand-cyan/40 shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-battle-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="cyan" className="text-[10px] uppercase font-bold tracking-wider">
                  Official Audit
                </Badge>
                <span className="text-xs text-battle-muted font-mono">{items.length} Lots Evaluated</span>
              </div>
              <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                Auction Completion Report
              </h3>
            </div>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={handleDownloadCompletionReportJSON}
            className="font-broadcast text-xs gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download Report (JSON)</span>
          </Button>
        </div>

        {/* Market Economics Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-center">
            <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block mb-1">
              Market Clearance
            </span>
            <span className="text-2xl font-black text-brand-neon font-mono">
              {((soldItems.length / (items.length || 1)) * 100).toFixed(1)}%
            </span>
            <span className="text-[10px] text-battle-muted block mt-0.5">
              {soldItems.length} Sold / {unsoldItems.length} Unsold
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-center">
            <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block mb-1">
              Total Capital Spent
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(totalLeagueSpent, currency)}
            </span>
            <span className="text-[10px] text-battle-muted block mt-0.5">
              Avg {formatCurrency(soldItems.length ? totalLeagueSpent / soldItems.length : 0, currency)} / hero
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-center">
            <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block mb-1">
              Top Acquisition
            </span>
            <span className="text-lg font-black text-white font-broadcast truncate block">
              {highestValueBuy ? highestValueBuy.name : 'None'}
            </span>
            <span className="text-[10px] text-amber-400 font-mono block mt-0.5">
              {highestValueBuy ? `${formatCurrency(highestValueBuy.soldPrice, currency)} (${teams.find((t) => t.id === highestValueBuy.soldTo)?.name || 'Buyer'})` : '—'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-center">
            <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold block mb-1">
              Biggest Bargain
            </span>
            <span className="text-lg font-black text-white font-broadcast truncate block">
              {cheapestBuy ? cheapestBuy.name : 'None'}
            </span>
            <span className="text-[10px] text-brand-cyan font-mono block mt-0.5">
              {cheapestBuy ? `${formatCurrency(cheapestBuy.soldPrice, currency)} (${teams.find((t) => t.id === cheapestBuy.soldTo)?.name || 'Buyer'})` : '—'}
            </span>
          </div>
        </div>

        {/* Participating Franchise Balance & Audit Table (BIDBATTLE 8.2) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-broadcast">
            <thead>
              <tr className="border-b border-battle-border text-battle-muted uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Franchise</th>
                <th className="py-2.5 px-3 text-right">Total Points</th>
                <th className="py-2.5 px-3 text-right">Purse Left</th>
                <th className="py-2.5 px-3 text-center">Highest Rating (MVP)</th>
                <th className="py-2.5 px-3 text-center">Combined Rating</th>
                <th className="py-2.5 px-3">Differentiating Reason</th>
                <th className="py-2.5 px-3 text-center">Squad</th>
                <th className="py-2.5 px-3 text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-battle-border/50">
              {rankedTeams.map((t) => {
                const totalPurse = (t.remainingPurse || 0) + (t.totalSpent || 0);

                return (
                  <tr key={t.id} className="hover:bg-battle-surface/40 transition-colors">
                    <td className="py-3 px-3 font-bold">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] ${
                        t.rank === 1 ? 'border-amber-500/60 bg-amber-500/10 text-amber-300' :
                        t.rank === 2 ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300' :
                        'border-battle-border bg-battle-surface text-battle-muted'
                      }`}>
                        #{t.rank}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.logo}</span>
                        <div>
                          <span className="font-bold text-white block text-sm" style={{ color: t.color }}>
                            {t.name}
                          </span>
                          <span className="text-[10px] text-battle-muted font-mono">{t.owner}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                      {t.totalPoints} PTS
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-brand-neon">
                      {formatCurrency(t.remainingPurse, currency)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-white">
                      ★ {t.highestRating || '—'} {t.strongestHero ? `(${t.strongestHero.name})` : ''}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-brand-cyan font-bold">
                      {t.combinedSquadRating} pts
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-battle-text">
                      <span className="px-2 py-0.5 rounded bg-battle-bg border border-battle-border/80 inline-block">
                        {t.differentiatingReason || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {t.heroesCount} / {maxSquadSize}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-battle-text">
                      {formatCurrency(t.totalSpent, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. COMPLETE ROSTERS WITH INDIVIDUAL RATINGS */}
      <div>
        <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wider mb-5 flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-purple" />
          Full Team Rosters & Individual {scoreMetricLabel} Ratings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rankedTeams.map((team) => (
            <div
              key={team.id}
              className="p-6 rounded-3xl battle-panel border border-battle-border relative overflow-hidden"
            >
              {/* Accent top stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color }}
              />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 rounded-2xl bg-battle-bg border border-battle-border shadow-sm">
                    {team.logo}
                  </span>
                  <div>
                    <h4 className="font-broadcast font-bold text-lg text-white" style={{ color: team.color }}>
                      {team.name}
                    </h4>
                    <span className="text-xs text-battle-muted font-broadcast">
                      Score: <strong className="text-amber-400 font-mono">{team.totalScore} pts</strong> • Spent: {formatCurrency(team.totalSpent, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-battle-muted uppercase block font-broadcast font-bold">Remaining</span>
                  <span className="text-sm font-mono font-bold text-brand-neon">
                    {formatCurrency(team.remainingPurse, currency)}
                  </span>
                </div>
              </div>

              {/* Roster entries with revealed individual rating points */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {team.squad.map((item, idx) => {
                  const isEligible = idx < maxSquadSize;

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                        isEligible
                          ? 'bg-battle-surface border-battle-border'
                          : 'bg-battle-bg/50 border-battle-border/40 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-battle-muted font-mono text-[10px]">{idx + 1}</span>
                        <div>
                          <span className="font-semibold text-white font-broadcast block">{item.name}</span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] text-brand-purple">{item.role}</span>
                            {item.movie && (
                              <span className="text-[10px] text-brand-cyan">• {item.movie} ({item.actor})</span>
                            )}
                            {item.director && (
                              <span className="text-[10px] text-amber-300">• {item.director} ({item.year})</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-3">
                        {item.settlementType === 'last_bidder_base_price_settlement' && (
                          <span
                            className="px-2 py-0.5 rounded-lg bg-brand-orange/20 border border-brand-orange/40 text-brand-orange font-mono text-[9px] uppercase font-bold"
                            title="Acquired via mandatory last-bidder settlement at original base price"
                          >
                            ⚡ Base Price Settle
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                          {item.imdbRating ? `★ IMDb ${item.imdbRating} (${item.rating} pts)` : `★ ${item.rating} pts`}
                        </span>
                        <span className="font-mono font-bold text-battle-muted text-[11px]">
                          {formatCurrency(item.soldPrice, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {team.squad.length === 0 && (
                  <div className="py-8 text-center text-battle-muted text-xs italic">
                    No heroes acquired in this tournament.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
