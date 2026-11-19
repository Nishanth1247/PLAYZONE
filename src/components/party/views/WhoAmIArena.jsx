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
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header / Progress Bar */}
      <div className="flex items-center justify-between border-b border-battle-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitToSetup}
            className="text-battle-muted hover:text-white text-xs"
          >
            ← Exit Setup
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-lg">❓</span>
            <span className="font-broadcast text-sm font-bold text-white tracking-wide">
              {gameState.collectionName}
            </span>
          </div>
        </div>

        {stage !== 'podium' && (
          <div className="flex items-center gap-2">
            <Badge variant="cyan" className="font-mono text-xs">
              Turn {currentTurnNum} / {totalTurns}
            </Badge>
            <Badge variant="purple" className="font-mono text-xs">
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
          className="battle-panel rounded-3xl p-8 border text-center space-y-6 shadow-2xl relative overflow-hidden"
          style={{ borderColor: `${currentGuesser.color}60` }}
        >
          {/* Ambient Lighting */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
            style={{ backgroundColor: currentGuesser.color }}
          />

          {/* Turn Banner */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-battle-muted">
            <span>ROUND {currentTurn?.roundNumber}</span>
            <span>•</span>
            <span>TURN {currentTurnNum} OF {totalTurns}</span>
          </div>

          {/* Guesser Spotlight Card */}
          <div className="space-y-3">
            <div
              className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl border-2"
              style={{
                backgroundColor: `${currentGuesser.color}25`,
                borderColor: currentGuesser.color,
                color: currentGuesser.color,
              }}
            >
              {currentGuesser.avatar}
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-battle-muted">
                CURRENT GUESSER
              </span>
              <h2
                className="font-broadcast text-4xl sm:text-5xl font-black tracking-wide uppercase"
                style={{ color: currentGuesser.color }}
              >
                {currentGuesser.name}
              </h2>
              <span className="text-xs font-mono text-battle-muted">
                {currentGuesser.tagline}
              </span>
            </div>
          </div>

          {/* PHYSICAL INSTRUCTIONS BOX */}
          <div className="max-w-xl mx-auto p-5 rounded-2xl bg-battle-bg border border-battle-border text-left space-y-3">
            <div className="flex items-center gap-2 text-brand-orange font-broadcast text-xs font-bold tracking-wider uppercase">
              <EyeOff className="w-4 h-4" />
              <span>PHYSICAL INSTRUCTIONS BEFORE REVEALING:</span>
            </div>
            <ul className="text-xs sm:text-sm text-battle-text space-y-2 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-brand-cyan font-bold">1.</span>
                <span>
                  <strong>{currentGuesser.name}</strong> must stand behind the laptop facing <strong>AWAY</strong> from the screen!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-purple font-bold">2.</span>
                <span>
                  All other players sit in front of the laptop. You will see the secret character!
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-neon font-bold">3.</span>
                <span>
                  {currentGuesser.name} asks Yes/No questions. Everyone answers: <strong>YES, NO, or MAYBE</strong>!
                </span>
              </li>
            </ul>
          </div>

          {/* START REVEAL BUTTON */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="xl"
              onClick={handleStartReveal}
              className="font-broadcast text-sm font-black shadow-glow flex items-center justify-center gap-2 mx-auto px-8"
              style={{
                backgroundColor: currentGuesser.color,
                borderColor: currentGuesser.color,
                color: '#080A12',
              }}
            >
              <Eye className="w-4 h-4" />
              <span>GUESSER IS IN POSITION — REVEAL CHARACTER</span>
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
          className="battle-panel rounded-3xl p-16 border border-brand-cyan/40 text-center space-y-4 shadow-2xl"
        >
          <span className="text-xs font-mono font-bold tracking-widest text-battle-muted uppercase">
            CHARACTER REVEALING IN
          </span>
          <div className="font-broadcast text-8xl sm:text-9xl font-black neon-text-cyan">
            {countdownNum}
          </div>
          <span className="text-sm font-mono text-brand-orange">
            Guesser face away now!
          </span>
        </motion.div>
      )}

      {/* =========================================================================
          STAGE 3: ACTIVE GUESSING ARENA (SHARED SCREEN)
          ========================================================================= */}
      {stage === 'guessing' && currentCharacter && currentGuesser && (
        <div className="space-y-6">
          {/* TOP WARNING BANNER */}
          <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-center flex items-center justify-center gap-2 text-xs font-mono font-bold text-red-300 shadow-sm animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>AUDIENCE ONLY: GUESSER MUST NOT LOOK AT THIS SCREEN!</span>
          </div>

          {/* MAIN CHARACTER DISPLAY CARD */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-cyan/50 text-center space-y-5 relative overflow-hidden shadow-2xl"
          >
            {/* Ambient Lighting */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-cyan/15 rounded-full blur-[130px] pointer-events-none" />

            {/* Badges Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Badge variant="cyan" className="font-mono text-xs">
                {currentCharacter.category}
              </Badge>
              <Badge
                variant={
                  currentCharacter.difficulty === 'Easy'
                    ? 'neon'
                    : currentCharacter.difficulty === 'Hard'
                    ? 'danger'
                    : 'orange'
                }
                className="font-mono text-xs"
              >
                {currentCharacter.difficulty}
              </Badge>
              {isSpeedBonusEligible && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
                  <Zap className="w-3 h-3" />
                  Speed Bonus Eligible (+5 pts)
                </span>
              )}
            </div>

            {/* SECRET CHARACTER NAME */}
            <div className="py-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-battle-muted block mb-1">
                YOU ARE:
              </span>
              <h1 className="font-broadcast text-4xl sm:text-6xl font-black text-white tracking-wider uppercase drop-shadow-md">
                {currentCharacter.name}
              </h1>
            </div>

            {/* OPTIONAL HINT SECTION */}
            {currentCharacter.hint && (
              <div className="pt-1">
                {showHint ? (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/40 max-w-lg mx-auto text-xs text-amber-200 font-mono flex items-center justify-center gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span><strong>HINT:</strong> {currentCharacter.hint}</span>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setShowHint(true)}
                    className="font-mono text-xs text-battle-muted hover:text-amber-300"
                  >
                    <Lightbulb className="w-3.5 h-3.5 mr-1" />
                    Reveal Hint to Audience
                  </Button>
                )}
              </div>
            )}

            {/* TIMER & GUESSER STATUS STRIP */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-battle-border/80 max-w-2xl mx-auto">
              {/* Guesser pill */}
              <div className="p-2.5 rounded-xl bg-battle-bg border border-battle-border flex items-center gap-2.5 text-left">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: currentGuesser.color }}
                >
                  {currentGuesser.avatar}
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-battle-muted block">Guesser</span>
                  <h4 className="font-broadcast text-xs font-bold text-white truncate">
                    {currentGuesser.name}
                  </h4>
                </div>
              </div>

              {/* Turn Timer */}
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 ${
                  timeRemaining <= 10
                    ? 'bg-red-500/15 border-red-500/50 text-red-400 animate-pulse'
                    : 'bg-battle-bg border-battle-border text-white'
                }`}
              >
                <Clock className="w-4 h-4 text-brand-orange" />
                <span className="font-mono text-lg font-black">{timeRemaining}s</span>
              </div>

              {/* Questions tally count */}
              <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-battle-bg border border-battle-border flex items-center justify-center gap-2 text-xs font-mono text-battle-muted">
                <HelpCircle className="w-4 h-4 text-brand-cyan" />
                <span>
                  Questions:{' '}
                  <strong className="text-white text-sm">{questionsCount}</strong>
                  {gameState.questionLimit > 0 && ` / ${gameState.questionLimit}`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* INTERACTIVE QUESTION TALLY BUTTONS (YES / NO / MAYBE) */}
          <div className="battle-panel rounded-3xl p-5 border border-battle-border space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-battle-muted block text-center">
              AUDIENCE LIVE RESPONSE & QUESTION TRACKER:
            </span>

            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <button
                type="button"
                onClick={() => handleTallyQuestion('yes')}
                className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 active:scale-95 transition-all text-center space-y-1 shadow-sm"
              >
                <ThumbsUp className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="font-broadcast text-xs font-black text-emerald-300 block">
                  YES!
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTallyQuestion('no')}
                className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 hover:bg-red-500/25 active:scale-95 transition-all text-center space-y-1 shadow-sm"
              >
                <ThumbsDown className="w-5 h-5 text-red-400 mx-auto" />
                <span className="font-broadcast text-xs font-black text-red-300 block">
                  NO!
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTallyQuestion('maybe')}
                className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 active:scale-95 transition-all text-center space-y-1 shadow-sm"
              >
                <Meh className="w-5 h-5 text-amber-400 mx-auto" />
                <span className="font-broadcast text-xs font-black text-amber-300 block">
                  MAYBE
                </span>
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS (CORRECT GUESS / SKIP) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Button
              variant="ghost"
              size="lg"
              onClick={handleSkipTurn}
              disabled={isSettling}
              className="text-battle-muted hover:text-white border-battle-border font-mono text-xs w-full sm:w-auto"
            >
              <FastForward className="w-4 h-4 mr-1.5" />
              <span>SKIP (0 PTS)</span>
            </Button>

            <Button
              variant="primary"
              size="xl"
              onClick={() => setShowConfirmCorrect(true)}
              disabled={isSettling}
              className="font-broadcast text-sm font-black shadow-glow bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-battle-bg flex items-center justify-center gap-2 w-full sm:w-auto px-8"
            >
              <CheckCircle2 className="w-5 h-5 fill-current" />
              <span>CORRECT GUESS! (+{isSpeedBonusEligible ? '15' : '10'} PTS)</span>
            </Button>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL FOR CORRECT GUESS */}
      {showConfirmCorrect && currentCharacter && currentGuesser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-battle-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 rounded-3xl bg-battle-surface border border-emerald-500/60 shadow-2xl space-y-4 text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="font-broadcast text-lg font-bold text-white">
                CONFIRM CORRECT GUESS
              </h3>
              <p className="text-xs text-battle-muted font-mono">
                Did <strong>{currentGuesser.name}</strong> successfully guess{' '}
                <strong className="text-white">"{currentCharacter.name}"</strong>?
              </p>
            </div>

            <div className="p-3 rounded-xl bg-battle-bg border border-battle-border text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-battle-muted">Base Points:</span>
                <span className="text-white font-bold">+10 pts</span>
              </div>
              {isSpeedBonusEligible && (
                <div className="flex justify-between text-amber-300 font-bold">
                  <span>Speed Bonus (&gt;{speedBonusThreshold}s):</span>
                  <span>+5 pts</span>
                </div>
              )}
              <div className="flex justify-between border-t border-battle-border pt-1 text-emerald-400 font-black">
                <span>Total Award:</span>
                <span>+{isSpeedBonusEligible ? 15 : 10} pts</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                size="md"
                onClick={() => setShowConfirmCorrect(false)}
                className="flex-1 text-xs text-battle-muted hover:text-white"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmCorrect}
                disabled={isSettling}
                className="flex-1 font-broadcast text-xs font-black bg-emerald-500 text-battle-bg border-emerald-500 hover:bg-emerald-400"
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
          className="battle-panel rounded-3xl p-8 border text-center space-y-6 shadow-2xl"
          style={{
            borderColor:
              lastOutcome.outcome === 'correct'
                ? '#10B98150'
                : '#EF444450',
          }}
        >
          {/* Outcome Icon & Title */}
          <div className="space-y-2">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg border ${
                lastOutcome.outcome === 'correct'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-400 border-red-500/40'
              }`}
            >
              {lastOutcome.outcome === 'correct' ? '🎉' : lastOutcome.outcome === 'timeout' ? '⏰' : '⏭️'}
            </div>

            <h2 className="font-broadcast text-3xl font-black text-white tracking-wide uppercase">
              {lastOutcome.outcome === 'correct'
                ? 'CORRECT GUESS!'
                : lastOutcome.outcome === 'timeout'
                ? "TIME'S UP!"
                : 'ROUND SKIPPED!'}
            </h2>

            <p className="text-xs font-mono text-battle-muted">
              {lastOutcome.playerName} was <strong>"{lastOutcome.characterName}"</strong>
            </p>
          </div>

          {/* Points summary banner */}
          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border max-w-sm mx-auto space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-battle-muted">
              POINTS AWARDED
            </span>
            <div
              className={`font-broadcast text-4xl font-black ${
                lastOutcome.pointsAwarded > 0 ? 'text-emerald-400' : 'text-battle-muted'
              }`}
            >
              +{lastOutcome.pointsAwarded} PTS
            </div>
            {lastOutcome.speedBonus && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold">
                <Zap className="w-3 h-3" /> Includes +5 Speed Bonus!
              </span>
            )}
            <div className="text-[11px] font-mono text-battle-muted pt-1">
              Time taken: {lastOutcome.timeTaken}s • Questions: {lastOutcome.questionsAsked}
            </div>
          </div>

          {/* Current Scoreboard Snapshot */}
          <div className="max-w-md mx-auto space-y-2">
            <span className="text-[11px] font-mono font-bold text-battle-muted uppercase tracking-wider block">
              CURRENT STANDINGS
            </span>
            <div className="space-y-1.5">
              {standings.map((score, idx) => (
                <div
                  key={score.playerId}
                  className="p-2.5 rounded-xl bg-battle-bg border border-battle-border flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-battle-muted font-bold w-4">{idx + 1}.</span>
                    <span
                      className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white"
                      style={{ backgroundColor: score.color }}
                    >
                      {score.avatar}
                    </span>
                    <span className="font-bold text-white">{score.name}</span>
                  </div>
                  <span className="font-broadcast font-bold text-sm text-brand-cyan">
                    {score.totalScore} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Next Turn Button */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="xl"
              onClick={handleNextTurn}
              className="font-broadcast text-xs font-black shadow-glow-cyan bg-brand-cyan text-battle-bg border-brand-cyan hover:scale-105 transition-transform mx-auto px-8"
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
          className="battle-panel rounded-3xl p-8 border border-brand-cyan/40 text-center space-y-8 shadow-2xl relative overflow-hidden"
        >
          {/* Ambient Lighting */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-brand-cyan/15 rounded-full blur-[140px] pointer-events-none" />

          {/* Trophy Header */}
          <div className="space-y-2">
            <div className="w-20 h-20 rounded-3xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center mx-auto shadow-glow-cyan/40">
              <Trophy className="w-10 h-10" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-brand-neon">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TOURNAMENT COMPLETED</span>
            </div>
            <h1 className="font-broadcast text-4xl sm:text-5xl font-black text-white tracking-wide uppercase">
              WHO AM I? <span className="neon-text-cyan">CHAMPION</span>
            </h1>
          </div>

          {/* PODIUM GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-2">
            {standings.slice(0, 3).map((player, idx) => {
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              const medalTitle = idx === 0 ? 'CHAMPION' : idx === 1 ? 'RUNNER UP' : '3RD PLACE';
              const isWinner = idx === 0;

              return (
                <div
                  key={player.playerId}
                  className={`p-5 rounded-3xl border flex flex-col justify-between text-center relative overflow-hidden space-y-3 ${
                    isWinner
                      ? 'bg-battle-surface border-brand-cyan shadow-glow-cyan/30 sm:-translate-y-2'
                      : 'bg-battle-bg border-battle-border'
                  }`}
                >
                  <div className="text-2xl">{medalEmoji}</div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-battle-muted">
                      {medalTitle}
                    </span>
                    <h3
                      className="font-broadcast font-bold text-xl text-white truncate"
                      style={{ color: player.color }}
                    >
                      {player.name}
                    </h3>
                  </div>

                  <div className="py-2 border-t border-b border-battle-border/60">
                    <span className="font-broadcast text-3xl font-black text-white">
                      {player.totalScore}
                    </span>
                    <span className="text-xs font-mono text-battle-muted block">points</span>
                  </div>

                  <div className="text-[11px] font-mono text-battle-muted space-y-0.5">
                    <div>Correct: <strong>{player.correctGuesses}</strong></div>
                    <div>Speed Bonuses: <strong>{player.speedBonuses}</strong></div>
                    {player.fastestGuessTime !== null && (
                      <div>Fastest: <strong>{player.fastestGuessTime}s</strong></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-battle-border">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                clearWhoAmIState();
                onExitToSetup();
              }}
              className="font-broadcast text-xs font-bold border-battle-border hover:border-brand-cyan text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>NEW TOURNAMENT SETUP</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
