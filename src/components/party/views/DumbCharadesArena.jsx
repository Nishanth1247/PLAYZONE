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
  Home
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
  calculateDumbCharadesStandings 
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
    teamStats = {},
    turnHistory = [],
    isCompleted = false,
  } = tournament || {};

  const currentTeam = selectedTeams[currentTeamIndex] || selectedTeams[0];
  const consumedSet = new Set(consumedPromptIds);
  const remainingPromptsCount = shuffledQueue.filter((p) => !consumedSet.has(p.id)).length;
  const standings = calculateDumbCharadesStandings(teamStats, selectedTeams);

  // Fire celebratory confetti on game completion
  useEffect(() => {
    if (isCompleted || turnState === 'completed') {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [isCompleted, turnState]);

  // Handle Step 2 -> Step 3: Player clicks "I'M READY"
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
          soundService.playUrgentTick();
        } else if (prev % 5 === 0) {
          soundService.playTick();
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

    // Audio SFX
    if (outcomeType === 'found') {
      soundService.playBid();
      toast.success(`${currentTeam?.name} FOUND the prompt! (+1 Point)`);
    } else if (outcomeType === 'timeout') {
      soundService.playGavel();
      toast.warning(`Time ran out for ${currentTeam?.name}! (0 Points)`);
    } else {
      soundService.playGavel();
      toast.info(`${currentTeam?.name} passed/skipped prompt. (0 Points)`);
    }

    // Advance turn and update scores
    setTournament((prev) => {
      const updated = recordDumbCharadesTurnOutcome(prev, outcomeType, timeUsed);
      return updated;
    });

    setTimeLeft(timerDuration);

    // Release settlement lock after brief transition
    setTimeout(() => {
      isSettlingTurnRef.current = false;
    }, 300);
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

  // Reset / Start genuinely new tournament
  const handleNewTournament = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    clearDumbCharadesState();
    onExitToSetup();
  };

  // =========================================================================
  // VIEW 1: GAME COMPLETED / PODIUM
  // =========================================================================
  if (isCompleted || turnState === 'completed') {
    const champion = standings[0];
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-brand-purple text-center relative overflow-hidden shadow-2xl space-y-5"
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] blur-[140px] opacity-25 pointer-events-none rounded-full"
            style={{ backgroundColor: champion?.teamColor || '#9147FF' }}
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
              Crown Champion with {champion?.score} Points ({champion?.found} Found • {champion?.notFound} Missed • {champion?.timeout} Timeouts)
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleNewTournament}
              className="font-broadcast text-xs font-black bg-brand-purple hover:bg-purple-600 text-white shadow-glow-purple flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>START NEW TOURNAMENT</span>
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onExitToSetup}
              className="font-broadcast text-xs text-battle-muted hover:text-white flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>RETURN TO SETUP</span>
            </Button>
          </div>
        </motion.div>

        {/* Final Standings Table */}
        <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-battle-border space-y-4">
          <h3 className="font-broadcast font-bold text-lg text-white uppercase tracking-wider">
            Final Championship Standings
          </h3>

          <div className="divide-y divide-battle-border/60">
            {standings.map((st) => (
              <div key={st.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-battle-muted w-6">
                    #{st.rank}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base shadow"
                    style={{ backgroundColor: st.color }}
                  >
                    {st.avatar}
                  </div>
                  <div>
                    <h4 className="font-broadcast font-bold text-sm text-white">{st.name}</h4>
                    <span className="text-[11px] font-mono text-battle-muted">
                      {st.found} Found • {st.notFound} Missed • {st.timeout} Timeouts
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xl font-black text-brand-neon">
                    {st.score} PTS
                  </span>
                  <span className="text-[10px] font-mono text-battle-muted block">
                    Total Score
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Turn History Log */}
        {turnHistory.length > 0 && (
          <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-3">
            <h4 className="font-broadcast font-bold text-sm text-white uppercase">
              Tournament Turn History ({turnHistory.length} Turns)
            </h4>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
              {turnHistory.map((turn, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-battle-surface/40 border border-battle-border/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-battle-muted font-bold">#{turn.turnNumber}</span>
                    <span style={{ color: turn.teamColor }} className="font-bold">
                      {turn.teamAvatar} {turn.teamName}
                    </span>
                    <span className="text-battle-muted">•</span>
                    <span className="text-white truncate max-w-xs font-medium">"{turn.promptName}"</span>
                  </div>
                  <div>
                    {turn.result === 'found' ? (
                      <span className="text-emerald-400 font-bold">+1 PT (Found)</span>
                    ) : turn.result === 'timeout' ? (
                      <span className="text-rose-400 font-bold">0 PTS (Timeout)</span>
                    ) : (
                      <span className="text-battle-muted font-bold">0 PTS (Skipped)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE TURN (STEP 1: PASS SCREEN OR STEP 3: ACTING SCREEN)
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner: Tournament Name & Prompt Queue Progress */}
      <div className="battle-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 border border-battle-border shadow-lg">
        <div className="flex items-center gap-3">
          <Badge variant="purple">
            DUMB CHARADES 2.0
          </Badge>
          <div>
            <h2 className="font-broadcast font-bold text-white text-base truncate max-w-xs">
              {listName}
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-mono text-battle-muted">
              <span>Turn #{turnHistory.length + 1}</span>
              <span>•</span>
              <span className="text-brand-orange font-bold">
                {remainingPromptsCount} Prompts Remaining
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndTournament}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 font-broadcast"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            <span>End Tournament</span>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ================================================================= */}
        {/* STEP 1 & 2: PASS-THE-LAPTOP PRIVACY SCREEN & READY BUTTON        */}
        {/* Strictly NO secret prompt is revealed here!                       */}
        {/* ================================================================= */}
        {turnState === 'pass' && (
          <motion.div
            key={`pass_${currentTeam?.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-brand-purple text-center relative overflow-hidden shadow-2xl space-y-6"
          >
            {/* Ambient lighting in team color */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[250px] blur-[120px] opacity-20 pointer-events-none rounded-full"
              style={{ backgroundColor: currentTeam?.color }}
            />

            <Badge variant="orange" pulse className="px-3 py-1 text-xs font-mono">
              PASS-THE-LAPTOP PRIVACY LOCK
            </Badge>

            <div className="space-y-3">
              <div
                className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl border-2 border-battle-border"
                style={{ backgroundColor: currentTeam?.color }}
              >
                {currentTeam?.avatar}
              </div>

              <h1 className="font-broadcast text-3xl sm:text-5xl font-black text-white uppercase tracking-wider">
                Pass the Laptop to{' '}
                <span style={{ color: currentTeam?.color }}>{currentTeam?.name}</span>
              </h1>

              <p className="text-xs sm:text-sm text-battle-muted max-w-lg mx-auto leading-relaxed">
                Only <strong className="text-white">{currentTeam?.name}</strong> should view the screen now. Other players must look away. When ready, click the button below to reveal your secret movie prompt and start the {timerDuration}s timer!
              </p>
            </div>

            {/* Big "I'M READY" Button */}
            <div className="pt-4 max-w-sm mx-auto">
              <Button
                variant="primary"
                size="xl"
                onClick={handleReadyClick}
                className="w-full font-broadcast text-base shadow-glow-purple bg-brand-purple hover:bg-purple-600 text-white font-black py-4 flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                <span>I'M READY — REVEAL PROMPT</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* ================================================================= */}
        {/* STEP 3 & 4: PRIVATE PROMPT REVEAL + COUNTDOWN + ACTIONS          */}
        {/* Prompt is consumed immediately upon assignment                   */}
        {/* ================================================================= */}
        {turnState === 'acting' && activePrompt && (
          <motion.div
            key={`acting_${activePrompt?.id}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl battle-panel p-6 sm:p-10 border-2 border-brand-orange relative overflow-hidden shadow-2xl space-y-6"
          >
            {/* Top row: Team indicator & Countdown clock */}
            <div className="flex items-center justify-between pb-4 border-b border-battle-border">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow"
                  style={{ backgroundColor: currentTeam?.color }}
                >
                  {currentTeam?.avatar}
                </div>
                <div>
                  <h3 className="font-broadcast font-bold text-base text-white">
                    {currentTeam?.name}'s Turn
                  </h3>
                  <span className="text-[11px] font-mono text-battle-muted">
                    Act silently without speaking or lip-syncing!
                  </span>
                </div>
              </div>

              {/* Glowing Countdown Timer */}
              <div className="flex items-center gap-2">
                <motion.div
                  animate={timeLeft <= 10 ? { scale: [1, 1.08, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono font-bold transition-all ${
                    timeLeft <= 10
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-600/50 animate-pulse'
                      : 'bg-battle-surface border-battle-border text-brand-orange'
                  }`}
                >
                  <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-rose-400 animate-spin' : 'text-brand-orange'}`} />
                  <span className="text-3xl font-black">{timeLeft}s</span>
                </motion.div>
              </div>
            </div>

            {/* Secret Prompt Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-battle-bg border-2 border-brand-purple/60 text-center space-y-3 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between">
                <Badge variant="purple" className="text-xs font-mono uppercase">
                  {activePrompt.category || 'General'}
                </Badge>
                <Badge variant="cyan" className="text-xs font-mono">
                  {activePrompt.wordsCount || 1} {activePrompt.wordsCount === 1 ? 'Word' : 'Words'}
                </Badge>
              </div>

              <div className="py-3">
                <h2 className="font-broadcast text-3xl sm:text-5xl font-black text-amber-300 tracking-wider">
                  {activePrompt.name || activePrompt.title}
                </h2>
                {activePrompt.year && (
                  <span className="text-xs font-mono text-battle-muted mt-1 block">
                    Release Year: {activePrompt.year}
                  </span>
                )}
              </div>

              {activePrompt.hint && (
                <div className="p-3 rounded-2xl bg-battle-surface/60 border border-battle-border text-xs text-battle-muted max-w-md mx-auto">
                  <strong className="text-white font-mono block mb-0.5">Clue / Star:</strong>
                  <span>{activePrompt.hint}</span>
                </div>
              )}

              {/* Rules Reminder */}
              <div className="p-3 rounded-2xl bg-amber-950/30 border border-amber-900/50 text-[11px] text-amber-300 flex items-center justify-center gap-2 font-mono">
                <VolumeX className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>Strict Rule: Absolutely NO speaking, singing, or lip-syncing! Body language only.</span>
              </div>
            </div>

            {/* STEP 4: TURN ACTION BUTTONS (FOUND vs NOT FOUND / SKIP) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button
                variant="primary"
                size="xl"
                onClick={() => handleTurnFinished('found', timerDuration - timeLeft)}
                className="w-full font-broadcast text-base py-4 shadow-glow-neon bg-brand-neon hover:bg-lime-500 text-dark-950 font-black flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span>FOUND (+1 POINT)</span>
              </Button>

              <Button
                variant="secondary"
                size="xl"
                onClick={() => handleTurnFinished('not_found', timerDuration - timeLeft)}
                className="w-full font-broadcast text-base py-4 border-rose-500/60 hover:bg-rose-950/40 text-rose-300 font-black flex items-center justify-center gap-2"
              >
                <XCircle className="w-6 h-6" />
                <span>NOT FOUND / SKIP (0 PTS)</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Standings Board */}
      <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-broadcast font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Live Standings & Turn Rotation</span>
          </h4>
          <span className="text-[11px] font-mono text-battle-muted">
            +1 Point per Found Prompt
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {standings.map((st) => {
            const isTurn = currentTeam?.id === st.id;
            return (
              <div
                key={st.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isTurn
                    ? 'bg-battle-surface border-brand-orange shadow-glow-orange'
                    : 'bg-battle-surface/40 border-battle-border'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{st.avatar}</span>
                    <h5 className="font-broadcast font-bold text-xs text-white truncate max-w-[80px]">
                      {st.name}
                    </h5>
                  </div>
                  {isTurn && (
                    <Badge variant="orange" className="text-[8px] px-1 py-0">
                      ACTING
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-battle-border/60">
                  <span className="text-xs font-mono text-battle-muted">
                    {st.found}W • {st.notFound + st.timeout}L
                  </span>
                  <span className="text-base font-mono font-black text-brand-neon">
                    {st.score} PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
