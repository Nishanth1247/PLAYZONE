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
  Flame,
  Gavel
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrency } from '../common/CurrencyDisplay';

/**
 * BIDBATTLE Main Auction Stage Card (Centre Column)
 * - Directly adopts the visual standard of Battle Arena Auction Stage
 * - Symmetrical, focused on Player Artwork, Identity & Live Bid Economics
 * - Shows Current Highest Bid AND Next Calculated Bid simultaneously
 * - Screen-fit responsive proportions for 1366x768 & 1080p
 * - Rating concealment strictly enforced
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
  confirmSold,
  markUnsold,
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
      className={`battle-panel rounded-3xl p-4 sm:p-5 flex flex-col justify-between max-h-[660px] overflow-hidden relative transition-all duration-300 border-2 h-full ${
        cardState === 'sold'
          ? 'border-emerald-500/80 shadow-glow-neon'
          : cardState === 'new_bid'
          ? 'border-brand-cyan shadow-glow-cyan'
          : cardState === 'paused'
          ? 'border-amber-500/60'
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
      <div className="flex items-center justify-between gap-2 mb-2 z-10 shrink-0">
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

          {currentItem.category && (
            <Badge variant="cyan" className="hidden md:inline-flex text-[10px] py-0.5">
              {currentItem.category}
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
            <Clock className={`w-3.5 h-3.5 ${timer <= 5 && isTimerRunning ? 'text-rose-400 animate-spin' : 'text-[#D97858]'}`} />
            <span className="text-xl font-bold leading-none">{timer}s</span>
          </motion.div>

          {/* Clock Pause/Resume Trigger */}
          <button
            onClick={toggleTimer}
            title={isTimerRunning ? 'Pause Auction Clock' : 'Resume Auction Clock'}
            className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
          >
            {isTimerRunning ? (
              <Pause className="w-3.5 h-3.5 text-[#F5F3EE]" />
            ) : (
              <Play className="w-3.5 h-3.5 text-[#F5F3EE] fill-current" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION A: PLAYER SPOTLIGHT (Visual Standard from Battle Arena) */}
      <div className="text-center my-1 z-10">
        <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-[#222F43] to-[#2C394C] border-2 border-[#39465A] shadow-xl flex items-center justify-center text-5xl mb-2 overflow-hidden shadow-glow-orange group">
          {currentItem.imageUrl ? (
            <img
              src={currentItem.imageUrl}
              alt={currentItem.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span>{currentItem.movie ? '🎬' : '⭐'}</span>
          )}
        </div>

        <h2 className="font-heading sm:font-title text-2xl sm:text-3xl font-black text-[#F5F3EE] tracking-wide uppercase truncate px-2 leading-tight">
          {currentItem.name}
        </h2>

        {currentItem.movie && (
          <span className="text-xs text-brand-cyan font-bold block mt-0.5">
            Film: {currentItem.movie} {currentItem.actor ? `(${currentItem.actor})` : ''}
          </span>
        )}

        {currentItem.desc && (
          <p className="text-xs text-[#AEB9CC] max-w-md mx-auto line-clamp-2 my-1 leading-relaxed">
            {currentItem.desc}
          </p>
        )}

        {/* Base Price & Info Strip (NO RATINGS VISIBLE) */}
        <div className="inline-flex items-center gap-3 mt-1.5 px-4 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs text-[#AEB9CC] font-heading">
          <div>
            <span className="mr-1.5 text-[#AEB9CC]">BASE PRICE:</span>
            <span className="font-mono font-bold text-[#D4B879]">
              {formatCurrency(currentItem.basePrice, currency)}
            </span>
          </div>
          <span className="text-[#39465A]">|</span>
          <div>
            <span className="mr-1.5 text-[#AEB9CC]">ROLE:</span>
            <span className="font-mono font-bold text-[#F5F3EE]">
              {currentItem.role || currentItem.category || 'Standard'}
            </span>
          </div>
          <span className="text-[#39465A]">|</span>
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#AEB9CC]">
            <Lock className="w-3 h-3 text-[#D4B879]" />
            <span>Hidden</span>
          </div>
        </div>
      </div>

      {/* SECTION B: MASSIVE GLOWING BID DISPLAY */}
      <div className="my-2 p-4 rounded-3xl bg-[#2C394C] border border-[#39465A] shadow-inner text-center z-10 relative overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-[#AEB9CC] font-heading font-semibold mb-0.5 px-1">
          <span className="uppercase tracking-widest text-[10px] font-black">
            CURRENT HIGHEST BID
          </span>
          <span className="text-[#D4B879] font-mono text-[10px] font-bold">
            {currentTierLabel}
          </span>
        </div>

        {/* Animated Numerical Bid Value */}
        <div className="font-mono text-5xl sm:text-6xl font-black tracking-wider text-[#F5F3EE] py-0.5">
          <AnimatedNumber
            value={currentBid}
            format={(v) => formatCurrency(v, currency)}
          />
        </div>

        {/* Live Leader Capsule */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {currentLeaderTeam ? (
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border shadow-sm font-heading font-bold text-xs tracking-wide transition-all"
              style={{
                backgroundColor: `${currentLeaderTeam.color}25`,
                borderColor: currentLeaderTeam.color,
                color: '#F5F3EE',
              }}
            >
              <span className="text-base">{currentLeaderTeam.logo || '🛡️'}</span>
              <span>{currentLeaderTeam.name}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
              <span className="text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.2 rounded bg-[#111827] font-bold text-[#F5F3EE]">
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
        <div className="mt-2 pt-2 border-t border-[#39465A] flex items-center justify-between px-2 text-xs">
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

      {/* SECTION C: HOST HAMMER ACTION CONTROLS */}
      {confirmSold && markUnsold && (
        <div className="grid grid-cols-2 gap-2.5 z-10 mt-1">
          <Button
            variant="primary"
            size="lg"
            disabled={!highestBidder}
            onClick={confirmSold}
            className="font-heading text-sm font-black py-2.5 flex items-center justify-center gap-1.5 shadow-md"
          >
            <Gavel className="w-4 h-4 fill-current" />
            <span>SOLD!</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={markUnsold}
            className="font-heading text-xs font-bold py-2.5 bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#F5F3EE]"
          >
            <span>MARK UNSOLD</span>
          </Button>
        </div>
      )}

    </div>
  );
};
