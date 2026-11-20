import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  X, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Maximize2, 
  Layers, 
  RotateCcw,
  Check
} from 'lucide-react';
import { Button } from '../ui/Button';

export const BroadcastSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg rounded-3xl bg-[#192231] border border-[#39465A] shadow-2xl p-6 sm:p-7 space-y-6 text-[#F5F3EE]"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#39465A]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D4B879]/15 border border-[#D4B879]/40 flex items-center justify-center text-[#D4B879]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-lg tracking-wide text-[#F5F3EE]">
                  BROADCAST SETTINGS
                </h2>
                <p className="text-xs text-[#AEB9CC] font-sans">
                  Customize presentation pacing, audio, and visual density
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-[#222F43] hover:bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Options Grid */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* 1. Animation Intensity */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4B879]" />
                  <span className="text-xs font-heading font-bold text-[#F5F3EE]">
                    Animation Intensity
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#AEB9CC] uppercase">
                  {settings.animationIntensity}
                </span>
              </div>
              <p className="text-[11px] text-[#AEB9CC]">
                Adjust transition speeds. Select "Reduced" for low-power displays or accessibility.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['normal', 'reduced'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onUpdateSettings({ animationIntensity: mode })}
                    className={`py-2 px-3 rounded-xl text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      settings.animationIntensity === mode
                        ? 'bg-[#D4B879] text-[#0B0F17] shadow-sm'
                        : 'bg-[#222F43] text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    {settings.animationIntensity === mode && <Check className="w-3.5 h-3.5" />}
                    <span>{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Broadcast Audio FX */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#00D9FF]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="text-xs font-heading font-bold text-[#F5F3EE]">
                    Broadcast Sound Effects
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.soundEnabled ? 'bg-[#00D9FF]' : 'bg-[#2C394C]'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.soundEnabled ? 26 : 4 }}
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
              <p className="text-[11px] text-[#AEB9CC]">
                Enables synthesised countdown beeps, sold chimes, and victory fanfares (zero network required).
              </p>
            </div>

            {/* 3. Auto-Advance & Slide Duration */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-heading font-bold text-[#F5F3EE]">
                    Auto-Advance Scenes
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ autoAdvance: !settings.autoAdvance })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    settings.autoAdvance ? 'bg-amber-400' : 'bg-[#2C394C]'
                  }`}
                >
                  <motion.div
                    animate={{ x: settings.autoAdvance ? 26 : 4 }}
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                  />
                </button>
              </div>
              <p className="text-[11px] text-[#AEB9CC]">
                Automatically progress to next slide during franchise intros and ceremony sequences.
              </p>

              {settings.autoAdvance && (
                <div className="pt-2 border-t border-[#39465A]/60 flex items-center justify-between">
                  <span className="text-[11px] font-sans text-[#AEB9CC]">Slide Duration</span>
                  <div className="flex items-center gap-2">
                    {[5, 8, 12, 15].map((secs) => (
                      <button
                        key={secs}
                        type="button"
                        onClick={() => onUpdateSettings({ slideDuration: secs })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          settings.slideDuration === secs
                            ? 'bg-[#D4B879] text-[#0B0F17]'
                            : 'bg-[#222F43] text-[#AEB9CC] hover:text-[#F5F3EE]'
                        }`}
                      >
                        {secs}s
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Scoreboard Layout Style */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-heading font-bold text-[#F5F3EE]">
                    Scoreboard Overlay Style
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#AEB9CC] uppercase">
                  {settings.scoreboardStyle}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {['compact', 'expanded'].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onUpdateSettings({ scoreboardStyle: style })}
                    className={`py-2 px-3 rounded-xl text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      settings.scoreboardStyle === style
                        ? 'bg-[#00D9FF] text-[#0B0F17] shadow-sm'
                        : 'bg-[#222F43] text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    {settings.scoreboardStyle === style && <Check className="w-3.5 h-3.5" />}
                    <span>{style}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Nonessential Statistics */}
            <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center justify-between">
              <div>
                <span className="text-xs font-heading font-bold text-[#F5F3EE] block">
                  Show Highlight Statistics
                </span>
                <span className="text-[11px] text-[#AEB9CC]">
                  Display top spends, budget health indicators, and tiebreakers
                </span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showExtraStats: !settings.showExtraStats })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.showExtraStats ? 'bg-[#D4B879]' : 'bg-[#2C394C]'
                }`}
              >
                <motion.div
                  animate={{ x: settings.showExtraStats ? 26 : 4 }}
                  className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-[#39465A]">
            <button
              type="button"
              onClick={onResetSettings}
              className="flex items-center gap-1.5 text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <Button
              variant="champagne"
              size="sm"
              onClick={onClose}
              className="px-5 font-heading font-black text-xs"
            >
              Apply & Done
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
