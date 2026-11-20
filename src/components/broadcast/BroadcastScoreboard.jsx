import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Coins, 
  Clock, 
  ChevronUp, 
  ChevronDown,
  Users
} from 'lucide-react';
import { formatCurrency } from '../common/CurrencyDisplay';

export const BroadcastScoreboard = ({
  mode = 'auction', // 'auction' | 'battle' | 'party'
  style = 'compact', // 'compact' | 'expanded'
  auctionState,
  battleState,
  partyState,
  tournament,
  standings = [],
  onToggleStyle
}) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.25 }}
        className="fixed top-4 left-4 right-4 z-40 pointer-events-auto max-w-7xl mx-auto"
      >
        <div className="rounded-2xl bg-[#111827]/90 border border-[#39465A] shadow-2xl backdrop-blur-xl overflow-hidden text-[#F5F3EE]">
          {/* Top Brand & Arena Accent Stripe */}
          <div className="h-1 bg-gradient-to-r from-[#D4B879] via-[#00D9FF] to-[#D97858]" />

          {/* COMPACT VIEW */}
          {style === 'compact' ? (
            <div className="px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
              {/* Left: Tournament & Live Indicator */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span>LIVE SCOREBOARD</span>
                </div>
                <div className="font-heading font-bold text-xs sm:text-sm text-[#F5F3EE] truncate max-w-[200px]">
                  {tournament?.name || (mode === 'auction' ? 'Live Auction Arena' : mode === 'battle' ? 'Battle Championship' : 'Party Showdown')}
                </div>
              </div>

              {/* Center: Live Arena Specific Metrics */}
              {mode === 'auction' && auctionState && (
                <div className="flex items-center gap-4 text-xs font-heading">
                  {/* Current Item */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[#AEB9CC] text-[11px]">LOT:</span>
                    <span className="font-bold text-[#F5F3EE] truncate max-w-[140px]">
                      {auctionState.items?.[auctionState.currentItemIndex]?.name || 'N/A'}
                    </span>
                  </div>

                  {/* Current Bid */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#222F43] border border-[#39465A]">
                    <span className="text-[#D4B879] text-[11px] font-bold">BID:</span>
                    <span className="font-mono font-black text-sm text-[#00D9FF]">
                      {formatCurrency(auctionState.currentBid || 0)}
                    </span>
                  </div>

                  {/* Highest Bidder */}
                  {auctionState.highestBidder && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#AEB9CC] text-[11px]">LEADER:</span>
                      {(() => {
                        const team = auctionState.teams?.find((t) => t.id === auctionState.highestBidder);
                        return (
                          <span
                            className="font-bold px-2 py-0.5 rounded-lg text-xs border"
                            style={{
                              backgroundColor: `${team?.color || '#D4B879'}20`,
                              borderColor: team?.color || '#D4B879',
                              color: '#F5F3EE',
                            }}
                          >
                            {team?.name || 'Leading'}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {mode === 'battle' && battleState && (
                <div className="flex items-center gap-4 text-xs font-heading">
                  <div className="flex items-center gap-2">
                    <Swords className="w-3.5 h-3.5 text-[#00D9FF]" />
                    <span className="text-[#AEB9CC]">MATCH STAGE:</span>
                    <span className="font-mono font-bold text-[#D4B879] uppercase">
                      {battleState.phase || 'Tactical Clash'}
                    </span>
                  </div>

                  {/* Leader */}
                  {standings.length > 0 && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#222F43] border border-[#39465A]">
                      <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
                      <span className="text-[#AEB9CC] text-[11px]">TABLE LEADER:</span>
                      <span className="font-bold text-[#F5F3EE]">{standings[0].teamName}</span>
                      <span className="font-mono font-black text-[#D4B879] ml-1">
                        {standings[0].points} PTS
                      </span>
                    </div>
                  )}
                </div>
              )}

              {mode === 'party' && (
                <div className="flex items-center gap-3 text-xs font-heading">
                  <Gamepad2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[#AEB9CC]">PARTY ARENA:</span>
                  <span className="font-bold text-[#F5F3EE]">Active Round</span>
                </div>
              )}

              {/* Right: Expand Toggle */}
              {onToggleStyle && (
                <button
                  type="button"
                  onClick={onToggleStyle}
                  className="flex items-center gap-1 text-[11px] font-heading font-bold text-[#D4B879] hover:text-[#F5F3EE] transition-colors"
                >
                  <span>STANDINGS</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* EXPANDED VIEW */
            <div className="p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#39465A]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#D4B879]" />
                  <span className="font-heading font-black text-sm tracking-wide text-[#F5F3EE]">
                    LIVE BROADCAST STANDINGS & PURSE MONITOR
                  </span>
                </div>
                {onToggleStyle && (
                  <button
                    type="button"
                    onClick={onToggleStyle}
                    className="flex items-center gap-1 text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE]"
                  >
                    <span>COLLAPSE TICKER</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Standings Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {standings.map((item, idx) => (
                  <div
                    key={item.teamId || idx}
                    className="p-3 rounded-xl bg-[#222F43] border border-[#39465A] flex items-center justify-between gap-3 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1"
                      style={{ backgroundColor: item.color || '#D4B879' }}
                    />
                    <div className="flex items-center gap-2 pl-1.5 truncate">
                      <span className="font-mono font-black text-xs text-[#AEB9CC]">
                        #{item.rank || idx + 1}
                      </span>
                      <span className="font-heading font-bold text-xs text-[#F5F3EE] truncate">
                        {item.teamName}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      {mode === 'auction' ? (
                        <div className="font-mono text-xs font-bold text-[#00D9FF]">
                          ₹{item.purseRemaining} Cr
                        </div>
                      ) : (
                        <div className="font-mono text-xs font-black text-[#D4B879]">
                          {item.points || 0} PTS
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
