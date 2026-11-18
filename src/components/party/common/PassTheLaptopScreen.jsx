import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, ShieldAlert, Sparkles, Check, ArrowRight } from 'lucide-react';
import { Button } from '../../ui/Button';

export const PassTheLaptopScreen = ({
  player,
  phaseTitle = 'Private Pass-the-Laptop Turn',
  subInstruction = 'Keep the screen hidden from everyone else!',
  revealButtonText = "I'm Ready / Reveal",
  hideButtonText = 'Hide & Pass to Next Player',
  onFinishPass,
  children,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleHideAndPass = () => {
    setIsRevealed(false);
    if (onFinishPass) {
      onFinishPass();
    }
  };

  return (
    <div className="max-w-xl mx-auto my-6 p-6 sm:p-8 rounded-3xl battle-panel border border-battle-border shadow-2xl relative overflow-hidden text-center">
      {/* Background glow tinted to current player's color */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 blur-[120px] opacity-25 pointer-events-none rounded-full"
        style={{ backgroundColor: player?.color || '#9147FF' }}
      />

      <AnimatePresence mode="wait">
        {!isRevealed ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 relative z-10"
          >
            {/* Header / Privacy Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-battle-muted">
              <Shield className="w-3.5 h-3.5 text-brand-cyan" />
              <span>PASS-THE-LAPTOP PRIVACY LOCK</span>
            </div>

            {/* Big Player Spotlight */}
            <div className="space-y-3">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2"
                style={{
                  backgroundColor: `${player?.color || '#9147FF'}20`,
                  borderColor: player?.color || '#9147FF',
                  boxShadow: `0 0 30px ${player?.color || '#9147FF'}50`,
                }}
              >
                <span>{player?.avatar || '👤'}</span>
              </motion.div>

              <div>
                <p className="text-xs uppercase font-mono tracking-widest text-battle-muted font-bold">
                  PASS THE LAPTOP TO
                </p>
                <h2
                  className="font-broadcast text-3xl sm:text-4xl font-black uppercase tracking-wider"
                  style={{ color: player?.color || '#9147FF' }}
                >
                  {player?.name || 'Player'}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-battle-surface/80 border border-battle-border text-xs text-battle-muted space-y-1">
              <p className="font-bold text-white flex items-center justify-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>{phaseTitle}</span>
              </p>
              <p>{subInstruction}</p>
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={handleReveal}
              className="w-full font-broadcast text-base shadow-glow-purple flex items-center justify-center gap-2"
              style={{
                backgroundColor: player?.color,
                borderColor: player?.color,
              }}
            >
              <Eye className="w-5 h-5" />
              <span>{revealButtonText}</span>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 relative z-10"
          >
            {/* Top Bar for active private viewer */}
            <div className="flex items-center justify-between pb-3 border-b border-battle-border text-left">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{player?.avatar}</span>
                <div>
                  <span
                    className="font-broadcast text-sm font-bold block leading-none"
                    style={{ color: player?.color }}
                  >
                    {player?.name}
                  </span>
                  <span className="text-[10px] text-battle-muted font-mono font-medium">
                    Private Screen
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded-lg">
                <Eye className="w-3.5 h-3.5" />
                <span>Secret Unlocked</span>
              </div>
            </div>

            {/* Secret Content Injected Here */}
            <div className="text-left">
              {children}
            </div>

            {/* Hide & Pass Button */}
            {onFinishPass && (
              <Button
                variant="secondary"
                size="lg"
                onClick={handleHideAndPass}
                className="w-full font-broadcast text-sm border-battle-border hover:border-battle-borderLight flex items-center justify-center gap-2"
              >
                <EyeOff className="w-4 h-4 text-battle-muted" />
                <span>{hideButtonText}</span>
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
