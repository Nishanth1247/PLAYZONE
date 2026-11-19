import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  FastForward, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Meh,
  Volume2,
  VolumeX,
  Award
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { 
  getSavedWhoAmIState,
  settleWhoAmITurn, 
  clearWhoAmIState, 
  calculateWhoAmIStandings 
} from '../../../services/party/whoAmIEngine';
import { soundService } from '../../../services/soundService';
import { toast } from 'sonner';

export const WhoAmIArena = ({ session, onExitToSetup }) => {
  const [gameState, setGameState] = useState(() => {
    if (session) return session;
    return getSavedWhoAmIState();
  });
  const [stage, setStage] = useState('prepare'); // 'prepare' | 'countdown' | 'guessing' | 'outcome' | 'podium'
  const [countdownNum, setCountdownNum] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(() => gameState?.timerDuration || 60);
  const [timerActive, setTimerActive] = useState(false);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showConfirmCorrect, setShowConfirmCorrect] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);

  const timerRef = useRef(null);

  // Current turn info
  const currentTurn = useMemo(() => {
    if (!gameState || !gameState.turns) return null;
    return gameState.turns[gameState.currentTurnIndex] || null;
  }, [gameState]);

  const currentGuesser = currentTurn?.player || null;
  const currentCharacter = currentTurn?.character || null;
  const totalTurns = gameState?.turns?.length || 0;
  const currentTurnNum = (gameState?.currentTurnIndex || 0) + 1;
  const speedBonusThreshold = Math.floor((gameState?.timerDuration || 60) / 2);
  const isSpeedBonusEligible = timeRemaining > speedBonusThreshold;

  // Initialize stage on mount or tournament completion
  useEffect(() => {
    if (!gameState) return;
    if (gameState.isCompleted) {
      setStage('podium');
    }
  }, [gameState?.isCompleted]);

  // Turn timer countdown
  useEffect(() => {
    if (stage === 'guessing' && timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTurnTimeout();
            return 0;
          }
          if (prev === 11) {
            soundService?.play?.('timer_warning');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [stage, timerActive, timeRemaining]);

  // 3-second reveal countdown
  useEffect(() => {
    let cdTimer = null;
    if (stage === 'countdown') {
      soundService?.play?.('countdown_tick');
      cdTimer = setInterval(() => {
        setCountdownNum((prev) => {
          if (prev <= 1) {
            clearInterval(cdTimer);
            setStage('guessing');
            setTimerActive(true);
            soundService?.play?.('round_start');
            return 3;
          }
          soundService?.play?.('countdown_tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cdTimer);
  }, [stage]);

  // Timeout handler
  const handleTurnTimeout = () => {
    if (isSettling) return;
    setIsSettling(true);
    setTimerActive(false);
    soundService?.play?.('timer_expired');

    const nextState = settleWhoAmITurn(gameState, {
      outcome: 'timeout',
      timeRemaining: 0,
      questionsAsked: questionsCount,
    });

    setLastOutcome(nextState.lastSettledOutcome);
    setGameState(nextState);
    setStage(nextState.isCompleted ? 'podium' : 'outcome');
    setIsSettling(false);
  };

  // Correct guess handler
  const handleConfirmCorrect = () => {
    if (isSettling) return;
    setIsSettling(true);
    setTimerActive(false);
    setShowConfirmCorrect(false);

    soundService?.play?.('success');

    const nextState = settleWhoAmITurn(gameState, {
      outcome: 'correct',
      timeRemaining,
      questionsAsked: questionsCount,
    });

    setLastOutcome(nextState.lastSettledOutcome);
    setGameState(nextState);
    setStage(nextState.isCompleted ? 'podium' : 'outcome');
    setIsSettling(false);
  };

  // Skip handler
  const handleSkipTurn = () => {
    if (isSettling) return;
    setIsSettling(true);
    setTimerActive(false);
    soundService?.play?.('skip');

    const nextState = settleWhoAmITurn(gameState, {
      outcome: 'skip',
      timeRemaining,
      questionsAsked: questionsCount,
    });

    setLastOutcome(nextState.lastSettledOutcome);
    setGameState(nextState);
    setStage(nextState.isCompleted ? 'podium' : 'outcome');
    setIsSettling(false);
  };

  // Question tally buttons
  const handleTallyQuestion = (type) => {
    if (stage !== 'guessing' || !timerActive) return;

    if (type === 'yes') soundService?.play?.('bid_placed');
    else if (type === 'no') soundService?.play?.('bid_outbid');
    else soundService?.play?.('button_click');

    const newCount = questionsCount + 1;
    setQuestionsCount(newCount);

    // Check if question limit reached
    if (gameState.questionLimit > 0 && newCount >= gameState.questionLimit) {
      toast.warning(`Question limit (${gameState.questionLimit}) reached!`);
    }
  };

  // Advance to next turn
  const handleNextTurn = () => {
    if (gameState.isCompleted) {
      setStage('podium');
    } else {
      setStage('prepare');
      setTimeRemaining(gameState.timerDuration || 60);
      setTimerActive(false);
      setQuestionsCount(0);
      setShowHint(false);
      setShowConfirmCorrect(false);
      setIsSettling(false);
    }
  };

  // Start 3-second reveal countdown
  const handleStartReveal = () => {
    setCountdownNum(3);
    setStage('countdown');
  };

  // Final podium standings
  const standings = useMemo(() => {
    return calculateWhoAmIStandings(gameState?.scores);
  }, [gameState?.scores]);

  if (!gameState) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="font-broadcast text-xl font-bold text-white">No Active Who Am I? Session</h2>
        <p className="text-xs font-mono text-battle-muted">Please configure a tournament in setup to play.</p>
        <Button variant="primary" size="md" onClick={onExitToSetup}>
          Go to Setup
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-3.5 select-none">
      {/* Top Header / Progress Bar */}
      <div className="flex items-center justify-between border-b border-[#39465A] pb-3">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitToSetup}
            className="text-[#AEB9CC] hover:text-[#F5F3EE] text-xs font-mono"
          >
            ← Exit Setup
          </Button>
          <div className="flex items-center gap-1.5">
            <span className="text-base">❓</span>
            <span className="font-heading text-xs sm:text-sm font-bold text-[#F5F3EE] tracking-wide truncate max-w-[180px] sm:max-w-xs">
              {gameState.collectionName}
            </span>
          </div>
        </div>

        {stage !== 'podium' && (
          <div className="flex items-center gap-1.5">
            <Badge variant="subtle" className="font-mono text-[11px] py-0.5">
              Turn {currentTurnNum} / {totalTurns}
            </Badge>
            <Badge variant="outline" className="font-mono text-[11px] py-0.5 border-[#39465A] text-[#AEB9CC]">
              Round {currentTurn?.roundNumber} / {gameState.roundsCount}
            </Badge>
          </div>
        )}
      </div>

      {/* =========================================================================
          STAGE 1: PREPARE SCREEN — PHYSICAL INSTRUCTION & GUESSER SETUP
          ========================================================================= */}
      {stage === 'prepare' && currentGuesser && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#222F43] p-5 sm:p-7 border-2 text-center space-y-4 shadow-2xl relative overflow-hidden"
          style={{ borderColor: `${currentGuesser.color}80` }}
        >
          {/* Ambient Lighting */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: currentGuesser.color }}
          />

          {/* Turn Banner */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono font-bold text-[#AEB9CC]">
            <span>ROUND {currentTurn?.roundNumber}</span>
            <span>•</span>
            <span>TURN {currentTurnNum} OF {totalTurns}</span>
          </div>

          {/* Guesser Spotlight Card */}
          <div className="space-y-2">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2"
              style={{
                backgroundColor: `${currentGuesser.color}20`,
                borderColor: currentGuesser.color,
                color: currentGuesser.color,
              }}
            >
              {currentGuesser.avatar}
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AEB9CC]">
                CURRENT GUESSER
              </span>
              <h2
                className="font-heading sm:font-broadcast text-3xl sm:text-4xl font-black tracking-wide uppercase"
                style={{ color: currentGuesser.color }}
              >
                {currentGuesser.name}
              </h2>
              <span className="text-xs font-mono text-[#AEB9CC]">
                {currentGuesser.tagline}
              </span>
            </div>
          </div>

          {/* PHYSICAL INSTRUCTIONS BOX */}
          <div className="max-w-lg mx-auto p-3.5 sm:p-4 rounded-2xl bg-[#2C394C] border border-[#39465A] text-left space-y-2">
            <div className="flex items-center gap-2 text-[#D97858] font-heading text-xs font-bold tracking-wider uppercase">
              <EyeOff className="w-3.5 h-3.5" />
              <span>PHYSICAL INSTRUCTIONS BEFORE REVEALING:</span>
            </div>
            <ul className="text-xs text-[#AEB9CC] space-y-1.5 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-[#91A98B] font-bold">1.</span>
                <span>
                  <strong className="text-[#F5F3EE]">{currentGuesser.name}</strong> must stand behind the device facing <strong>AWAY</strong> from the screen!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D4B879] font-bold">2.</span>
                <span>
                  All other players sit in front of the screen. You will see the secret character!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#D97858] font-bold">3.</span>
                <span>
                  {currentGuesser.name} asks Yes/No questions. Everyone answers: <strong className="text-[#F5F3EE]">YES, NO, or MAYBE</strong>!
                </span>
              </li>
            </ul>
          </div>

          {/* START REVEAL BUTTON */}
          <div className="pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStartReveal}
              className="font-heading text-xs sm:text-sm font-black shadow-xl flex items-center justify-center gap-2 mx-auto px-6 py-3"
              style={{
                backgroundColor: currentGuesser.color,
                borderColor: currentGuesser.color,
                color: '#111827',
              }}
            >
              <Eye className="w-4 h-4" />
              <span>GUESSER IN POSITION — REVEAL CHARACTER</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          STAGE 2: COUNTDOWN SCREEN (3-2-1)
          ========================================================================= */}
      {stage === 'countdown' && (
        <motion.div
          key={countdownNum}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.4 }}
          className="rounded-3xl bg-[#222F43] p-10 sm:p-14 border border-[#39465A] text-center space-y-3 shadow-2xl"
        >
          <span className="text-xs font-mono font-bold tracking-widest text-[#AEB9CC] uppercase">
            CHARACTER REVEALING IN
          </span>
          <div className="font-heading sm:font-broadcast text-7xl sm:text-8xl font-black text-[#F5F3EE]">
            {countdownNum}
          </div>
          <span className="text-xs font-mono text-[#D97858]">
            Guesser face away now!
          </span>
        </motion.div>
      )}

      {/* =========================================================================
          STAGE 3: ACTIVE GUESSING ARENA (SHARED SCREEN)
          ========================================================================= */}
      {stage === 'guessing' && currentCharacter && currentGuesser && (
        <div className="space-y-3.5">
          {/* TOP WARNING BANNER */}
          <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/40 text-center flex items-center justify-center gap-2 text-xs font-mono font-bold text-red-300 shadow-sm animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>AUDIENCE ONLY: GUESSER MUST NOT LOOK AT THIS SCREEN!</span>
          </div>

          {/* MAIN CHARACTER DISPLAY CARD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-[#222F43] p-4 sm:p-6 border border-[#39465A] text-center space-y-3.5 relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D97858]/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <Badge variant="subtle" className="font-mono text-[10px]">
                {currentCharacter.category}
              </Badge>
              <Badge
                variant={
                  currentCharacter.difficulty === 'Easy'
                    ? 'outline'
                    : currentCharacter.difficulty === 'Hard'
                    ? 'danger'
                    : 'subtle'
                }
                className="font-mono text-[10px]"
              >
                {currentCharacter.difficulty}
              </Badge>
              {isSpeedBonusEligible && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4B879]/15 border border-[#D4B879]/40 text-[#D4B879] font-mono text-[10px] font-bold">
                  <Zap className="w-3 h-3" />
                  Speed Bonus Eligible (+5 pts)
                </span>
              )}
            </div>

            {/* SECRET CHARACTER NAME */}
            <div className="py-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AEB9CC] block mb-0.5">
                YOU ARE:
              </span>
              <h1 className="font-heading sm:font-broadcast text-3xl sm:text-5xl font-black text-[#F5F3EE] tracking-wider uppercase drop-shadow-md">
                {currentCharacter.name}
              </h1>
            </div>

            {/* OPTIONAL HINT SECTION */}
            {currentCharacter.hint && (
              <div>
                {showHint ? (
                  <div className="p-2.5 rounded-xl bg-[#D4B879]/10 border border-[#D4B879]/40 max-w-md mx-auto text-xs text-[#D4B879] font-mono flex items-center justify-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-[#D4B879] flex-shrink-0" />
                    <span><strong>HINT:</strong> {currentCharacter.hint}</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowHint(true)}
                    className="font-mono text-xs text-[#AEB9CC] hover:text-[#D4B879]"
                  >
                    <Lightbulb className="w-3 h-3 mr-1" />
                    Reveal Hint to Audience
                  </Button>
                )}
              </div>
            )}

            {/* TIMER & GUESSER STATUS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-[#39465A] max-w-xl mx-auto">
              {/* Guesser pill */}
              <div className="p-2 rounded-xl bg-[#2C394C] border border-[#39465A] flex items-center gap-2 text-left">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: currentGuesser.color }}
                >
                  {currentGuesser.avatar}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-[#AEB9CC] block">Guesser</span>
                  <h4 className="font-heading text-xs font-bold text-[#F5F3EE] truncate">
                    {currentGuesser.name}
                  </h4>
                </div>
              </div>

              {/* Turn Timer */}
              <div
                className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 ${
                  timeRemaining <= 10
                    ? 'bg-red-500/15 border-red-500/50 text-red-400 animate-pulse'
                    : 'bg-[#2C394C] border-[#39465A] text-[#F5F3EE]'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#D97858]" />
                <span className="font-mono text-base font-black">{timeRemaining}s</span>
              </div>

              {/* Questions tally count */}
              <div className="col-span-2 sm:col-span-1 p-2 rounded-xl bg-[#2C394C] border border-[#39465A] flex items-center justify-center gap-1.5 text-xs font-mono text-[#AEB9CC]">
                <HelpCircle className="w-3.5 h-3.5 text-[#F5F3EE]" />
                <span>
                  Questions:{' '}
                  <strong className="text-[#F5F3EE] text-xs">{questionsCount}</strong>
                  {gameState.questionLimit > 0 && ` / ${gameState.questionLimit}`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* INTERACTIVE QUESTION TALLY BUTTONS (YES / NO / MAYBE) */}
          <div className="rounded-3xl bg-[#222F43] p-3.5 sm:p-4 border border-[#39465A] space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#AEB9CC] block text-center">
              AUDIENCE LIVE RESPONSE & QUESTION TRACKER:
            </span>

            <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => handleTallyQuestion('yes')}
                className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 active:scale-95 transition-all text-center space-y-0.5 shadow-sm"
              >
                <ThumbsUp className="w-4 h-4 text-emerald-400 mx-auto" />
                <span className="font-heading text-xs font-black text-emerald-300 block">
                  YES!
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTallyQuestion('no')}
                className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 active:scale-95 transition-all text-center space-y-0.5 shadow-sm"
              >
                <ThumbsDown className="w-4 h-4 text-red-400 mx-auto" />
                <span className="font-heading text-xs font-black text-red-300 block">
                  NO!
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTallyQuestion('maybe')}
                className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 active:scale-95 transition-all text-center space-y-0.5 shadow-sm"
              >
                <Meh className="w-4 h-4 text-amber-400 mx-auto" />
                <span className="font-heading text-xs font-black text-amber-300 block">
                  MAYBE
                </span>
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS (CORRECT GUESS / SKIP) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
            <Button
              variant="secondary"
              size="md"
              onClick={handleSkipTurn}
              disabled={isSettling}
              className="text-[#AEB9CC] hover:text-[#F5F3EE] bg-[#2C394C] border-[#39465A] font-mono text-xs w-full sm:w-auto"
            >
              <FastForward className="w-3.5 h-3.5 mr-1" />
              <span>SKIP (0 PTS)</span>
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowConfirmCorrect(true)}
              disabled={isSettling}
              className="font-heading text-xs font-black shadow-md bg-[#91A98B] hover:bg-emerald-400 border-[#91A98B] text-[#111827] flex items-center justify-center gap-1.5 w-full sm:w-auto px-6 py-2.5"
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>CORRECT GUESS! (+{isSpeedBonusEligible ? '15' : '10'} PTS)</span>
            </Button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR CORRECT GUESS */}
      {showConfirmCorrect && currentCharacter && currentGuesser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-5 rounded-3xl bg-[#222F43] border border-[#39465A] shadow-2xl space-y-3.5 text-center"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading text-base font-bold text-[#F5F3EE]">
                CONFIRM CORRECT GUESS
              </h3>
              <p className="text-xs text-[#AEB9CC] font-mono">
                Did <strong>{currentGuesser.name}</strong> successfully guess{' '}
                <strong className="text-[#F5F3EE]">"{currentCharacter.name}"</strong>?
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-[#AEB9CC]">Base Points:</span>
                <span className="text-[#F5F3EE] font-bold">+10 pts</span>
              </div>
              {isSpeedBonusEligible && (
                <div className="flex justify-between text-[#D4B879] font-bold">
                  <span>Speed Bonus (&gt;{speedBonusThreshold}s):</span>
                  <span>+5 pts</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#39465A] pt-1 text-emerald-400 font-black">
                <span>Total Award:</span>
                <span>+{isSpeedBonusEligible ? 15 : 10} pts</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirmCorrect(false)}
                className="flex-1 text-xs text-[#AEB9CC] hover:text-[#F5F3EE]"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCorrect}
                disabled={isSettling}
                className="flex-1 font-heading text-xs font-black bg-[#91A98B] text-[#111827] border-[#91A98B] hover:bg-emerald-400"
              >
                CONFIRM & AWARD
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* =========================================================================
          STAGE 4: TURN OUTCOME SCREEN
          ========================================================================= */}
      {stage === 'outcome' && lastOutcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#222F43] p-5 sm:p-7 border text-center space-y-4 shadow-2xl"
          style={{
            borderColor:
              lastOutcome.outcome === 'correct'
                ? '#91A98B80'
                : '#EF444480',
          }}
        >
          {/* Outcome Icon & Title */}
          <div className="space-y-1.5">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg border ${
                lastOutcome.outcome === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}
            >
              {lastOutcome.outcome === 'correct' ? '🎉' : lastOutcome.outcome === 'timeout' ? '⏰' : '⏭️'}
            </div>

            <h2 className="font-heading sm:font-broadcast text-2xl sm:text-3xl font-black text-[#F5F3EE] tracking-wide uppercase">
              {lastOutcome.outcome === 'correct'
                ? 'CORRECT GUESS!'
                : lastOutcome.outcome === 'timeout'
                ? "TIME'S UP!"
                : 'ROUND SKIPPED!'}
            </h2>

            <p className="text-xs font-mono text-[#AEB9CC]">
              {lastOutcome.playerName} was <strong>"{lastOutcome.characterName}"</strong>
            </p>
          </div>

          {/* Points summary banner */}
          <div className="p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] max-w-sm mx-auto space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AEB9CC]">
              POINTS AWARDED
            </span>
            <div
              className={`font-heading sm:font-broadcast text-3xl font-black ${
                lastOutcome.pointsAwarded > 0 ? 'text-[#91A98B]' : 'text-[#AEB9CC]'
              }`}
            >
              +{lastOutcome.pointsAwarded} PTS
            </div>
            {lastOutcome.speedBonus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D4B879] font-bold">
                <Zap className="w-3 h-3" /> Includes +5 Speed Bonus!
              </span>
            )}
            <div className="text-[10px] font-mono text-[#AEB9CC] pt-0.5">
              Time taken: {lastOutcome.timeTaken}s • Questions: {lastOutcome.questionsAsked}
            </div>
          </div>

          {/* Current Scoreboard Snapshot */}
          <div className="max-w-sm mx-auto space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
              CURRENT STANDINGS
            </span>
            <div className="space-y-1">
              {standings.map((score, idx) => (
                <div
                  key={score.playerId}
                  className="p-2 rounded-xl bg-[#2C394C] border border-[#39465A] flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[#AEB9CC] font-bold w-4 text-[11px]">{idx + 1}.</span>
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white"
                      style={{ backgroundColor: score.color }}
                    >
                      {score.avatar}
                    </span>
                    <span className="font-bold text-[#F5F3EE]">{score.name}</span>
                  </div>
                  <span className="font-heading font-bold text-xs text-[#F5F3EE]">
                    {score.totalScore} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Turn Button */}
          <div className="pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNextTurn}
              className="font-heading text-xs font-black shadow-md bg-[#D97858] text-[#F5F3EE] hover:bg-white hover:text-[#111827] mx-auto px-6 py-2.5"
            >
              <span>{gameState.isCompleted ? 'VIEW FINAL PODIUM' : 'NEXT GUESSER →'}</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          STAGE 5: FINAL TOURNAMENT PODIUM SCREEN
          ========================================================================= */}
      {stage === 'podium' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#222F43] p-6 sm:p-8 border border-[#39465A] text-center space-y-5 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 bg-[#D97858]/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Trophy Header */}
          <div className="space-y-1.5">
            <div className="w-14 h-14 rounded-2xl bg-[#2C394C] border border-[#39465A] text-[#D97858] flex items-center justify-center mx-auto shadow-md">
              <Trophy className="w-7 h-7" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono font-bold text-[#91A98B]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TOURNAMENT COMPLETED</span>
            </div>
            <h1 className="font-heading sm:font-broadcast text-3xl sm:text-5xl font-black text-[#F5F3EE] tracking-wide uppercase">
              WHO AM I? CHAMPION
            </h1>
          </div>

          {/* PODIUM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-1">
            {standings.slice(0, 3).map((player, idx) => {
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              const medalTitle = idx === 0 ? 'CHAMPION' : idx === 1 ? 'RUNNER UP' : '3RD PLACE';
              const isWinner = idx === 0;

              return (
                <div
                  key={player.playerId}
                  className={`p-4 rounded-2xl border flex flex-col justify-between text-center relative overflow-hidden space-y-2 ${
                    isWinner
                      ? 'bg-[#2C394C] border-[#F5F3EE] ring-1 ring-[#F5F3EE]/20 shadow-md sm:-translate-y-1'
                      : 'bg-[#2C394C] border-[#39465A]'
                  }`}
                >
                  <div className="text-xl">{medalEmoji}</div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#AEB9CC]">
                      {medalTitle}
                    </span>
                    <h3
                      className="font-heading font-bold text-base text-[#F5F3EE] truncate"
                      style={{ color: player.color }}
                    >
                      {player.name}
                    </h3>
                  </div>

                  <div className="py-1 border-t border-b border-[#39465A]">
                    <span className="font-mono text-2xl font-black text-[#F5F3EE]">
                      {player.totalScore}
                    </span>
                    <span className="text-[10px] font-mono text-[#AEB9CC] block">points</span>
                  </div>

                  <div className="text-[10px] font-mono text-[#AEB9CC] space-y-0.5">
                    <div>Correct: <strong className="text-[#F5F3EE]">{player.correctGuesses}</strong></div>
                    <div>Speed Bonus: <strong className="text-[#D4B879]">{player.speedBonuses}</strong></div>
                    {player.fastestGuessTime !== null && (
                      <div>Fastest: <strong className="text-[#F5F3EE]">{player.fastestGuessTime}s</strong></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-[#39465A]">
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                clearWhoAmIState();
                onExitToSetup();
              }}
              className="font-heading text-xs font-bold border-[#39465A] bg-[#2C394C] hover:bg-[#39465A] text-[#F5F3EE]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>NEW TOURNAMENT SETUP</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
