import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, AlertTriangle, X, Check, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

/**
 * UndoConfirmModal — Transaction Safety Mechanism (BIDBATTLE 7.7)
 * Displays explicit transaction details and safety impact before reversing.
 */
export const UndoConfirmModal = ({
  isOpen,
  dialogData,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !dialogData) return null;

  const { meta } = dialogData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl battle-panel border border-amber-500/50 shadow-2xl p-6 sm:p-7 relative overflow-hidden"
      >
        {/* Glow ambient background halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <RotateCcw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="orange" className="text-[10px] uppercase font-bold tracking-wider">
                  Transaction Safety
                </Badge>
                <span className="text-xs font-mono text-battle-muted">Reversible</span>
              </div>
              <h3 className="text-xl font-black text-white font-broadcast uppercase tracking-wide">
                Confirm Transaction Reversal
              </h3>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Transaction Identification Card */}
        <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border relative z-10 space-y-3 mb-5">
          <div className="flex items-center justify-between text-xs font-broadcast font-bold uppercase text-battle-muted">
            <span>Transaction to Reverse:</span>
            <span className="text-amber-400 font-mono">
              {meta?.type === 'settlement' ? 'Settled Lot Sale' : meta?.type === 'unsold' ? 'Unsold Settlement' : 'Active Bid'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-battle-surface/60 border border-battle-border/80">
            <p className="text-sm font-broadcast font-bold text-white">
              {meta?.description || 'Previous Auction Transaction'}
            </p>
            {meta?.lotName && (
              <span className="text-xs text-battle-muted block mt-1 font-mono">
                Item: <strong className="text-brand-cyan">{meta.lotName}</strong>
                {meta?.teamName && <> • Buyer: <strong className="text-white">{meta.teamName}</strong></>}
                {meta?.amount && <> • Amount: <strong className="text-amber-400">₹{meta.amount} Cr</strong></>}
              </span>
            )}
          </div>
        </div>

        {/* Proposed Rollback Effects */}
        <div className="space-y-2 mb-6 relative z-10">
          <span className="text-xs font-broadcast font-bold text-battle-muted uppercase tracking-wider block">
            Impact & Rollback Effects:
          </span>

          <div className="space-y-2">
            {(meta?.effects || [
              'Revert previous state safely',
              'Restore purse balances without duplicate deductions',
              'Preserve transaction history integrity',
            ]).map((effect, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 text-xs text-battle-text p-2 rounded-xl bg-battle-surface/40 border border-battle-border/50"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span>{effect}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-broadcast font-semibold flex items-center gap-2 mb-6 relative z-10">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>Safe Rollback Guarantee: Accurate transaction logs will be maintained in the timeline.</span>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-battle-border relative z-10">
          <Button
            variant="secondary"
            size="md"
            onClick={onCancel}
            className="font-broadcast text-xs"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            className="font-broadcast text-xs bg-amber-400 hover:bg-amber-300 text-dark-950 font-black shadow-glow-orange flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>CONFIRM & REVERSE TRANSACTION</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
