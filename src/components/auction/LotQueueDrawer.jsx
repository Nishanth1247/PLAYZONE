import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, CheckCircle2, AlertCircle, Clock, EyeOff, Gavel } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../common/CurrencyDisplay';

export const LotQueueDrawer = ({
  isOpen,
  onClose,
  items = [],
  currentIndex = 0,
  teams = [],
  currency = { symbol: '₹', unit: 'Cr' },
  isRatingHidden = false,
  scoreMetricLabel = 'Rating',
}) => {
  if (!isOpen) return null;

  const totalLots = items.length;
  const soldLots = items.filter((i) => i.status === 'sold').length;
  const unsoldLots = items.filter((i) => i.status === 'unsold').length;
  const remainingLots = items.filter((i) => i.status === 'pending').length;
  const percentComplete = Math.round(((soldLots + unsoldLots) / (totalLots || 1)) * 100);

  const getTeam = (teamId) => teams.find((t) => t.id === teamId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="w-full max-w-md h-full battle-panel border-l border-battle-border p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-battle-border">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-brand-purple" />
              <h3 className="font-broadcast font-black text-lg text-white uppercase tracking-wider">
                Tournament Lot Queue ({totalLots})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress summary bar */}
          <div className="p-3.5 rounded-2xl bg-battle-surface/80 border border-battle-border mb-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-broadcast font-bold">
              <span className="text-battle-muted">AUCTION PROGRESS:</span>
              <span className="text-brand-neon font-mono">{percentComplete}% Complete</span>
            </div>
            <div className="w-full bg-battle-bg rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-purple to-brand-cyan transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-1 pt-1 text-center font-mono text-[11px]">
              <div className="p-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300">
                <span className="block font-bold">{soldLots}</span>
                <span className="text-[9px] uppercase font-broadcast text-battle-muted">Sold</span>
              </div>
              <div className="p-1.5 rounded-lg bg-rose-950/30 border border-rose-800/40 text-rose-300">
                <span className="block font-bold">{unsoldLots}</span>
                <span className="text-[9px] uppercase font-broadcast text-battle-muted">Unsold</span>
              </div>
              <div className="p-1.5 rounded-lg bg-battle-bg border border-battle-border text-brand-cyan">
                <span className="block font-bold">{remainingLots}</span>
                <span className="text-[9px] uppercase font-broadcast text-battle-muted">Pending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lots List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1 my-2">
          {items.map((item, idx) => {
            const isCurrent = idx === currentIndex;
            const isSold = item.status === 'sold';
            const isUnsold = item.status === 'unsold';
            const isPending = item.status === 'pending';
            const soldTeam = item.soldTo ? getTeam(item.soldTo) : null;

            return (
              <div
                key={item.id || idx}
                className={`p-3 rounded-2xl border transition-all text-xs relative overflow-hidden ${
                  isCurrent
                    ? 'bg-brand-purple/20 border-brand-purple shadow-glow-purple'
                    : isSold
                    ? 'bg-battle-surface/40 border-battle-border/60'
                    : isUnsold
                    ? 'bg-rose-950/20 border-rose-900/40 opacity-70'
                    : 'bg-battle-surface border-battle-border'
                }`}
              >
                {isCurrent && (
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-brand-cyan" />
                )}

                <div className="flex items-start justify-between gap-2 pl-1">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-battle-muted font-bold text-[10px]">
                        #{idx + 1}
                      </span>
                      <h4 className="font-broadcast font-bold text-white text-xs truncate max-w-[170px]">
                        {item.name}
                      </h4>
                      {isCurrent && (
                        <Badge variant="cyan" pulse className="px-1.5 py-0 text-[9px]">
                          ON BLOCK
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] text-brand-purple font-semibold block">
                      {item.role || item.genre || 'Hero'}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    {isSold ? (
                      <div>
                        <span className="text-[9px] font-broadcast font-bold text-emerald-400 block">
                          SOLD TO {soldTeam?.name || 'Franchise'}
                        </span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {formatCurrency(item.soldPrice, currency)}
                        </span>
                      </div>
                    ) : isUnsold ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-950/60 text-rose-300 text-[10px] font-broadcast font-bold border border-rose-800">
                        UNSOLD
                      </span>
                    ) : (
                      <div>
                        <span className="text-[9px] text-battle-muted font-broadcast block">BASE</span>
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {formatCurrency(item.basePrice, currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lot info footer with rating strictly hidden during auction */}
                <div className="mt-2 pt-1.5 border-t border-battle-border/40 flex items-center justify-between text-[10px] pl-1 font-mono">
                  <span className="text-battle-muted truncate max-w-[140px]">
                    {item.movie ? item.movie : item.director ? `Dir: ${item.director}` : item.role || ''}
                  </span>
                  <span className="text-brand-purple font-bold">
                    {item.status === 'sold' ? 'Sold' : item.status === 'unsold' ? 'Unsold' : 'On Block'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-battle-border">
          <Button variant="secondary" size="md" onClick={onClose} className="w-full">
            Close Lot Queue
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
