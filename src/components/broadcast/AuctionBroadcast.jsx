import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Clock, 
  Coins, 
  Trophy, 
  Users, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Flame,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../common/CurrencyDisplay';
import { broadcastService } from '../../services/broadcastService';
import { getProgressiveTierLabel } from '../../services/auctionEngine';

export const AuctionBroadcast = ({
  auctionState,
  tournament,
  subview = 'live', // 'intro' | 'live' | 'results'
}) => {
  const [lastBidAmount, setLastBidAmount] = useState(auctionState?.currentBid || 0);
  const [isBidPulsing, setIsBidPulsing] = useState(false);

  const currentItem = auctionState?.items?.[auctionState?.currentItemIndex] || null;
  const teams = auctionState?.teams || [];
  const currentBid = auctionState?.currentBid || 0;
  const highestBidderId = auctionState?.highestBidder;
  const highestBidderTeam = teams.find((t) => t.id === highestBidderId);
  const timer = auctionState?.timer ?? 20;
  const isTimerRunning = auctionState?.isTimerRunning ?? false;
  const bidHistory = auctionState?.bidHistory || [];

  // Animate bid pulse whenever currentBid updates
  useEffect(() => {
    if (currentBid !== lastBidAmount) {
      setLastBidAmount(currentBid);
      setIsBidPulsing(true);
      broadcastService.playAudio('bid_placed');
      const timerId = setTimeout(() => setIsBidPulsing(false), 600);
      return () => clearTimeout(timerId);
    }
  }, [currentBid, lastBidAmount]);

  if (!currentItem) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-[#AEB9CC] font-heading">
        No active auction lots found.
      </div>
    );
  }

  // Derive special settlement vs normal sale if current lot has a settlement status
  const isSpecialSettlement = currentItem.settlementType === 'special_base_price' || currentItem.settlementType === 'mandatory_last_bidder';
  const isSold = currentItem.status === 'sold';
  const isUnsold = currentItem.status === 'unsold';

  // Compute auction summary metrics
  const soldItems = (auctionState?.items || []).filter((i) => i.status === 'sold');
  const highestPurchase = soldItems.length > 0 
    ? [...soldItems].sort((a, b) => (Number(b.soldPrice) || 0) - (Number(a.soldPrice) || 0))[0]
    : null;

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between relative z-10">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#39465A]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-[#D4B879]/20 border border-[#D4B879]/40 text-[#D4B879] text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Gavel className="w-3.5 h-3.5" />
            <span>LIVE AUCTION BROADCAST</span>
          </div>
          <span className="text-xs font-mono text-[#AEB9CC]">
            LOT #{auctionState.currentItemIndex + 1} OF {auctionState.items?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-heading">
          {/* Bid Increment Tier */}
          <div className="hidden sm:flex items-center gap-1.5 text-[#AEB9CC]">
            <span className="text-[10px] uppercase font-mono">Increment Tier:</span>
            <span className="font-bold text-[#F5F3EE]">
              {getProgressiveTierLabel(currentBid)}
            </span>
          </div>

          {/* Broadcast Timer */}
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-2 font-mono font-black text-sm shadow-md transition-all ${
            timer <= 5
              ? 'bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse'
              : 'bg-[#222F43] border-[#39465A] text-[#F5F3EE]'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timer <= 5 ? 'text-rose-400' : 'text-[#D4B879]'}`} />
            <span>00:{timer < 10 ? `0${timer}` : timer}</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN CENTER STAGE */}
      <div className="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* LEFT: PLAYER SPOTLIGHT ARTWORK CARD (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl p-6 border bg-[#192231]/90 border-[#39465A] shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
          {/* Top category badge */}
          <div className="flex items-center justify-between gap-2 z-10">
            <span className="px-3 py-1 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879] uppercase">
              {currentItem.category || currentItem.role || 'Player Lot'}
            </span>
            <span className="text-xs font-mono font-bold text-[#AEB9CC]">
              Base: ₹{currentItem.basePrice} Cr
            </span>
          </div>

          {/* Large Player Artwork / Spotlight */}
          <div className="my-auto py-4 text-center z-10">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl mx-auto mb-4 border-2 border-[#39465A] shadow-2xl overflow-hidden bg-[#111827] flex items-center justify-center">
              {currentItem.image ? (
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="font-heading font-black text-5xl text-[#D4B879]">
                  {currentItem.name?.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE] tracking-tight break-words">
              {currentItem.name}
            </h2>

            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-[#AEB9CC] font-sans">
              <span>{currentItem.role || 'Combat Fighter'}</span>
              <span>•</span>
              <span className="text-[#91A98B] font-mono">Rating Strictly Concealed</span>
            </div>
          </div>

          {/* Bottom Lot Metadata */}
          <div className="pt-3 border-t border-[#39465A]/80 flex items-center justify-between text-xs font-heading text-[#AEB9CC] z-10">
            <span>Tournament: {tournament?.name || 'PLAYZONE'}</span>
            <span className="font-mono text-[#D4B879]">PASS & PLAY</span>
          </div>

          {/* Soft Glow Ambient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent opacity-60" />
        </div>

        {/* RIGHT: LIVE BIDDING & SPOTLIGHT BOARD (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Big Live Bid Card */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all duration-300 ${
              isBidPulsing
                ? 'scale-[1.02] bg-[#222F43] border-[#00D9FF]'
                : 'bg-[#192231] border-[#39465A]'
            }`}
            style={{
              borderColor: highestBidderTeam?.color || '#39465A',
              boxShadow: highestBidderTeam ? `0 0 40px ${highestBidderTeam.color}25` : undefined,
            }}
          >
            {/* Top Stripe with Team Color */}
            <div
              className="absolute top-0 left-0 right-0 h-2.5 transition-all"
              style={{ backgroundColor: highestBidderTeam?.color || '#D4B879' }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#AEB9CC] tracking-widest uppercase block">
                  CURRENT HIGHEST BID
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <motion.span
                    key={currentBid}
                    initial={{ scale: 1.15, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="font-mono font-black text-4xl sm:text-6xl text-[#F5F3EE] tracking-tight"
                  >
                    {formatCurrency(currentBid)}
                  </motion.span>
                </div>
              </div>

              {/* Leading Franchise Showcase */}
              <div className="text-left sm:text-right">
                <span className="text-xs font-mono font-bold text-[#AEB9CC] uppercase block">
                  LEADER SPOTLIGHT
                </span>
                {highestBidderTeam ? (
                  <div className="inline-flex items-center gap-2 mt-1 px-4 py-2 rounded-2xl bg-[#111827] border border-[#39465A]">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ backgroundColor: highestBidderTeam.color }}
                    />
                    <span className="font-heading font-black text-lg text-[#F5F3EE]">
                      {highestBidderTeam.name}
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl bg-[#222F43] text-xs font-heading font-bold text-[#AEB9CC]">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Awaiting First Bid</span>
                  </div>
                )}
              </div>
            </div>

            {/* Special Settlement Notice / Normal Sold Banner */}
            {isSpecialSettlement && (
              <div className="mt-4 p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-2.5 text-amber-300 text-xs font-heading font-bold">
                <Zap className="w-4 h-4 fill-current shrink-0" />
                <span>SPECIAL SETTLEMENT: Mandatory Last-Bidder Base-Price Allocation</span>
              </div>
            )}
          </div>

          {/* Franchise Purse Gauges */}
          <div className="rounded-3xl p-5 border bg-[#192231]/80 border-[#39465A] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#39465A]">
              <span className="text-xs font-heading font-bold text-[#F5F3EE] flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#00D9FF]" />
                <span>FRANCHISE BUDGET & SQUAD GAUGES</span>
              </span>
              <span className="text-[11px] font-mono text-[#AEB9CC]">
                {teams.length} Franchises Active
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {teams.map((t) => {
                const isLeader = t.id === highestBidderId;
                return (
                  <div
                    key={t.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isLeader
                        ? 'bg-[#222F43] border-[#00D9FF] shadow-sm'
                        : 'bg-[#111827] border-[#39465A]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: t.color || '#D4B879' }}
                      />
                      <span className="font-heading font-bold text-xs text-[#F5F3EE] truncate">
                        {t.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="text-[#AEB9CC]">Purse:</span>
                      <span className="font-bold text-[#00D9FF]">₹{t.purse} Cr</span>
                    </div>

                    <div className="flex items-center justify-between font-mono text-[11px] mt-0.5">
                      <span className="text-[#AEB9CC]">Squad:</span>
                      <span className="font-bold text-[#F5F3EE]">
                        {t.squad?.length || 0} Lots
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Bid History Ticker */}
          <div className="rounded-2xl p-3 bg-[#111827] border border-[#39465A] flex items-center gap-3 overflow-x-auto text-xs font-heading">
            <span className="text-[10px] font-mono uppercase font-bold text-[#AEB9CC] shrink-0">
              LATEST BIDS:
            </span>
            {bidHistory.length > 0 ? (
              bidHistory.slice(0, 4).map((bh, idx) => {
                const bTeam = teams.find((t) => t.id === bh.teamId);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#222F43] border border-[#39465A] shrink-0"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: bTeam?.color || '#D4B879' }}
                    />
                    <span className="font-bold text-[#F5F3EE]">{bTeam?.name || 'Bidder'}</span>
                    <span className="font-mono text-[#00D9FF]">₹{bh.amount} Cr</span>
                  </div>
                );
              })
            ) : (
              <span className="text-[#AEB9CC] text-xs">No bids placed on this lot yet</span>
            )}
          </div>
        </div>
      </div>

      {/* 3. BOTTOM TICKER BAR */}
      <div className="pt-3 border-t border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-heading text-[#AEB9CC]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#D4B879]" />
          <span>Ratings strictly concealed during active bidding phase.</span>
        </div>

        {highestPurchase && (
          <div className="flex items-center gap-1.5">
            <span className="text-[#AEB9CC]">Top Buy so far:</span>
            <span className="font-bold text-[#F5F3EE]">{highestPurchase.name}</span>
            <span className="font-mono font-bold text-[#D4B879]">
              (₹{highestPurchase.soldPrice} Cr)
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
