import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Coins, 
  Shield, 
  Trophy, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  SkipForward,
  Sparkles
} from 'lucide-react';
import { broadcastService } from '../../services/broadcastService';

export const FranchiseIntroduction = ({
  franchises = [],
  tournament,
  onComplete,
  autoAdvance = false,
  slideDuration = 8,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAllMode, setIsAllMode] = useState(franchises.length <= 4);

  // Play intro chime on mount or franchise change
  useEffect(() => {
    broadcastService.playAudio('intro');
  }, [selectedIndex]);

  // Handle auto-advance
  useEffect(() => {
    if (!autoAdvance) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => {
        if (prev >= franchises.length - 1) {
          if (onComplete) onComplete();
          return prev;
        }
        return prev + 1;
      });
    }, slideDuration * 1000);
    return () => clearInterval(timer);
  }, [autoAdvance, slideDuration, franchises.length, onComplete]);

  if (!franchises || franchises.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-[#AEB9CC] font-heading">
        No franchises registered for this tournament.
      </div>
    );
  }

  const currentFranchise = franchises[selectedIndex] || franchises[0];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between relative z-10">
      {/* Top Controls & Navigation Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#39465A]/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#D4B879]/20 border border-[#D4B879]/40 text-[#D4B879] text-xs font-mono font-bold tracking-wider uppercase">
              TEAM SPOTLIGHT
            </span>
            <span className="text-xs text-[#AEB9CC] font-mono">
              {selectedIndex + 1} OF {franchises.length} CONTENDERS
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight mt-1">
            FRANCHISE INTRODUCTIONS
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {franchises.length <= 4 && (
            <button
              onClick={() => setIsAllMode(!isAllMode)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold transition-all ${
                isAllMode
                  ? 'bg-[#00D9FF] text-[#0B0F17] border-[#00D9FF]'
                  : 'bg-[#222F43] border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              {isAllMode ? 'Show Single Spotlight' : 'Show All Contenders'}
            </button>
          )}

          <button
            onClick={onComplete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] text-xs font-heading font-bold transition-colors"
          >
            <span>Skip Intros</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="my-auto py-8">
        {isAllMode && franchises.length <= 4 ? (
          /* 2–4 FRANCHISES: LARGE CINEMATIC GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {franchises.map((f, idx) => (
              <motion.div
                key={f.id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.12 }}
                onClick={() => setSelectedIndex(idx)}
                className={`rounded-3xl p-6 border relative overflow-hidden transition-all cursor-pointer group ${
                  selectedIndex === idx
                    ? 'bg-[#222F43] shadow-2xl scale-[1.02]'
                    : 'bg-[#192231]/80 hover:bg-[#222F43]/90 border-[#39465A]'
                }`}
                style={{
                  borderColor: selectedIndex === idx ? (f.color || '#D4B879') : '#39465A',
                  boxShadow: selectedIndex === idx ? `0 0 35px ${f.color || '#D4B879'}25` : undefined,
                }}
              >
                {/* Top Accent Stripe */}
                <div
                  className="absolute top-0 left-0 right-0 h-2 transition-all"
                  style={{ backgroundColor: f.color || '#D4B879' }}
                />

                <div className="space-y-5 pt-2">
                  {/* Franchise Logo Avatar */}
                  <div
                    className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center font-heading font-black text-3xl shadow-xl border overflow-hidden transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: '#111827',
                      borderColor: f.color || '#D4B879',
                      color: f.color || '#F5F3EE',
                    }}
                  >
                    {f.logo && (f.logo.startsWith('http') || f.logo.startsWith('data:')) ? (
                      <img src={f.logo} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{f.logo || f.name?.slice(0, 2).toUpperCase() || 'FC'}</span>
                    )}
                  </div>

                  {/* Title & Identity */}
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#AEB9CC]">
                      FRANCHISE #{idx + 1}
                    </span>
                    <h3 className="font-heading font-black text-xl text-[#F5F3EE] tracking-wide break-words">
                      {f.name}
                    </h3>
                  </div>

                  {/* Purse & Target Squad */}
                  <div className="p-3.5 rounded-2xl bg-[#111827]/80 border border-[#39465A] space-y-2 text-xs font-heading">
                    <div className="flex items-center justify-between">
                      <span className="text-[#AEB9CC] flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-[#D4B879]" />
                        <span>Starting Purse:</span>
                      </span>
                      <span className="font-mono font-bold text-[#00D9FF]">
                        ₹{f.startingPurse || f.purse || 100} Cr
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#AEB9CC] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-[#AEB9CC]" />
                        <span>Squad Target:</span>
                      </span>
                      <span className="font-mono font-bold text-[#F5F3EE]">
                        {tournament?.auctionConfig?.squadSize || 5} Players
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ADAPTIVE SPOTLIGHT VIEW (For 5-10+ Franchises or Focused View) */
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFranchise.id || selectedIndex}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl p-8 sm:p-12 border bg-[#222F43] shadow-2xl relative overflow-hidden"
                style={{
                  borderColor: currentFranchise.color || '#D4B879',
                  boxShadow: `0 0 50px ${currentFranchise.color || '#D4B879'}20`,
                }}
              >
                {/* Accent Ribbon */}
                <div
                  className="absolute top-0 left-0 right-0 h-3"
                  style={{ backgroundColor: currentFranchise.color || '#D4B879' }}
                />

                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  {/* Huge Cinematic Franchise Logo */}
                  <div
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl flex items-center justify-center font-heading font-black text-6xl shadow-2xl border-2 shrink-0 overflow-hidden"
                    style={{
                      backgroundColor: '#111827',
                      borderColor: currentFranchise.color || '#D4B879',
                      color: currentFranchise.color || '#F5F3EE',
                    }}
                  >
                    {currentFranchise.logo && (currentFranchise.logo.startsWith('http') || currentFranchise.logo.startsWith('data:')) ? (
                      <img src={currentFranchise.logo} alt={currentFranchise.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{currentFranchise.logo || currentFranchise.name?.slice(0, 2).toUpperCase() || 'FC'}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4 text-center md:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>OFFICIAL CONTENDER #{selectedIndex + 1} OF {franchises.length}</span>
                    </div>

                    <h1 className="font-heading font-black text-3xl sm:text-5xl text-[#F5F3EE] tracking-tight break-words">
                      {currentFranchise.name}
                    </h1>

                    <p className="text-sm text-[#AEB9CC] font-sans">
                      Contending in {tournament?.name || 'PLAYZONE Championship'} with full tournament snapshot protection.
                    </p>

                    {/* Meta stats bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A]">
                        <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                          Starting Purse
                        </span>
                        <span className="font-mono font-bold text-lg text-[#00D9FF]">
                          ₹{currentFranchise.startingPurse || currentFranchise.purse || 100} Cr
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A]">
                        <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                          Target Squad
                        </span>
                        <span className="font-mono font-bold text-lg text-[#F5F3EE]">
                          {tournament?.auctionConfig?.squadSize || 5} Lots
                        </span>
                      </div>

                      <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                          Franchise Color
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-white/40 shadow-sm"
                            style={{ backgroundColor: currentFranchise.color || '#D4B879' }}
                          />
                          <span className="font-mono text-xs text-[#AEB9CC]">
                            {currentFranchise.color || '#D4B879'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Bottom Franchise Selector Pills */}
      <div className="pt-4 border-t border-[#39465A]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Navigation Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
            disabled={selectedIndex === 0}
            className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] disabled:opacity-30 disabled:cursor-not-allowed border border-[#39465A] text-[#F5F3EE]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-[#AEB9CC]">
            {selectedIndex + 1} / {franchises.length}
          </span>
          <button
            onClick={() => setSelectedIndex((prev) => Math.min(franchises.length - 1, prev + 1))}
            disabled={selectedIndex === franchises.length - 1}
            className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] disabled:opacity-30 disabled:cursor-not-allowed border border-[#39465A] text-[#F5F3EE]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Team Badges */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {franchises.map((f, idx) => (
            <button
              key={f.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                selectedIndex === idx
                  ? 'bg-[#D4B879] text-[#0B0F17] border-[#D4B879] shadow-md'
                  : 'bg-[#222F43] border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: f.color || '#D4B879' }}
              />
              <span className="truncate max-w-[120px]">{f.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
