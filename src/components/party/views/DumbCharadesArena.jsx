import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  VolumeX, 
  Trophy,
  Flame,
  RotateCcw,
  Layers,
  StopCircle,
  Home,
  BarChart2,
  Award,
  Zap,
  FastForward,
  ShieldAlert,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { soundService } from '../../../services/soundService';
import { 
  getSavedDumbCharadesState, 
  saveDumbCharadesState, 
  clearDumbCharadesState, 
  assignNextPromptAndConsume, 
  recordDumbCharadesTurnOutcome, 
  proceedToNextTurn,
  replayDumbCharadesWithUnusedPrompts,
  calculateDumbCharadesStandings,
  getDumbCharadesPerformanceSummary
} from '../../../services/party/dumbCharadesEngine';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const DumbCharadesArena = ({
  initialTournament,
  onExitToSetup,
}) => {
  // State from props or restored from LocalStorage
  const [tournament, setTournament] = useState(() => {
    const saved = getSavedDumbCharadesState();
    if (saved && saved.shuffledQueue && saved.selectedTeams) {
      return saved;
    }
    return initialTournament;
  });

  const [timeLeft, setTimeLeft] = useState(() => {
    return tournament?.remainingTime || tournament?.timerDuration || 60;
  });

  const [showStatsModal, setShowStatsModal] = useState(false);

  const timerRef = useRef(null);
  const isSettlingTurnRef = useRef(false);

  // Auto-persist state
  useEffect(() => {
    if (tournament) {
      saveDumbCharadesState(tournament);
    }
  }, [tournament]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const {
    listName,
    shuffledQueue = [],
    consumedPromptIds = [],
    selectedTeams = [],
    currentTeamIndex = 0,
    activePrompt,
    turnState = 'pass',
    timerDuration = 60,
    scoringConfig = { basePoints: 1, streakBonusEnabled: false, skipPenalty: 0, timeoutPenalty: 0 },
    teamStats = {},
    turnHistory = [],
    lastTurnOutcome = null,
    isCompleted = false,
  } = tournament || {};

  const currentTeam = selectedTeams[currentTeamIndex] || selectedTeams[0];
  const consumedSet = new Set(consumedPromptIds);
  const remainingPromptsCount = shuffledQueue.filter((p) => !consumedSet.has(p.id)).length;
  const standings = calculateDumbCharadesStandings(teamStats, selectedTeams);
  const performanceSummary = getDumbCharadesPerformanceSummary(teamStats, selectedTeams, turnHistory);

  // Fire celebratory confetti on game completion
  useEffect(() => {
    if (isCompleted || turnState === 'completed') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted, turnState]);

  // Handle Step 2 -> Step 3: Player clicks "I'M READY — REVEAL PROMPT"
  const handleReadyClick = () => {
    if (isSettlingTurnRef.current) return;

    // Assign and consume next prompt
    const nextState = assignNextPromptAndConsume(tournament);
    setTournament(nextState);

    if (nextState.turnState === 'completed') {
      toast.info('All prompts in the queue have been exhausted!');
      return;
    }

    const duration = nextState.timerDuration || 60;
    setTimeLeft(duration);

    // Play round start chime
    soundService?.play?.('round_start');

    // Start timer countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTurnFinished('timeout', duration);
          return 0;
        }

        // Procedural tick audio
        if (prev <= 10) {
          soundService?.play?.('timer_warning');
        } else if (prev % 5 === 0) {
          soundService?.play?.('tick');
        }

        return prev - 1;
      });
    }, 1000);
  };

  // Handle turn outcome (FOUND, NOT_FOUND / SKIP, or TIMEOUT)
  const handleTurnFinished = (outcomeType, timeUsed) => {
    if (isSettlingTurnRef.current) return;
    isSettlingTurnRef.current = true;

    if (timerRef.current) clearInterval(timerRef.current);

    // Audio SFX & toast feedback
    if (outcomeType === 'found') {
      soundService?.play?.('success');
      toast.success(`${currentTeam?.name} FOUND the prompt!`);
    } else if (outcomeType === 'timeout') {
      soundService?.play?.('timer_expired');
      toast.warning(`Time ran out for ${currentTeam?.name}!`);
    } else {
      soundService?.play?.('skip');
      toast.info(`${currentTeam?.name} passed/skipped prompt.`);
    }

    // Advance turn and update scores
    setTournament((prev) => {
      const updated = recordDumbCharadesTurnOutcome(prev, outcomeType, timeUsed);
      return updated;
    });

    setTimeLeft(timerDuration);

    setTimeout(() => {
      isSettlingTurnRef.current = false;
    }, 300);
  };

  // Advance from 'result' screen to next turn's 'pass' screen
  const handleProceedNext = () => {
    const nextState = proceedToNextTurn(tournament);
    setTournament(nextState);
    setTimeLeft(nextState.timerDuration || 60);
  };

  // Replay with unused prompts
  const handleReplayUnused = () => {
    try {
      const replayed = replayDumbCharadesWithUnusedPrompts(tournament);
      setTournament(replayed);
      setTimeLeft(replayed.timerDuration || 60);
      toast.success('New round started with unused prompts!');
    } catch (err) {
      toast.error(err.message || 'No remaining prompts to replay.');
    }
  };

  // Manual end tournament
  const handleEndTournament = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTournament((prev) => ({
      ...prev,
      turnState: 'completed',
      isCompleted: true,
      activePrompt: null,
    }));
  };

  // Reset / Start fresh tournament
  const handleNewTournament = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearDumbCharadesState();
    onExitToSetup();
  };

  // SVG Circular Timer Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.max(0, Math.min(1, timeLeft / timerDuration));
  const strokeDashoffset = circumference - (progressRatio * circumference);
  const isFinal10Seconds = timeLeft <= 10;

  // =========================================================================
  // VIEW 1: GAME COMPLETED / PODIUM
  // =========================================================================
  if (isCompleted || turnState === 'completed') {
    const champion = performanceSummary.champion;
    const runnerUp = performanceSummary.runnerUp;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-brand-purple text-center relative overflow-hidden shadow-2xl space-y-6"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[140px] opacity-25 pointer-events-none rounded-full"
            style={{ backgroundColor: champion?.color || '#9147FF' }}
          />

          <Badge variant="purple" pulse className="px-4 py-1.5 text-xs font-mono">
            🏆 TOURNAMENT CONCLUDED • ALL PROMPTS CONSUMED
          </Badge>

          <div>
            <div className="text-6xl mb-2">{champion?.avatar}</div>
            <h1 className="font-broadcast text-4xl sm:text-6xl font-black text-white uppercase tracking-wider">
              {champion?.name} WINS!
            </h1>
            <p className="text-sm font-mono text-battle-muted mt-1">
              Crown Champion with <strong>{champion?.score} Points</strong> ({champion?.found} Found • {champion?.notFound} Skipped • {champion?.timeout} Timeouts)
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto pt-2">
            <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-center">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Total Turns</span>
              <span className="font-broadcast text-xl font-bold text-white">{performanceSummary.totalTurns}</span>
            </div>
            <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-center">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Overall Accuracy</span>
              <span className="font-broadcast text-xl font-bold text-brand-neon">{performanceSummary.overallAccuracy}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-center">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Prompts Found</span>
              <span className="font-broadcast text-xl font-bold text-emerald-400">{performanceSummary.totalFound}</span>
            </div>
            <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border text-center">
              <span className="text-[10px] font-mono text-battle-muted uppercase block">Best Team Streak</span>
              <span className="font-broadcast text-xl font-bold text-brand-orange">
                {performanceSummary.highestStreak}🔥 ({performanceSummary.bestStreakTeam?.name || 'N/A'})
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {remainingPromptsCount > 0 && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleReplayUnused}
                className="font-broadcast text-xs bg-brand-cyan hover:bg-cyan-500 text-dark-950 font-black shadow-glow-cyan"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                <span>REPLAY UNUSED PROMPTS ({remainingPromptsCount} REMAINING)</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              onClick={handleNewTournament}
              className="font-broadcast text-xs border-battle-border hover:border-brand-purple text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1.5" />
              <span>NEW TOURNAMENT SETUP</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={onExitToSetup}
              className="font-broadcast text-xs text-battle-muted hover:text-white"
            >
              <Home className="w-4 h-4 mr-1.5" />
              <span>PARTY ARENA LOBBY</span>
            </Button>
          </div>
        </motion.div>

        {/* Final Standings Table */}
        <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-battle-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-purple" />
              <h2 className="font-broadcast font-bold text-lg text-white">FINAL STANDINGS & STATISTICS</h2>
            </div>
            <span className="text-xs font-mono text-battle-muted">{listName}</span>
          </div>

          <div className="space-y-2">
            {standings.map((team, idx) => (
              <div
                key={team.id}
                className="p-4 rounded-2xl bg-battle-bg border border-battle-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-broadcast font-bold ${
                    idx === 0 ? 'bg-amber-400 text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-battle-surface text-battle-muted'
                  }`}>
                    {idx + 1}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.avatar}
                  </div>
                  <div>
                    <h3 className="font-broadcast font-bold text-white text-base">{team.name}</h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-battle-muted">
                      <span>Accuracy: <strong className="text-white">{team.accuracy}%</strong></span>
                      <span>•</span>
                      <span>Best Streak: <strong className="text-brand-orange">{team.bestStreak}🔥</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto font-mono text-xs">
                  <div className="text-right">
                    <span className="text-battle-muted block text-[10px]">FOUND / MISS / TIME</span>
                    <span className="text-white font-bold">{team.found} / {team.notFound} / {team.timeout}</span>
                  </div>
                  <div className="text-right pl-3 border-l border-battle-border">
                    <span className="text-battle-muted block text-[10px]">TOTAL SCORE</span>
                    <span className="font-broadcast text-2xl font-black text-brand-cyan">{team.score} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE GAMEPLAY
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-battle-border pb-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitToSetup}
            className="text-xs text-battle-muted hover:text-white"
          >
            ← Exit Setup
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-lg">🎭</span>
            <span className="font-broadcast text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">
              {listName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Performance Dashboard Modal Trigger */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStatsModal(true)}
            className="font-mono text-xs text-battle-muted hover:text-brand-cyan flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Stats</span>
          </Button>

          <Badge variant="purple" className="font-mono text-xs">
            {remainingPromptsCount} Unused Prompts
          </Badge>
        </div>
      </div>

      {/* =========================================================================
          STEP 1: DEDICATED PASS-THE-LAPTOP TURN INTRODUCTION SCREEN
          ========================================================================= */}
      {turnState === 'pass' && (
        <motion.div
          key={`pass_${currentTeam?.id}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="rounded-3xl battle-panel p-8 sm:p-12 border-2 text-center relative overflow-hidden shadow-2xl space-y-6"
          style={{ borderColor: `${currentTeam?.color}60` }}
        >
          {/* Ambient Lighting */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[130px] opacity-25 pointer-events-none"
            style={{ backgroundColor: currentTeam?.color }}
          />

          {/* Turn Order Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-battle-muted">
            <span>TURN {turnHistory.length + 1}</span>
            <span>•</span>
            <span style={{ color: currentTeam?.color }}>{currentTeam?.name.toUpperCase()}</span>
          </div>

          {/* Team Profile Banner */}
          <div className="space-y-3">
            <div
              className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-5xl shadow-xl border-2"
              style={{
                backgroundColor: `${currentTeam?.color}20`,
                borderColor: currentTeam?.color,
                color: currentTeam?.color,
              }}
            >
              {currentTeam?.avatar}
            </div>

            <h1 className="font-broadcast text-3xl sm:text-5xl font-black text-white uppercase tracking-wider">
              PASS THE LAPTOP TO <span style={{ color: currentTeam?.color }}>{currentTeam?.name}</span>
            </h1>

            <p className="text-xs sm:text-sm text-battle-muted max-w-lg mx-auto leading-relaxed">
              Only <strong className="text-white">{currentTeam?.name}</strong> should view the screen now. All other players must look away. When ready, click below to privately reveal your prompt and start the {timerDuration}s clock!
            </p>
          </div>

          {/* Privacy Notice Box */}
          <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-battle-bg border border-battle-border flex items-center justify-center gap-2 text-xs font-mono text-battle-muted">
            <ShieldAlert className="w-4 h-4 text-brand-orange flex-shrink-0" />
            <span>Anti-Cheat Guard Active • Prompts strictly hidden from spectators</span>
          </div>

          {/* REVEAL PROMPT BUTTON */}
          <div className="pt-2 max-w-sm mx-auto">
            <Button
              variant="primary"
              size="xl"
              onClick={handleReadyClick}
              className="w-full font-broadcast text-sm font-black shadow-glow flex items-center justify-center gap-2 py-4"
              style={{
                backgroundColor: currentTeam?.color,
                borderColor: currentTeam?.color,
                color: '#080A12',
              }}
            >
              <Eye className="w-4 h-4" />
              <span>I'M READY — REVEAL PROMPT</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          STEP 2: ACTIVE PROMPT STAGE (CIRCULAR TIMER & CRISP DISPLAY)
          ========================================================================= */}
      {turnState === 'acting' && activePrompt && (
        <motion.div
          key={`acting_${activePrompt?.id}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className={`rounded-3xl battle-panel p-6 sm:p-10 border-2 relative overflow-hidden shadow-2xl space-y-6 ${
            isFinal10Seconds ? 'border-red-500/80 shadow-red-500/20 animate-pulse' : 'border-brand-purple/60'
          }`}
        >
          {/* Top Status Bar: Team & Category */}
          <div className="flex items-center justify-between pb-4 border-b border-battle-border">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                style={{ backgroundColor: currentTeam?.color }}
              >
                {currentTeam?.avatar}
              </div>
              <div>
                <span className="text-[10px] font-mono text-battle-muted uppercase block">ACTING NOW</span>
                <h3 className="font-broadcast font-bold text-base text-white">{currentTeam?.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="cyan" className="font-mono text-xs">
                {activePrompt.category || 'Movie'}
              </Badge>
              {activePrompt.wordsCount && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {activePrompt.wordsCount} {activePrompt.wordsCount === 1 ? 'Word' : 'Words'}
                </Badge>
              )}
            </div>
          </div>

          {/* MAIN PROMPT CARD */}
          <div className="text-center py-4 space-y-4">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-battle-muted block">
              SECRET MOVIE / PROMPT:
            </span>

            <h1 className="font-broadcast text-4xl sm:text-6xl font-black text-white tracking-wide uppercase drop-shadow-md select-none">
              {activePrompt.name || activePrompt.title}
            </h1>

            {activePrompt.hint && (
              <p className="text-xs font-mono text-amber-300 max-w-md mx-auto bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl">
                💡 <strong>Hint:</strong> {activePrompt.hint}
              </p>
            )}
          </div>

          {/* CIRCULAR SVG COUNTDOWN TIMER */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Track circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                />
                {/* Progress animated circle */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={isFinal10Seconds ? '#EF4444' : timeLeft <= 20 ? '#FF8A35' : '#9147FF'}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center digital time */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`font-mono text-4xl font-black leading-none ${
                  isFinal10Seconds ? 'text-red-400 animate-bounce' : 'text-white'
                }`}>
                  {timeLeft}
                </span>
                <span className="text-[10px] font-mono text-battle-muted uppercase mt-0.5">SECONDS</span>
              </div>
            </div>

            {isFinal10Seconds && (
              <span className="text-xs font-mono text-red-400 font-bold mt-2 animate-pulse">
                ⚠️ FINAL 10 SECONDS!
              </span>
            )}
          </div>

          {/* ACTION BUTTONS (FOUND / SKIP / NOT FOUND) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-battle-border">
            {/* SKIP */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleTurnFinished('not_found', timerDuration - timeLeft)}
              className="font-broadcast text-xs border-battle-border hover:border-amber-400 text-amber-300 flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4" />
              <span>SKIP PROMPT (0 PTS)</span>
            </Button>

            {/* NOT FOUND */}
            <Button
              variant="secondary"
              size="lg"
              onClick={() => handleTurnFinished('not_found', timerDuration - timeLeft)}
              className="font-broadcast text-xs border-battle-border hover:border-red-500 text-red-400 flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              <span>NOT FOUND (0 PTS)</span>
            </Button>

            {/* FOUND! */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => handleTurnFinished('found', timerDuration - timeLeft)}
              className="font-broadcast text-xs font-black shadow-glow bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-dark-950 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 fill-current" />
              <span>CORRECT / FOUND! (+{scoringConfig.basePoints || 1} PT)</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          STEP 3: RESULT TRANSITION SCREEN BEFORE NEXT TURN
          ========================================================================= */}
      {turnState === 'result' && lastTurnOutcome && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl battle-panel p-8 sm:p-10 border text-center space-y-6 shadow-2xl"
          style={{
            borderColor: lastTurnOutcome.result === 'found' ? '#10B98160' : '#EF444460',
          }}
        >
          <div className="space-y-2">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg border ${
              lastTurnOutcome.result === 'found'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {lastTurnOutcome.result === 'found' ? '🎉' : lastTurnOutcome.result === 'timeout' ? '⏰' : '⏭️'}
            </div>

            <h2 className="font-broadcast text-3xl font-black text-white tracking-wide uppercase">
              {lastTurnOutcome.result === 'found'
                ? 'PROMPT GUESSED!'
                : lastTurnOutcome.result === 'timeout'
                ? "TIME'S UP!"
                : 'PROMPT SKIPPED!'}
            </h2>

            <p className="text-xs font-mono text-battle-muted">
              {lastTurnOutcome.teamName} completed their turn in {lastTurnOutcome.secondsUsed}s
            </p>
          </div>

          {/* Points & Streak Banner */}
          <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border max-w-sm mx-auto space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-battle-muted">
              POINTS EARNED
            </span>
            <div className={`font-broadcast text-4xl font-black ${
              lastTurnOutcome.points > 0 ? 'text-emerald-400' : 'text-battle-muted'
            }`}>
              +{lastTurnOutcome.points} PTS
            </div>
            {lastTurnOutcome.streakBonus > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 font-bold">
                <Flame className="w-3.5 h-3.5" /> +{lastTurnOutcome.streakBonus} Streak Bonus Awarded!
              </span>
            )}
            {lastTurnOutcome.currentStreak > 1 && (
              <div className="text-[11px] font-mono text-brand-orange">
                🔥 Current Streak: {lastTurnOutcome.currentStreak} in a row!
              </div>
            )}
          </div>

          {/* Standings Snapshot */}
          <div className="max-w-md mx-auto space-y-1.5">
            <span className="text-[11px] font-mono font-bold text-battle-muted uppercase tracking-wider block">
              CURRENT LEADERBOARD
            </span>
            {standings.map((t, idx) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-battle-bg border border-battle-border flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-battle-muted font-bold w-4">{idx + 1}.</span>
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </span>
                  <span className="font-bold text-white">{t.name}</span>
                </div>
                <span className="font-broadcast font-bold text-sm text-brand-cyan">
                  {t.score} pts
                </span>
              </div>
            ))}
          </div>

          {/* NEXT TURN PROCEED BUTTON */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="xl"
              onClick={handleProceedNext}
              className="font-broadcast text-xs font-black shadow-glow bg-brand-purple text-white border-brand-purple hover:scale-105 transition-transform mx-auto px-8"
            >
              <span>NEXT TURN: PASS TO {currentTeam?.name.toUpperCase()} →</span>
            </Button>
          </div>
        </motion.div>
      )}

      {/* =========================================================================
          PERFORMANCE STATS DRAWER / MODAL
          ========================================================================= */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-battle-bg/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl p-6 rounded-3xl bg-battle-surface border border-brand-purple/50 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-battle-border pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-brand-cyan" />
                <h3 className="font-broadcast text-lg font-bold text-white">
                  TOURNAMENT PERFORMANCE DASHBOARD
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatsModal(false)}
                className="text-xs text-battle-muted hover:text-white"
              >
                ✕ Close
              </Button>
            </div>

            {/* Team stats table */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {standings.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-broadcast font-bold text-sm text-white">
                        #{idx + 1} {team.name}
                      </span>
                      <span className="text-xs">{team.avatar}</span>
                    </div>
                    <span className="font-broadcast text-lg font-black text-brand-cyan">
                      {team.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] font-mono text-battle-muted border-t border-battle-border/60 pt-2">
                    <div>Found: <strong className="text-emerald-400">{team.found}</strong></div>
                    <div>Missed: <strong className="text-red-400">{team.notFound}</strong></div>
                    <div>Timeouts: <strong className="text-amber-400">{team.timeout}</strong></div>
                    <div>Accuracy: <strong className="text-white">{team.accuracy}%</strong></div>
                    <div>Best Streak: <strong className="text-brand-orange">{team.bestStreak}🔥</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Controls: End Tournament */}
      {turnState !== 'completed' && !isCompleted && (
        <div className="flex justify-end pt-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleEndTournament}
            className="text-[11px] font-mono text-battle-muted hover:text-red-400"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            End Tournament Early
          </Button>
        </div>
      )}
    </div>
  );
};
