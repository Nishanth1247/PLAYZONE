import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gavel, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Flame, 
  Trophy, 
  Users, 
  ChevronRight, 
  ArrowLeft,
  Shield,
  Coins,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import { formatCurrency } from '../common/CurrencyDisplay';
import { 
  calculateNextBid, 
  getProgressiveIncrement, 
  getProgressiveTierLabel, 
  getPurseHealth 
} from '../../services/auctionEngine';
import { useBattleArena } from '../../context/BattleArenaContext';

export const BattleAuctionStage = () => {
  const {
    battleState,
    placeBattleBid,
    confirmBattleSold,
    markBattleUnsold,
    toggleBattleTimer,
    resetBattleTimer,
    resetBattleTournament,
  } = useBattleArena();

  const {
    tournamentName,
    themeColor,
    teamCount,
    squadSize,
    teams,
    auction,
  } = battleState;

  const { items, currentItemIndex, currentBid, highestBidder, timer, isTimerRunning } = auction;
  const currentItem = items[currentItemIndex] || items[0] || {};
  const currentLeaderTeam = highestBidder ? teams.find((t) => t.id === highestBidder) : null;

  const currentIncrement = getProgressiveIncrement(currentBid);
  const currentTierLabel = getProgressiveTierLabel(currentBid);

  const nextCalculatedBid = calculateNextBid(
    currentBid,
    Boolean(highestBidder),
    currentItem.basePrice
  );

  const totalLots = items.length;
  const soldLotsCount = items.filter((i) => i.status === 'sold').length;
  const unsoldLotsCount = items.filter((i) => i.status === 'unsold').length;
  const progressPercent = Math.round(((soldLotsCount + unsoldLotsCount) / (totalLots || 1)) * 100);

  const currency = { symbol: '₹', unit: 'Cr' };

  return (
    <div className="max-w-[1700px] mx-auto px-4 py-4 space-y-4">
      {/* 1. TOP HEADER BANNER */}
      <div className="battle-panel rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-lg">
        {/* Left: Tournament info */}
        <div className="flex items-center gap-3">
          <Badge variant="orange" pulse>
            BATTLE ARENA • ROUND 1
          </Badge>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-broadcast font-bold text-white text-base sm:text-lg leading-tight truncate max-w-xs">
                {tournamentName}
              </h1>
              <Badge variant="outline" className="text-[10px] py-0 border-[#39465A] text-[#AEB9CC]">
                Squad Quota: {squadSize} Lots / Team
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#AEB9CC] font-heading font-medium mt-0.5">
              <span className="text-[#F5F3EE] font-bold">
                LOT #{currentItemIndex + 1} OF {totalLots}
              </span>
              <span>•</span>
              <span className="text-[#F5F3EE] font-bold">{soldLotsCount} Sold</span>
              <span>•</span>
              <span className="text-[#AEB9CC] font-bold">{unsoldLotsCount} Unsold</span>
              <span>•</span>
              <span className="text-[#AEB9CC] font-mono font-bold">{progressPercent}% Completed</span>
            </div>
          </div>
        </div>

        {/* Center: Progress Bar */}
        <div className="hidden xl:flex items-center gap-3 w-64">
          <div className="w-full bg-[#2C394C] rounded-full h-2 overflow-hidden border border-[#39465A]">
            <div
              className="h-full bg-[#F5F3EE] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: Controls (Pause/Resume, Reset, Exit) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBattleTimer}
            className={`px-3 py-1.5 rounded-xl border text-xs font-broadcast font-bold flex items-center gap-1.5 transition-all ${
              isTimerRunning
                ? 'bg-battle-surface border-battle-border text-battle-text hover:bg-battle-card'
                : 'bg-emerald-950/60 border-emerald-700 text-emerald-300 hover:bg-emerald-900 shadow-glow-neon'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTimerRunning ? 'Pause' : 'Resume'}</span>
          </button>

          <button
            onClick={resetBattleTimer}
            title="Reset Countdown Clock"
            className="p-1.5 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={resetBattleTournament}
            title="Exit Battle Tournament"
            className="px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-900 text-rose-300 text-xs font-broadcast font-bold"
          >
            Exit Setup
          </button>
        </div>
      </div>

      {/* 2. MAIN 3-COLUMN BATTLE ARENA STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* LEFT COLUMN: TEAM PURSE & SQUAD SLOTS (3 COLS) */}
        <div className="lg:col-span-3 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[660px] overflow-hidden border border-battle-border space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-battle-border">
            <span className="text-xs font-black text-battle-muted uppercase tracking-wider font-broadcast flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Squad Capacity ({teams.length})</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-brand-orange">
              Target: {squadSize} Each
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
            {teams.map((t) => {
              const isLeading = highestBidder === t.id;
              const squadCount = t.squad.length;
              const isFull = squadCount >= squadSize;
              const remainingSlots = Math.max(0, squadSize - squadCount);
              const health = getPurseHealth(t.purse, t.initialPurse);

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
                            {isFull && (
                              <Badge variant="neon" className="px-1.5 py-0 text-[8px]">
                                READY
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-battle-muted font-medium block">
                            Purse: ₹{t.purse} Cr
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono text-sm font-black ${isFull ? 'text-brand-neon' : 'text-white'}`}>
                          {squadCount} / {squadSize}
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
                          backgroundColor: isFull ? '#B7F34A' : t.color,
                          width: `${Math.min(100, (squadCount / squadSize) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-battle-surface/40 border border-battle-border text-[11px] text-battle-muted">
            Round 2 requires every team to have exactly {squadSize} players.
          </div>
        </div>

        {/* MIDDLE COLUMN: THE STAGE & HIGHEST BID (5 COLS) */}
        <div className="lg:col-span-5 battle-panel rounded-3xl p-5 flex flex-col justify-between max-h-[660px] overflow-hidden border border-brand-orange/40 relative">
          
          {/* Top Info Strip */}
          <div className="flex items-center justify-between mb-2 z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-battle-surface border border-battle-border text-xs font-broadcast font-bold text-battle-text">
                LOT #{currentItemIndex + 1}
              </span>
              <Badge variant="purple">
                {currentItem.role || 'Superstar'}
              </Badge>
              {currentItem.category && (
                <Badge variant="cyan">
                  {currentItem.category}
                </Badge>
              )}
            </div>

            {/* Glowing Countdown Clock */}
            <div className="flex items-center gap-2">
              <motion.div
                animate={timer <= 5 ? { scale: [1, 1.08, 1] } : {}}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-bold transition-all ${
                  timer <= 5
                    ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/50 animate-pulse'
                    : 'bg-battle-surface border-battle-border text-brand-orange'
                }`}
              >
                <Clock className={`w-4 h-4 ${timer <= 5 ? 'text-rose-400 animate-spin' : 'text-brand-orange'}`} />
                <span className="text-2xl font-black">{timer}s</span>
              </motion.div>
            </div>
          </div>

          {/* Lot Avatar & Bio (Ratings strictly hidden) */}
          <div className="text-center my-1 z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-battle-surface to-battle-card border-2 border-battle-border shadow-xl flex items-center justify-center text-5xl mb-2.5 shadow-glow-orange overflow-hidden">
              {currentItem.imageUrl ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{currentItem.movie ? '🎬' : '⚔️'}</span>
              )}
            </div>

            <h2 className="font-broadcast text-2xl sm:text-3xl font-black text-white tracking-wide uppercase truncate px-2">
              {currentItem.name}
            </h2>

            {currentItem.movie && (
              <span className="text-xs text-brand-cyan font-bold block mt-0.5">
                Film: {currentItem.movie} {currentItem.actor ? `(${currentItem.actor})` : ''}
              </span>
            )}

            <p className="text-xs text-battle-muted max-w-md mx-auto line-clamp-2 my-1 leading-relaxed">
              {currentItem.desc || 'Championship contender ready to lead your squad to victory in Round 2.'}
            </p>

            {/* Base Price & Info Strip (NO RATINGS VISIBLE) */}
            <div className="inline-flex items-center gap-3 mt-1.5 px-4 py-1 rounded-full bg-battle-surface border border-battle-border text-xs text-battle-muted font-broadcast">
              <div>
                <span className="mr-1.5 text-battle-muted">BASE PRICE:</span>
                <span className="font-mono font-bold text-amber-400">
                  {formatCurrency(currentItem.basePrice, currency)}
                </span>
              </div>
              <span className="text-battle-border">|</span>
              <div>
                <span className="mr-1.5 text-battle-muted">ROLE:</span>
                <span className="font-mono font-bold text-brand-cyan">
                  {currentItem.role || currentItem.category || 'Battle Fighter'}
                </span>
              </div>
            </div>
          </div>

          {/* MASSIVE GLOWING BID DISPLAY */}
          <div className="my-2 p-4 rounded-3xl bg-[#2C394C] border border-[#39465A] shadow-inner text-center z-10 relative overflow-hidden">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#AEB9CC] block mb-1 font-heading">
              CURRENT HIGHEST BID
            </span>

            <div className="font-mono text-5xl sm:text-6xl font-black tracking-wider text-[#F5F3EE]">
              <AnimatedNumber
                value={currentBid}
                format={(v) => formatCurrency(v, currency)}
              />
            </div>

            {/* Leading Team Badge */}
            <div className="mt-2 flex items-center justify-center">
              {currentLeaderTeam ? (
                <div
                  className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm font-heading font-bold text-sm tracking-wide"
                  style={{
                    backgroundColor: `${currentLeaderTeam.color}20`,
                    borderColor: currentLeaderTeam.color,
                    color: '#F5F3EE',
                  }}
                >
                  <span className="text-lg">{currentLeaderTeam.logo}</span>
                  <span>{currentLeaderTeam.name}</span>
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>
              ) : (
                <span className="text-xs text-[#AEB9CC] font-medium italic font-heading">
                  Awaiting opening bid at base price ({formatCurrency(currentItem.basePrice, currency)})
                </span>
              )}
            </div>
          </div>

          {/* HOST HAMMER CONTROLS */}
          <div className="grid grid-cols-2 gap-2.5 z-10">
            <Button
              variant="primary"
              size="lg"
              disabled={!highestBidder}
              onClick={confirmBattleSold}
              className="font-heading text-base bg-[#F5F3EE] hover:bg-white text-[#111827] font-black"
            >
              <Gavel className="w-5 h-5 fill-current" />
              <span>SOLD!</span>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={markBattleUnsold}
              className="font-heading text-sm bg-[#39465A] text-[#F5F3EE] hover:bg-[#3a3a3a] border border-[#404040]"
            >
              <span>MARK UNSOLD</span>
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: PROGRESSIVE INCREMENT & BID TRIGGERS (4 COLS) */}
        <div className="lg:col-span-4 battle-panel rounded-3xl p-4 flex flex-col justify-between max-h-[660px] overflow-hidden border border-battle-border space-y-3">
          
          {/* Automatic Progressive Increment Banner */}
          <div className="p-3 rounded-2xl bg-battle-bg border border-brand-orange/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-orange uppercase tracking-wider font-broadcast flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-orange" />
                Automatic Progressive Increment
              </span>
              <span className="text-xs font-mono text-brand-cyan font-black">
                +₹{currentIncrement.toFixed(2)} Cr
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-battle-muted bg-battle-surface px-2.5 py-1 rounded-xl border border-battle-border">
              <span className="truncate max-w-[220px]">{currentTierLabel}</span>
              <span className="text-emerald-400 font-bold ml-1">Live</span>
            </div>
          </div>

          {/* Participating Franchise Bid Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-battle-muted uppercase font-bold tracking-wider font-broadcast">
                Franchise Bid Triggers ({teams.length})
              </span>
              <span className="text-[10px] font-mono text-brand-cyan font-bold">
                Next: {formatCurrency(nextCalculatedBid, currency)}
              </span>
            </div>

            <div className={`grid grid-cols-1 ${teams.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2 ${teams.length > 4 ? 'max-h-[220px] sm:max-h-[260px] overflow-y-auto pr-1' : ''}`}>
              {teams.map((t) => {
                const isLeading = highestBidder === t.id;
                const isSquadFull = t.squad.length >= squadSize;
                const canAfford = t.purse >= nextCalculatedBid;
                const isDisabled = isLeading || !canAfford || isSquadFull;

                let actionLabel = !highestBidder
                  ? `BID ${formatCurrency(nextCalculatedBid, currency)}`
                  : `BID ${formatCurrency(nextCalculatedBid, currency)} (+₹${currentIncrement.toFixed(2)} Cr)`;
                let subReason = '';

                if (isLeading) {
                  actionLabel = '👑 LEADING';
                  subReason = 'Cannot outbid self';
                } else if (isSquadFull) {
                  actionLabel = 'SQUAD FULL';
                  subReason = `Limit ${squadSize} reached`;
                } else if (!canAfford) {
                  actionLabel = '⚠️ NO PURSE';
                  subReason = `Has ₹${t.purse} Cr`;
                }

                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    disabled={isDisabled}
                    whileHover={isDisabled ? undefined : { scale: 1.02 }}
                    whileTap={isDisabled ? undefined : { scale: 0.98 }}
                    onClick={() => placeBattleBid(t.id)}
                    title={subReason}
                    className={`${teams.length > 4 ? 'p-2 sm:p-2.5' : 'p-3'} rounded-2xl border text-left transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
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
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-lg bg-battle-bg border border-battle-border shadow-sm flex items-center justify-center overflow-hidden text-[10px] font-broadcast font-black"
                          style={{ color: t.color }}
                        >
                          {t.logo && (t.logo.startsWith('http') || t.logo.startsWith('data:')) ? (
                            <img src={t.logo} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                            <span>{t.logo || t.shortName || t.name?.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-broadcast font-bold text-xs text-white truncate max-w-[90px]">
                          {t.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-brand-neon font-bold">
                        ₹{t.purse} Cr
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

          <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-center space-y-1">
            <span className="text-[10px] font-mono text-battle-muted uppercase tracking-wider block">
              Round 1 Target:
            </span>
            <p className="text-xs text-white font-broadcast font-bold">
              All teams must reach exactly {squadSize} players to unlock the battles.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
