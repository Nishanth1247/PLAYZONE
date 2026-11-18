import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { toast } from 'sonner';
import { 
  Archive, 
  RotateCcw, 
  Play, 
  ArrowLeft, 
  Radio, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatCurrency } from '../common/CurrencyDisplay';

export const UnsoldManager = () => {
  const { 
    auction, 
    reAuctionItem, 
    reAuctionAllUnsold, 
    setActivePage 
  } = useAuction();

  const [roleFilter, setRoleFilter] = useState('ALL');

  if (!auction || !auction.items) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl battle-panel text-center">
        <Archive className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white font-broadcast uppercase mb-2">No Active Auction</h2>
        <p className="text-xs text-battle-muted mb-6">Create or load an auction to view the unsold lot repository.</p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setActivePage('setup')}
        >
          Go To Setup
        </Button>
      </div>
    );
  }

  const { items, currency } = auction;
  const unsoldItems = items.filter((i) => i.status === 'unsold');
  const roles = ['ALL', ...new Set(unsoldItems.map((i) => i.role).filter(Boolean))];

  const filteredUnsold = unsoldItems.filter((i) => {
    if (roleFilter === 'ALL') return true;
    return i.role === roleFilter;
  });

  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => setActivePage('live')}
            className="text-xs text-battle-muted hover:text-white flex items-center gap-1.5 mb-2 transition-colors font-broadcast font-bold uppercase tracking-wide"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Live Arena
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-white font-broadcast uppercase tracking-wider flex items-center gap-3">
            <Archive className="w-8 h-8 text-amber-400" />
            Unsold Pool & Second Chance Gallery
          </h1>
          <p className="text-xs text-battle-muted">
            {unsoldItems.length} items currently awaiting second chances or accelerated bidding.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unsoldItems.length > 0 && (
            <Button
              variant="accent"
              size="md"
              onClick={() => {
                if (window.confirm(`Start Round ${(auction.round || 1) + 1} with all ${unsoldItems.length} unsold items?`)) {
                  reAuctionAllUnsold();
                  toast.success(`Round ${(auction.round || 1) + 1} began!`);
                }
              }}
              className="shadow-glow-orange"
            >
              <RotateCcw className="w-4 h-4 stroke-[3]" />
              Re-Auction All Unsold (Round {(auction.round || 1) + 1})
            </Button>
          )}

          <Button
            variant="secondary"
            size="md"
            onClick={() => setActivePage('live')}
          >
            <Radio className="w-4 h-4 text-red-400" />
            Live Arena
          </Button>
        </div>
      </div>

      {/* Role Filters */}
      {roles.length > 2 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-xs text-battle-muted flex items-center gap-1 font-broadcast uppercase font-bold">
            <Filter className="w-3.5 h-3.5" /> Filter Role:
          </span>
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1 rounded-xl text-xs font-broadcast font-bold transition-all ${
                roleFilter === r
                  ? 'bg-amber-400 text-dark-950 shadow-glow-orange'
                  : 'bg-battle-surface border border-battle-border text-battle-muted hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      {/* Unsold Items Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUnsold.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl battle-panel border border-battle-border hover:border-amber-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <Badge variant="orange">
                  {item.role || 'Player'}
                </Badge>
                <span className="text-xs font-mono font-bold text-battle-muted">
                  Base: {formatCurrency(item.basePrice, currency)}
                </span>
              </div>

              <h3 className="font-broadcast text-xl font-bold text-white mb-1.5">{item.name}</h3>
              <p className="text-xs text-battle-muted mb-6 line-clamp-2 leading-relaxed">
                {item.desc || `Ready for immediate re-bidding. Base price preserved at ${formatCurrency(item.basePrice, currency)}.`}
              </p>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                reAuctionItem(item.id);
                toast.success(`Put ${item.name} on the auction block!`);
              }}
              className="w-full hover:border-amber-400 hover:text-amber-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-brand-cyan" />
              Put On Auction Block Now
            </Button>
          </motion.div>
        ))}
      </div>

      {filteredUnsold.length === 0 && (
        <div className="p-16 text-center rounded-3xl battle-panel border border-battle-border">
          <CheckCircle2 className="w-14 h-14 text-brand-neon mx-auto mb-3" />
          <h3 className="text-xl font-black text-white font-broadcast uppercase mb-1">
            Zero Unsold Lots
          </h3>
          <p className="text-xs text-battle-muted">
            Every item in this auction has either been sold or is currently pending in line!
          </p>
        </div>
      )}
    </div>
  );
};
