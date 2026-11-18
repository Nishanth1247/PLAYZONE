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
  AUCTION_MODES
} from '../../services/auctionEngine';
import { SoldCelebrationModal } from './SoldCelebrationModal';
import { UnsoldPromptModal } from './UnsoldPromptModal';
import { RandomEventModal } from './RandomEventModal';
import { AuctionSettingsModal } from './AuctionSettingsModal';
import { LotQueueDrawer } from './LotQueueDrawer';

export const LiveAuction = () => {
  const {
    auction,
    getCurrentItem,
    placeBid,
    placeIncrementBid,
    undoLastBid,
    canUndo,
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
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
              const spent = Number((t.initialPurse - t.purse).toFixed(2));
              const health = getPurseHealth(t.purse, t.initialPurse);
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
                        </div>
                        <span className="text-[10px] text-battle-muted font-medium block">
                          Squad: {squadCount}/{rules.maxSquadSize} • Spent: {currency.symbol}{spent} Cr
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-battle-muted uppercase block font-broadcast font-bold">
                        Remaining
                      </span>
                      <span className={`text-sm font-mono font-bold block ${health.textClass}`}>
                        {formatCurrency(t.purse, currency)}
                      </span>
                      <span className="text-[10px] text-battle-muted font-mono block">
                        Start: {currency.symbol}{t.initialPurse} Cr
                      </span>
                    </div>
                  </div>

                  {/* Purse Health Progress Bar */}
                  <div className="mt-2 pl-2">
                    <div className="flex justify-between text-[10px] text-battle-muted font-mono mb-1">
                      <span>Available</span>
                      <span className={health.textClass}>{health.percentage}%</span>
                    </div>
                    <div className="w-full bg-battle-bg rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${health.bgClass}`}
                        style={{ width: `${health.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Warning if team cannot afford next bid */}
                  {!canAffordNext && !isLeading && (
                    <div className="mt-2 pl-2 flex items-center gap-1 text-[10px] text-rose-400 font-broadcast font-bold">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>Cannot afford next bid ({formatCurrency(nextCalculatedBid, currency)})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CENTER COLUMN: MAIN AUCTION STAGE (5 cols) */}
        <div className="lg:col-span-5 battle-panel rounded-3xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden border border-brand-purple/40">
          
          {/* Ambient Spotlight Lighting */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl opacity-25 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: currentLeaderTeam?.color || '#9147FF' }}
          />

          {/* Stage Top Strip: Lot number, Role, Timer */}
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-battle-surface border border-battle-border text-xs font-broadcast font-bold text-battle-text">
                LOT #{auction.currentItemIndex + 1}
              </span>
              <Badge variant="purple">
                {currentItem.role || 'Superstar'}
              </Badge>
              {isRatingHidden ? (
                <Badge variant="cyan" title="Surprise-Reveal Mode active">
                  🔒 Hidden Rating
                </Badge>
              ) : currentItem.imdbRating ? (
                <Badge variant="gold" className="font-mono">
                  ★ IMDb RATING: {currentItem.imdbRating} / 10
                </Badge>
              ) : currentItem.rating ? (
                <Badge variant="gold" className="font-mono">
                  ★ {scoreMetricLabel}: {currentItem.rating}/100
                </Badge>
              ) : null}
            </div>

            {/* Glowing Countdown Clock with Urgency Pulse */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={timer <= 5 ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-bold transition-all ${
                  timer <= 5
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/50 animate-pulse'
                    : 'bg-battle-surface border-battle-border text-brand-cyan'
                }`}
              >
                <Clock className={`w-4 h-4 ${timer <= 5 ? 'text-rose-400 animate-spin' : 'text-brand-cyan'}`} />
                <span className="text-2xl font-black">{timer}s</span>
              </motion.div>
            </div>
          </div>

          {/* Lot Featured Media & Bio */}
          <div className="text-center my-1 z-10">
            {/* Featured Poster / Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-battle-surface to-battle-card border-2 border-battle-border shadow-xl flex items-center justify-center text-5xl mb-2.5 shadow-glow-purple overflow-hidden">
              {currentItem.imageUrl ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <span>
                  {currentItem.imdbRating ? '🍿' : currentItem.movie ? '🎭' : '⭐'}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wide mb-1 leading-tight">
              {currentItem.name}
            </h2>

            {/* Metadata Badges for Movies / Characters */}
            {currentItem.movie && (
              <div className="flex flex-wrap items-center justify-center gap-2 my-1">
                <span className="px-3 py-0.5 rounded-xl bg-brand-purple/20 border border-brand-purple/40 text-purple-200 text-xs font-broadcast font-bold">
                  🎬 Film: {currentItem.movie}
                </span>
                {currentItem.actor && (
                  <span className="px-3 py-0.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-cyan-200 text-xs font-broadcast font-bold">
                    🎭 Star: {currentItem.actor}
                  </span>
                )}
              </div>
            )}

            {currentItem.director && (
              <div className="flex flex-wrap items-center justify-center gap-2 my-1">
                <span className="px-3 py-0.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-broadcast font-bold">
                  🎬 Dir: {currentItem.director} ({currentItem.year})
                </span>
                {currentItem.genre && (
                  <span className="px-3 py-0.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-cyan-200 text-xs font-broadcast font-bold">
                    🍿 {currentItem.genre}
                  </span>
                )}
                {currentItem.imdbId && (
                  <span className="px-2 py-0.5 rounded-xl bg-battle-surface border border-battle-border text-battle-muted font-mono text-[11px]">
                    ID: {currentItem.imdbId}
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-battle-muted max-w-md mx-auto line-clamp-2 my-1 leading-relaxed">
              {currentItem.desc || `Championship lot ready to make an immediate impact.`}
            </p>

            {/* Base price & score strip */}
            <div className="inline-flex items-center gap-3 mt-1.5 px-4 py-1 rounded-full bg-battle-surface border border-battle-border text-xs text-battle-muted font-broadcast">
              <div>
                <span className="mr-1.5 text-battle-muted">BASE PRICE:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatCurrency(currentItem.basePrice, currency)}
                </span>
              </div>
              <span className="text-battle-border">|</span>
              <div>
                {currentItem.imdbRating ? (
                  <span>
                    <span className="mr-1.5 text-amber-400 font-bold">★ IMDb RATING:</span>
                    <span className="font-mono font-bold text-white">
                      {currentItem.imdbRating} / 10
                    </span>
                    <span className="text-[10px] text-brand-neon ml-1 font-mono">
                      ({currentItem.rating} pts)
                    </span>
                  </span>
                ) : (
                  <span>
                    <span className="mr-1.5">{scoreMetricLabel.toUpperCase()}:</span>
                    {isRatingHidden ? (
                      <span className="font-mono font-bold text-brand-cyan">🔒 Hidden</span>
                    ) : (
                      <span className="font-mono font-bold text-brand-neon">
                        ★ {currentItem.rating} / 100
                      </span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* MASSIVE GLOWING BID DISPLAY */}
          <div className="my-2 p-4 rounded-3xl bg-battle-bg border border-battle-border shadow-inner text-center z-10 relative overflow-hidden">
            <span className="text-[11px] font-black uppercase tracking-widest text-battle-muted block mb-1 font-broadcast">
              CURRENT HIGHEST BID
            </span>

            <div className="font-broadcast text-6xl sm:text-7xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent neon-text-gold">
              <AnimatedNumber
                value={currentBid}
                format={(v) => formatCurrency(v, currency)}
              />
            </div>

            {/* Leading Team Spotlight Badge */}
            <div className="mt-2 flex items-center justify-center">
              {currentLeaderTeam ? (
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-lg font-broadcast font-bold text-sm tracking-wide"
                  style={{
                    backgroundColor: `${currentLeaderTeam.color}20`,
                    borderColor: currentLeaderTeam.color,
                    color: currentLeaderTeam.color,
                  }}
                >
                  <span className="text-lg">{currentLeaderTeam.logo}</span>
                  <span>{currentLeaderTeam.name}</span>
                  <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                </div>
              ) : (
                <span className="text-xs text-battle-muted font-medium italic font-broadcast">
                  Awaiting opening bid at base price ({formatCurrency(currentItem.basePrice, currency)})
                </span>
              )}
            </div>
          </div>

          {/* HOST GAVEL HAMMER CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 z-10">
            <Button
              variant="accent"
              size="lg"
              disabled={!highestBidder}
              onClick={confirmSold}
              className="font-broadcast text-lg shadow-glow-orange"
            >
              <Gavel className="w-5 h-5 fill-current" />
              <span>SOLD!</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={markUnsold}
              className="font-broadcast text-sm"
            >
              <span>MARK UNSOLD</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={advanceToNextItem}
              className="font-broadcast text-sm"
            >
              <span>SKIP / NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

        </div>

        {/* RIGHT COLUMN: BIDDING CONTROL & FAST INCREMENTS (4 cols) */}
        <div className="lg:col-span-4 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[640px] overflow-hidden border border-battle-border space-y-3">
          
          {/* Automatic Progressive Increment Status Banner (BIDBATTLE 7.2) */}
          <div className="p-3 rounded-2xl bg-battle-bg border border-brand-orange/40 space-y-1.5">
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

          {/* 4 Large Franchise Bidding Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-battle-muted uppercase font-bold tracking-wider font-broadcast">
                Franchise Bid Triggers ({teams.length})
              </span>
              <span className="text-[10px] font-mono text-brand-cyan font-bold">
                Next: {formatCurrency(nextCalculatedBid, currency)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {teams.map((t) => {
                const isLeading = highestBidder === t.id;
                const squadCount = auction.items.filter((i) => i.soldTo === t.id).length;
                const squadFull = squadCount >= rules.maxSquadSize;
                const canAfford = t.purse >= nextCalculatedBid;
                const isDisabled = (isLeading && rules.antiSelfBidding) || !canAfford || squadFull;

                let actionLabel = !highestBidder
                  ? `BID ${formatCurrency(nextCalculatedBid, currency)}`
                  : `BID ${formatCurrency(nextCalculatedBid, currency)} (+${currency.symbol}${currentIncrement.toFixed(2)} Cr)`;
                let subReason = '';

                if (isLeading && rules.antiSelfBidding) {
                  actionLabel = '👑 LEADING';
                  subReason = 'Cannot outbid self';
                } else if (!canAfford) {
                  actionLabel = '⚠️ NO PURSE';
                  subReason = `Has ${formatCurrency(t.purse, currency)}`;
                } else if (squadFull) {
                  actionLabel = 'SQUAD FULL';
                  subReason = `Max ${rules.maxSquadSize} reached`;
                }

                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    disabled={isDisabled}
                    whileHover={isDisabled ? undefined : { scale: 1.02 }}
                    whileTap={isDisabled ? undefined : { scale: 0.98 }}
                    onClick={() => handleTeamBidClick(t.id)}
                    title={subReason}
                    className={`p-3 rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                      isDisabled
                        ? 'bg-battle-surface/40 border-battle-border opacity-45 cursor-not-allowed text-battle-muted'
                        : 'bg-battle-surface shadow-md hover:shadow-xl cursor-pointer'
                    }`}
                    style={{
                      borderColor: isDisabled ? undefined : t.color,
                      boxShadow: isDisabled ? undefined : `0 4px 18px ${t.color}25`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.logo || '🛡️'}</span>
                        <span className="font-broadcast font-bold text-xs text-white truncate max-w-[90px]">
                          {t.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-brand-neon font-bold">
                        {formatCurrency(t.purse, currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span
                        className="font-black text-xs uppercase tracking-wider font-broadcast"
                        style={{ color: isDisabled ? undefined : t.color }}
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

          {/* Jump / Custom Bid Box */}
          <div className="p-3 rounded-2xl bg-battle-surface/80 border border-battle-border">
            <span className="text-[10px] font-black text-battle-muted uppercase tracking-wider block mb-1.5 font-broadcast">
              Custom / Jump Bid
            </span>

            <form onSubmit={handleCustomBidSubmit} className="flex gap-2">
              <select
                value={selectedCustomTeam}
                onChange={(e) => setSelectedCustomTeam(e.target.value)}
                className="w-1/2 bg-battle-bg border border-battle-border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple font-broadcast font-bold"
              >
                <option value="">Franchise...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({formatCurrency(t.purse, currency)})
                  </option>
                ))}
              </select>

              <input
                type="number"
                step="any"
                min="0"
                value={customBidAmount}
                onChange={(e) => setCustomBidAmount(e.target.value)}
                placeholder={`> ${currentBid}`}
                className="w-1/3 bg-battle-bg border border-battle-border rounded-xl px-2 py-1.5 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-400"
              />

              <Button variant="primary" size="sm" type="submit" className="shrink-0 text-xs px-3">
                Jump
              </Button>
            </form>
          </div>

          {/* Bid History Feed & Undo */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1">
                <Radio className="w-3 h-3 text-brand-purple" />
                Live Bid Log ({bidHistory.length})
              </span>

              {canUndo && (
                <button
                  type="button"
                  onClick={() => setShowUndoConfirm(true)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-broadcast font-bold flex items-center gap-1 hover:underline"
                >
                  <Undo2 className="w-3 h-3" />
                  Undo Last Bid
                </button>
              )}
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-36 pr-1">
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

      {/* Undo Confirmation Modal */}
      {showUndoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-sm w-full p-6 rounded-3xl battle-panel border border-battle-border text-center space-y-4">
            <Undo2 className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="font-broadcast font-bold text-white text-lg uppercase">Undo Previous Bid?</h3>
            <p className="text-xs text-battle-muted">
              This will revert the active bid to the preceding amount and restore leader state.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={() => setShowUndoConfirm(false)} className="w-full">
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setShowUndoConfirm(false);
                  undoLastBid();
                  toast.success('Undid previous bid');
                }}
                className="w-full"
              >
                Confirm Undo
              </Button>
            </div>
          </div>
        </div>
      )}

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
