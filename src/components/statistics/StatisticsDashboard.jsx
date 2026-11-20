import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Trophy, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Users, 
  Flame, 
  Clock, 
  Sparkles, 
  Crown, 
  Coins, 
  Shield, 
  Zap, 
  Search, 
  Filter, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  Tv,
  CheckCircle2,
  Calendar,
  Layers,
  Award
} from 'lucide-react';
import { statisticsService } from '../../services/statisticsService';
import { franchiseService } from '../../services/franchiseService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../common/CurrencyDisplay';

export const StatisticsDashboard = ({ onNavigateToGame }) => {
  // Navigation section
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'franchises' | 'auction' | 'battle' | 'players' | 'rivalries' | 'tournaments' | 'party'

  // Filters
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [selectedFranchise, setSelectedFranchise] = useState('all');
  const [selectedArena, setSelectedArena] = useState('all');

  // Head-to-Head rival selector
  const [rivalA, setRivalA] = useState('team-nishanth');
  const [rivalB, setRivalB] = useState('team-ajmal');

  // Sorting in Franchise Rankings
  const [franchiseSort, setFranchiseSort] = useState('titles'); // 'titles' | 'wins' | 'winPercentage' | 'battlePoints' | 'appearances'

  // Search in Tournament History
  const [historySearch, setHistorySearch] = useState('');

  // Load aggregated statistics
  const stats = useMemo(() => {
    return statisticsService.getStatistics({
      season: selectedSeason,
      tournamentId: selectedTournament,
      franchiseId: selectedFranchise,
      arenaType: selectedArena,
    });
  }, [selectedSeason, selectedTournament, selectedFranchise, selectedArena]);

  // Head-to-Head data
  const headToHead = useMemo(() => {
    return statisticsService.getHeadToHead(rivalA, rivalB);
  }, [rivalA, rivalB]);

  // All franchises for rival dropdowns
  const allFranchises = useMemo(() => {
    return franchiseService.getAllFranchises({ includeArchived: true });
  }, []);

  // Sorted franchise rankings
  const sortedFranchises = useMemo(() => {
    const list = [...stats.franchiseRankings];
    list.sort((a, b) => {
      if (franchiseSort === 'wins') return b.wins - a.wins;
      if (franchiseSort === 'winPercentage') return b.winPercentage - a.winPercentage;
      if (franchiseSort === 'battlePoints') return b.battlePoints - a.battlePoints;
      if (franchiseSort === 'appearances') return b.appearances - a.appearances;
      // Default: titles
      if (b.titles !== a.titles) return b.titles - a.titles;
      return b.battlePoints - a.battlePoints;
    });
    return list;
  }, [stats.franchiseRankings, franchiseSort]);

  // Filtered tournament history
  const filteredHistory = useMemo(() => {
    if (!historySearch.trim()) return stats.tournamentHistory;
    const q = historySearch.toLowerCase();
    return stats.tournamentHistory.filter(
      (t) =>
        t.name?.toLowerCase().includes(q) ||
        t.category?.toLowerCase().includes(q) ||
        t.season?.toLowerCase().includes(q) ||
        t.championName?.toLowerCase().includes(q)
    );
  }, [stats.tournamentHistory, historySearch]);

  const handleResetFilters = () => {
    setSelectedSeason('all');
    setSelectedTournament('all');
    setSelectedFranchise('all');
    setSelectedArena('all');
  };

  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'franchises', label: 'Franchise Rankings', icon: Users },
    { id: 'auction', label: 'Auction Records', icon: Gavel },
    { id: 'battle', label: 'Battle Records', icon: Swords },
    { id: 'players', label: 'Player Records', icon: Award },
    { id: 'rivalries', label: 'Head-to-Head Rivalries', icon: Flame },
    { id: 'tournaments', label: 'Tournament History', icon: Trophy },
    { id: 'party', label: 'Party Arena Records', icon: Gamepad2 },
  ];

  return (
    <div className="min-h-screen bg-[#111827] text-[#F5F3EE] font-sans pb-20 selection:bg-[#D97858] selection:text-[#F5F3EE]">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ========================================================
            1. HERO TITLE & STATS CONTROL BANNER
            ======================================================== */}
        <div className="rounded-3xl bg-[#222F43] p-6 sm:p-8 border border-[#39465A] shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#39465A] text-xs font-mono text-[#D4B879]">
              <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
              <span>ALL-TIME HISTORICAL ARCHIVE</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-5xl font-black text-[#F5F3EE] tracking-tight">
              STATISTICS & RECORDS
            </h1>
            <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
              Official records, franchise leaderboards, auction transactions, combat win percentages, and head-to-head rivalries calculated from authentic completed tournament data.
            </p>
          </div>

          {/* Quick Action to Broadcast Ceremony */}
          <div className="flex items-center gap-3">
            <Button
              variant="champagne"
              size="md"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('bidbattle_open_broadcast', {
                  detail: { mode: 'ceremony' }
                }));
              }}
              className="flex items-center gap-2 font-heading font-black text-xs shadow-md"
            >
              <Tv className="w-4 h-4" />
              <span>Championship Broadcast</span>
            </Button>
          </div>
        </div>

        {/* ========================================================
            2. MULTI-CRITERIA FILTER TOOLBAR
            ======================================================== */}
        <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A] shadow-lg flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-[#AEB9CC]">
              <Filter className="w-4 h-4 text-[#D4B879]" />
              <span>FILTERS:</span>
            </div>

            {/* Season Filter */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:outline-none focus:border-[#D4B879]"
            >
              <option value="all">All Seasons</option>
              {stats.availableFilters.seasons.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Tournament Filter */}
            <select
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:outline-none focus:border-[#D4B879] max-w-[200px]"
            >
              <option value="all">All Tournaments</option>
              {stats.availableFilters.tournaments.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>

            {/* Franchise Filter */}
            <select
              value={selectedFranchise}
              onChange={(e) => setSelectedFranchise(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:outline-none focus:border-[#D4B879]"
            >
              <option value="all">All Franchises</option>
              {stats.availableFilters.franchises.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {/* Arena Type Pills */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#222F43] border border-[#39465A]">
              {[
                { id: 'all', label: 'All Arenas' },
                { id: 'auction', label: 'Auction' },
                { id: 'battle', label: 'Battle' },
                { id: 'party', label: 'Party' },
              ].map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedArena(a.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all ${
                    selectedArena === a.id
                      ? 'bg-[#00D9FF] text-[#0B0F17] shadow-sm'
                      : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Filters */}
          {(selectedSeason !== 'all' || selectedTournament !== 'all' || selectedFranchise !== 'all' || selectedArena !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#D4B879] hover:text-[#F5F3EE] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* ========================================================
            3. SECTION NAVIGATION TABS
            ======================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#39465A]">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-heading font-black tracking-wide transition-all shrink-0 ${
                  isActive
                    ? 'bg-[#D4B879] text-[#0B0F17] shadow-lg'
                    : 'bg-[#222F43] text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#2C394C] border border-[#39465A]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================
            4. TAB CONTENT SECTIONS
            ======================================================== */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Telemetry Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    COMPLETED TOURNAMENTS
                  </span>
                  <div className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE]">
                    {stats.overview.totalCompletedTournaments}
                  </div>
                  <span className="text-[11px] text-[#91A98B] font-mono">
                    100% Finalized Podiums
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    FRANCHISE APPEARANCES
                  </span>
                  <div className="font-heading font-black text-3xl sm:text-4xl text-[#00D9FF]">
                    {stats.overview.totalFranchiseAppearances}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    Across All Seasons
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    AUCTION TRANSACTIONS
                  </span>
                  <div className="font-heading font-black text-3xl sm:text-4xl text-[#D4B879]">
                    {stats.overview.totalAuctionTransactions}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    Sold, Settled & Unsold
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    BATTLE MATCHES
                  </span>
                  <div className="font-heading font-black text-3xl sm:text-4xl text-[#D97858]">
                    {stats.overview.totalBattleMatches}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    3-1-0 Point Deciders
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    MOST SUCCESSFUL FRANCHISE
                  </span>
                  <div className="font-heading font-black text-xl sm:text-2xl text-[#F5F3EE] truncate mt-1">
                    {stats.overview.mostSuccessfulFranchise}
                  </div>
                  <span className="text-[11px] text-[#D4B879] font-mono font-bold">
                    👑 {stats.overview.mostTournamentTitles} Tournament Titles
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    RECORD AUCTION BUY
                  </span>
                  <div className="font-heading font-black text-2xl sm:text-3xl text-[#00D9FF]">
                    ₹{stats.overview.mostExpensivePurchase} Cr
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono truncate block">
                    {stats.auctionRecords.mostExpensivePlayer?.name || 'N/A'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    HIGHEST BATTLE WIN RATE
                  </span>
                  <div className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
                    {stats.overview.highestWinPercentage}%
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    {stats.battleRecords.highestWinRateFranchise?.name || 'N/A'} (min 2 matches)
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                    PARTY ARENA SESSIONS
                  </span>
                  <div className="font-heading font-black text-2xl sm:text-3xl text-[#91A98B]">
                    {stats.overview.totalPartySessions}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    Dumb Charades & Who Am I
                  </span>
                </div>
              </div>

              {/* Quick Links Banner */}
              <div className="p-6 rounded-3xl bg-[#222F43] border border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
                    Explore Historical Details
                  </h3>
                  <p className="text-xs text-[#AEB9CC]">
                    Dive into franchise leaderboards, transaction breakdowns, head-to-head rivalries, and tournament archives.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActiveTab('franchises')}
                    className="font-heading font-bold text-xs"
                  >
                    Franchise Leaderboard →
                  </Button>
                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={() => setActiveTab('rivalries')}
                    className="font-heading font-bold text-xs"
                  >
                    Head-to-Head Clash →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FRANCHISE RANKINGS */}
          {activeTab === 'franchises' && (
            <motion.div
              key="franchises"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                    ALL-TIME FRANCHISE RANKINGS
                  </h2>
                  <p className="text-xs text-[#AEB9CC]">
                    Calculated from completed tournaments with snapshot isolation (edits in Franchise Manager never alter old records)
                  </p>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-bold text-[#AEB9CC]">SORT BY:</span>
                  <select
                    value={franchiseSort}
                    onChange={(e) => setFranchiseSort(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE]"
                  >
                    <option value="titles">Tournament Titles (Default)</option>
                    <option value="wins">Battle Wins</option>
                    <option value="winPercentage">Win Percentage</option>
                    <option value="battlePoints">Battle Points</option>
                    <option value="appearances">Appearances</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="rounded-3xl bg-[#192231] border border-[#39465A] shadow-2xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#222F43] border-b border-[#39465A] text-[#AEB9CC] font-mono uppercase tracking-wider">
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Franchise</th>
                      <th className="py-3 px-4 text-center">Appearances</th>
                      <th className="py-3 px-4 text-center">Titles 🏆</th>
                      <th className="py-3 px-4 text-center">Runner-up 🥈</th>
                      <th className="py-3 px-4 text-center">Matches</th>
                      <th className="py-3 px-4 text-center">W-D-L</th>
                      <th className="py-3 px-4 text-center">Win %</th>
                      <th className="py-3 px-4 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#39465A]/60 font-heading">
                    {sortedFranchises.map((f, idx) => (
                      <tr key={f.id} className="hover:bg-[#222F43]/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-black text-sm text-[#D4B879]">
                          #{idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: f.color || '#D4B879' }}
                            />
                            <span className="font-bold text-sm text-[#F5F3EE]">{f.name}</span>
                            {f.isArchived && (
                              <Badge variant="outline" className="text-[9px] py-0 border-[#39465A] text-[#AEB9CC]">
                                Archived
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#F5F3EE]">
                          {f.appearances}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-black text-sm text-[#D4B879]">
                          {f.titles}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#AEB9CC]">
                          {f.runnerUps}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#F5F3EE]">
                          {f.battleMatches}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs">
                          <span className="text-emerald-400 font-bold">{f.wins}</span>-
                          <span className="text-[#AEB9CC]">{f.draws}</span>-
                          <span className="text-rose-400 font-bold">{f.losses}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#00D9FF]">
                          {f.winPercentage}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-sm text-[#D4B879]">
                          {f.battlePoints} PTS
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AUCTION RECORDS */}
          {activeTab === 'auction' && (
            <motion.div
              key="auction"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                  AUCTION ARENA RECORDS
                </h2>
                <p className="text-xs text-[#AEB9CC]">
                  Historical transactions, record bids, mandatory base-price settlements, and budget metrics (player ratings remain concealed where tournament rules require)
                </p>
              </div>

              {/* Auction Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    HIGHEST PURCHASE
                  </span>
                  <div className="font-heading font-black text-2xl text-[#00D9FF]">
                    ₹{stats.auctionRecords.mostExpensivePlayer?.soldPrice || 0} Cr
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.auctionRecords.mostExpensivePlayer?.name || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#AEB9CC] font-mono block">
                    Bought by: {stats.auctionRecords.mostExpensivePlayer?.buyerName || 'N/A'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    BIGGEST PRICE SURGE
                  </span>
                  <div className="font-heading font-black text-2xl text-[#D97858]">
                    +₹{(Number(stats.auctionRecords.biggestPriceDelta?.soldPrice) || 0) - (Number(stats.auctionRecords.biggestPriceDelta?.basePrice) || 0)} Cr
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.auctionRecords.biggestPriceDelta?.name || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#AEB9CC] font-mono block">
                    Base: ₹{stats.auctionRecords.biggestPriceDelta?.basePrice} Cr → Sold: ₹{stats.auctionRecords.biggestPriceDelta?.soldPrice} Cr
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    BIGGEST BARGAIN
                  </span>
                  <div className="font-heading font-black text-2xl text-[#91A98B]">
                    ₹{stats.auctionRecords.biggestBargain?.soldPrice || 0} Cr
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.auctionRecords.biggestBargain?.name || 'N/A'}
                  </span>
                  <span className="text-[10px] text-[#AEB9CC] font-mono block">
                    Acquired at/near base price
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    TRANSACTIONS BREAKDOWN
                  </span>
                  <div className="space-y-1 pt-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Normal Sold:</span>
                      <strong className="text-[#F5F3EE]">{stats.auctionRecords.totalNormalSold}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-400">Special Settlement:</span>
                      <strong className="text-[#F5F3EE]">{stats.auctionRecords.totalSpecialSettlement}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-400">Unsold:</span>
                      <strong className="text-[#F5F3EE]">{stats.auctionRecords.totalUnsold}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Auction Lots Table */}
              <div className="rounded-3xl bg-[#192231] border border-[#39465A] shadow-2xl overflow-hidden overflow-x-auto">
                <div className="p-4 bg-[#222F43] border-b border-[#39465A]">
                  <h3 className="font-heading font-black text-sm text-[#F5F3EE]">
                    ALL-TIME RECORD AUCTION LOTS
                  </h3>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#192231] border-b border-[#39465A] text-[#AEB9CC] font-mono uppercase">
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Category / Role</th>
                      <th className="py-3 px-4">Base Price</th>
                      <th className="py-3 px-4">Sale Price</th>
                      <th className="py-3 px-4">Acquiring Franchise</th>
                      <th className="py-3 px-4">Settlement Type</th>
                      <th className="py-3 px-4">Tournament</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#39465A]/60 font-heading">
                    {stats.auctionRecords.topLots.map((lot, idx) => (
                      <tr key={idx} className="hover:bg-[#222F43]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-sm text-[#F5F3EE]">
                          {lot.name}
                        </td>
                        <td className="py-3 px-4 text-[#AEB9CC]">
                          {lot.role || lot.category || 'Hero'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[#AEB9CC]">
                          ₹{lot.basePrice} Cr
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-sm text-[#00D9FF]">
                          ₹{lot.soldPrice} Cr
                        </td>
                        <td className="py-3 px-4 font-bold text-[#F5F3EE]">
                          {lot.buyerName || lot.soldTo}
                        </td>
                        <td className="py-3 px-4">
                          {lot.settlementType === 'mandatory_last_bidder' || lot.settlementType === 'special_base_price' ? (
                            <Badge variant="orange" className="text-[10px] py-0.5">
                              Special Settlement
                            </Badge>
                          ) : (
                            <Badge variant="green" className="text-[10px] py-0.5">
                              Normal Sold
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#AEB9CC]">
                          {lot.tournamentName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 4: BATTLE RECORDS */}
          {activeTab === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                  BATTLE ARENA RECORDS
                </h2>
                <p className="text-xs text-[#AEB9CC]">
                  Authoritative match results, 3-1-0 points, and combat records
                </p>
              </div>

              {/* Battle Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    MOST VICTORIES
                  </span>
                  <div className="font-heading font-black text-2xl text-emerald-400">
                    {stats.battleRecords.mostBattleVictories?.wins || 0} Wins
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.battleRecords.mostBattleVictories?.name || 'N/A'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    HIGHEST COMBAT WIN %
                  </span>
                  <div className="font-heading font-black text-2xl text-[#00D9FF]">
                    {stats.battleRecords.highestWinRateFranchise?.winPercentage || 0}%
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.battleRecords.highestWinRateFranchise?.name || 'N/A'} (min 2 matches)
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    MOST BATTLE POINTS
                  </span>
                  <div className="font-heading font-black text-2xl text-[#D4B879]">
                    {stats.battleRecords.mostBattlePoints?.battlePoints || 0} PTS
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.battleRecords.mostBattlePoints?.name || 'N/A'}
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    MOST MATCHES PLAYED
                  </span>
                  <div className="font-heading font-black text-2xl text-[#D97858]">
                    {stats.battleRecords.mostMatchesPlayed?.battleMatches || 0} Matches
                  </div>
                  <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                    {stats.battleRecords.mostMatchesPlayed?.name || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Completed Matches Table */}
              <div className="rounded-3xl bg-[#192231] border border-[#39465A] shadow-2xl overflow-hidden overflow-x-auto">
                <div className="p-4 bg-[#222F43] border-b border-[#39465A]">
                  <h3 className="font-heading font-black text-sm text-[#F5F3EE]">
                    OFFICIAL COMPLETED BATTLE MATCHES
                  </h3>
                </div>
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#192231] border-b border-[#39465A] text-[#AEB9CC] font-mono uppercase">
                      <th className="py-3 px-4">Team A (Home)</th>
                      <th className="py-3 px-4 text-center">Score</th>
                      <th className="py-3 px-4">Team B (Away)</th>
                      <th className="py-3 px-4">Winner (+3 Pts)</th>
                      <th className="py-3 px-4">Tournament</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#39465A]/60 font-heading">
                    {stats.battleRecords.completedMatches.map((m, idx) => (
                      <tr key={idx} className="hover:bg-[#222F43]/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-sm text-[#F5F3EE]">
                          {m.teamAName}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-sm text-[#00D9FF]">
                          {m.scoreA} - {m.scoreB}
                        </td>
                        <td className="py-3 px-4 font-bold text-sm text-[#F5F3EE]">
                          {m.teamBName}
                        </td>
                        <td className="py-3 px-4">
                          {m.isDraw ? (
                            <span className="text-[#AEB9CC] font-bold">Draw (+1 Pt Each)</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">
                              {m.winnerId === m.teamAId ? m.teamAName : m.teamBName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-[#AEB9CC]">
                          {m.tournamentName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PLAYER RECORDS */}
          {activeTab === 'players' && (
            <motion.div
              key="players"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div>
                <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                  PLAYER & CONTENDER RECORDS
                </h2>
                <p className="text-xs text-[#AEB9CC]">
                  Historical player acquisitions across tournaments (ratings are omitted where concealed)
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {stats.playerRecords.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#D4B879]">
                        #{idx + 1}
                      </span>
                      <Badge variant="outline" className="text-[10px] py-0.5 border-[#39465A] text-[#AEB9CC]">
                        {p.role}
                      </Badge>
                    </div>

                    <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
                      {p.name}
                    </h3>

                    <div className="space-y-1.5 pt-1 text-xs font-mono border-t border-[#39465A]/80">
                      <div className="flex justify-between">
                        <span className="text-[#AEB9CC]">Times Acquired:</span>
                        <strong className="text-[#F5F3EE]">{p.timesAcquired}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#AEB9CC]">Peak Purchase Price:</span>
                        <strong className="text-[#00D9FF]">₹{p.highestPrice} Cr</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#AEB9CC]">Franchises Represented:</span>
                        <strong className="text-[#D4B879]">{p.franchisesCount}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 6: HEAD-TO-HEAD RIVALRIES */}
          {activeTab === 'rivalries' && (
            <motion.div
              key="rivalries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                  HEAD-TO-HEAD RIVALRY COMPARISON
                </h2>
                <p className="text-xs text-[#AEB9CC]">
                  Select any two franchises to compare all-time encounters, wins, and tournament results
                </p>
              </div>

              {/* Selector */}
              <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-bold text-[#AEB9CC]">FRANCHISE A:</span>
                  <select
                    value={rivalA}
                    onChange={(e) => setRivalA(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE]"
                  >
                    {allFranchises.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div className="w-8 h-8 rounded-full bg-[#111827] border border-[#D4B879] flex items-center justify-center font-mono font-black text-xs text-[#D4B879]">
                  VS
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-bold text-[#AEB9CC]">FRANCHISE B:</span>
                  <select
                    value={rivalB}
                    onChange={(e) => setRivalB(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE]"
                  >
                    {allFranchises.map((f) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Head-to-Head Clash Card */}
              {headToHead ? (
                <div className="rounded-3xl p-6 sm:p-8 bg-[#222F43] border border-[#39465A] shadow-2xl space-y-6">
                  {/* Big Faceoff Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center text-center">
                    {/* Team A */}
                    <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A] space-y-2">
                      <div
                        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-heading font-black text-2xl border"
                        style={{ backgroundColor: '#111827', borderColor: headToHead.franchiseA.color, color: headToHead.franchiseA.color }}
                      >
                        {headToHead.franchiseA.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
                        {headToHead.franchiseA.name}
                      </h3>
                      <div className="font-mono text-2xl font-black text-emerald-400">
                        {headToHead.winsA} Wins ({headToHead.winRateA}%)
                      </div>
                    </div>

                    {/* Encounters Meta */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono uppercase text-[#AEB9CC] tracking-widest block">
                        TOTAL ENCOUNTERS
                      </span>
                      <div className="font-mono font-black text-4xl text-[#00D9FF]">
                        {headToHead.totalEncounters}
                      </div>
                      <span className="text-xs font-mono text-[#AEB9CC]">
                        {headToHead.draws} Draws • {headToHead.tournamentsTogether} Tournaments Together
                      </span>
                    </div>

                    {/* Team B */}
                    <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A] space-y-2">
                      <div
                        className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center font-heading font-black text-2xl border"
                        style={{ backgroundColor: '#111827', borderColor: headToHead.franchiseB.color, color: headToHead.franchiseB.color }}
                      >
                        {headToHead.franchiseB.name?.slice(0, 2).toUpperCase()}
                      </div>
                      <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
                        {headToHead.franchiseB.name}
                      </h3>
                      <div className="font-mono text-2xl font-black text-emerald-400">
                        {headToHead.winsB} Wins ({headToHead.winRateB}%)
                      </div>
                    </div>
                  </div>

                  {/* Historical Encounters Log */}
                  {headToHead.encounters.length > 0 && (
                    <div className="space-y-2 pt-4 border-t border-[#39465A]">
                      <span className="text-xs font-mono font-bold text-[#AEB9CC] uppercase block">
                        MATCH HISTORY:
                      </span>
                      <div className="space-y-2">
                        {headToHead.encounters.map((m, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-[#192231] border border-[#39465A] flex items-center justify-between gap-4 text-xs font-heading"
                          >
                            <span className="text-[#AEB9CC] font-mono text-[11px]">
                              {m.tournamentName} ({m.season})
                            </span>
                            <div className="font-mono font-bold text-sm">
                              <span className={m.winnerId === headToHead.franchiseA.id ? 'text-emerald-400 font-black' : 'text-[#F5F3EE]'}>
                                {m.scoreA}
                              </span>
                              <span className="text-[#AEB9CC] mx-2">-</span>
                              <span className={m.winnerId === headToHead.franchiseB.id ? 'text-emerald-400 font-black' : 'text-[#F5F3EE]'}>
                                {m.scoreB}
                              </span>
                            </div>
                            <span className="font-bold text-xs">
                              {m.isDraw ? 'Draw' : m.winnerId === headToHead.franchiseA.id ? `${headToHead.franchiseA.name} Won` : `${headToHead.franchiseB.name} Won`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-[#192231] border border-[#39465A] text-center text-[#AEB9CC] font-heading">
                  Please select two distinct franchises to view their head-to-head record.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 7: TOURNAMENT HISTORY */}
          {activeTab === 'tournaments' && (
            <motion.div
              key="tournaments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                    COMPLETED TOURNAMENT ARCHIVE
                  </h2>
                  <p className="text-xs text-[#AEB9CC]">
                    Historical seasons with crowned champions and immutable results
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-[#AEB9CC] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history..."
                    className="pl-9 pr-4 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:outline-none focus:border-[#D4B879]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredHistory.map((t) => (
                  <div
                    key={t.id}
                    className="p-6 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[10px] font-mono text-[#D4B879]">
                          {t.category}
                        </span>
                        <span className="text-xs font-mono text-[#AEB9CC]">
                          {t.season}
                        </span>
                      </div>
                      <Badge variant="green" className="text-[10px] py-0.5">
                        COMPLETED
                      </Badge>
                    </div>

                    <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
                      {t.name}
                    </h3>

                    {/* Champion Banner */}
                    <div className="p-3.5 rounded-2xl bg-[#222F43] border border-[#D4B879]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-[#D4B879]" />
                        <div>
                          <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block leading-none">
                            Champion
                          </span>
                          <span className="font-heading font-black text-sm text-[#F5F3EE]">
                            {t.championName}
                          </span>
                        </div>
                      </div>

                      {t.runnerUpName && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block leading-none">
                            Runner-Up
                          </span>
                          <span className="font-heading font-bold text-xs text-[#AEB9CC]">
                            {t.runnerUpName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenders Badges */}
                    {t.franchisesSnapshot.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                          Contenders:
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {t.franchisesSnapshot.map((f, idx) => (
                            <span
                              key={f.id || idx}
                              className="px-2 py-0.5 rounded-lg bg-[#111827] border border-[#39465A] text-[11px] font-heading font-bold text-[#F5F3EE] flex items-center gap-1.5"
                            >
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                              <span>{f.name}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 8: PARTY ARENA RECORDS */}
          {activeTab === 'party' && (
            <motion.div
              key="party"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="font-heading font-black text-2xl text-[#F5F3EE]">
                  PARTY ARENA RECORDS
                </h2>
                <p className="text-xs text-[#AEB9CC]">
                  Party game statistics tracking Dumb Charades, prompt accuracy, and Early Guess bonus points
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    TOTAL PROMPTS SOLVED
                  </span>
                  <div className="font-heading font-black text-3xl text-emerald-400">
                    {stats.partyRecords.totalCorrectGuesses}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    Correct Charades Guesses
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    EARLY GUESSES (&lt;50% TIME)
                  </span>
                  <div className="font-heading font-black text-3xl text-amber-400">
                    {stats.partyRecords.totalEarlyGuesses}
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    ⚡ Solved in first half of clock
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    EARLY BONUS POINTS AWARDED
                  </span>
                  <div className="font-heading font-black text-3xl text-[#00D9FF]">
                    +{stats.partyRecords.totalEarlyBonusPoints} PTS
                  </div>
                  <span className="text-[11px] text-[#AEB9CC] font-mono">
                    +1 Point Per Early Guess
                  </span>
                </div>

                <div className="p-5 rounded-3xl bg-[#192231] border border-[#39465A] shadow-xl space-y-1">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    TOP PARTY TEAM
                  </span>
                  <div className="font-heading font-black text-xl text-[#F5F3EE] truncate mt-1">
                    {stats.partyRecords.bestTeamName}
                  </div>
                  <span className="text-[11px] text-[#D4B879] font-mono font-bold">
                    Peak Score: {stats.partyRecords.highestTeamScore} PTS
                  </span>
                </div>
              </div>

              {/* Early Guess Scoring Rule Summary */}
              <div className="p-6 rounded-3xl bg-[#222F43] border border-amber-500/40 shadow-xl flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Zap className="w-6 h-6 fill-current" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-black text-lg text-[#F5F3EE]">
                    Official Dumb Charades Early Guess Rule Active
                  </h3>
                  <p className="text-xs text-[#AEB9CC] leading-relaxed">
                    Teams receive an automatic <strong>+1 point early-guess bonus</strong> whenever they accurately solve the secret acting prompt within the first 50% of the round timer. All bonuses are tracked independently alongside streaks and base points.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
