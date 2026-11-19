import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { toast } from 'sonner';
import { 
  Gavel, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Undo2, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Trophy, 
  Radio, 
  ChevronRight, 
  Zap, 
  Users, 
  ArrowRight, 
  Shield, 
  Coins, 
  DollarSign,
  Settings,
  Layers,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Activity
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrency } from '../common/CurrencyDisplay';
import { getScoreMetricLabel } from '../../services/presets';
import { 
  calculateNextBid, 
  validateBid, 
  getPurseHealth, 
  DEFAULT_INCREMENTS,
  toPaise,
  fromPaise,
  getProgressiveIncrement,
  getProgressiveTierLabel,
  AUCTION_MODES,
  calculateFranchiseBudgetHealth,
  calculateAuctionStrategyIndicators
} from '../../services/auctionEngine';
import { SoldCelebrationModal } from './SoldCelebrationModal';
import { UnsoldPromptModal } from './UnsoldPromptModal';
import { RandomEventModal } from './RandomEventModal';
import { AuctionSettingsModal } from './AuctionSettingsModal';
import { LotQueueDrawer } from './LotQueueDrawer';
import { UndoConfirmModal } from './UndoConfirmModal';
import { LiveAuctionCard } from './LiveAuctionCard';

export const LiveAuction = () => {
  const {
    auction,
    getCurrentItem,
    placeBid,
    placeIncrementBid,
    undoLastBid,
    canUndo,
    requestUndo,
    executeConfirmedUndo,
    cancelUndo,
    undoConfirmDialog,
    confirmSold,
    markUnsold,
    advanceToNextItem,
    reAuctionItem,
    toggleTimer,
    resetTimer,
    triggerRandomEvent,
    activeEvent,
    setActiveEvent,
    outbidAlert,
    setOutbidAlert,
    saleCelebration,
    unsoldPrompt,
    setActivePage,
    updateAuctionSettings,
    isMuted,
    setIsMuted,
  } = useAuction();

  const [customBidAmount, setCustomBidAmount] = useState('');
  const [selectedCustomTeam, setSelectedCustomTeam] = useState('');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [rightTab, setRightTab] = useState('bids'); // 'bids' | 'timeline'

  const currentItem = getCurrentItem();

  // Outbid alert toast
  useEffect(() => {
    if (outbidAlert) {
      toast.warning(`OUTBID ALERT: ${outbidAlert.newBidder.name} outbid ${outbidAlert.outbidTeam.name}!`, {
        description: `Current high bid: ${formatCurrency(outbidAlert.amount, auction?.currency)}`,
        duration: 3500,
      });
      const timeout = setTimeout(() => setOutbidAlert(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [outbidAlert]);

  if (!auction || !currentItem) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl battle-panel text-center">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white font-broadcast uppercase mb-2">Auction Concluded</h2>
        <p className="text-xs text-battle-muted mb-6">
          All lots have finished or no auction tournament is currently active.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setActivePage(auction ? 'results' : 'setup')}
        >
          {auction ? 'View Tournament Podium' : 'Create Auction'}
        </Button>
      </div>
    );
  }

  const { currency, rules, teams, currentBid, highestBidder, timer, isTimerRunning, bidHistory } = auction;
  const currentLeaderTeam = highestBidder ? teams.find((t) => t.id === highestBidder) : null;
  const scoreMetricLabel = auction.scoreLabel || getScoreMetricLabel(auction.category);
  const isRatingHidden = Boolean(rules?.hideRatingsDuringAuction);

  // Progressive Increment & Auction Mode
  const currentIncrement = getProgressiveIncrement(currentBid);
  const currentTierLabel = getProgressiveTierLabel(currentBid);
  const currentMode = AUCTION_MODES[auction.mode] || AUCTION_MODES.standard;

  // Next bid calculation with automatic progressive increments
  const nextCalculatedBid = calculateNextBid(
    currentBid,
    Boolean(highestBidder),
    currentItem.basePrice
  );

  // Lot statistics
  const totalLots = auction.items.length;
  const soldLotsCount = auction.items.filter((i) => i.status === 'sold').length;
  const unsoldLotsCount = auction.items.filter((i) => i.status === 'unsold').length;
  const pendingLotsCount = auction.items.filter((i) => i.status === 'pending').length;
  const progressPercent = Math.round(((soldLotsCount + unsoldLotsCount) / (totalLots || 1)) * 100);

  // Handle Quick Team Bid Click
  const handleTeamBidClick = (teamId) => {
    const res = placeBid(teamId, nextCalculatedBid);
    if (!res.success) {
      toast.error(res.reason || 'Invalid bid action');
    } else {
      toast.success(`${res.team.name} placed bid at ${formatCurrency(res.amount, currency)}!`);
    }
  };

  // Handle Custom Bid Submit
  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomTeam) {
      toast.error('Select a franchise first for jump bid');
      return;
    }
    const amount = Number(customBidAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Enter a valid positive number');
      return;
    }

    const res = placeBid(selectedCustomTeam, amount);
    if (!res.success) {
      toast.error(res.reason || 'Invalid custom bid');
    } else {
      toast.success(`Jump bid placed: ${res.team.name} bid ${formatCurrency(amount, currency)}!`);
      setCustomBidAmount('');
    }
  };

  // Strategy indicators calculation (BIDBATTLE 7.7)
  const strategyIndicators = useMemo(() => {
    if (!auction) return null;
    return calculateAuctionStrategyIndicators({
      teams: auction.teams || [],
      items: auction.items || [],
      currentItemIndex: auction.currentItemIndex || 0,
    });
  }, [auction?.teams, auction?.items, auction?.currentItemIndex]);

  // Activity ticker list (from auction state or synthetic fallback)
  const activityList = auction.tickerEvents && auction.tickerEvents.length > 0
    ? auction.tickerEvents
    : bidHistory.slice(0, 5).map((b) => ({
        id: b.id,
        text: `${b.teamLogo} ${b.teamName} raised bid to ${currency.symbol}${b.amount} Cr`,
        timestamp: b.timestamp,
        type: 'bid',
      }));

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between p-3 sm:p-5 max-w-[1750px] mx-auto select-none space-y-3">
      
      {/* 1. TOP BROADCAST CONTROL BAR */}
      <div className="battle-panel rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-lg">
        {/* Left: Live status, Tournament name, Lot counter */}
        <div className="flex items-center gap-3">
          <Badge variant="orange" pulse>
            LIVE ARENA
          </Badge>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-broadcast font-bold text-white text-base sm:text-lg leading-tight truncate max-w-[180px] sm:max-w-xs">
                {auction.name}
              </h1>
              <Badge variant="purple" className="text-[10px] py-0 hidden sm:inline-flex">
                {currentItem.category || auction.category}
              </Badge>
              <Badge variant={currentMode?.badgeVariant || 'cyan'} className="text-[10px] py-0 font-mono hidden md:inline-flex">
                {currentMode?.badge || 'Classic 20s'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-[11px] text-battle-muted font-broadcast font-medium mt-0.5">
              <span className="text-brand-cyan font-bold">
                LOT #{auction.currentItemIndex + 1} OF {totalLots}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{soldLotsCount} Sold</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">{unsoldLotsCount} Unsold</span>
              <span>•</span>
              <span className="text-brand-purple font-mono font-bold">{progressPercent}% Done</span>
            </div>
          </div>
        </div>

        {/* Center: Subtle Auction Progress Bar */}
        <div className="hidden xl:flex items-center gap-3 w-64">
          <div className="w-full bg-battle-bg rounded-full h-2 overflow-hidden border border-battle-border">
            <div
              className="h-full bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-neon transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Actions (Queue, Event, Timer, Sound, Settings, Exit) */}
        <div className="flex items-center gap-2">
          {/* Lot Queue Drawer Trigger */}
          <button
            onClick={() => setShowQueueDrawer(true)}
            className="px-3 py-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:text-white text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all"
            title="Inspect full lot queue and upcoming cards"
          >
            <Layers className="w-3.5 h-3.5 text-brand-purple" />
            <span className="hidden md:inline">Lot Queue</span>
          </button>

          {rules?.randomEvents && (
            <button
              onClick={triggerRandomEvent}
              className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all shadow-glow-orange"
              title="Trigger Random Event / Sponsor Boost"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Event</span>
            </button>
          )}

          {/* Clock Pause/Resume */}
          <button
            onClick={toggleTimer}
            className={`px-3 py-1.5 rounded-xl border text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all ${
              isTimerRunning
                ? 'bg-battle-surface border-battle-border text-battle-text hover:bg-battle-card'
                : 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900 shadow-glow-neon'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTimerRunning ? 'Pause' : 'Resume'}</span>
          </button>

          {/* Clock Reset */}
          <button
            onClick={resetTimer}
            title="Reset Countdown Clock"
            className="p-1.5 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Sound muted (click to unmute)' : 'Sound enabled (click to mute)'}
            className="p-1.5 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-white"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-brand-neon" />}
          </button>

          {/* Settings Control */}
          <button
            onClick={() => setShowSettingsModal(true)}
            title="Auction Settings & Rules"
            className="p-1.5 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-white"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Exit / Return */}
          <button
            onClick={() => setShowExitConfirm(true)}
            title="Exit Live Arena"
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900 text-rose-300 text-xs font-broadcast font-bold"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 1.5 STRATEGY & MARKET INTELLIGENCE STRIP (BIDBATTLE 7.7) */}
      <div className="battle-panel rounded-2xl px-4 py-2 border border-brand-purple/30 bg-battle-surface/60 backdrop-blur-md shadow-md">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 items-center text-xs">
          {/* Top Acquisition */}
          <div className="flex items-center gap-2 border-r border-battle-border/60 pr-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast font-bold block leading-none mb-0.5">
                Top Acquisition
              </span>
              {strategyIndicators?.mostExpensiveAcquisition ? (
                <div className="truncate text-white font-broadcast font-bold flex items-center gap-1">
                  <span className="truncate">{strategyIndicators.mostExpensiveAcquisition.name}</span>
                  <span className="text-amber-400 font-mono text-[11px] shrink-0">
                    (₹{strategyIndicators.mostExpensiveAcquisition.price} Cr)
                  </span>
                </div>
              ) : (
                <span className="text-battle-muted italic font-mono text-[11px]">No sales yet</span>
              )}
            </div>
          </div>

          {/* Highest Spender */}
          <div className="flex items-center gap-2 border-r border-battle-border/60 pr-2">
            <div className="w-8 h-8 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast font-bold block leading-none mb-0.5">
                Highest Spender
              </span>
              {strategyIndicators?.highestSpender ? (
                <div className="truncate text-white font-broadcast font-bold flex items-center gap-1">
                  <span>{strategyIndicators.highestSpender.logo}</span>
                  <span className="truncate">{strategyIndicators.highestSpender.name}</span>
                  <span className="text-brand-orange font-mono text-[11px] shrink-0">
                    (₹{strategyIndicators.highestSpender.totalSpent} Cr)
                  </span>
                </div>
              ) : (
                <span className="text-battle-muted italic font-mono text-[11px]">₹0 spent</span>
              )}
            </div>
          </div>

          {/* Purse Leader */}
          <div className="flex items-center gap-2 border-r border-battle-border/60 pr-2">
            <div className="w-8 h-8 rounded-xl bg-brand-cyan/15 border border-brand-cyan/30 text-brand-cyan flex items-center justify-center shrink-0">
              <Coins className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast font-bold block leading-none mb-0.5">
                Purse Leader
              </span>
              {strategyIndicators?.highestPurseTeam ? (
                <div className="truncate text-white font-broadcast font-bold flex items-center gap-1">
                  <span>{strategyIndicators.highestPurseTeam.logo}</span>
                  <span className="truncate">{strategyIndicators.highestPurseTeam.name}</span>
                  <span className="text-brand-cyan font-mono text-[11px] shrink-0">
                    (₹{strategyIndicators.highestPurseTeam.purse} Cr)
                  </span>
                </div>
              ) : (
                <span className="text-battle-muted italic font-mono text-[11px]">N/A</span>
              )}
            </div>
          </div>

          {/* Market Clearance */}
          <div className="flex items-center gap-2 border-r border-battle-border/60 pr-2">
            <div className="w-8 h-8 rounded-xl bg-brand-purple/15 border border-brand-purple/30 text-brand-purple flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast font-bold block leading-none mb-0.5">
                Market Clearance
              </span>
              <div className="text-[11px] font-mono flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">{strategyIndicators?.soldCount || 0} Sold</span>
                <span className="text-battle-muted">•</span>
                <span className="text-rose-400">{strategyIndicators?.unsoldCount || 0} Unsold</span>
                <span className="text-battle-muted">•</span>
                <span className="text-amber-400">{strategyIndicators?.pendingCount || 0} Pending</span>
              </div>
            </div>
          </div>

          {/* Lot Progress */}
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-battle-muted uppercase tracking-wider font-broadcast font-bold block leading-none mb-0.5">
                Lot Progress
              </span>
              <span className="text-[11px] font-mono font-bold text-white">
                Lot #{strategyIndicators?.currentLotNumber || 1} of {strategyIndicators?.totalLots || totalLots} ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN BROADCAST ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
        
        {/* LEFT COLUMN: TEAM PURSE BOARD (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[640px] overflow-hidden border border-battle-border">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-battle-border">
            <span className="text-xs font-black text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              Franchise Purse Board ({teams.length})
            </span>
            <button
              onClick={() => setActivePage('teams')}
              className="text-[11px] text-brand-cyan hover:underline font-broadcast font-bold tracking-wide"
            >
              Full Roster →
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {teams.map((t) => {
              const isLeading = highestBidder === t.id;
              const squadCount = auction.items.filter((i) => i.soldTo === t.id).length;
              const pendingLots = auction.items.filter((i) => i.status === 'pending');
              const budget = calculateFranchiseBudgetHealth({
                team: t,
                rules,
                pendingLots,
                currentSquadCount: squadCount,
              });
              const canAffordNext = t.purse >= nextCalculatedBid;

              return (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isLeading
                      ? 'bg-battle-surface border-brand-cyan shadow-glow-cyan'
                      : 'bg-battle-surface/70 border-battle-border hover:border-battle-borderLight'
                  }`}
                >
                  {/* Team accent vertical bar */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: t.color }}
                  />

                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1 rounded-xl bg-battle-bg border border-battle-border shadow-sm">
                        {t.logo || '🛡️'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-broadcast font-bold text-sm text-white truncate max-w-[110px]">
                            {t.name}
                          </h4>
                          {isLeading && (
                            <Badge variant="cyan" pulse className="px-1.5 py-0 text-[9px]">
                              LEAD
                            </Badge>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-broadcast font-bold uppercase border ${
                              budget.status === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : budget.status === 'caution'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                            title={budget.reason}
                          >
                            {budget.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-battle-muted font-medium block">
                          Squad: {budget.playersAcquired}/{rules.maxSquadSize} ({budget.remainingSquadSlots} req) • Spent: {currency.symbol}{budget.totalSpent} Cr ({budget.purseConsumedPct}%)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-battle-muted uppercase block font-broadcast font-bold">
                        Remaining
                      </span>
                      <span className="text-sm font-mono font-bold block text-white">
                        {formatCurrency(t.purse, currency)}
                      </span>
                      <span className="text-[10px] text-brand-cyan font-mono block" title="Average budget available per remaining required slot">
                        Avg: {currency.symbol}{budget.avgAvailablePerSlot} Cr/slot
                      </span>
                    </div>
                  </div>

                  {/* Purse Health Progress Bar */}
                  <div className="mt-2 pl-2">
                    <div className="flex justify-between text-[10px] text-battle-muted font-mono mb-1">
                      <span>Reserve: {currency.symbol}{budget.minRequiredReserve} Cr</span>
                      <span className={budget.status === 'critical' ? 'text-rose-400 font-bold' : budget.status === 'caution' ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {100 - budget.purseConsumedPct}% Purse Left
                      </span>
                    </div>
                    <div className="w-full bg-battle-bg rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          budget.status === 'critical'
                            ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                            : budget.status === 'caution'
                            ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                        }`}
                        style={{ width: `${Math.max(5, 100 - budget.purseConsumedPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning if team cannot afford next bid or has deficit */}
                  {!canAffordNext && !isLeading && (
                    <div className="mt-2 pl-2 flex items-center gap-1 text-[10px] text-rose-400 font-broadcast font-bold">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Cannot afford next bid ({formatCurrency(nextCalculatedBid, currency)})</span>
                    </div>
                  )}
                  {budget.status === 'critical' && canAffordNext && (
                    <div className="mt-1 pl-2 text-[9px] text-rose-400 font-mono italic">
                      ⚠️ {budget.reason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: MAIN REDESIGNED AUCTION STAGE (6 cols, BIDBATTLE 8.2) */}
        <div className="lg:col-span-6">
          <LiveAuctionCard
            currentItem={currentItem}
            auction={auction}
            currentBid={currentBid}
            highestBidder={highestBidder}
            currentLeaderTeam={currentLeaderTeam}
            timer={timer}
            isTimerRunning={isTimerRunning}
            toggleTimer={toggleTimer}
            confirmSold={confirmSold}
            markUnsold={markUnsold}
            advanceToNextItem={advanceToNextItem}
            onTeamBid={handleTeamBidClick}
            onCustomBid={(teamId, amount) => {
              if (!teamId) {
                toast.error('Select a franchise first for jump bid');
                return;
              }
              const parsed = Number(amount);
              if (isNaN(parsed) || parsed <= 0) {
                toast.error('Enter a valid positive number');
                return;
              }
              const res = placeBid(teamId, parsed);
              if (!res.success) {
                toast.error(res.reason || 'Invalid custom bid');
              } else {
                toast.success(`Jump bid placed: ${res.team.name} bid ${formatCurrency(parsed, currency)}!`);
              }
            }}
            nextCalculatedBid={nextCalculatedBid}
            currentIncrement={currentIncrement}
            currentTierLabel={currentTierLabel}
            isRatingHidden={isRatingHidden}
            teams={teams}
            currency={currency}
          />
        </div>

        {/* RIGHT COLUMN: SUPPORTING INTELLIGENCE, TIMELINE & SAFE UNDO (3 cols, BIDBATTLE 8.2) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[680px] overflow-hidden border border-battle-border space-y-3">
          
          {/* Automatic Progressive Increment Status Banner (BIDBATTLE 7.2) */}
          <div className="p-3 rounded-2xl bg-battle-bg border border-brand-orange/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-orange uppercase tracking-wider font-broadcast flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-orange" />
                Progressive Increment Tier
              </span>
              <span className="text-xs font-mono text-brand-cyan font-black">
                +{currency.symbol}{currentIncrement.toFixed(2)} Cr
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-battle-muted bg-battle-surface px-2.5 py-1 rounded-xl border border-battle-border">
              <span className="truncate max-w-[180px]">{currentTierLabel}</span>
              <span className="text-emerald-400 font-bold ml-1">Live</span>
            </div>
          </div>

          {/* Bid History Feed & Timeline Tabs with Safe Undo (BIDBATTLE 7.7) */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden pt-1">
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-battle-border">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRightTab('bids')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all ${
                    rightTab === 'bids'
                      ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/40 shadow-sm'
                      : 'text-battle-muted hover:text-white'
                  }`}
                >
                  <Radio className="w-3 h-3 text-brand-purple" />
                  <span>Bid Log ({bidHistory.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRightTab('timeline')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all ${
                    rightTab === 'timeline'
                      ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                      : 'text-battle-muted hover:text-white'
                  }`}
                >
                  <Activity className="w-3 h-3 text-brand-cyan" />
                  <span>Timeline ({(auction.activityTimeline || []).length})</span>
                </button>
              </div>

              {canUndo && (
                <button
                  type="button"
                  onClick={requestUndo}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-broadcast font-bold flex items-center gap-1 hover:underline px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30"
                  title="Request Safe Undo with Rollback Impact"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              )}
            </div>

            {/* TAB CONTENT: BIDS */}
            {rightTab === 'bids' && (
              <div className="space-y-1.5 overflow-y-auto max-h-40 pr-1">
                {bidHistory.map((bid, idx) => {
                  const isFirst = idx === 0;
                  return (
                    <div
                      key={bid.id || idx}
                      className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isFirst
                          ? 'bg-battle-surface border-amber-500/60 shadow-sm'
                          : 'bg-battle-surface/40 border-battle-border/60 text-battle-muted'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>{bid.teamLogo || '🛡️'}</span>
                        <span className={`font-broadcast font-bold text-xs ${isFirst ? 'text-white' : 'text-battle-text'}`}>
                          {bid.teamName}
                        </span>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <span className={`font-mono font-bold ${isFirst ? 'text-amber-400' : 'text-battle-text'}`}>
                          {formatCurrency(bid.amount, currency)}
                        </span>
                        <span className="text-[9px] text-battle-muted font-mono">{bid.timestamp}</span>
                      </div>
                    </div>
                  );
                })}

                {bidHistory.length === 0 && (
                  <div className="py-4 text-center text-battle-muted text-[11px] italic">
                    Awaiting opening bid on the block.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TIMELINE */}
            {rightTab === 'timeline' && (
              <div className="space-y-1.5 overflow-y-auto max-h-40 pr-1">
                {(auction.activityTimeline || []).map((tl) => (
                  <div
                    key={tl.id}
                    className="p-2 rounded-xl border border-battle-border/70 bg-battle-surface/50 text-xs transition-all hover:border-battle-border"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{tl.icon || '📌'}</span>
                        <span className="font-broadcast font-bold text-white text-[11px] truncate">
                          {tl.title}
                        </span>
                      </div>
                      <span className="text-[9px] text-battle-muted font-mono shrink-0 ml-1">
                        {tl.timestamp}
                      </span>
                    </div>
                    {tl.description && (
                      <p className="text-[10px] text-battle-muted truncate pl-5 font-mono">
                        {tl.description}
                      </p>
                    )}
                  </div>
                ))}

                {(!auction.activityTimeline || auction.activityTimeline.length === 0) && (
                  <div className="py-4 text-center text-battle-muted text-[11px] italic">
                    Auction timeline initialized. Events will record here.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. RECENT ACTIVITY TICKER STRIP */}
      <div className="battle-panel rounded-2xl px-4 py-2 border border-battle-border flex items-center gap-3 overflow-hidden text-xs font-broadcast">
        <div className="flex items-center gap-1.5 text-brand-neon font-bold uppercase tracking-wider shrink-0">
          <Activity className="w-3.5 h-3.5" />
          <span>ARENA TICKER:</span>
        </div>

        <div className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-4 py-0.5">
          {activityList.map((act) => (
            <span
              key={act.id}
              className={`inline-flex items-center gap-1.5 text-xs ${
                act.type === 'sold'
                  ? 'text-emerald-300 font-bold'
                  : act.type === 'unsold'
                  ? 'text-rose-300 font-bold'
                  : act.type === 'undo'
                  ? 'text-amber-300'
                  : 'text-battle-text'
              }`}
            >
              <span>{act.text}</span>
              <span className="text-[10px] text-battle-muted font-mono">({act.timestamp})</span>
              <span className="text-battle-border">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 4. MODALS & DRAWERS */}
      {showSettingsModal && (
        <AuctionSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          rules={rules}
          currency={currency}
          onSaveRules={(newRules) => {
            updateAuctionSettings(newRules);
            toast.success('Live arena rules updated!');
          }}
        />
      )}

      {showQueueDrawer && (
        <LotQueueDrawer
          isOpen={showQueueDrawer}
          onClose={() => setShowQueueDrawer(false)}
          items={auction.items}
          currentIndex={auction.currentItemIndex}
          teams={teams}
          currency={currency}
          isRatingHidden={isRatingHidden}
          scoreMetricLabel={scoreMetricLabel}
        />
      )}

      {saleCelebration && (
        <SoldCelebrationModal
          saleData={saleCelebration}
          currency={currency}
          onNext={advanceToNextItem}
        />
      )}

      {unsoldPrompt && (
        <UnsoldPromptModal
          unsoldData={unsoldPrompt}
          currency={currency}
          onNext={advanceToNextItem}
          onReAuctionNow={() => reAuctionItem(unsoldPrompt.item.id)}
        />
      )}

      {activeEvent && (
        <RandomEventModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
        />
      )}

      {/* Safe Undo Confirmation Modal (BIDBATTLE 7.7) */}
      <UndoConfirmModal
        isOpen={Boolean(undoConfirmDialog)}
        dialogData={undoConfirmDialog}
        onConfirm={executeConfirmedUndo}
        onCancel={cancelUndo}
      />

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full p-6 rounded-3xl battle-panel border border-battle-border text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
            <h3 className="font-broadcast font-bold text-white text-lg uppercase">Exit Tournament?</h3>
            <p className="text-xs text-battle-muted">
              Your auction progress is saved locally. You can resume anytime from the Home page.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={() => setShowExitConfirm(false)} className="w-full">
                Stay In Arena
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setShowExitConfirm(false);
                  setActivePage('home');
                }}
                className="w-full"
              >
                Exit to Home
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
