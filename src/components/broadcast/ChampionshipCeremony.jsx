import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  RotateCcw, 
  ArrowLeft, 
  FileText, 
  Coins, 
  Shield, 
  CheckCircle2,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { Button } from '../ui/Button';
import { broadcastService } from '../../services/broadcastService';

export const ChampionshipCeremony = ({
  tournament,
  standings = [],
  onViewResults,
  onExitCeremony,
}) => {
  const [ceremonyStep, setCeremonyStep] = useState(1); // 1: Title, 2: Standings, 3: Podium, 4: Champion, 5: Summary
  const champions = broadcastService.getChampions(standings);
  const runnerUp = standings.length > 1 ? standings[1] : null;
  const thirdPlace = standings.length > 2 ? standings[2] : null;

  // Trigger celebration confetti and audio on champion reveal
  useEffect(() => {
    if (ceremonyStep === 4) {
      broadcastService.playAudio('victory');
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4B879', '#00D9FF', '#D97858', '#FFFFFF'],
        });
        const timer = setTimeout(() => {
          confetti({
            particleCount: 80,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#D4B879', '#00D9FF'],
          });
          confetti({
            particleCount: 80,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#D4B879', '#D97858'],
          });
        }, 400);
        return () => clearTimeout(timer);
      } catch (e) {
        // Confetti fallback
      }
    }
  }, [ceremonyStep]);

  const handleReplay = () => {
    setCeremonyStep(1);
    broadcastService.playAudio('intro');
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between relative z-10 text-[#F5F3EE]">
      {/* 1. TOP CEREMONY BANNER & PROGRESS STEPS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#39465A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#D4B879]/20 border border-[#D4B879]/40 text-[#D4B879] text-xs font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>OFFICIAL CHAMPIONSHIP CEREMONY</span>
            </span>
            <span className="text-xs text-[#AEB9CC] font-mono">
              STAGE {ceremonyStep} OF 5
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#F5F3EE] tracking-tight mt-1">
            {tournament?.name || 'PLAYZONE Championship'}
          </h2>
        </div>

        {/* Quick Stage Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { step: 1, label: 'Title' },
            { step: 2, label: 'Standings' },
            { step: 3, label: 'Podium' },
            { step: 4, label: 'Champion' },
            { step: 5, label: 'Summary' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setCeremonyStep(item.step)}
              className={`px-3 py-1 rounded-xl text-xs font-heading font-bold transition-all ${
                ceremonyStep === item.step
                  ? 'bg-[#D4B879] text-[#0B0F17] shadow-sm'
                  : 'bg-[#222F43] text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. MAIN PRESENTATION BODY */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          {/* STAGE 1: TITLE REVEAL */}
          {ceremonyStep === 1 && (
            <motion.div
              key="step_1"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="w-24 h-24 rounded-3xl bg-[#D4B879]/15 border-2 border-[#D4B879] mx-auto flex items-center justify-center text-[#D4B879] shadow-glow-orange">
                <Crown className="w-12 h-12" />
              </div>

              <div className="space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879] tracking-widest uppercase">
                  SEASON CONCLUDED • WINNER DECIDED
                </span>
                <h1 className="font-heading font-black text-4xl sm:text-6xl text-[#F5F3EE] tracking-tight">
                  {tournament?.name}
                </h1>
                <p className="text-base text-[#AEB9CC] font-sans max-w-lg mx-auto">
                  {tournament?.description || 'All arena stages and combat rounds have concluded. Let us honor the contenders and crown the champion.'}
                </p>
              </div>

              <div className="pt-4">
                <Button
                  variant="champagne"
                  size="lg"
                  onClick={() => setCeremonyStep(2)}
                  className="px-8 font-heading font-black text-sm shadow-xl inline-flex items-center gap-2"
                >
                  <span>Reveal Final Standings</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STAGE 2: FINAL STANDINGS REVEAL */}
          {ceremonyStep === 2 && (
            <motion.div
              key="step_2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="text-center space-y-1">
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE]">
                  FINAL TOURNAMENT STANDINGS
                </h2>
                <p className="text-xs text-[#AEB9CC] font-sans">
                  Ranked by official points (3-1-0 matrix) and tiebreak criteria
                </p>
              </div>

              <div className="space-y-3">
                {standings.map((s, idx) => (
                  <motion.div
                    key={s.teamId || idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between gap-4 relative overflow-hidden ${
                      idx === 0
                        ? 'bg-[#222F43] border-[#D4B879] shadow-glow-orange'
                        : 'bg-[#192231] border-[#39465A]'
                    }`}
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-2"
                      style={{ backgroundColor: s.color || '#D4B879' }}
                    />

                    <div className="flex items-center gap-3 pl-2">
                      <span className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                        idx === 0
                          ? 'bg-[#D4B879] text-[#0B0F17]'
                          : idx === 1
                          ? 'bg-[#AEB9CC] text-[#0B0F17]'
                          : idx === 2
                          ? 'bg-[#D97858] text-[#F5F3EE]'
                          : 'bg-[#111827] text-[#AEB9CC]'
                      }`}>
                        #{s.rank || idx + 1}
                      </span>

                      <div>
                        <h4 className="font-heading font-black text-lg text-[#F5F3EE]">
                          {s.teamName}
                        </h4>
                        <span className="text-xs text-[#AEB9CC] font-sans">
                          {s.wins}W • {s.draws}D • {s.losses}L
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-black text-2xl text-[#00D9FF] block">
                        {s.points} PTS
                      </span>
                      <span className="text-[10px] font-mono text-[#AEB9CC]">
                        Purse: ₹{s.purseRemaining} Cr
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center pt-2">
                <Button
                  variant="cyan"
                  size="md"
                  onClick={() => setCeremonyStep(3)}
                  className="px-6 font-heading font-black text-xs inline-flex items-center gap-2"
                >
                  <span>Proceed to Podium Announcements</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STAGE 3: PODIUM HONORS (2ND & 3RD) */}
          {ceremonyStep === 3 && (
            <motion.div
              key="step_3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto space-y-8 text-center"
            >
              <div className="space-y-1">
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE]">
                  PODIUM CONTENDERS
                </h2>
                <p className="text-xs text-[#AEB9CC] font-sans">
                  Honoring the top finishing franchises of the season
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* 2nd Place / Runner-up */}
                {runnerUp && (
                  <div className="rounded-3xl p-6 sm:p-8 bg-[#192231] border border-[#AEB9CC]/40 shadow-xl space-y-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#AEB9CC]/15 border border-[#AEB9CC] mx-auto flex items-center justify-center text-[#AEB9CC] font-mono font-black text-2xl">
                      🥈
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
                        RUNNER-UP • 2ND PLACE
                      </span>
                      <h3 className="font-heading font-black text-2xl text-[#F5F3EE] mt-1">
                        {runnerUp.teamName}
                      </h3>
                      <span className="font-mono font-bold text-lg text-[#00D9FF]">
                        {runnerUp.points} Points
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {thirdPlace && (
                  <div className="rounded-3xl p-6 sm:p-8 bg-[#192231] border border-[#D97858]/40 shadow-xl space-y-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#D97858]/15 border border-[#D97858] mx-auto flex items-center justify-center text-[#D97858] font-mono font-black text-2xl">
                      🥉
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-[#D97858] uppercase tracking-wider block">
                        PODIUM • 3RD PLACE
                      </span>
                      <h3 className="font-heading font-black text-2xl text-[#F5F3EE] mt-1">
                        {thirdPlace.teamName}
                      </h3>
                      <span className="font-mono font-bold text-lg text-[#00D9FF]">
                        {thirdPlace.points} Points
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  variant="champagne"
                  size="lg"
                  onClick={() => setCeremonyStep(4)}
                  className="px-8 font-heading font-black text-sm shadow-xl inline-flex items-center gap-2"
                >
                  <Crown className="w-4 h-4" />
                  <span>CROWN THE CHAMPION</span>
                </Button>
              </div>
            </motion.div>
          )}

          {/* STAGE 4: CHAMPION CROWNING & TROPHY REVEAL */}
          {ceremonyStep === 4 && (
            <motion.div
              key="step_4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              {/* Grand Golden Trophy Badge */}
              <div className="relative inline-block">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-[#D4B879]/30 via-[#D4B879]/10 to-transparent border-2 border-[#D4B879] mx-auto flex items-center justify-center text-[#D4B879] shadow-glow-orange"
                >
                  <Trophy className="w-16 h-16 sm:w-20 sm:h-20 fill-[#D4B879]/30 text-[#D4B879]" />
                </motion.div>
                <div className="absolute -top-3 -right-3 p-2 rounded-xl bg-[#D4B879] text-[#0B0F17] shadow-lg">
                  <Crown className="w-6 h-6 fill-current" />
                </div>
              </div>

              {/* Champion Details */}
              <div className="space-y-3">
                <span className="px-4 py-1.5 rounded-full bg-[#D4B879]/20 border border-[#D4B879] text-xs font-mono font-black text-[#D4B879] tracking-widest uppercase">
                  {champions.length > 1 ? 'JOINT CHAMPIONS OF THE REALM' : 'GRAND CHAMPION & TROPHY WINNER'}
                </span>

                {champions.map((champ, idx) => (
                  <h1
                    key={champ.teamId || idx}
                    className="font-heading font-black text-4xl sm:text-6xl text-[#F5F3EE] tracking-tight break-words"
                  >
                    {champ.teamName}
                  </h1>
                ))}

                <p className="text-base text-[#AEB9CC] font-sans max-w-lg mx-auto">
                  Dominating the arena with unmatched tactical auctions, strategic squad management, and combat supremacy.
                </p>

                {champions.length > 0 && (
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-[#111827] border border-[#D4B879] font-mono text-lg font-black text-[#00D9FF]">
                    <span>Score: {champions[0].points} PTS</span>
                    <span>•</span>
                    <span>Rank #1</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <Button
                  variant="champagne"
                  size="md"
                  onClick={() => setCeremonyStep(5)}
                  className="px-6 font-heading font-black text-xs inline-flex items-center gap-2"
                >
                  <span>View Season Highlights</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STAGE 5: FINAL TOURNAMENT STATISTICS & ACTIONS */}
          {ceremonyStep === 5 && (
            <motion.div
              key="step_5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-6 text-center"
            >
              <div className="space-y-1">
                <h2 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE]">
                  SEASON SUMMARY & POST-MATCH
                </h2>
                <p className="text-xs text-[#AEB9CC] font-sans">
                  Official tournament results are preserved and safely archived.
                </p>
              </div>

              {/* Stats Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A]">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    Champion
                  </span>
                  <span className="font-heading font-black text-base text-[#D4B879] truncate block mt-1">
                    {champions[0]?.teamName || 'N/A'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A]">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    Winning Points
                  </span>
                  <span className="font-mono font-black text-base text-[#00D9FF] block mt-1">
                    {champions[0]?.points || 0} PTS
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A]">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    Contending Teams
                  </span>
                  <span className="font-mono font-black text-base text-[#F5F3EE] block mt-1">
                    {standings.length} Franchises
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#192231] border border-[#39465A]">
                  <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">
                    Tournament Status
                  </span>
                  <span className="font-heading font-bold text-xs text-emerald-400 block mt-1">
                    COMPLETED
                  </span>
                </div>
              </div>

              {/* Actions: Replay, View Results, Return to Hub */}
              <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleReplay}
                  className="flex items-center gap-2 font-heading font-black text-xs"
                >
                  <RotateCcw className="w-4 h-4 text-[#D4B879]" />
                  <span>REPLAY CEREMONY</span>
                </Button>

                {onViewResults && (
                  <Button
                    variant="cyan"
                    size="md"
                    onClick={onViewResults}
                    className="flex items-center gap-2 font-heading font-black text-xs"
                  >
                    <FileText className="w-4 h-4" />
                    <span>VIEW FULL RESULTS</span>
                  </Button>
                )}

                <Button
                  variant="champagne"
                  size="md"
                  onClick={onExitCeremony}
                  className="flex items-center gap-2 font-heading font-black text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>RETURN TO TOURNAMENT HUB</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. BOTTOM FOOTER HINT */}
      <div className="pt-3 border-t border-[#39465A] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-heading text-[#AEB9CC]">
        <span>Pass-and-Play Offline Presentation • Press Left/Right arrows or use buttons to navigate ceremony</span>
        <button
          onClick={handleReplay}
          className="flex items-center gap-1 text-[#D4B879] hover:text-[#F5F3EE] transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Replay from Beginning</span>
        </button>
      </div>
    </div>
  );
};
