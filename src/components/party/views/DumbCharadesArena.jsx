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
      const isEarly = timeUsed <= timerDuration * 0.5;
      if (isEarly) {
        toast.success(`⚡ EARLY GUESS! ${currentTeam?.name} earned +1 BONUS point!`);
      } else {
        toast.success(`${currentTeam?.name} FOUND the prompt!`);
      }
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
  const radius = 44;
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
      <div className="max-w-3xl mx-auto px-4 py-5 space-y-5 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-[#222F43] p-6 sm:p-8 border-2 border-[#39465A] text-center relative overflow-hidden shadow-2xl space-y-4"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-48 blur-[100px] opacity-20 pointer-events-none rounded-full"
            style={{ backgroundColor: champion?.color || '#D97858' }}
          />

          <Badge variant="subtle" className="px-3.5 py-1 text-xs font-mono font-bold">
            🏆 TOURNAMENT CONCLUDED • ALL PROMPTS CONSUMED
          </Badge>

          <div>
            <div className="text-5xl mb-1.5">{champion?.avatar}</div>
            <h1 className="font-heading sm:font-broadcast text-3xl sm:text-5xl font-black text-[#F5F3EE] uppercase tracking-wider">
              {champion?.name} WINS!
            </h1>
            <p className="text-xs font-mono text-[#AEB9CC] mt-1">
              Crown Champion with <strong>{champion?.score} Points</strong> ({champion?.found} Found • {champion?.notFound} Skipped • {champion?.timeout} Timeouts)
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-xl mx-auto pt-1">
            <div className="p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] text-center">
              <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">Total Turns</span>
              <span className="font-heading sm:font-broadcast text-lg font-bold text-[#F5F3EE]">{performanceSummary.totalTurns}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] text-center">
              <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">Accuracy</span>
              <span className="font-heading sm:font-broadcast text-lg font-bold text-[#91A98B]">{performanceSummary.overallAccuracy}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] text-center">
              <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">Prompts Found</span>
              <span className="font-heading sm:font-broadcast text-lg font-bold text-[#F5F3EE]">{performanceSummary.totalFound}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] text-center">
              <span className="text-[10px] font-mono text-[#AEB9CC] uppercase block">Best Streak</span>
              <span className="font-heading sm:font-broadcast text-lg font-bold text-[#D97858]">
                {performanceSummary.highestStreak}🔥
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {remainingPromptsCount > 0 && (
              <Button
                variant="primary"
                size="md"
                onClick={handleReplayUnused}
                className="font-heading text-xs bg-[#D97858] hover:bg-white text-[#F5F3EE] hover:text-[#111827] font-black shadow-md"
              >
                <Zap className="w-3.5 h-3.5 mr-1" />
                <span>REPLAY UNUSED ({remainingPromptsCount})</span>
              </Button>
            )}

            <Button
              variant="secondary"
              size="md"
              onClick={handleNewTournament}
              className="font-heading text-xs border-[#39465A] bg-[#2C394C] hover:bg-[#39465A] text-[#F5F3EE]"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>NEW TOURNAMENT SETUP</span>
            </Button>

            <Button
              variant="ghost"
              size="md"
              onClick={onExitToSetup}
              className="font-heading text-xs text-[#AEB9CC] hover:text-[#F5F3EE]"
            >
              <Home className="w-3.5 h-3.5 mr-1" />
              <span>PARTY LOBBY</span>
            </Button>
          </div>
        </motion.div>

        {/* Final Standings Table */}
        <div className="rounded-3xl bg-[#222F43] p-5 sm:p-6 border border-[#39465A] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#39465A]">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D97858]" />
              <h2 className="font-heading font-bold text-sm sm:text-base text-[#F5F3EE]">FINAL STANDINGS & STATISTICS</h2>
            </div>
            <span className="text-xs font-mono text-[#AEB9CC]">{listName}</span>
          </div>

          <div className="space-y-2">
            {standings.map((team, idx) => (
              <div
                key={team.id}
                className="p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 relative overflow-hidden"
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: team.color }}
                />

                <div className="flex items-center gap-2.5 pl-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-heading font-black ${
                    idx === 0 ? 'bg-[#D4B879] text-black' : idx === 1 ? 'bg-slate-300 text-black' : 'bg-[#222F43] text-[#AEB9CC]'
                  }`}>
                    {idx + 1}
                  </span>
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.avatar}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-[#F5F3EE] text-sm">{team.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[#AEB9CC]">
                      <span>Accuracy: <strong className="text-[#F5F3EE]">{team.accuracy}%</strong></span>
                      <span>•</span>
                      <span>Best Streak: <strong className="text-[#D97858]">{team.bestStreak}🔥</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto font-mono text-xs">
                  <div className="text-right">
                    <span className="text-[#AEB9CC] block text-[9px]">FOUND / MISS / TIME</span>
                    <span className="text-[#F5F3EE] font-bold text-xs">{team.found} / {team.notFound} / {team.timeout}</span>
                  </div>
                  <div className="text-right pl-2.5 border-l border-[#39465A]">
                    <span className="text-[#AEB9CC] block text-[9px]">TOTAL SCORE</span>
                    <span className="font-heading font-black text-lg text-[#F5F3EE]">{team.score} pts</span>
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
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4 select-none">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#39465A] pb-3">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExitToSetup}
            className="text-xs text-[#AEB9CC] hover:text-[#F5F3EE] font-mono"
          >
            ← Exit Setup
          </Button>

          <div className="flex items-center gap-1.5">
            <span className="text-base">🎭</span>
            <span className="font-heading text-xs sm:text-sm font-bold text-[#F5F3EE] tracking-wide truncate max-w-[180px] sm:max-w-xs">
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
            className="font-mono text-xs text-[#AEB9CC] hover:text-[#F5F3EE] flex items-center gap-1.5"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#AEB9CC]" />
            <span>Stats</span>
          </Button>

          <Badge variant="subtle" className="font-mono text-[11px] py-0.5">
            {remainingPromptsCount} Prompts Left
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
          className="rounded-3xl bg-[#222F43] p-5 sm:p-7 border-2 text-center relative overflow-hidden shadow-2xl space-y-4"
          style={{ borderColor: `${currentTeam?.color}80` }}
        >
          {/* Ambient Lighting */}
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: currentTeam?.color }}
          />

          {/* Turn Order Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono font-bold text-[#AEB9CC]">
            <span>TURN {turnHistory.length + 1}</span>
            <span>•</span>
            <span style={{ color: currentTeam?.color }}>{currentTeam?.name.toUpperCase()}</span>
          </div>

          {/* Team Profile Banner */}
          <div className="space-y-2">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-2"
              style={{
                backgroundColor: `${currentTeam?.color}20`,
                borderColor: currentTeam?.color,
                color: currentTeam?.color,
              }}
            >
              {currentTeam?.avatar}
            </div>

            <h1 className="font-heading sm:font-broadcast text-2xl sm:text-4xl font-black text-[#F5F3EE] uppercase tracking-wider">
              PASS LAPTOP TO <span style={{ color: currentTeam?.color }}>{currentTeam?.name}</span>
            </h1>

            <p className="text-xs text-[#AEB9CC] max-w-md mx-auto leading-relaxed">
              Only <strong className="text-[#F5F3EE]">{currentTeam?.name}</strong> should view the screen now. All other players look away. When ready, click below to reveal the prompt and start the {timerDuration}s clock!
            </p>
          </div>

          {/* Privacy Notice Box */}
          <div className="max-w-sm mx-auto p-2.5 rounded-xl bg-[#2C394C] border border-[#39465A] flex items-center justify-center gap-2 text-[11px] font-mono text-[#AEB9CC]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#D97858] flex-shrink-0" />
            <span>Anti-Cheat Guard Active • Strictly hidden from spectators</span>
          </div>

          {/* REVEAL PROMPT BUTTON */}
          <div className="pt-1 max-w-xs mx-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={handleReadyClick}
              className="w-full font-heading text-xs sm:text-sm font-black shadow-xl flex items-center justify-center gap-2 py-3.5"
              style={{
                backgroundColor: currentTeam?.color,
                borderColor: currentTeam?.color,
                color: '#111827',
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
          className={`rounded-3xl bg-[#222F43] p-4 sm:p-6 border-2 relative overflow-hidden shadow-2xl space-y-3.5 ${
            isFinal10Seconds ? 'border-red-500/80 shadow-red-500/20 animate-pulse' : 'border-[#39465A]'
          }`}
        >
          {/* Top Status Bar: Team & Category */}
          <div className="flex items-center justify-between pb-2.5 border-b border-[#39465A]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-base shadow"
                style={{ backgroundColor: currentTeam?.color }}
              >
                {currentTeam?.avatar}
              </div>
              <div>
                <span className="text-[9px] font-mono text-[#AEB9CC] uppercase block">ACTING NOW</span>
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#F5F3EE]">{currentTeam?.name}</h3>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Badge variant="subtle" className="font-mono text-[10px]">
                {activePrompt.category || 'Movie'}
              </Badge>
              {activePrompt.wordsCount && (
                <Badge variant="outline" className="font-mono text-[10px] border-[#39465A] text-[#AEB9CC]">
                  {activePrompt.wordsCount} {activePrompt.wordsCount === 1 ? 'Word' : 'Words'}
                </Badge>
              )}
            </div>
          </div>

          {/* MAIN PROMPT CARD */}
          <div className="text-center py-2 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AEB9CC] block">
              SECRET MOVIE / PROMPT:
            </span>

            <h1 className="font-heading sm:font-broadcast text-3xl sm:text-5xl font-black text-[#F5F3EE] tracking-wide uppercase drop-shadow-md select-none">
              {activePrompt.name || activePrompt.title}
            </h1>

            {activePrompt.hint && (
              <p className="text-xs font-mono text-[#D4B879] max-w-md mx-auto bg-[#D4B879]/10 border border-[#D4B879]/30 p-2 rounded-xl">
                💡 <strong>Hint:</strong> {activePrompt.hint}
              </p>
            )}
          </div>

          {/* CIRCULAR SVG COUNTDOWN TIMER (Compact 28x28) */}
          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Track circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="7"
                />
                {/* Progress animated circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={isFinal10Seconds ? '#EF4444' : timeLeft <= 20 ? '#D97858' : '#91A98B'}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Center digital time */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`font-mono text-3xl sm:text-4xl font-black leading-none ${
                  isFinal10Seconds ? 'text-red-400 animate-bounce' : 'text-[#F5F3EE]'
                }`}>
                  {timeLeft}
                </span>
                <span className="text-[9px] font-mono text-[#AEB9CC] uppercase mt-0.5">SECONDS</span>
              </div>
            </div>

            {isFinal10Seconds && (
              <span className="text-xs font-mono text-red-400 font-bold mt-1.5 animate-pulse">
                ⚠️ FINAL 10 SECONDS!
              </span>
            )}
          </div>

          {/* ACTION BUTTONS (FOUND / SKIP / NOT FOUND) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[#39465A]">
            {/* SKIP */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleTurnFinished('not_found', timerDuration - timeLeft)}
              className="font-heading text-xs border-[#39465A] bg-[#2C394C] hover:bg-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] flex items-center justify-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>SKIP (0 PTS)</span>
            </Button>

            {/* NOT FOUND */}
            <Button
              variant="secondary"
              size="md"
              onClick={() => handleTurnFinished('not_found', timerDuration - timeLeft)}
              className="font-heading text-xs border-[#39465A] bg-[#2C394C] hover:border-red-500/50 text-red-400 flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>NOT FOUND (0 PTS)</span>
            </Button>

            {/* FOUND! */}
            <Button
              variant="primary"
              size="md"
              onClick={() => handleTurnFinished('found', timerDuration - timeLeft)}
              className="font-heading text-xs font-black shadow-md bg-[#91A98B] hover:bg-emerald-400 border-[#91A98B] text-[#111827] flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
              <span>CORRECT (+{scoringConfig.basePoints || 1} PT)</span>
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
          className="rounded-3xl bg-[#222F43] p-5 sm:p-7 border text-center space-y-4 shadow-2xl"
          style={{
            borderColor: lastTurnOutcome.result === 'found' ? '#91A98B80' : '#EF444480',
          }}
        >
          <div className="space-y-1.5">
            <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl shadow-lg border ${
              lastTurnOutcome.result === 'found'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-red-500/20 text-red-400 border-red-500/40'
            }`}>
              {lastTurnOutcome.result === 'found' ? '🎉' : lastTurnOutcome.result === 'timeout' ? '⏰' : '⏭️'}
            </div>

            <h2 className="font-heading sm:font-broadcast text-2xl sm:text-3xl font-black text-[#F5F3EE] tracking-wide uppercase">
              {lastTurnOutcome.result === 'found'
                ? 'PROMPT GUESSED!'
                : lastTurnOutcome.result === 'timeout'
                ? "TIME'S UP!"
                : 'PROMPT SKIPPED!'}
            </h2>

            <p className="text-xs font-mono text-[#AEB9CC]">
              {lastTurnOutcome.teamName} completed their turn in {lastTurnOutcome.secondsUsed}s
            </p>
          </div>

          {/* Points & Streak Banner */}
          <div className="p-3.5 rounded-2xl bg-[#2C394C] border border-[#39465A] max-w-sm mx-auto space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#AEB9CC]">
              POINTS EARNED
            </span>
            <div className={`font-heading sm:font-broadcast text-3xl font-black ${
              lastTurnOutcome.points > 0 ? 'text-[#91A98B]' : 'text-[#AEB9CC]'
            }`}>
              +{lastTurnOutcome.points} PTS
            </div>

            {/* Early Guess Celebratory Banner */}
            {lastTurnOutcome.isEarlyGuess && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-1 px-2.5 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>EARLY GUESS! +1 BONUS POINT</span>
              </motion.div>
            )}

            {lastTurnOutcome.streakBonus > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#D4B879] font-bold">
                <Flame className="w-3 h-3" /> +{lastTurnOutcome.streakBonus} Streak Bonus Awarded!
              </span>
            )}
            {lastTurnOutcome.currentStreak > 1 && (
              <div className="text-[11px] font-mono text-[#D97858]">
                🔥 Current Streak: {lastTurnOutcome.currentStreak} in a row!
              </div>
            )}
          </div>

          {/* Standings Snapshot */}
          <div className="max-w-sm mx-auto space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-[#AEB9CC] uppercase tracking-wider block">
              CURRENT LEADERBOARD
            </span>
            {standings.map((t, idx) => (
              <div
                key={t.id}
                className="p-2 rounded-xl bg-[#2C394C] border border-[#39465A] flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#AEB9CC] font-bold w-4 text-[11px]">{idx + 1}.</span>
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </span>
                  <span className="font-bold text-[#F5F3EE]">{t.name}</span>
                </div>
                <span className="font-heading font-bold text-xs text-[#F5F3EE]">
                  {t.score} pts
                </span>
              </div>
            ))}
          </div>

          {/* NEXT TURN PROCEED BUTTON */}
          <div className="pt-1">
            <Button
              variant="primary"
              size="lg"
              onClick={handleProceedNext}
              className="font-heading text-xs font-black shadow-md bg-[#D97858] text-[#F5F3EE] hover:bg-white hover:text-[#111827] mx-auto px-6 py-3"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl p-5 rounded-3xl bg-[#222F43] border border-[#39465A] shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between border-b border-[#39465A] pb-2.5">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#F5F3EE]" />
                <h3 className="font-heading text-base font-bold text-[#F5F3EE]">
                  TOURNAMENT PERFORMANCE DASHBOARD
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStatsModal(false)}
                className="text-xs text-[#AEB9CC] hover:text-[#F5F3EE]"
              >
                ✕ Close
              </Button>
            </div>

            {/* Team stats table */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {standings.map((team, idx) => (
                <div
                  key={team.id}
                  className="p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-xs sm:text-sm text-[#F5F3EE]">
                        #{idx + 1} {team.name}
                      </span>
                      <span className="text-xs">{team.avatar}</span>
                    </div>
                    <span className="font-mono text-sm font-black text-[#F5F3EE]">
                      {team.score} pts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-[#AEB9CC] border-t border-[#39465A] pt-1.5">
                    <div>Found: <strong className="text-emerald-400">{team.found}</strong></div>
                    <div>Missed: <strong className="text-red-400">{team.notFound}</strong></div>
                    <div>Timeouts: <strong className="text-[#D4B879]">{team.timeout}</strong></div>
                    <div>Accuracy: <strong className="text-[#F5F3EE]">{team.accuracy}%</strong></div>
                    <div>Best Streak: <strong className="text-[#D97858]">{team.bestStreak}🔥</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Bottom Controls: End Tournament */}
      {turnState !== 'completed' && !isCompleted && (
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleEndTournament}
            className="text-[11px] font-mono text-[#AEB9CC] hover:text-red-400"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            End Tournament Early
          </Button>
        </div>
      )}
    </div>
  );
};
