import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { 
  Users, 
  Trophy, 
  TrendingUp, 
  Coins, 
  Sparkles, 
  ArrowLeft, 
  Radio, 
  ShieldCheck, 
  Flame,
  Award,
  Wallet,
  BarChart2
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
import { getScoreMetricLabel } from '../../services/presets';
import { calculateTeamRankings } from '../../services/scoringEngine';

export const TeamDashboard = () => {
  const { auction, setActivePage } = useAuction();
  const [selectedTeamId, setSelectedTeamId] = useState(auction?.teams?.[0]?.id || null);

  if (!auction || !auction.teams) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl battle-panel text-center">
        <Users className="w-12 h-12 text-brand-cyan mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white font-broadcast uppercase mb-2">No Active Teams</h2>
        <p className="text-xs text-battle-muted mb-6">Create or load an auction tournament to inspect team purses and rosters.</p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setActivePage('setup')}
        >
          Go To Setup
        </Button>
      </div>
    );
  }

  const { teams, items, currency, rules } = auction;
  const scoreMetricLabel = auction.scoreLabel || getScoreMetricLabel(auction.category);
  const maxSquadSize = rules?.maxSquadSize || 8;

  const { rankedTeams } = calculateTeamRankings(teams, items, maxSquadSize);

  // Compute team analytics
  const teamMetrics = rankedTeams.map((team) => {
    const squad = items.filter((i) => i.soldTo === team.id);
    const totalSpent = squad.reduce((sum, i) => sum + (Number(i.soldPrice) || 0), 0);
    const avgPrice = squad.length > 0 ? (totalSpent / squad.length).toFixed(2) : 0;
    const highestPurchase = squad.reduce((max, i) => (Number(i.soldPrice) > (max?.soldPrice || 0) ? i : max), null);
    const spentPercentage = Math.min(100, Math.round((totalSpent / (team.initialPurse || 1)) * 100));

    return {
      ...team,
      squad,
      totalSpent,
      avgPrice,
      highestPurchase,
      spentPercentage,
    };
  });

  const highestSpender = [...teamMetrics].sort((a, b) => b.totalSpent - a.totalSpent)[0];
  const mostEconomical = [...teamMetrics].sort((a, b) => a.totalSpent - b.totalSpent)[0];
  const biggestSinglePurchase = items
    .filter((i) => i.status === 'sold' && i.soldPrice)
    .sort((a, b) => Number(b.soldPrice) - Number(a.soldPrice))[0];

  const activeSelectedTeam = teamMetrics.find((t) => t.id === selectedTeamId) || teamMetrics[0];

  // Chart data for spending comparison
  const chartData = teamMetrics.map((t) => ({
    name: t.shortName || t.name.slice(0, 3).toUpperCase(),
    fullName: t.name,
    spent: t.totalSpent,
    remaining: t.purse,
    color: t.color,
  }));

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => setActivePage('live')}
            className="text-xs text-battle-muted hover:text-white flex items-center gap-1.5 mb-2 transition-colors font-broadcast font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Arena
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wider flex items-center gap-3">
            <Users className="w-8 h-8 text-brand-cyan" />
            Franchise Roster & Purse Analytics
          </h1>
        </div>

        <Button
          variant="danger"
          size="md"
          onClick={() => setActivePage('live')}
          className="shadow-xl"
        >
          <Radio className="w-4 h-4 animate-pulse" />
          Return To Live Arena
        </Button>
      </div>

      {/* TOP ANALYTICS BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-3xl battle-panel border border-amber-500/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 shadow-glow-orange">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-battle-muted font-broadcast">Highest Spender</span>
            <h4 className="text-lg font-black text-white font-broadcast">{highestSpender?.name || '—'}</h4>
            <span className="text-xs font-mono font-bold text-amber-400">
              {formatCurrency(highestSpender?.totalSpent, currency)} spent
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl battle-panel border border-brand-neon/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-neon/20 text-brand-neon flex items-center justify-center shrink-0 shadow-glow-neon">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-battle-muted font-broadcast">Most Economical</span>
            <h4 className="text-lg font-black text-white font-broadcast">{mostEconomical?.name || '—'}</h4>
            <span className="text-xs font-mono font-bold text-brand-neon">
              {formatCurrency(mostEconomical?.purse, currency)} remaining
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl battle-panel border border-brand-purple/30 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 text-brand-purple flex items-center justify-center shrink-0 shadow-glow-purple">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-battle-muted font-broadcast">Biggest Single Buy</span>
            <h4 className="text-lg font-black text-white font-broadcast truncate max-w-[170px]">
              {biggestSinglePurchase?.name || 'None yet'}
            </h4>
            <span className="text-xs font-mono font-bold text-amber-400">
              {biggestSinglePurchase ? formatCurrency(biggestSinglePurchase.soldPrice, currency) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* RECHARTS SPENDING OVERVIEW */}
      <div className="mb-8 p-6 rounded-3xl battle-panel border border-battle-border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-brand-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-battle-muted font-broadcast">
            Franchise Expenditure vs Remaining Purse ({currency.symbol})
          </h3>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Bar dataKey="spent" name="Spent" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#9147FF'} />
                ))}
              </Bar>
              <Bar dataKey="remaining" name="Remaining" fill="#151A2B" stroke="#323C61" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* COMPARISON & ROSTER DEEP DIVE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Team Selection Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-battle-muted mb-2 font-broadcast">
            Select Franchise
          </h3>

          {teamMetrics.map((t) => {
            const isSelected = activeSelectedTeam?.id === t.id;

            return (
              <motion.div
                key={t.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedTeamId(t.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'battle-panel border-brand-cyan shadow-glow-cyan'
                    : 'battle-panel border-battle-border hover:border-battle-borderLight'
                }`}
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: t.color }}
                />

                <div className="flex items-center justify-between pl-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-battle-bg border border-battle-border flex items-center justify-center overflow-hidden font-broadcast font-black text-base"
                      style={{ color: t.color }}
                    >
                      {t.logo && (t.logo.startsWith('http') || t.logo.startsWith('data:')) ? (
                        <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{t.logo || t.shortName || t.name?.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-broadcast font-bold text-sm text-white">{t.name}</h4>
                      <span className="text-xs text-battle-muted">
                        {t.squad.length} / {auction.rules?.maxSquadSize || 15} Superstars
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-battle-muted block uppercase font-broadcast font-bold">Remaining</span>
                    <span className="text-sm font-mono font-bold text-brand-neon">
                      {formatCurrency(t.purse, currency)}
                    </span>
                  </div>
                </div>

                <div className="pl-2">
                  <div className="flex justify-between text-[11px] text-battle-muted mb-1 font-mono">
                    <span>Spent: {formatCurrency(t.totalSpent, currency)}</span>
                    <span>{t.spentPercentage}% budget used</span>
                  </div>
                  <div className="w-full bg-battle-bg rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${t.spentPercentage}%`,
                        backgroundColor: t.color || '#9147FF',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: Selected Squad Roster (7 cols) */}
        <div className="lg:col-span-7">
          {activeSelectedTeam && (
            <div className="rounded-3xl battle-panel p-6 border border-battle-border">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 mb-4 border-b border-battle-border">
                <div className="flex items-center gap-3">
                  <span className="text-4xl p-2.5 rounded-2xl bg-battle-bg border border-battle-border shadow-md">
                    {activeSelectedTeam.logo}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-white font-broadcast" style={{ color: activeSelectedTeam.color }}>
                      {activeSelectedTeam.name}
                    </h2>
                    <p className="text-xs text-battle-muted">
                      Initial: {formatCurrency(activeSelectedTeam.initialPurse, currency)} • Average Buy: {formatCurrency(activeSelectedTeam.avgPrice, currency)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-battle-muted block font-broadcast font-bold">AVAILABLE FUNDS</span>
                  <span className="text-2xl font-black font-mono text-brand-neon">
                    {formatCurrency(activeSelectedTeam.purse, currency)}
                  </span>
                </div>
              </div>

              {/* Squad List */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-battle-muted mb-3 font-broadcast">
                Acquired Players & Roles ({activeSelectedTeam.squad.length})
              </h4>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeSelectedTeam.squad.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-battle-muted font-bold">{idx + 1}</span>
                      <div>
                        <h5 className="font-bold text-white text-xs font-broadcast">{item.name}</h5>
                        {item.movie && (
                          <span className="text-[10px] text-brand-cyan block">
                            {item.movie} ({item.actor})
                          </span>
                        )}
                        {item.director && (
                          <span className="text-[10px] text-amber-300 block">
                            Dir: {item.director} ({item.year})
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Badge variant="purple" className="text-[9px] py-0">
                            {item.role || 'Hero'}
                          </Badge>
                          {auction?.status === 'completed' ? (
                            item.imdbRating ? (
                              <span className="text-[10px] text-amber-300 font-mono font-bold">
                                ★ IMDb {item.imdbRating} ({item.rating} pts)
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-300 font-mono font-bold">
                                ★ {item.rating} pts
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-brand-cyan font-mono font-bold">
                              Acquired
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {formatCurrency(item.soldPrice, currency)}
                      </span>
                    </div>
                  </div>
                ))}

                {activeSelectedTeam.squad.length === 0 && (
                  <div className="py-12 text-center text-battle-muted text-xs italic">
                    This franchise has not acquired any players yet in this tournament.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
