import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, X, Clock, Volume2, VolumeX, Eye, EyeOff, RotateCcw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { DEFAULT_INCREMENTS } from '../../services/auctionEngine';

export const AuctionSettingsModal = ({
  isOpen,
  onClose,
  rules,
  onSaveRules,
  currency = { symbol: '₹', unit: 'Cr' },
}) => {
  if (!isOpen) return null;

  const [countdownDuration, setCountdownDuration] = useState(rules?.countdownDuration || 20);
  const [soundEffects, setSoundEffects] = useState(rules?.soundEffects !== false);
  const [hideRatings, setHideRatings] = useState(Boolean(rules?.hideRatingsDuringAuction));
  const [confirmSkip, setConfirmSkip] = useState(rules?.confirmSkip !== false);
  const [confirmEnd, setConfirmEnd] = useState(rules?.confirmEnd !== false);

  // Increments
  const [increments, setIncrements] = useState(rules?.customIncrements || DEFAULT_INCREMENTS);
  const [defaultInc, setDefaultInc] = useState(rules?.minIncrement || 1.0);
  const [newIncInput, setNewIncInput] = useState('');

  const handleAddCustomInc = (e) => {
    e.preventDefault();
    const val = Number(newIncInput);
    if (!isNaN(val) && val > 0 && !increments.includes(val)) {
      const updated = [...increments, val].sort((a, b) => a - b);
      setIncrements(updated);
      setNewIncInput('');
    }
  };

  const handleToggleInc = (inc) => {
    if (increments.includes(inc)) {
      if (increments.length <= 1) return; // Keep at least one
      setIncrements(increments.filter((x) => x !== inc));
      if (defaultInc === inc) {
        setDefaultInc(increments.find((x) => x !== inc) || 1.0);
      }
    } else {
      setIncrements([...increments, inc].sort((a, b) => a - b));
    }
  };

  const handleResetIncrements = () => {
    setIncrements(DEFAULT_INCREMENTS);
    setDefaultInc(1.0);
  };

  const handleSave = () => {
    onSaveRules({
      countdownDuration: Number(countdownDuration),
      soundEffects,
      hideRatingsDuringAuction: hideRatings,
      confirmSkip,
      confirmEnd,
      customIncrements: increments,
      minIncrement: Number(defaultInc),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-3xl battle-panel border border-brand-purple/50 shadow-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-battle-border">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-brand-cyan" />
            <h3 className="font-broadcast font-black text-xl text-white uppercase tracking-wider">
              Live Arena Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Note on Starting Budgets */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Starting franchise purses are locked during an active tournament to preserve competitive integrity. Return to setup to alter initial budgets.
            </span>
          </div>

          {/* 1. Countdown Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-battle-muted uppercase tracking-wider block font-broadcast">
              Countdown Clock Duration (Seconds)
            </label>
            <div className="grid grid-cols-4 gap-2 font-mono">
              {[10, 15, 20, 30].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setCountdownDuration(sec)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    countdownDuration === sec
                      ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple'
                      : 'bg-battle-surface border-battle-border text-battle-text hover:text-white'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          {/* 2. Fast Bid Increments Configuration */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-battle-muted uppercase tracking-wider font-broadcast">
                Fast Increments Selection ({currency.unit})
              </label>
              <button
                type="button"
                onClick={handleResetIncrements}
                className="text-[11px] text-brand-cyan hover:underline flex items-center gap-1 font-broadcast"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {DEFAULT_INCREMENTS.map((inc) => {
                const isActive = increments.includes(inc);
                return (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => handleToggleInc(inc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                      isActive
                        ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan shadow-sm'
                        : 'bg-battle-surface/40 border-battle-border text-battle-muted line-through'
                    }`}
                  >
                    +{currency.symbol}{inc} {currency.unit}
                  </button>
                );
              })}
            </div>

            {/* Default increment selector */}
            <div className="flex items-center justify-between text-xs font-broadcast pt-1">
              <span className="text-battle-muted font-bold">Default Fast Increment:</span>
              <select
                value={defaultInc}
                onChange={(e) => setDefaultInc(Number(e.target.value))}
                className="bg-battle-bg border border-battle-border rounded-xl px-2.5 py-1 text-white font-mono font-bold text-xs"
              >
                {increments.map((inc) => (
                  <option key={inc} value={inc}>
                    +{currency.symbol}{inc} {currency.unit}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Audio & Reveal Toggles */}
          <div className="space-y-3 pt-2 border-t border-battle-border">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-battle-surface border border-battle-border">
              <div className="flex items-center gap-2.5">
                {soundEffects ? <Volume2 className="w-4 h-4 text-brand-neon" /> : <VolumeX className="w-4 h-4 text-battle-muted" />}
                <div>
                  <h4 className="text-xs font-bold text-white font-broadcast">Sound Effects & Live Chimes</h4>
                  <span className="text-[11px] text-battle-muted">Gavel slams, countdown alerts, and bid sounds</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="w-4 h-4 accent-brand-purple cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-battle-surface border border-battle-border">
              <div className="flex items-center gap-2.5">
                {hideRatings ? <EyeOff className="w-4 h-4 text-brand-cyan" /> : <Eye className="w-4 h-4 text-amber-400" />}
                <div>
                  <h4 className="text-xs font-bold text-white font-broadcast">Surprise-Reveal Mode</h4>
                  <span className="text-[11px] text-battle-muted">Hide player ratings until lot is hammered / sold</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hideRatings}
                onChange={(e) => setHideRatings(e.target.checked)}
                className="w-4 h-4 accent-brand-purple cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-battle-surface border border-battle-border">
              <div>
                <h4 className="text-xs font-bold text-white font-broadcast">Confirmation Before Unsold / Skip</h4>
                <span className="text-[11px] text-battle-muted">Prevent accidental skipping of valuable lots</span>
              </div>
              <input
                type="checkbox"
                checked={confirmSkip}
                onChange={(e) => setConfirmSkip(e.target.checked)}
                className="w-4 h-4 accent-brand-purple cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-battle-border">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleSave}>
            Apply Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
