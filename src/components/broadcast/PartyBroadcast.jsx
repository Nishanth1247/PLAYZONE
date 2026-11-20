import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Clock, 
  Trophy, 
  Flame, 
  HelpCircle, 
  CheckCircle2, 
  XCircle,
  Sparkles,
  Users,
  Shield
} from 'lucide-react';

export const PartyBroadcast = ({
  partyState,
  selectedGame,
  tournament,
  standings = [],
}) => {
  const isWhoAmI = selectedGame?.id === 'party_who_am_i';
  const gameTitle = selectedGame?.title || (isWhoAmI ? 'Who Am I?' : 'Dumb Charades 2.0');

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between relative z-10">
      {/* 1. TOP HEADER BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#39465A]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>PARTY ARENA BROADCAST</span>
          </div>
          <span className="text-xs font-mono text-[#AEB9CC]">
            {gameTitle}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
            LOCAL PASS & PLAY
          </span>
        </div>
      </div>

      {/* 2. MAIN CENTER STAGE */}
      <div className="my-auto py-8 max-w-3xl mx-auto w-full text-center space-y-6">
        <div className="rounded-3xl p-8 sm:p-10 border bg-[#192231] border-[#39465A] shadow-2xl relative overflow-hidden space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
            <Gamepad2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL PARTY SHOWDOWN</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE]">
              {gameTitle}
            </h2>
            <p className="text-xs text-[#AEB9CC] font-sans max-w-md mx-auto">
              Live broadcast monitor for Pass-and-Play party gaming. Secret guessing prompts and hidden characters remain safely shielded from the active guesser.
            </p>
          </div>

          {/* Privacy Protection Notice */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center justify-center gap-3 text-xs font-heading text-[#D4B879]">
            <Shield className="w-4 h-4 text-[#D4B879]" />
            <span>Pass-and-play screen privacy is active. Turn phone / screen towards actor.</span>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SCOREBOARD PREVIEW */}
      <div className="pt-3 border-t border-[#39465A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-heading text-[#AEB9CC]">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
          <span>Party Arena integrates directly with the live tournament scoreboard.</span>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[#F5F3EE] font-bold">Tournament:</span>
          <span className="text-[#D4B879]">{tournament?.name || 'Party Cup'}</span>
        </div>
      </div>
    </div>
  );
};
