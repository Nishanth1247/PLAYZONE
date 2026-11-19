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
  ChevronRight, 
  Zap, 
  Users, 
  ArrowRight, 
  Shield, 
  Coins, 
  Settings,
  Layers,
  Volume2,
  VolumeX,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Activity,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../common/CurrencyDisplay';
import { getScoreMetricLabel } from '../../services/presets';
import { openGameRules } from '../rules/GameRules';
import { 
  calculateNextBid, 
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
import { SpecialSettlementModal } from './SpecialSettlementModal';
import { LiveAuctionCard } from './LiveAuctionCard';

/**
 * BIDBATTLE 8.3 - Screen-Fit Three-Column Auction Arena
 * - Left Column: Team/Franchise Information (Purse, Spent, Acquired, Health, Active State)
 * - Centre Column: Main Game Stage (Player Spotlight Artwork, Name, Live Bid, Next Bid, Timer)
 * - Right Column: Actions and Controls (4 Franchise Quick Bid Buttons, Pause/Resume, Undo, Gavel, Special Settlement)
 * - Screen-fit responsive design tailored for 1366x768 and 1920x1080 without vertical scroll clutter
 */
export const LiveAuction = () => {
  const {
    auction,
    getCurrentItem,
    placeBid,
    canUndo,
    requestUndo,
    executeConfirmedUndo,
    cancelUndo,
    undoConfirmDialog,
    confirmSold,
    markUnsold,
    specialSettlementDialog,
    confirmSpecialSettlement,
    cancelSpecialSettlement,
    advanceToNextItem,
    reAuctionItem,
    toggleTimer,
    resetTimer,
    triggerRandomEvent,
    activeEvent,
    setActiveEvent,
    saleCelebration,
    unsoldPrompt,
    setActivePage,
    updateAuctionSettings,
    isMuted,
    setIsMuted,
  } = useAuction();

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQueueDrawer, setShowQueueDrawer] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const currentItem = getCurrentItem();

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
  // BIDBATTLE 8.4: Strict Rating Concealment globally during active auctions
  const isRatingHidden = true;

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

  // Handle Quick Team Bid Click (Debounced, no live toast popups per Part 2B)
  const handleTeamBidClick = (teamId) => {
    if (isSubmittingBid || !isTimerRunning) return;
    setIsSubmittingBid(true);
    const res = placeBid(teamId, nextCalculatedBid);
    if (!res.success) {
      toast.error(res.reason || 'Invalid bid action');
    }
    setTimeout(() => setIsSubmittingBid(false), 350);
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

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex flex-col justify-between p-2 sm:p-4 max-w-[1750px] mx-auto select-none space-y-2.5">
      
      {/* 1. TOP BROADCAST CONTROL BAR */}
      <div className="battle-panel rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-md shrink-0">
        {/* Left: Live status, Tournament name, Lot counter */}
        <div className="flex items-center gap-3">
          <Badge variant="orange" pulse className="text-[10px] py-0.5">
            LIVE ARENA
          </Badge>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-broadcast font-bold text-white text-sm sm:text-base leading-tight truncate max-w-[200px] sm:max-w-xs">
                {auction.name}
              </h1>
              <Badge variant="purple" className="text-[9px] py-0 hidden sm:inline-flex">
                {currentItem.category || auction.category}
              </Badge>
              <Badge variant={currentMode?.badgeVariant || 'cyan'} className="text-[9px] py-0 font-mono hidden md:inline-flex">
                {currentMode?.badge || 'Classic 20s'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] text-battle-muted font-broadcast font-medium mt-0.5">
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
        <div className="hidden xl:flex items-center gap-3 w-56">
          <div className="w-full bg-battle-bg rounded-full h-1.5 overflow-hidden border border-battle-border">
            <div
              className="h-full bg-gradient-to-r from-brand-purple via-brand-cyan to-brand-neon transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Actions (Rules, Queue, Event, Timer, Sound, Settings, Exit) */}
        <div className="flex items-center gap-1.5">
          {/* Official Rulebook Trigger */}
          <button
            onClick={() => openGameRules('auction')}
            className="px-2.5 py-1 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] text-xs font-heading font-bold flex items-center gap-1.5 transition-all"
            title="Inspect official auction rules and tiebreaker matrix"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#D4B879]" />
            <span className="hidden md:inline">Rules</span>
          </button>

          {/* Lot Queue Drawer Trigger */}
          <button
            onClick={() => setShowQueueDrawer(true)}
            className="px-2.5 py-1 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:text-white text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all"
            title="Inspect full lot queue and upcoming cards"
          >
            <Layers className="w-3.5 h-3.5 text-brand-purple" />
            <span className="hidden md:inline">Queue</span>
          </button>

          {rules?.randomEvents && (
            <button
              onClick={triggerRandomEvent}
              className="px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all shadow-glow-orange"
              title="Trigger Random Event / Sponsor Boost"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Event</span>
            </button>
          )}

          {/* Clock Pause/Resume */}
          <button
            onClick={toggleTimer}
            className={`px-2.5 py-1 rounded-xl border text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all ${
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
            title={isMuted ? 'Sound muted' : 'Sound enabled'}
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
            className="px-2 py-1 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900 text-rose-300 text-xs font-broadcast font-bold"
          >
            Exit
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN BATTLE-STYLE SCREEN-FIT ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
        
        {/* LEFT COLUMN: TEAM INFORMATION & SQUAD SLOTS (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[660px] overflow-hidden border border-battle-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-battle-border">
            <span className="text-xs font-black text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Squad Capacity ({teams.length})</span>
            </span>
            <button
              onClick={() => setActivePage('teams')}
              className="text-[10px] text-brand-cyan hover:underline font-broadcast font-bold tracking-wide"
            >
              Full Roster →
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {teams.map((t) => {
              const isLeading = highestBidder === t.id;
              const squadCount = auction.items.filter((i) => i.soldTo === t.id).length;
              const targetSquad = rules.maxSquadSize || 8;
              const isFull = squadCount >= targetSquad;
              const remainingSlots = Math.max(0, targetSquad - squadCount);
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
                      : isFull
                      ? 'bg-battle-surface/40 border-battle-border opacity-70'
                      : 'bg-battle-surface/70 border-battle-border'
                  }`}
                >
                  {/* Accent vertical stripe */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: t.color }}
                  />

                  <div className="pl-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-xl bg-battle-bg border border-battle-border shadow-sm flex items-center justify-center overflow-hidden font-broadcast font-black text-sm"
                          style={{ color: t.color }}
                        >
                          {t.logo && (t.logo.startsWith('http') || t.logo.startsWith('data:')) ? (
                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{t.logo || t.shortName || t.name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-broadcast font-bold text-sm text-white truncate max-w-[100px]">
                              {t.name}
                            </h4>
                            {isFull ? (
                              <Badge variant="neon" className="px-1.5 py-0 text-[8px]">
                                READY
                              </Badge>
                            ) : isLeading ? (
                              <Badge variant="subtle" className="px-1.5 py-0 text-[8px] uppercase">
                                LEAD
                              </Badge>
                            ) : null}
                          </div>
                          <span className="text-[10px] text-battle-muted font-medium block">
                            Purse: {formatCurrency(t.purse, currency)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-sm font-black ${isFull ? 'text-brand-neon' : 'text-white'}`}>
                          {squadCount} / {targetSquad}
                        </span>
                        <span className="text-[9px] text-battle-muted uppercase block font-bold">
                          {isFull ? 'Full Squad' : `${remainingSlots} Slots Left`}
                        </span>
                      </div>
                    </div>

                    {/* Squad capacity progress bar */}
                    <div className="w-full bg-battle-bg rounded-full h-1.5 mt-2 overflow-hidden border border-battle-border/60">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          backgroundColor: isFull ? '#91A98B' : t.color,
                          width: `${Math.min(100, (squadCount / targetSquad) * 100)}%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-battle-muted mt-1.5 font-mono">
                      <span>Spent: {currency.symbol}{budget.totalSpent} Cr</span>
                      <span>Avg/slot: {currency.symbol}{budget.avgAvailablePerSlot} Cr</span>
                    </div>

                    {!canAffordNext && !isLeading && (
                      <div className="mt-1 flex items-center gap-1 text-[9px] text-rose-400 font-broadcast font-bold">
                        <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                        <span>Cannot afford next bid</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-battle-surface/40 border border-battle-border text-[11px] text-battle-muted flex items-center justify-between">
            <span>Target: {rules.maxSquadSize || 8} Slots Each</span>
            <span className="text-emerald-400 font-bold font-mono">Solvency Guard Active</span>
          </div>
        </div>

        {/* CENTRE COLUMN: THE STAGE & HIGHEST BID (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <LiveAuctionCard
            currentItem={currentItem}
            auction={auction}
            currentBid={currentBid}
            highestBidder={highestBidder}
            currentLeaderTeam={currentLeaderTeam}
            timer={timer}
            isTimerRunning={isTimerRunning}
            toggleTimer={toggleTimer}
            nextCalculatedBid={nextCalculatedBid}
            currentIncrement={currentIncrement}
            currentTierLabel={currentTierLabel}
            isRatingHidden={isRatingHidden}
            currency={currency}
            confirmSold={confirmSold}
            markUnsold={markUnsold}
          />
        </div>

        {/* RIGHT COLUMN: PROGRESSIVE INCREMENT & BID TRIGGERS (4 cols) */}
        <div className="lg:col-span-4 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[660px] overflow-hidden border border-battle-border space-y-3">
          
          {/* Automatic Progressive Increment Banner */}
          <div className="p-3 rounded-2xl bg-battle-bg border border-brand-orange/40 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-orange uppercase tracking-wider font-broadcast flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-orange" />
                Automatic Progressive Increment
              </span>
              <span className="text-xs font-mono text-brand-cyan font-black">
                +{currency.symbol}{currentIncrement.toFixed(2)} Cr
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-battle-muted bg-battle-surface px-2.5 py-1 rounded-xl border border-battle-border">
              <span className="truncate max-w-[220px]">{currentTierLabel}</span>
              <span className="text-emerald-400 font-bold ml-1">Live</span>
            </div>
          </div>

          {/* Participating Franchise Bid Buttons in 2x2 Grid */}
          <div className="space-y-2 flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-battle-muted uppercase font-bold tracking-wider font-broadcast">
                Franchise Bid Triggers ({teams.length})
              </span>
              <span className="text-[10px] font-mono text-brand-cyan font-bold">
                Next: {formatCurrency(nextCalculatedBid, currency)}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${teams.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 ${teams.length > 4 ? 'max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1' : ''}`}>
              {teams.map((team) => {
                const isLeading = highestBidder === team.id;
                const squadCount = auction.items.filter((i) => i.soldTo === team.id).length;
                const targetSquad = rules.maxSquadSize || 8;
                const isSquadFull = squadCount >= targetSquad;
                const canAfford = team.purse >= nextCalculatedBid;
                const isDisabled = !isTimerRunning || (isLeading && rules.antiSelfBidding) || !canAfford || isSquadFull || isSubmittingBid;

                let actionLabel = !highestBidder
                  ? `BID ${formatCurrency(nextCalculatedBid, currency)}`
                  : `BID ${formatCurrency(nextCalculatedBid, currency)}`;
                let subReason = '';

                if (isLeading && rules.antiSelfBidding) {
                  actionLabel = '👑 LEADING';
                  subReason = 'Cannot outbid self';
                } else if (isSquadFull) {
                  actionLabel = 'SQUAD FULL';
                  subReason = `Limit ${targetSquad} reached`;
                } else if (!canAfford) {
                  actionLabel = '⚠️ NO PURSE';
                  subReason = `Has ${formatCurrency(team.purse, currency)}`;
                } else if (!isTimerRunning) {
                  actionLabel = 'PAUSED';
                  subReason = 'Resume clock to bid';
                }

                return (
                  <motion.button
                    key={team.id}
                    type="button"
                    disabled={isDisabled}
                    whileHover={isDisabled ? undefined : { scale: 1.02 }}
                    whileTap={isDisabled ? undefined : { scale: 0.98 }}
                    onClick={() => handleTeamBidClick(team.id)}
                    title={subReason}
                    className={`${teams.length > 4 ? 'p-2 sm:p-2.5' : 'p-3'} rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                      isDisabled
                        ? 'bg-battle-surface/40 border-battle-border opacity-45 cursor-not-allowed text-battle-muted'
                        : 'bg-battle-surface shadow-md hover:shadow-xl cursor-pointer'
                    }`}
                    style={{
                      borderColor: isDisabled ? undefined : team.color,
                      boxShadow: isDisabled ? undefined : `0 4px 18px ${team.color}25`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-lg bg-battle-bg border border-battle-border shadow-sm flex items-center justify-center overflow-hidden text-[10px] font-broadcast font-black"
                          style={{ color: team.color }}
                        >
                          {team.logo && (team.logo.startsWith('http') || team.logo.startsWith('data:')) ? (
                            <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{team.logo || team.shortName || team.name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-broadcast font-bold text-xs text-white truncate max-w-[90px]">
                          {team.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-brand-neon font-bold">
                        {formatCurrency(team.purse, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span
                        className="font-black text-xs uppercase tracking-wider font-broadcast"
                        style={{ color: isDisabled ? undefined : team.color }}
                      >
                        {actionLabel}
                      </span>
                      {subReason && (
                        <span className="text-[9px] text-battle-muted font-broadcast truncate max-w-[80px]">
                          {subReason}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Quick Utilities & Mandatory Settlement Toolbar */}
          <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={toggleTimer}
                title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Clock'}
                className="p-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white flex items-center justify-center gap-1 text-[11px] font-broadcast font-bold transition-all"
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={requestUndo}
                disabled={!canUndo}
                title="Safe Undo Last Transaction"
                className={`p-1.5 rounded-xl border flex items-center justify-center gap-1 text-[11px] font-broadcast font-bold transition-all ${
                  canUndo
                    ? 'bg-battle-surface hover:bg-battle-card border-battle-border text-white'
                    : 'bg-battle-surface/30 border-battle-border text-battle-muted/40 cursor-not-allowed'
                }`}
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo</span>
              </button>

              <button
                onClick={() => setShowQueueDrawer(true)}
                title="View Lot Queue"
                className="p-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white flex items-center justify-center gap-1 text-[11px] font-broadcast font-bold transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Queue</span>
              </button>
            </div>

            {/* Mandatory Base Price Settlement trigger (BIDBATTLE 8.3) */}
            {highestBidder ? (
              <button
                onClick={markUnsold}
                className="w-full py-1.5 px-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-[#39465A] text-[10px] font-broadcast font-bold text-[#AEB9CC] hover:text-[#F5F3EE] flex items-center justify-center gap-1.5 transition-all"
                title="Mandatory Settlement: Award lot to active bidder at original base price"
              >
                <AlertTriangle className="w-3 h-3 text-[#D97858]" />
                <span>Settle Lot @ Base Price ({formatCurrency(currentItem.basePrice, currency)})</span>
              </button>
            ) : (
              <button
                onClick={markUnsold}
                className="w-full py-1.5 px-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-[#39465A] text-[10px] font-broadcast font-bold text-[#AEB9CC] hover:text-[#F5F3EE] flex items-center justify-center gap-1.5 transition-all"
              >
                <XCircle className="w-3 h-3 text-[#AEB9CC]" />
                <span>Mark Unsold / Pass Lot</span>
              </button>
            )}

            {/* SKIP / NEXT LOT */}
            <button
              onClick={advanceToNextItem}
              className="w-full py-1 px-2 rounded-xl bg-transparent hover:bg-battle-surface text-[10px] font-broadcast font-bold text-[#AEB9CC] hover:text-[#F5F3EE] flex items-center justify-center gap-1 transition-all"
            >
              <span>Skip to Next Lot</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

        </div>

      </div>

      {/* OVERLAY MODALS */}
      {/* 1. Mandatory Last-Bidder Settlement Confirmation Modal (BIDBATTLE 8.3) */}
      <SpecialSettlementModal
        dialogData={specialSettlementDialog}
        currency={currency}
        onConfirm={confirmSpecialSettlement}
        onCancel={cancelSpecialSettlement}
      />

      {/* 2. Safe Undo Confirmation Modal */}
      <UndoConfirmModal
        dialogData={undoConfirmDialog}
        currency={currency}
        onConfirm={executeConfirmedUndo}
        onCancel={cancelUndo}
      />

      {/* 3. Sold Hammer Celebration Modal */}
      <SoldCelebrationModal
        saleData={saleCelebration}
        currency={currency}
        onNext={advanceToNextItem}
      />

      {/* 4. Unsold Prompt Modal */}
      <UnsoldPromptModal
        promptData={unsoldPrompt}
        currency={currency}
        onReAuction={() => reAuctionItem(currentItem.id)}
        onNext={advanceToNextItem}
      />

      {/* 5. In-Auction Settings Modal */}
      <AuctionSettingsModal
        isOpen={showSettingsModal}
        rules={rules}
        onClose={() => setShowSettingsModal(false)}
        onSave={updateAuctionSettings}
      />

      {/* 6. Lot Queue Drawer */}
      <LotQueueDrawer
        isOpen={showQueueDrawer}
        items={auction.items}
        currentIndex={auction.currentItemIndex}
        currency={currency}
        onClose={() => setShowQueueDrawer(false)}
      />

      {/* 7. Random Event / Sponsor Boost Modal */}
      <RandomEventModal
        activeEvent={activeEvent}
        onClose={() => setActiveEvent(null)}
      />

      {/* 8. Exit Arena Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-sm w-full p-6 rounded-3xl battle-panel border border-rose-900 text-center space-y-4">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="font-broadcast text-lg font-bold text-white uppercase">Exit Live Arena?</h3>
            <p className="text-xs text-battle-muted">
              Your auction tournament progress is securely saved in local storage.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowExitConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setShowExitConfirm(false);
                  setActivePage('home');
                }}
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
