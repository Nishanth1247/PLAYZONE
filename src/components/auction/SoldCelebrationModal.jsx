import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Gavel, Trophy, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../common/CurrencyDisplay';

export const SoldCelebrationModal = ({ saleData, currency, onNext }) => {
  if (!saleData) return null;

  const { item, team, price } = saleData;
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    // Fire celebratory confetti bursts
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#9147FF', '#00D9FF', '#FF8A35', '#B7F34A', '#FF4FA3'];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Auto-advance countdown
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
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative max-w-lg w-full rounded-3xl battle-panel border-2 border-brand-orange/60 p-8 shadow-2xl text-center overflow-hidden"
      >
        {/* Glow ambient background halo */}
        <div 
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: team.color || '#FF8A35' }}
        />

        {/* SOLD Animated Stamp */}
        <motion.div
          initial={{ scale: 3, rotate: -25, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
          className="inline-block mb-4"
        >
          <div className="px-8 py-2.5 rounded-2xl border-4 border-red-500 bg-red-600/30 text-red-500 font-broadcast text-6xl font-black tracking-widest uppercase shadow-2xl drop-shadow-[0_0_35px_rgba(239,68,68,0.8)]">
            SOLD!
          </div>
        </motion.div>

        {/* Winning Franchise Spotlight */}
        <div className="my-6 space-y-3 relative z-10">
          <Badge variant="gold" icon={Trophy}>
            Acquired by Franchise
          </Badge>

          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl p-2.5 rounded-2xl bg-battle-surface border border-battle-border shadow-xl">
              {team.logo || '🏆'}
            </span>
            <div className="text-left">
              <h3 className="text-3xl font-black text-white font-broadcast tracking-wide" style={{ color: team.color }}>
                {team.name}
              </h3>
              <p className="text-xs text-battle-muted">Added to official championship roster</p>
            </div>
          </div>
        </div>

        {/* Superstar Details & Final Price Card */}
        <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border mb-6 flex items-center justify-between relative z-10">
          <div className="text-left">
            <span className="text-[10px] text-battle-muted uppercase font-bold tracking-wider block font-broadcast">
              Superstar Lot
            </span>
            <h4 className="text-xl font-bold text-white font-broadcast">{item.name}</h4>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-brand-purple font-semibold">{item.role || 'Lot'}</span>
              {item.movie && (
                <span className="text-xs text-brand-cyan font-medium">• {item.movie} ({item.actor})</span>
              )}
              {item.director && (
                <span className="text-xs text-amber-300 font-medium">• {item.director} ({item.year})</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-battle-muted uppercase font-bold tracking-wider block font-broadcast">
              Final Hammer Price
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {formatCurrency(price, currency)}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={onNext}
          className="w-full relative z-10 shadow-xl"
        >
          <span>Next Item On Block {countdown > 0 ? `(${countdown}s)` : ''}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
};
