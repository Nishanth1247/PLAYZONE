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

      {/* 2. MAIN SCREEN-FIT 3-COLUMN BROADCAST ARENA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 items-stretch">
        
        {/* LEFT COLUMN: TEAM INFORMATION & PURSE BOARD (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-battle-border overflow-hidden">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-battle-border">
            <span className="text-xs font-black text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              Franchise Purse Board ({teams.length})
            </span>
            <button
              onClick={() => setActivePage('teams')}
              className="text-[10px] text-brand-cyan hover:underline font-broadcast font-bold tracking-wide"
            >
              Full Roster →
            </button>
          </div>

          <div className="space-y-2 overflow-y-auto pr-1 flex-1">
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
                  className={`p-2.5 rounded-2xl border transition-all relative overflow-hidden ${
                    isLeading
                      ? 'bg-[#222F43] border-[#F5F3EE] ring-1 ring-[#F5F3EE]/40 shadow-sm'
                      : 'bg-[#222F43] border-[#39465A] hover:border-[#39465A]'
                  }`}
                >
                  {/* Franchise color accent vertical bar */}
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: t.color }}
                  />

                  <div className="flex items-center justify-between pl-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl p-1 rounded-xl bg-[#2C394C] border border-[#39465A] shadow-sm">
                        {t.logo || '🛡️'}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-heading font-bold text-xs text-[#F5F3EE] truncate max-w-[90px]">
                            {t.name}
                          </h4>
                          {isLeading && (
                            <Badge variant="subtle" className="px-1 py-0 text-[8px]">
                              LEAD
                            </Badge>
                          )}
                          <span
                            className={`px-1 py-0.2 rounded text-[8px] font-heading font-bold uppercase border ${
                              budget.status === 'critical'
                                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                : budget.status === 'caution'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-[#2C394C] text-[#AEB9CC] border-[#39465A]'
                            }`}
                            title={budget.reason}
                          >
                            {budget.label}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#AEB9CC] font-medium block">
                          Squad: {budget.playersAcquired}/{rules.maxSquadSize || 8} • Spent: {currency.symbol}{budget.totalSpent} Cr
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] text-[#AEB9CC] uppercase block font-heading font-bold">
                        Purse
                      </span>
                      <span className="text-xs font-mono font-bold block text-[#F5F3EE]">
                        {formatCurrency(t.purse, currency)}
                      </span>
                      <span className="text-[9px] text-[#AEB9CC] font-mono block">
                        Avg: {currency.symbol}{budget.avgAvailablePerSlot} Cr
                      </span>
                    </div>
                  </div>

                  {/* Purse Health Bar */}
                  <div className="mt-1.5 pl-2">
                    <div className="w-full bg-battle-bg rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          budget.status === 'critical'
                            ? 'bg-rose-500'
                            : budget.status === 'caution'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, 100 - budget.purseConsumedPct)}%` }}
                      />
                    </div>
                  </div>

                  {!canAffordNext && !isLeading && (
                    <div className="mt-1 pl-2 flex items-center gap-1 text-[9px] text-rose-400 font-broadcast font-bold">
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      <span>Cannot afford next bid</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTRE COLUMN: MAIN GAME STAGE (6 cols) */}
        <div className="lg:col-span-6 flex flex-col justify-between">
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
          />
        </div>

        {/* RIGHT COLUMN: ACTIONS AND CONTROLS (3 cols) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-3.5 flex flex-col justify-between border border-battle-border overflow-hidden space-y-2.5">
          
          {/* 1. FRANCHISE QUICK BIDDING TRIGGERS (4 Buttons with next calculated bid) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-heading font-bold text-[#AEB9CC]">
              <span>FRANCHISE QUICK BIDS</span>
              <span className="text-[#F5F3EE] font-mono text-[10px]">
                Next: {formatCurrency(nextCalculatedBid, currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {teams.map((team) => {
                const isLeading = highestBidder === team.id;
                const squadCount = auction.items.filter((i) => i.soldTo === team.id).length;
                const squadFull = squadCount >= (rules.maxSquadSize || 8);
                const canAfford = team.purse >= nextCalculatedBid;
                const isDisabled = !isTimerRunning || (isLeading && rules.antiSelfBidding) || !canAfford || squadFull || isSubmittingBid;

                let actionText = `BID ${formatCurrency(nextCalculatedBid, currency)}`;
                let statusText = `Purse: ${formatCurrency(team.purse, currency)}`;

                if (isLeading && rules.antiSelfBidding) {
                  actionText = '👑 LEADING';
                  statusText = 'Active Leader';
                } else if (!canAfford) {
                  actionText = '⚠️ NO PURSE';
                  statusText = `Has ${formatCurrency(team.purse, currency)}`;
                } else if (squadFull) {
                  actionText = 'SQUAD FULL';
                  statusText = `Max ${rules.maxSquadSize || 8} reached`;
                } else if (!isTimerRunning) {
                  actionText = 'PAUSED';
                  statusText = 'Resume clock to bid';
                }

                return (
                  <motion.button
                    key={team.id}
                    type="button"
                    disabled={isDisabled}
                    whileHover={isDisabled ? undefined : { scale: 1.01 }}
                    whileTap={isDisabled ? undefined : { scale: 0.98 }}
                    onClick={() => handleTeamBidClick(team.id)}
                    className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between ${
                      isLeading
                        ? 'bg-[#222F43] border-[#F5F3EE] ring-1 ring-[#F5F3EE]/40 shadow-sm'
                        : isDisabled
                        ? 'bg-[#222F43]/40 border-[#39465A] opacity-45 cursor-not-allowed text-[#AEB9CC]'
                        : 'bg-[#222F43] hover:bg-[#2C394C] cursor-pointer shadow-sm'
                    }`}
                    style={{
                      borderColor: isLeading ? '#F5F3EE' : isDisabled ? undefined : team.color,
                    }}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base">{team.logo || '🛡️'}</span>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-xs text-[#F5F3EE] truncate block">
                          {team.name}
                        </span>
                        <span className="text-[9px] font-mono text-[#AEB9CC] block">
                          {statusText}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className="font-heading font-black text-xs uppercase tracking-wider block"
                        style={{ color: isLeading ? '#F5F3EE' : isDisabled ? undefined : team.color }}
                      >
                        {actionText}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* 2. QUICK UTILITIES (Pause/Resume, Undo, Queue) */}
          <div className="grid grid-cols-3 gap-1.5 py-1.5 border-t border-b border-[#39465A]">
            <button
              onClick={toggleTimer}
              title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Clock'}
              className="p-1.5 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] flex flex-col items-center justify-center gap-0.5 text-[10px] font-heading font-bold"
            >
              {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={requestUndo}
              disabled={!canUndo}
              title="Safe Undo Last Transaction"
              className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 text-[10px] font-heading font-bold ${
                canUndo
                  ? 'bg-[#222F43] hover:bg-[#2C394C] border-[#39465A] text-[#F5F3EE]'
                  : 'bg-[#222F43]/30 border-[#39465A] text-[#AEB9CC]/40 cursor-not-allowed'
              }`}
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>

            <button
              onClick={() => setShowQueueDrawer(true)}
              title="View Lot Queue"
              className="p-1.5 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] flex flex-col items-center justify-center gap-0.5 text-[10px] font-heading font-bold"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Queue</span>
            </button>
          </div>

          {/* 3. HOST GAVEL HAMMER & SETTLEMENT CONTROLS */}
          <div className="space-y-1.5">
            {/* SOLD Hammer Button */}
            <Button
              variant="primary"
              size="lg"
              disabled={!highestBidder}
              onClick={confirmSold}
              className="w-full font-heading text-sm font-black py-2.5 flex items-center justify-center gap-1.5 bg-[#D97858] text-[#F5F3EE] hover:bg-white"
            >
              <Gavel className="w-4 h-4 fill-current" />
              <span>SOLD! ({formatCurrency(currentBid, currency)})</span>
            </Button>

            {/* UNSOLD or MANDATORY LAST-BIDDER SPECIAL SETTLEMENT (BIDBATTLE 8.3) */}
            {highestBidder ? (
              <Button
                variant="secondary"
                size="md"
                onClick={markUnsold}
                className="w-full font-heading text-[11px] font-bold bg-[#39465A] text-[#F5F3EE] hover:bg-[#3a3a3a] border border-[#404040] py-2 flex items-center justify-center gap-1"
                title="Mandatory Settlement: Award to last accepted bidder at original base price"
              >
                <AlertTriangle className="w-3 h-3 text-[#AEB9CC]" />
                <span>CLOSE LOT (SETTLE @ BASE PRICE)</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={markUnsold}
                className="w-full font-heading text-[11px] font-bold bg-[#39465A] text-[#F5F3EE] hover:bg-[#3a3a3a] border border-[#404040] py-2 flex items-center justify-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>MARK UNSOLD (NO BIDS)</span>
              </Button>
            )}

            {/* SKIP / NEXT LOT */}
            <Button
              variant="secondary"
              size="sm"
              onClick={advanceToNextItem}
              className="w-full font-heading text-[11px] border border-[#39465A] bg-[#222F43] hover:bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE] py-1.5 flex items-center justify-center gap-1"
            >
              <span>Skip to Next Lot</span>
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>

          {/* 4. PROGRESSIVE TIER PILL */}
          <div className="p-1.5 rounded-xl bg-battle-bg border border-battle-border/80 flex items-center justify-between text-[9px] font-mono shrink-0">
            <span className="text-battle-muted uppercase">Increment Tier</span>
            <span className="text-brand-orange font-bold">+{currency.symbol}{currentIncrement.toFixed(2)} Cr ({currentTierLabel})</span>
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
