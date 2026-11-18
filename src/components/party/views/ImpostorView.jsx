import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Sparkles,
  Trophy,
  HelpCircle,
  Gavel,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { soundService } from '../../../services/soundService';
import { PassTheLaptopScreen } from '../common/PassTheLaptopScreen';

export const ImpostorView = ({
  item,
  activePlayers = [],
  onAnswer,
  roundNumber,
  totalRounds,
  timerDuration = 60,
}) => {
  const isDuelMode = activePlayers.length === 2;

  // Lifecycle phases:
  // For 3-4 players: 'pass_secret' -> 'discussion' -> 'pass_vote' -> 'impostor_guess' -> 'final_reveal'
  // For 2 players (Duel): 'pass_secret' -> 'clue_exchange' -> 'duel_guess' -> 'final_reveal'
  const [phase, setPhase] = useState('pass_secret');

  // Secret delivery tracking
  const [currentSecretPlayerIdx, setCurrentSecretPlayerIdx] = useState(0);

  // Random Impostor selection for 3-4p mode
  const [impostorId] = useState(() => {
    const rand = Math.floor(Math.random() * activePlayers.length);
    return activePlayers[rand]?.id || activePlayers[0]?.id;
  });

  // Discussion countdown timer
  const [discussTime, setDiscussTime] = useState(timerDuration || 60);

  // Voting tracking (3-4p)
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votes, setVotes] = useState({}); // { [voterId]: suspectId }

  // Impostor guess state (if caught)
  const [impostorGuessInput, setImpostorGuessInput] = useState('');
  const [impostorGuessVerdict, setImpostorGuessVerdict] = useState(null); // 'correct' | 'wrong'

  // 2-Player Duel state
  const [duelGuesses, setDuelGuesses] = useState({}); // { [playerId]: guessedWord }

  // Discussion timer interval
  useEffect(() => {
    if (phase !== 'discussion') return;
    const interval = setInterval(() => {
      setDiscussTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('pass_vote');
          soundService.playGavel();
          return 0;
        }
        if (prev <= 10) soundService.playUrgentTick();
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const currentSecretPlayer = activePlayers[currentSecretPlayerIdx] || activePlayers[0];
  const isCurrentImpostor = currentSecretPlayer.id === impostorId;

  const currentVoter = activePlayers[currentVoterIdx] || activePlayers[0];

  // 1. Advance Pass-The-Laptop Secret
  const handleFinishSecretPass = () => {
    if (currentSecretPlayerIdx + 1 < activePlayers.length) {
      setCurrentSecretPlayerIdx((prev) => prev + 1);
    } else {
      if (isDuelMode) {
        setPhase('clue_exchange');
      } else {
        setPhase('discussion');
        soundService.playBid();
      }
    }
  };

  // 2. Cast Vote during Pass-The-Laptop Voting (3-4p)
  const handleCastVote = (suspectId) => {
    const updatedVotes = {
      ...votes,
      [currentVoter.id]: suspectId,
    };
    setVotes(updatedVotes);

    if (currentVoterIdx + 1 < activePlayers.length) {
      setCurrentVoterIdx((prev) => prev + 1);
    } else {
      // All votes cast -> tally votes
      const voteCounts = {};
      Object.values(updatedVotes).forEach((id) => {
        voteCounts[id] = (voteCounts[id] || 0) + 1;
      });

      // Find player with highest votes
      let highestVotedId = null;
      let maxV = -1;
      Object.entries(voteCounts).forEach(([id, count]) => {
        if (count > maxV) {
          maxV = count;
          highestVotedId = id;
        }
      });

      const impostorCaught = highestVotedId === impostorId;

      if (impostorCaught) {
        // Impostor was identified -> give them 1 chance to guess the secret word!
        setPhase('impostor_guess');
        soundService.playGavel();
      } else {
        // Impostor escaped detection!
        finalizeStandardGame(false, false);
      }
    }
  };

  // 3. Finalize Standard Game (3-4p)
  const finalizeStandardGame = (impostorCaught, impostorGuessedWordCorrectly) => {
    setPhase('final_reveal');
    soundService.playSold();

    const impostorObj = activePlayers.find((p) => p.id === impostorId);

    if (impostorCaught && !impostorGuessedWordCorrectly) {
      // Innocents win: award +500 to each innocent player
      activePlayers
        .filter((p) => p.id !== impostorId)
        .forEach((p) => {
          onAnswer({
            playerId: p.id,
            answer: `Caught Impostor (${impostorObj?.name})`,
            isCorrect: true,
            points: 500,
            item,
            explanation: `Successfully unmasked the Impostor (${impostorObj?.name}) who failed to guess the secret word "${item.secretWord}".`,
          });
        });
    } else {
      // Impostor wins: award +1000 to the Impostor
      onAnswer({
        playerId: impostorId,
        answer: impostorGuessedWordCorrectly
          ? `Guessed secret word: "${item.secretWord}"`
          : 'Escaped detection!',
        isCorrect: true,
        points: 1000,
        item,
        explanation: `${impostorObj?.name} won as the Impostor! ${
          impostorGuessedWordCorrectly
            ? `Correctly deduced the secret word "${item.secretWord}"!`
            : 'Evaded the vote!'
        }`,
      });
    }
  };

  // 4. Handle Impostor Guess Verdict
  const handleHostJudgeGuess = (isCorrect) => {
    setImpostorGuessVerdict(isCorrect ? 'correct' : 'wrong');
    finalizeStandardGame(true, isCorrect);
  };

  // 5. Duel Mode: Submit Guess for 2-player mode
  const handleDuelSubmit = (pId, guess) => {
    const updated = { ...duelGuesses, [pId]: guess };
    setDuelGuesses(updated);

    if (Object.keys(updated).length >= 2) {
      setPhase('final_reveal');
      soundService.playSold();

      // Award points for participation / correct guesses
      activePlayers.forEach((p) => {
        onAnswer({
          playerId: p.id,
          answer: updated[p.id] || 'Duel guess submitted',
          isCorrect: true,
          points: 500,
          item,
          explanation: `1v1 Deception Duel completed between ${activePlayers[0]?.name} and ${activePlayers[1]?.name}.`,
        });
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Header */}
      <div className="flex items-center justify-between pb-3 border-b border-battle-border">
        <div className="flex items-center gap-2">
          <Badge variant="cyan" className="font-mono text-xs font-bold">
            Round {roundNumber} of {totalRounds}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs font-mono text-battle-muted">
            {isDuelMode ? '1-vs-1 Deception Duel' : 'Social Deduction Mode'}
          </span>
        </div>

        <div className="text-xs font-mono text-brand-cyan font-bold flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-cyan" />
          <span>Category: {item?.category || 'General'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =================================================================== */}
        {/* PHASE 1: PASS-THE-LAPTOP SECRET DISTRIBUTION */}
        {/* =================================================================== */}
        {phase === 'pass_secret' && (
          <motion.div
            key={`secret_player_${currentSecretPlayerIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PassTheLaptopScreen
              player={currentSecretPlayer}
              phaseTitle="Private Role & Secret Delivery"
              subInstruction="Inspect your role and word carefully. Do not let any other player see your screen!"
              revealButtonText="View My Secret Role"
              hideButtonText="Hide & Pass to Next Player"
              onFinishPass={handleFinishSecretPass}
            >
              {isDuelMode ? (
                // 2-Player Duel Prompt
                <div className="p-5 rounded-2xl bg-battle-bg border border-brand-cyan/40 space-y-3 text-center">
                  <span className="text-xs font-mono text-brand-cyan font-bold uppercase tracking-wider block">
                    Your Assigned Secret Concept
                  </span>
                  <h3 className="font-broadcast text-3xl font-black text-amber-300">
                    {currentSecretPlayerIdx === 0
                      ? item?.duelWordA || item?.secretWord
                      : item?.duelWordB || item?.impostorWord || 'Alternate Concept'}
                  </h3>
                  <p className="text-xs text-battle-muted">
                    During the duel, exchange subtle hints without revealing this exact phrase!
                  </p>
                </div>
              ) : isCurrentImpostor ? (
                // Impostor Secret Prompt
                <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-500/60 space-y-3 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 text-rose-300 text-xs font-mono font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>YOU ARE THE IMPOSTOR!</span>
                  </div>
                  <p className="text-xs text-rose-200">
                    Everyone else shares the real secret word. You do NOT have the real word!
                  </p>
                  <div className="p-3 rounded-xl bg-battle-bg border border-battle-border">
                    <span className="text-[10px] font-mono text-battle-muted uppercase block">
                      Your Deception Hint
                    </span>
                    <h4 className="font-broadcast text-xl font-black text-amber-300">
                      {item?.impostorWord || item?.impostorHint || item?.category}
                    </h4>
                  </div>
                  <p className="text-[11px] text-battle-muted italic">
                    Bluff your way through discussion. Give plausible clues that blend in!
                  </p>
                </div>
              ) : (
                // Regular Player Secret Prompt
                <div className="p-5 rounded-2xl bg-battle-bg border border-brand-cyan/40 space-y-3 text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>YOU ARE INNOCENT</span>
                  </div>
                  <span className="text-xs font-mono text-battle-muted block">
                    The Shared Secret Word Is:
                  </span>
                  <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-brand-cyan tracking-wider">
                    {item?.secretWord || 'Target'}
                  </h3>
                  {item?.clues && (
                    <div className="text-[11px] font-mono text-battle-muted">
                      Related themes: {item.clues.slice(0, 3).join(' • ')}
                    </div>
                  )}
                  <p className="text-xs text-battle-muted italic">
                    Give a subtle clue that proves you know this word without giving it away to the Impostor.
                  </p>
                </div>
              )}
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 2: DISCUSSION PHASE (3-4 PLAYERS) */}
        {/* =================================================================== */}
        {phase === 'discussion' && (
          <motion.div
            key="discuss_phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-cyan/40 shadow-2xl space-y-6 text-center"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-battle-border">
              <div>
                <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider block">
                  Public Interrogation Phase
                </span>
                <h3 className="font-broadcast text-2xl font-black text-white">
                  Discuss & Give Clues Aloud
                </h3>
              </div>

              {/* Countdown Clock */}
              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono font-black text-xl ${
                  discussTime <= 10
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-battle-surface border-battle-border text-white'
                }`}
              >
                <Clock className="w-5 h-5 text-brand-cyan" />
                <span>{discussTime}s</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-battle-bg border border-battle-border text-left space-y-3">
              <h4 className="font-broadcast text-sm font-bold text-white uppercase flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-cyan" />
                <span>Round Instructions:</span>
              </h4>
              <ul className="text-xs text-battle-muted space-y-2 list-disc list-inside">
                <li>Take turns going around the laptop giving <strong>ONE subtle clue</strong>.</li>
                <li>Innocent players want to signal they know the word without revealing it.</li>
                <li>The Impostor must listen carefully and bluff convincingly!</li>
                <li>When the timer ends or everyone has spoken, proceed to secret voting.</li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => setPhase('pass_vote')}
              className="w-full font-broadcast text-base shadow-glow-cyan bg-brand-cyan hover:bg-cyan-400 text-black font-black flex items-center justify-center gap-2"
            >
              <Gavel className="w-5 h-5" />
              <span>START SECRET VOTING NOW</span>
            </Button>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 3: PASS-THE-LAPTOP SECRET VOTING (3-4 PLAYERS) */}
        {/* =================================================================== */}
        {phase === 'pass_vote' && (
          <motion.div
            key={`vote_player_${currentVoterIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PassTheLaptopScreen
              player={currentVoter}
              phaseTitle="Private Voting Phase"
              subInstruction="Select who you suspect is the IMPOSTOR. Your vote is strictly confidential!"
              revealButtonText="Open Private Ballot"
            >
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                  Select Your Prime Suspect:
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {activePlayers
                    .filter((p) => p.id !== currentVoter.id) // Strictly no self-voting
                    .map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleCastVote(candidate.id)}
                        className="p-3.5 rounded-2xl border border-battle-border hover:border-brand-cyan bg-battle-surface hover:bg-battle-surface/80 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: candidate.color }}
                          >
                            {candidate.avatar}
                          </span>
                          <span className="font-broadcast font-bold text-sm text-white group-hover:text-brand-cyan">
                            {candidate.name}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-battle-muted group-hover:text-brand-cyan">
                          VOTE →
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 4: IMPOSTOR GUESS OPPORTUNITY (IF CAUGHT) */}
        {/* =================================================================== */}
        {phase === 'impostor_guess' && (
          <motion.div
            key="impostor_guess_phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-rose-500/50 shadow-2xl text-center space-y-6"
          >
            <div className="space-y-2">
              <span className="text-4xl block">🚨</span>
              <h3 className="font-broadcast text-3xl font-black text-rose-400 uppercase tracking-wider">
                Impostor Identified!
              </h3>
              <p className="text-xs text-battle-muted">
                The players voted for{' '}
                <strong className="text-white">
                  {activePlayers.find((p) => p.id === impostorId)?.name}
                </strong>
                , who IS the Impostor!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-battle-bg border border-battle-border text-center space-y-3">
              <Badge variant="orange" className="text-xs font-mono font-bold">
                LAST CHANCE GUESS
              </Badge>
              <p className="text-xs text-battle-muted">
                The Impostor can steal victory (+1000 pts) by guessing the secret regular word right now!
              </p>
              <p className="text-xs font-mono text-battle-muted italic">
                (The Impostor says their guess aloud to the group)
              </p>
            </div>

            {/* Operator judges whether the Impostor got it right */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                The real secret word was: <strong className="text-brand-cyan font-broadcast text-base">{item?.secretWord}</strong>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleHostJudgeGuess(true)}
                  className="font-broadcast text-sm bg-brand-orange hover:bg-orange-600 text-black font-black"
                >
                  IMPOSTOR GUESSED CORRECTLY (+1000 PTS)
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handleHostJudgeGuess(false)}
                  className="font-broadcast text-sm border-battle-border hover:border-emerald-600 text-emerald-400"
                >
                  IMPOSTOR FAILED (INNOCENTS +500 PTS)
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 5: 2-PLAYER CLUE EXCHANGE & DUEL GUESS */}
        {/* =================================================================== */}
        {phase === 'clue_exchange' && (
          <motion.div
            key="clue_exchange_phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-cyan/40 shadow-2xl text-center space-y-6"
          >
            <div>
              <span className="text-xs font-mono font-bold text-brand-cyan uppercase tracking-wider block">
                1-vs-1 Deception Faceoff
              </span>
              <h3 className="font-broadcast text-2xl font-black text-white">
                Exchange Clues Aloud
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {activePlayers.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-center space-y-2">
                  <span className="text-2xl">{p.avatar}</span>
                  <h4 className="font-broadcast font-bold text-sm" style={{ color: p.color }}>
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-battle-muted">
                    Give 2 subtle hints describing your secret concept.
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => setPhase('duel_guess')}
              className="w-full font-broadcast text-base shadow-glow-cyan bg-brand-cyan text-black font-black"
            >
              PROCEED TO WORD DEDUCTION
            </Button>
          </motion.div>
        )}

        {phase === 'duel_guess' && (
          <motion.div
            key="duel_guess_phase"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-cyan/40 shadow-2xl text-center space-y-6"
          >
            <h3 className="font-broadcast text-2xl font-black text-white">
              Guess Opponent's Concept
            </h3>
            <p className="text-xs text-battle-muted">
              Discuss what you believe each other's concept was, then reveal both words below!
            </p>

            <Button
              variant="primary"
              size="xl"
              onClick={() => {
                handleDuelSubmit(activePlayers[0]?.id, 'Concept A');
                handleDuelSubmit(activePlayers[1]?.id, 'Concept B');
              }}
              className="w-full font-broadcast text-base shadow-glow-neon bg-brand-neon text-dark-950 font-black"
            >
              REVEAL BOTH SECRET CONCEPTS (+500 PTS EACH)
            </Button>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* FINAL REVEAL PHASE */}
        {/* =================================================================== */}
        {phase === 'final_reveal' && (
          <motion.div
            key="final_reveal_phase"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-purple/50 shadow-2xl text-center space-y-6"
          >
            <span className="text-4xl block">🎭</span>
            <h3 className="font-broadcast text-3xl font-black text-white uppercase tracking-wider">
              Round Complete!
            </h3>

            <div className="p-5 rounded-2xl bg-battle-bg border border-battle-border space-y-3">
              <span className="text-xs font-mono text-battle-muted uppercase block">
                The Truth Revealed
              </span>
              <div className="space-y-1">
                <p className="text-sm text-white font-mono">
                  Secret Word:{' '}
                  <strong className="text-brand-cyan font-broadcast text-xl">
                    {item?.secretWord || item?.duelWordA}
                  </strong>
                </p>
                {!isDuelMode && (
                  <p className="text-sm text-white font-mono">
                    The Impostor Was:{' '}
                    <strong className="text-rose-400 font-broadcast text-xl">
                      {activePlayers.find((p) => p.id === impostorId)?.name}
                    </strong>
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-battle-muted">
              Click "Next Turn / Round" at top right to continue to the next round.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
