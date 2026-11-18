import React from 'react';
import { Sparkles, Zap, Check } from 'lucide-react';

export const RandomEventModal = ({ event, onClose }) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative max-w-md w-full rounded-3xl glass-panel-glow border-2 border-amber-400/60 p-6 shadow-2xl text-center overflow-hidden">
        
        {/* Top Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-400/20 text-amber-300 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-400/20 animate-bounce-subtle">
          <Zap className="w-8 h-8 fill-current" />
        </div>

        <h3 className="text-xl font-black text-amber-400 font-broadcast tracking-wide mb-2 uppercase">
          {event.title}
        </h3>

        <p className="text-xs text-slate-300 mb-5 leading-relaxed">
          {event.desc}
        </p>

        {event.resultMessage && (
          <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-xs font-semibold mb-6 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{event.resultMessage}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-brand-orange text-dark-950 font-black text-xs uppercase tracking-wider hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Back To Bidding War
        </button>

      </div>
    </div>
  );
};
