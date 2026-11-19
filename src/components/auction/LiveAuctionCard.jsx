import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Play, 
  Pause, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Lock, 
  TrendingUp,
  Zap,
  Flame
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrency } from '../common/CurrencyDisplay';

/**
 * BIDBATTLE 8.3 - Screen-Fit Main Auction Stage Card (Centre Column)
 * - Focused on Player Artwork, Identity & Live Bid Economics
 * - Shows Current Highest Bid AND Next Calculated Bid simultaneously
 * - Screen-fit responsive proportions for 1366x768 & 1080p
 * - Rating protection when hidden ratings rule applies
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
  nextCalculatedBid,
  currentIncrement,
  currentTierLabel,
  isRatingHidden,
  currency = { symbol: '₹' },
}) => {
  const [justOutbid, setJustOutbid] = useState(false);
  const prevBidRef = useRef(currentBid);

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
    <div
      className={`bg-[#222F43] rounded-3xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 border-2 h-full ${
        cardState === 'sold'
          ? 'border-[#91A98B] shadow-lg'
          : cardState === 'new_bid'
          ? 'border-[#D97858] shadow-lg'
          : cardState === 'paused'
          ? 'border-[#D4B879]'
          : cardState === 'unsold'
          ? 'border-rose-900/60'
          : 'border-[#39465A] shadow-xl'
      }`}
    >
      {/* Dynamic Ambient Background Glow in Leading Franchise Color */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
        style={{ backgroundColor: currentLeaderTeam?.color || '#D97858' }}
      />

      {/* TOP BAR: LOT NUMBER, STATUS STATE, & VISUALLY PROMINENT COUNTDOWN CLOCK */}
      <div className="flex items-center justify-between gap-2 mb-3 z-10 shrink-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] shadow-inner">
            LOT #{auction.currentItemIndex + 1} OF {auction.items.length}
          </span>

          {/* Active Card State Pill */}
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-heading font-bold tracking-wider uppercase ${currentStateBadge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{currentStateBadge.label}</span>
          </div>

          {currentItem.role && (
            <Badge variant="subtle" className="hidden sm:inline-flex text-[10px] py-0.5 bg-[#2C394C] text-[#AEB9CC] border-[#39465A]">
              {currentItem.role}
            </Badge>
          )}
        </div>

        {/* Urgency Countdown Timer */}
        <div className="flex items-center gap-1.5 shrink-0">
          <motion.div
            animate={timer <= 5 && isTimerRunning ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.6 }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border font-mono font-bold transition-all ${
              !isTimerRunning
                ? 'bg-[#111827] border-[#39465A] text-[#AEB9CC]'
                : timer <= 5
                ? 'bg-[#111827] border-rose-600 text-rose-400 animate-pulse'
                : 'bg-[#111827] border-[#39465A] text-[#F5F3EE]'
            }`}
          >
            <Clock className={`w-3.5 h-3.5 ${timer <= 5 && isTimerRunning ? 'text-rose-400 animate-spin' : 'text-[#AEB9CC]'}`} />
            <span className="text-xl font-bold leading-none">{timer}s</span>
          </motion.div>

          {/* Clock Pause/Resume Trigger */}
          <button
            onClick={toggleTimer}
            title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Auction Clock'}
            className="p-2 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
          >
            {isTimerRunning ? (
              <Pause className="w-3.5 h-3.5 text-[#F5F3EE]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#F5F3EE] fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION A: PLAYER SPOTLIGHT (Primary Visual Focus) */}
      <div className="relative rounded-2xl overflow-hidden bg-[#111827] border border-[#39465A] shadow-sm my-1.5 z-10 group flex-1 min-h-[180px] max-h-[260px] flex flex-col justify-end">
        {currentItem.imageUrl ? (
          <img
            src={currentItem.imageUrl}
            alt={currentItem.name}
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111827]">
            <span className="text-4xl p-3.5 rounded-2xl bg-[#222F43] border border-[#39465A]">
              {currentItem.imdbRating ? '🍿' : currentItem.movie ? '🎭' : '⭐'}
            </span>
          </div>
        )}

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/75 to-transparent pointer-events-none" />

        {/* Overlay Player Metadata & Economics */}
        <div className="relative p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 z-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              {currentItem.movie && (
                <span className="px-2 py-0.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] text-[10px] font-heading font-medium">
                  🎬 {currentItem.movie}
                </span>
              )}
              {currentItem.actor && (
                <span className="px-2 py-0.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[#F5F3EE] text-[10px] font-heading font-medium">
                  🎭 {currentItem.actor}
                </span>
              )}
              {currentItem.year && (
                <span className="px-2 py-0.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[#AEB9CC] text-[10px] font-mono">
                  {currentItem.year}
                </span>
              )}
            </div>

            <h2 className="text-3xl sm:text-4xl font-title tracking-wider text-[#F5F3EE] uppercase leading-tight truncate">
              {currentItem.name}
            </h2>

            {currentItem.director && (
              <span className="text-[11px] text-[#AEB9CC] block font-sans truncate">
                Directed by <strong className="text-[#F5F3EE]">{currentItem.director}</strong> {currentItem.genre ? `• ${currentItem.genre}` : ''}
              </span>
            )}
          </div>

          {/* Base Price & Official Rating Capsules */}
          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            <div className="px-2.5 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-right">
              <span className="text-[8px] text-[#AEB9CC] uppercase font-heading font-bold block leading-none mb-0.5">
                BASE PRICE
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-[#F5F3EE] leading-none">
                {formatCurrency(currentItem.basePrice, currency)}
              </span>
            </div>

            <div className="px-2.5 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-right">
              <span className="text-[8px] text-[#AEB9CC] uppercase font-heading font-bold block leading-none mb-0.5">
                RATING
              </span>
              {/* Ratings strictly hidden during active bidding across all auctions */}
              <span className="font-mono text-[11px] text-[#D4B879] flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3 text-[#D4B879]" /> Hidden
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: LIVE BID DISPLAY (Current Highest Bid + Next Calculated Bid) */}
      <div className="my-1.5 p-3.5 sm:p-4 rounded-2xl bg-[#111827] border border-[#39465A] text-center z-10 relative overflow-hidden shrink-0">
        <div className="flex items-center justify-between text-[11px] text-[#AEB9CC] font-heading font-semibold mb-0.5 px-1">
          <span className="uppercase tracking-widest text-[10px]">
            CURRENT HIGHEST BID
          </span>
          <span className="text-[#D4B879] font-mono text-[10px] font-bold">
            {currentTierLabel}
          </span>
        </div>

        {/* Animated Numerical Bid Value */}
        <div className="font-mono text-5xl sm:text-6xl font-bold tracking-tight text-[#F5F3EE] py-1">
          <AnimatedNumber
            value={currentBid}
            format={(v) => formatCurrency(v, currency)}
          />
        </div>

        {/* Live Leader Capsule */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {currentLeaderTeam ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-heading font-semibold text-xs tracking-wide transition-all bg-[#222F43]"
              style={{
                borderColor: currentLeaderTeam.color,
                color: currentLeaderTeam.color,
              }}
            >
              <span className="text-sm">{currentLeaderTeam.logo || '🛡️'}</span>
              <span>{currentLeaderTeam.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span className="text-[9px] uppercase tracking-wider font-mono px-1 py-0.2 rounded bg-[#111827] font-bold text-[#F5F3EE]">
                LEADER
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-[#AEB9CC] font-medium italic font-sans">
              Awaiting opening bid at base price ({formatCurrency(currentItem.basePrice, currency)})
            </span>
          )}
        </div>

        {/* NEXT CALCULATED BID — Prominently displayed right on the Centre Stage */}
        <div className="mt-2.5 pt-2 border-t border-[#39465A] flex items-center justify-between px-2 text-xs">
          <span className="font-heading font-medium text-[#AEB9CC] flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#D97858]" />
            <span>NEXT CALCULATED BID:</span>
          </span>
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <span className="text-[#F5F3EE] text-sm sm:text-base">
              {formatCurrency(nextCalculatedBid, currency)}
            </span>
            <span className="text-[10px] text-[#91A98B]">
              (+{currency.symbol}{currentIncrement.toFixed(2)} Cr tier)
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
