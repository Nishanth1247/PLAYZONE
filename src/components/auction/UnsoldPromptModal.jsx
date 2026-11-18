import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Archive, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatCurrency } from '../common/CurrencyDisplay';

export const UnsoldPromptModal = ({ unsoldData, currency, onNext, onReAuctionNow }) => {
  if (!unsoldData) return null;
  const { item } = unsoldData;
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNext]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="relative max-w-md w-full rounded-3xl battle-panel border-2 border-battle-border p-8 shadow-2xl text-center overflow-hidden"
      >
        {/* UNSOLD Stamp */}
        <motion.div
          initial={{ scale: 2.5, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="inline-block mb-4"
        >
          <div className="px-8 py-2 rounded-2xl border-4 border-amber-500 bg-amber-500/20 text-amber-400 font-broadcast text-5xl font-black tracking-widest uppercase shadow-2xl drop-shadow-[0_0_25px_rgba(245,158,11,0.5)]">
            UNSOLD
          </div>
        </motion.div>

        <p className="text-sm text-battle-text mb-6 leading-relaxed">
          No team placed an opening bid for <strong className="text-white">{item.name}</strong> at the base price of <span className="text-amber-400 font-mono font-bold">{formatCurrency(item.basePrice, currency)}</span>.
        </p>

        <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border text-xs text-battle-muted mb-6 flex items-center justify-center gap-2">
          <Archive className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Moved to the Unsold Pool. Retains base price for Round 2!</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={onReAuctionNow}
            className="flex-1"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Re-Auction Now</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onNext}
            className="flex-1"
          >
            <span>Next Item {countdown > 0 ? `(${countdown}s)` : ''}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
