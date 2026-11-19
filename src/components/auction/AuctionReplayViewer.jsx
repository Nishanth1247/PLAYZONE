import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  Gavel, 
  History, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  ShieldCheck,
  Award,
  Layers
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../common/CurrencyDisplay';

/**
 * BIDBATTLE 8.1 - Historical Auction Replay Viewer
 * Strictly read-only viewer for navigating and inspecting settled lots.
 * Displays starting price, full bid sequence, bidder changes, final buyer, sale amount, and status.
 * Never modifies actual auction state or franchise purses.
 */
export const AuctionReplayViewer = ({ auction, onClose }) => {
  const items = auction?.items || [];
  // Filter lots that have been processed (sold or unsold)
  const settledItems = items.filter((item) => item.status === 'sold' || item.status === 'unsold');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (settledItems.length === 0) {
    return (
      <div className="p-8 rounded-3xl battle-panel text-center space-y-4 border border-battle-border">
        <History className="w-10 h-10 text-battle-muted mx-auto" />
        <h3 className="font-broadcast text-lg font-bold text-white uppercase">No Settled Lots Yet</h3>
        <p className="text-xs text-battle-muted max-w-sm mx-auto font-mono">
          Auction replay is available once lots have been hammered as SOLD or marked UNSOLD.
        </p>
        {onClose && (
          <Button variant="secondary" size="sm" onClick={onClose}>
            Back to Dashboard
          </Button>
        )}
      </div>
    );
  }

  const currentLot = settledItems[currentIndex] || settledItems[0];
  const isSold = currentLot.status === 'sold';
  const buyerTeam = isSold ? auction?.teams?.find((t) => t.id === currentLot.soldTo) : null;
  const currency = auction?.currency || 'INR';

  // Extract bid sequence from lot or activityTimeline
  const bidHistory = currentLot.bidHistory || [];
  const timelineEvents = (auction?.activityTimeline || []).filter(
    (ev) => ev.itemId === currentLot.id || (ev.message && ev.message.includes(currentLot.name))
  );

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : settledItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < settledItems.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-brand-cyan/40 relative overflow-hidden shadow-2xl space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-battle-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-broadcast font-bold text-lg text-white">
                AUCTION REPLAY VIEWER
              </span>
              <Badge variant="cyan" className="text-[10px] py-0 font-mono">
                READ-ONLY
              </Badge>
            </div>
            <span className="text-xs font-mono text-battle-muted">
              Lot {currentIndex + 1} of {settledItems.length} Settled Lots
            </span>
          </div>
        </div>

        {/* Previous / Next lot buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={handlePrev}
            className="font-broadcast text-xs flex items-center gap-1 border-battle-border hover:border-brand-cyan text-white"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>PREV LOT</span>
          </Button>

          <span className="px-3 py-1 rounded-xl bg-battle-bg border border-battle-border font-mono text-xs text-battle-muted">
            {currentIndex + 1} / {settledItems.length}
          </span>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleNext}
            className="font-broadcast text-xs flex items-center gap-1 border-battle-border hover:border-brand-cyan text-white"
          >
            <span>NEXT LOT</span>
            <ChevronRight className="w-4 h-4" />
          </Button>

          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs text-battle-muted hover:text-white ml-2"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Lot Inspection Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Lot Spotlight Card (7 COLS) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-battle-bg border border-battle-border space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-battle-muted uppercase">Lot #{currentIndex + 1}</span>
                <span className="text-battle-muted text-xs">•</span>
                <span className="text-xs font-mono text-brand-purple">{currentLot.category || 'Contender'}</span>
              </div>
              <h2 className="font-broadcast text-3xl sm:text-4xl font-black text-white uppercase tracking-wide">
                {currentLot.name}
              </h2>
              {currentLot.movie && (
                <span className="text-xs font-mono text-battle-muted block mt-0.5">
                  Context: {currentLot.movie}
                </span>
              )}
            </div>

            <Badge
              variant={isSold ? 'neon' : 'danger'}
              className="px-3 py-1 text-xs uppercase font-broadcast font-bold flex items-center gap-1"
            >
              {isSold ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
              <span>{isSold ? 'SOLD' : 'UNSOLD'}</span>
            </Badge>
          </div>

          {/* Pricing & Acquisition Economics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-battle-surface border border-battle-border">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Base Price</span>
              <span className="font-mono font-bold text-sm text-white">
                {formatCurrency(currentLot.basePrice, currency)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-battle-surface border border-battle-border">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Final Sale Price</span>
              <span className="font-broadcast font-black text-lg text-brand-neon">
                {isSold ? formatCurrency(currentLot.soldPrice, currency) : '₹0 Cr (Unsold)'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-battle-surface border border-battle-border col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Final Buyer</span>
              {buyerTeam ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span>{buyerTeam.logo}</span>
                  <span className="font-broadcast font-bold text-sm truncate" style={{ color: buyerTeam.color }}>
                    {buyerTeam.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-mono text-battle-muted italic">None (Unsold)</span>
              )}
            </div>
          </div>

          {/* Lore / Description */}
          {currentLot.description && (
            <p className="text-xs font-mono text-battle-text bg-battle-surface/60 p-3 rounded-xl border border-battle-border/60 leading-relaxed">
              {currentLot.description}
            </p>
          )}
        </div>

        {/* Right Column: Complete Bid Sequence & Timeline (5 COLS) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-battle-bg border border-battle-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-battle-border">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-orange" />
              <h3 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider">
                Complete Bid Sequence
              </h3>
            </div>
            <span className="text-xs font-mono text-battle-muted">
              {bidHistory.length} Bids Logged
            </span>
          </div>

          {bidHistory.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-battle-muted italic space-y-1">
              <span>No active bids recorded for this lot.</span>
              <span className="block text-[10px]">Passed at base price without competitive bids.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {bidHistory.map((bid, idx) => {
                const team = auction?.teams?.find((t) => t.id === bid.teamId || t.name === bid.teamName);
                const isFinal = idx === bidHistory.length - 1 && isSold;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono ${
                      isFinal
                        ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                        : 'bg-battle-surface border-battle-border/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-battle-muted text-[10px] w-5">#{idx + 1}</span>
                      <span className="text-sm">{team?.logo || '⚡'}</span>
                      <span className="font-bold text-white truncate" style={{ color: team?.color }}>
                        {team?.name || bid.teamName || 'Bidder'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold font-mono text-brand-cyan">
                        {formatCurrency(bid.amount, currency)}
                      </span>
                      {isFinal && (
                        <Badge variant="neon" className="text-[9px] py-0">
                          WINNING BID
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Bidder Changes Summary */}
          <div className="p-3 rounded-xl bg-battle-surface border border-battle-border flex items-center justify-between text-xs font-mono text-battle-muted">
            <span>Competitive Bidder Changes:</span>
            <span className="font-bold text-white">
              {bidHistory.reduce((changes, bid, i) => {
                if (i > 0 && bid.teamId !== bidHistory[i - 1].teamId) return changes + 1;
                return changes;
              }, 0)} changes
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
