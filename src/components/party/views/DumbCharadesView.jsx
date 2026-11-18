import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  VolumeX, 
  Trophy,
  Flame,
  ShieldAlert,
  Play
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { soundService } from '../../../services/soundService';
import { PassTheLaptopScreen } from '../common/PassTheLaptopScreen';

export const DumbCharadesView = ({
  item,
  activePlayer,
  activePlayers,
  onAnswer,
  roundNumber,
  totalRounds,
  timerDuration = 45,
}) => {
  // Game lifecycle steps: 'privacy_screen' | 'acting' | 'turn_summary'
  const [step, setStep] = useState('privacy_screen');
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [outcome, setOutcome] = useState(null); // 'guessed' | 'skipped' | 'timeout'
  const [earnedPoints, setEarnedPoints] = useState(0);

  const timerRef = useRef(null);

  const title = item?.title || 'Baasha';
  const category = item?.category || 'Tamil Cinema';
  const wordsCount = item?.wordsCount || title.split(/\s+/).length || 1;
  const year = item?.year || '';
  const hint = item?.hint || item?.stars || '';

  // Reset state when new item/round or active player arrives
  useEffect(() => {
    setStep('privacy_screen');
    setTimeLeft(timerDuration);
    setOutcome(null);
    setEarnedPoints(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [item, roundNumber, activePlayer?.id, timerDuration]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Step 1 -> Step 2: Start acting, hide prompt, start countdown timer on shared screen
  const handleStartActing = () => {
    setStep('acting');
    setTimeLeft(timerDuration);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTurnFinished('timeout', 0);
          return 0;
        }

        // Ticking sounds
        if (prev <= 10) {
          soundService.playUrgentTick();
        } else if (prev % 5 === 0) {
          soundService.playTick();
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Step 2 -> Step 3: Finish turn (Guessed, Skipped, or Timeout)
  const handleTurnFinished = (resultType, remainingSeconds = timeLeft) => {
    if (timerRef.current) clearInterval(timerRef.current);

    let pts = 0;
    if (resultType === 'guessed') {
      // Base 100 + 50 bonus if 15 seconds or less remaining
      const bonus = remainingSeconds <= 15 ? 50 : 0;
      pts = 100 + bonus;
      soundService.playBid();
    } else {
      pts = 0;
      soundService.playGavel();
    }

    setOutcome(resultType);
    setEarnedPoints(pts);
    setStep('turn_summary');

    onAnswer({
      playerId: activePlayer?.id,
      answer: `${resultType.toUpperCase()}: ${title}`,
      isCorrect: resultType === 'guessed',
      points: pts,
      timeSpent: timerDuration - remainingSeconds,
      item,
      explanation: `${activePlayer?.name} acted "${title}" (${category}). ${
        resultType === 'guessed'
          ? `Correctly guessed! Awarded ${pts} pts${remainingSeconds <= 15 ? ' (including +50 bonus)' : ''}.`
          : resultType === 'skipped'
          ? 'Turn skipped (0 pts).'
          : 'Timer ran out (0 pts).'
      }`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Turn Progress Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-battle-border">
        <div className="flex items-center gap-2">
          <Badge variant="purple" className="font-mono text-xs font-bold">
            Round {roundNumber} of {totalRounds}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs font-mono text-battle-muted">
            Actor: <strong className="text-white">{activePlayer?.name}</strong>
          </span>
        </div>

        <div className="text-xs font-mono text-brand-neon font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-neon" />
          <span>Charades Arena</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =================================================================== */}
        {/* STAGE 1: PASS-THE-LAPTOP PRIVACY SCREEN & SECRET PROMPT */}
        {/* =================================================================== */}
        {step === 'privacy_screen' && (
          <motion.div
            key="pass_laptop"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
          >
            <PassTheLaptopScreen
              player={activePlayer}
              phaseTitle="Private Acting Prompt Delivery"
              subInstruction="Inspect your movie prompt. When ready, click 'Start Acting & Hide Secret' to put the public screen on the table."
              revealButtonText="View Secret Movie Prompt"
            >
              <div className="p-5 rounded-2xl bg-battle-bg border border-brand-purple/50 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-purple uppercase tracking-wider font-bold">
                    Secret Film Title
                  </span>
                  <Badge variant="cyan" className="font-mono text-xs">
                    {wordsCount} {wordsCount === 1 ? 'Word' : 'Words'}
                  </Badge>
                </div>

                <div className="text-center py-2">
                  <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-amber-300 tracking-wider">
                    {title}
                  </h3>
                  {year && (
                    <span className="text-xs font-mono text-battle-muted mt-1 block">
                      Release Year: {year}
                    </span>
                  )}
                </div>

                {hint && (
                  <div className="p-3 rounded-xl bg-battle-surface border border-battle-border text-xs text-battle-muted">
                    <strong className="text-white font-mono block mb-0.5">Clue / Star:</strong>
                    <span>{hint}</span>
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 flex items-center gap-2 font-mono">
                  <VolumeX className="w-4 h-4 flex-shrink-0 text-amber-400" />
                  <span>Rules: Absolutely NO speaking, singing, or lip-syncing! Body language only.</span>
                </div>

                <Button
                  variant="primary"
                  size="xl"
                  onClick={handleStartActing}
                  className="w-full font-broadcast text-base shadow-glow-orange flex items-center justify-center gap-2 bg-brand-orange border-brand-orange hover:bg-orange-600 text-black font-black"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>START ACTING ({timerDuration}s TIMER)</span>
                </Button>
              </div>
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* STAGE 2: PUBLIC ACTING ARENA (NO SECRET PROMPT VISIBLE) */}
        {/* =================================================================== */}
        {step === 'acting' && (
          <motion.div
            key="acting_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-orange/40 shadow-2xl space-y-6"
          >
            {/* Top Status Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-battle-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md"
                  style={{ backgroundColor: activePlayer?.color || '#9147FF' }}
                >
                  {activePlayer?.avatar || '🎭'}
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider block">
                    Now Performing Silently
                  </span>
                  <h3 className="font-broadcast text-xl font-black text-white">
                    {activePlayer?.name}
                  </h3>
                </div>
              </div>

              {/* Huge Timer Clock */}
              <div
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-mono font-black text-2xl tracking-wider transition-all ${
                  timeLeft <= 10
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-glow-red animate-pulse'
                    : timeLeft <= 20
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                    : 'bg-battle-surface border-battle-border text-white'
                }`}
              >
                <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-rose-400' : 'text-amber-400'}`} />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Public Clue Display (SAFE: NO TITLE LEAKAGE) */}
            <div className="p-6 rounded-2xl bg-battle-bg border border-battle-border text-center space-y-3">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-battle-muted block">
                Public Clues For Guessers
              </span>

              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-battle-surface border border-brand-purple/40 shadow-glow-purple">
                <span className="text-sm font-broadcast font-bold text-white">
                  🎬 {category}
                </span>
                <span className="text-battle-border">|</span>
                <span className="text-sm font-mono font-black text-brand-cyan">
                  {wordsCount} {wordsCount === 1 ? 'WORD' : 'WORDS'}
                </span>
              </div>

              <p className="text-xs text-battle-muted italic">
                Shout your guesses aloud! When someone shouts the exact title, the host clicks "CORRECT".
              </p>
            </div>

            {/* Host Adjudication Buttons */}
            <div className="pt-2">
              <span className="text-xs font-mono font-bold uppercase text-battle-muted block mb-2 text-center">
                Operator Turn Verdict
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => handleTurnFinished('guessed', timeLeft)}
                  className="font-broadcast text-base shadow-glow-neon bg-brand-neon hover:bg-lime-400 text-dark-950 font-black flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 fill-current" />
                  <span>CORRECT! (+100 PTS{timeLeft <= 15 ? ' +50 BONUS' : ''})</span>
                </Button>

                <Button
                  variant="secondary"
                  size="xl"
                  onClick={() => handleTurnFinished('skipped', timeLeft)}
                  className="font-broadcast text-base border-battle-border hover:border-rose-900/80 hover:bg-rose-950/30 text-battle-muted hover:text-rose-300 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>SKIP TURN (0 PTS)</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* STAGE 3: TURN SUMMARY & SCORE REVEAL */}
        {/* =================================================================== */}
        {step === 'turn_summary' && (
          <motion.div
            key="summary_screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-purple/50 shadow-2xl text-center space-y-6"
          >
            <div className="space-y-2">
              <span className="text-4xl block">
                {outcome === 'guessed' ? '🎉' : outcome === 'skipped' ? '⏭️' : '⏰'}
              </span>
              <h3 className="font-broadcast text-3xl font-black text-white uppercase tracking-wider">
                {outcome === 'guessed'
                  ? 'Awesome Guess!'
                  : outcome === 'skipped'
                  ? 'Turn Skipped'
                  : 'Time Up!'}
              </h3>
              <p className="text-xs font-mono text-battle-muted">
                The secret film was: <strong className="text-amber-300 font-broadcast text-lg">{title}</strong>
              </p>
            </div>

            {/* Points Awarded Card */}
            <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border inline-flex items-center gap-4 px-8">
              <Trophy className="w-6 h-6 text-brand-neon" />
              <div className="text-left">
                <span className="text-[10px] font-mono text-battle-muted uppercase font-bold block">
                  Points Awarded to {activePlayer?.name}
                </span>
                <span className="font-mono text-2xl font-black text-brand-neon">
                  +{earnedPoints} PTS
                </span>
              </div>
            </div>

            <div className="text-xs text-battle-muted">
              Click "Next Turn / Round" at top right to pass the laptop to the next actor.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
