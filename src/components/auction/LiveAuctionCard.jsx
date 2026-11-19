import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Clock, 
  Play, 
  Pause, 
  Flame, 
  Trophy, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  DollarSign, 
  Users, 
  Lock, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrency } from '../common/CurrencyDisplay';

/**
 * BIDBATTLE 8.2 - Premium Live Auction Stage Card
 * Features:
 * - High-impact Player Spotlight with dark gradient overlays
 * - Dynamic Live Bid Display with Live Leader and Previous Bid info
 * - Clear Auction Card States: Waiting, Active Bidding, New High Bid, Paused, Sold, Unsold, Reauction
 * - Responsive, Touch-friendly Primary & Franchise Bid Controls with Duplicate Prevention
 * - Strict Hidden Rating Protection when tournament rules mandate
 */
export const LiveAuctionCard = ({
  currentItem,
  auction,
  currentBid,
  highestBidder,
  currentLeaderTeam,
  timer,
  isTimerRunning,
  toggleTimer,
  confirmSold,
  markUnsold,
  advanceToNextItem,
  onTeamBid,
  onCustomBid,
  nextCalculatedBid,
  currentIncrement,
  currentTierLabel,
  isRatingHidden,
  teams = [],
  currency = { symbol: '₹' },
}) => {
  const [selectedCustomTeam, setSelectedCustomTeam] = useState('');
  const [customBidAmount, setCustomBidAmount] = useState('');
  const [showCustomBid, setShowCustomBid] = useState(false);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [justOutbid, setJustOutbid] = useState(false);

  const prevBidRef = useRef(currentBid);
  const rules = auction?.rules || {};

  // Detect new highest bid and trigger brief celebration flash
  useEffect(() => {
    if (currentBid > prevBidRef.current && highestBidder) {
      setJustOutbid(true);
      const timerId = setTimeout(() => setJustOutbid(false), 1800);
      prevBidRef.current = currentBid;
      return () => clearTimeout(timerId);
    }
    prevBidRef.current = currentBid;
  }, [currentBid, highestBidder]);

  // Determine current card visual state
  let cardState = 'bidding';
  if (currentItem?.status === 'sold') {
    cardState = 'sold';
  } else if (currentItem?.status === 'unsold') {
    cardState = 'unsold';
  } else if (currentItem?.isReauction) {
    cardState = 'reauction';
  } else if (!isTimerRunning) {
    cardState = 'paused';
  } else if (justOutbid) {
    cardState = 'new_bid';
  } else if (!highestBidder) {
    cardState = 'waiting';
  }

  // Bid History extraction
  const bidHistory = auction?.bidHistory || [];
  const previousBid = bidHistory.length > 1 ? bidHistory[bidHistory.length - 2] : null;

  // Handle protected franchise bid submission with duplicate protection
  const handleProtectedTeamBid = (teamId) => {
    if (isSubmittingBid || !isTimerRunning) return;
    setIsSubmittingBid(true);
    onTeamBid(teamId);
    setTimeout(() => setIsSubmittingBid(false), 450);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    if (isSubmittingBid || !isTimerRunning) return;
    onCustomBid(selectedCustomTeam, customBidAmount);
    setCustomBidAmount('');
  };

  // State Banner Configuration
  const stateBadgeConfig = {
    waiting: {
      label: 'AWAITING OPENING BID',
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: Clock,
    },
    bidding: {
      label: 'LIVE BIDDING WAR',
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      icon: TrendingUp,
    },
    new_bid: {
      label: 'NEW HIGHEST BID!',
      color: 'bg-emerald-500/30 text-emerald-300 border-emerald-400 shadow-glow-neon animate-pulse',
      icon: Sparkles,
    },
    paused: {
      label: 'AUCTION PAUSED',
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: Pause,
    },
    sold: {
      label: 'LOT HAMMERED SOLD',
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-glow-neon',
      icon: CheckCircle2,
    },
    unsold: {
      label: 'LOT PASSED UNSOLD',
      color: 'bg-rose-950/40 text-rose-300 border-rose-700',
      icon: XCircle,
    },
    reauction: {
      label: 'RE-AUCTION IN PROGRESS',
      color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: RotateCcw,
    },
  };

  const currentStateBadge = stateBadgeConfig[cardState] || stateBadgeConfig.bidding;
  const BadgeIcon = currentStateBadge.icon;

  return (
    <div className={`battle-panel rounded-3xl p-5 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-2 ${
      cardState === 'sold'
        ? 'border-emerald-500/80 shadow-glow-neon'
        : cardState === 'new_bid'
        ? 'border-brand-cyan shadow-glow-cyan'
        : cardState === 'paused'
        ? 'border-amber-500/60'
        : cardState === 'unsold'
        ? 'border-rose-900/60'
        : 'border-brand-purple/40 shadow-2xl'
    }`}>
      
      {/* Dynamic Ambient Background Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: currentLeaderTeam?.color || '#9147FF' }}
      />

      {/* TOP HEADER: LOT NUMBER, STATUS STATE, & VISUALLY PROMINENT COUNTDOWN CLOCK */}
      <div className="flex items-center justify-between gap-3 mb-4 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-battle-bg border border-battle-border text-xs font-broadcast font-bold text-white shadow-inner">
            LOT #{auction.currentItemIndex + 1} OF {auction.items.length}
          </span>

          {/* Active Card State Pill */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-broadcast font-bold tracking-wider uppercase ${currentStateBadge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{currentStateBadge.label}</span>
          </div>

          {currentItem.role && (
            <Badge variant="purple" className="hidden sm:inline-flex text-[11px]">
              {currentItem.role}
            </Badge>
          )}
        </div>

        {/* Prominent Urgency Countdown Timer */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={timer <= 5 && isTimerRunning ? { scale: [1, 1.08, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border font-mono font-bold transition-all shadow-md ${
              !isTimerRunning
                ? 'bg-amber-950/40 border-amber-600 text-amber-300'
                : timer <= 5
                ? 'bg-rose-950/90 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/50 animate-pulse ring-2 ring-rose-500/40'
                : 'bg-battle-bg border-battle-border text-brand-cyan'
            }`}
          >
            <Clock className={`w-4 h-4 ${timer <= 5 && isTimerRunning ? 'text-rose-400 animate-spin' : 'text-brand-cyan'}`} />
            <span className="text-2xl font-black leading-none">{timer}s</span>
          </motion.div>

          {/* Pause / Resume Button */}
          <button
            onClick={toggleTimer}
            title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Auction Clock'}
            className="p-2 rounded-xl bg-battle-bg hover:bg-battle-surface border border-battle-border text-battle-muted hover:text-white transition-colors"
          >
            {isTimerRunning ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 fill-current" />}
          </button>
        </div>
      </div>

      {/* SECTION A: PLAYER SPOTLIGHT (High-Impact Hero Artwork & Metadata) */}
      <div className="relative rounded-2xl overflow-hidden bg-battle-bg border border-battle-border/80 shadow-inner my-2 z-10 group">
        <div className="relative h-56 sm:h-64 w-full flex items-center justify-center overflow-hidden bg-gradient-to-t from-battle-card via-battle-bg to-dark-950">
          {currentItem.imageUrl ? (
            <img
              src={currentItem.imageUrl}
              alt={currentItem.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="text-6xl p-6 rounded-3xl bg-battle-surface/40 border border-battle-border/50 shadow-2xl">
              {currentItem.imdbRating ? '🍿' : currentItem.movie ? '🎭' : '⭐'}
            </div>
          )}

          {/* Dark Cinematic Gradient Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/60 to-transparent pointer-events-none" />

          {/* Bottom Overlay Info Container */}
          <div className="absolute bottom-3 left-4 right-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-2 z-10">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                {currentItem.movie && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-purple/40 border border-brand-purple/60 text-purple-200 text-[10px] font-broadcast font-bold">
                    🎬 Film: {currentItem.movie}
                  </span>
                )}
                {currentItem.actor && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-brand-cyan/40 border border-brand-cyan/60 text-cyan-200 text-[10px] font-broadcast font-bold">
                    🎭 Star: {currentItem.actor}
                  </span>
                )}
                {currentItem.year && (
                  <span className="px-2 py-0.5 rounded-lg bg-battle-surface border border-battle-border text-battle-muted text-[10px] font-mono">
                    {currentItem.year}
                  </span>
                )}
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wide leading-tight drop-shadow-lg">
                {currentItem.name}
              </h2>

              {currentItem.director && (
                <span className="text-xs text-battle-muted block font-broadcast">
                  Directed by <strong className="text-white">{currentItem.director}</strong> {currentItem.genre ? `• ${currentItem.genre}` : ''}
                </span>
              )}
            </div>

            {/* Price & Rating Capsule */}
            <div className="flex items-center justify-center sm:justify-end gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-battle-surface/90 border border-battle-border backdrop-blur-md text-right">
                <span className="text-[9px] text-battle-muted uppercase font-broadcast font-bold block leading-none mb-0.5">
                  BASE PRICE
                </span>
                <span className="font-mono text-base font-black text-amber-400 leading-none">
                  {formatCurrency(currentItem.basePrice, currency)}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-battle-surface/90 border border-battle-border backdrop-blur-md text-right">
                <span className="text-[9px] text-battle-muted uppercase font-broadcast font-bold block leading-none mb-0.5">
                  OFFICIAL RATING
                </span>
                {isRatingHidden ? (
                  <span className="font-mono text-xs text-battle-muted flex items-center gap-1 font-bold">
                    <Lock className="w-3 h-3 text-brand-purple" /> Hidden
                  </span>
                ) : (
                  <span className="font-mono text-base font-black text-brand-cyan leading-none">
                    ★ {currentItem.rating || currentItem.power || 80}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: LIVE BID DISPLAY (The central numerical hero element) */}
      <div className="my-3 p-4 sm:p-5 rounded-3xl bg-battle-bg border border-battle-border/90 shadow-inner text-center z-10 relative overflow-hidden">
        {/* Subtle Background Leading Glow */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: currentLeaderTeam?.color || '#9147FF' }}
        />

        <div className="flex items-center justify-between text-xs text-battle-muted font-broadcast font-bold mb-1 px-1">
          <span className="uppercase tracking-widest text-[11px]">
            CURRENT HIGHEST BID
          </span>
          <span className="text-brand-orange font-mono">
            {currentTierLabel}
          </span>
        </div>

        {/* Animated Numerical Display */}
        <div className="font-broadcast text-6xl sm:text-7xl lg:text-8xl font-black tracking-wider bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent neon-text-gold py-1">
          <AnimatedNumber
            value={currentBid}
            format={(v) => formatCurrency(v, currency)}
          />
        </div>

        {/* Current Leader / Live Leader Banner */}
        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3">
          {currentLeaderTeam ? (
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-lg font-broadcast font-bold text-sm tracking-wide transition-all"
              style={{
                backgroundColor: `${currentLeaderTeam.color}20`,
                borderColor: currentLeaderTeam.color,
                color: currentLeaderTeam.color,
                boxShadow: `0 0 16px ${currentLeaderTeam.color}30`,
              }}
            >
              <span className="text-lg">{currentLeaderTeam.logo || '🛡️'}</span>
              <span>{currentLeaderTeam.name}</span>
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span className="text-[10px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-battle-bg font-black">
                LIVE LEADER
              </span>
            </div>
          ) : (
            <span className="text-xs text-battle-muted font-medium italic font-broadcast">
              Awaiting opening bid at base price ({formatCurrency(currentItem.basePrice, currency)})
            </span>
          )}

          {/* Previous Bid Info */}
          {previousBid && (
            <span className="text-xs font-mono text-battle-muted">
              (Prev: {formatCurrency(previousBid.amount, currency)} by {previousBid.teamName})
            </span>
          )}
        </div>
      </div>

      {/* SECTION C: BIDDING CONTROLS & HOST HAMMER CONTROLS */}
      <div className="space-y-3 z-10">
        
        {/* Large Primary Franchise Bid Triggers (Lap & Touch Friendly) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-broadcast font-bold text-battle-muted">
            <span>QUICK BID TRIGGERS ({teams.length} FRANCHISES)</span>
            <span className="text-brand-cyan font-mono">
              Next Bid: {formatCurrency(nextCalculatedBid, currency)} (+{currency.symbol}{currentIncrement.toFixed(2)} Cr)
            </span>
          </div>

          <div className={`grid grid-cols-1 ${teams.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5`}>
            {teams.map((team) => {
              const isLeading = highestBidder === team.id;
              const squadCount = auction.items.filter((i) => i.soldTo === team.id).length;
              const squadFull = squadCount >= rules.maxSquadSize;
              const canAfford = team.purse >= nextCalculatedBid;
              const isDisabled = !isTimerRunning || (isLeading && rules.antiSelfBidding) || !canAfford || squadFull || isSubmittingBid;

              let actionText = !highestBidder
                ? `BID ${formatCurrency(nextCalculatedBid, currency)}`
                : `BID ${formatCurrency(nextCalculatedBid, currency)}`;
              let statusText = '';

              if (isLeading && rules.antiSelfBidding) {
                actionText = '👑 LEADING';
                statusText = 'Active Leader';
              } else if (!canAfford) {
                actionText = '⚠️ NO PURSE';
                statusText = `Has ${formatCurrency(team.purse, currency)}`;
              } else if (squadFull) {
                actionText = 'SQUAD FULL';
                statusText = `Max ${rules.maxSquadSize} reached`;
              } else if (!isTimerRunning) {
                actionText = 'PAUSED';
                statusText = 'Resume clock to bid';
              }

              return (
                <motion.button
                  key={team.id}
                  type="button"
                  disabled={isDisabled}
                  whileHover={isDisabled ? undefined : { scale: 1.02 }}
                  whileTap={isDisabled ? undefined : { scale: 0.98 }}
                  onClick={() => handleProtectedTeamBid(team.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                    isLeading
                      ? 'bg-battle-surface border-brand-cyan ring-2 ring-brand-cyan/70 shadow-glow-cyan'
                      : isDisabled
                      ? 'bg-battle-surface/40 border-battle-border opacity-45 cursor-not-allowed text-battle-muted'
                      : 'bg-battle-surface hover:bg-battle-card cursor-pointer shadow-md'
                  }`}
                  style={{
                    borderColor: isLeading ? '#00D9FF' : isDisabled ? undefined : team.color,
                    boxShadow: isLeading ? '0 0 20px rgba(0, 217, 255, 0.3)' : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{team.logo || '🛡️'}</span>
                      <span className="font-broadcast font-bold text-sm text-white truncate max-w-[100px]">
                        {team.name}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-brand-neon">
                      {formatCurrency(team.purse, currency)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span
                      className="font-black text-xs uppercase tracking-wider font-broadcast"
                      style={{ color: isLeading ? '#00D9FF' : isDisabled ? undefined : team.color }}
                    >
                      {actionText}
                    </span>
                    <span className="text-[10px] font-mono text-battle-muted">
                      {statusText || `+${currency.symbol}${currentIncrement.toFixed(2)} Cr`}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Secondary Custom Bid Drawer Toggle */}
        <div className="pt-1">
          {!showCustomBid ? (
            <button
              onClick={() => setShowCustomBid(true)}
              className="text-xs font-broadcast font-bold text-brand-cyan hover:underline flex items-center gap-1 mx-auto"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Need custom / jump bid amount? Click to open custom input</span>
            </button>
          ) : (
            <form onSubmit={handleCustomBidSubmit} className="p-3 rounded-2xl bg-battle-bg border border-battle-border flex flex-wrap sm:flex-nowrap gap-2 items-center">
              <select
                value={selectedCustomTeam}
                onChange={(e) => setSelectedCustomTeam(e.target.value)}
                className="w-full sm:w-1/2 bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-purple font-broadcast font-bold"
              >
                <option value="">Select Franchise...</option>
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
                placeholder={`Min ${formatCurrency(nextCalculatedBid, currency)}`}
                className="w-full sm:w-1/3 bg-battle-surface border border-battle-border rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-cyan font-mono"
              />

              <Button
                variant="primary"
                size="sm"
                type="submit"
                className="w-full sm:w-auto font-broadcast text-xs font-bold bg-brand-cyan text-black shrink-0"
              >
                Place Jump
              </Button>

              <button
                type="button"
                onClick={() => setShowCustomBid(false)}
                className="text-xs text-battle-muted hover:text-white px-1"
              >
                ✕
              </button>
            </form>
          )}
        </div>

        {/* HOST GAVEL HAMMER CONTROLS (SOLD! / UNSOLD / SKIP) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-battle-border/80">
          <Button
            variant="accent"
            size="lg"
            disabled={!highestBidder}
            onClick={confirmSold}
            className="font-broadcast text-lg shadow-glow-orange bg-brand-orange hover:bg-orange-600 font-black py-3.5"
          >
            <Gavel className="w-5 h-5 fill-current" />
            <span>SOLD!</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={markUnsold}
            className="font-broadcast text-sm border-battle-border hover:border-rose-500 text-rose-300 py-3.5"
          >
            <XCircle className="w-4 h-4 mr-1 text-rose-400" />
            <span>MARK UNSOLD</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={advanceToNextItem}
            className="font-broadcast text-sm border-battle-border hover:border-brand-cyan text-white py-3.5"
          >
            <span>SKIP / NEXT</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

      </div>

    </div>
  );
};
