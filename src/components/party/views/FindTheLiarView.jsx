import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  HelpCircle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  Gavel, 
  Trophy,
  Send,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { soundService } from '../../../services/soundService';
import { PassTheLaptopScreen } from '../common/PassTheLaptopScreen';

export const FindTheLiarView = ({
  item,
  activePlayers = [],
  onAnswer,
  roundNumber,
  totalRounds,
  timerDuration = 60,
}) => {
  const isDuelMode = activePlayers.length === 2;

  // Phases:
  // 3-4 players: 'pass_answer' -> 'discussion' -> 'pass_vote' -> 'final_reveal'
  // 2 players: 'pass_answer' -> 'duel_guess' -> 'final_reveal'
  const [phase, setPhase] = useState('pass_answer');

  const [currentSecretPlayerIdx, setCurrentSecretPlayerIdx] = useState(0);

  // Random Liar assignment for this round
  const [liarPlayerId] = useState(() => {
    const rand = Math.floor(Math.random() * activePlayers.length);
    return activePlayers[rand]?.id || activePlayers[0]?.id;
  });

  // Recorded answers: { [playerId]: answerText }
  const [playerAnswers, setPlayerAnswers] = useState({});
  const [currentTypedAnswer, setCurrentTypedAnswer] = useState('');

  // Discussion countdown
  const [timeLeft, setTimeLeft] = useState(timerDuration || 60);

  // Voting state
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votes, setVotes] = useState({});

  // Timer loop for discussion
  useEffect(() => {
    if (phase !== 'discussion') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
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
  const isCurrentLiar = currentSecretPlayer.id === liarPlayerId;
  const currentVoter = activePlayers[currentVoterIdx] || activePlayers[0];

  const questionForCurrent = isDuelMode
    ? currentSecretPlayerIdx === 0
      ? item?.questionA || item?.duelA
      : item?.questionB || item?.duelB
    : isCurrentLiar
    ? item?.questionB || 'What is something you dislike?'
    : item?.questionA || 'What is your favorite item?';

  // 1. Submit private typed answer during pass-the-laptop
  const handleSubmitAnswer = (e) => {
    e?.preventDefault();
    if (!currentTypedAnswer.trim()) return;

    const updated = {
      ...playerAnswers,
      [currentSecretPlayer.id]: currentTypedAnswer.trim(),
    };
    setPlayerAnswers(updated);
    setCurrentTypedAnswer('');

    if (currentSecretPlayerIdx + 1 < activePlayers.length) {
      setCurrentSecretPlayerIdx((prev) => prev + 1);
    } else {
      setPhase(isDuelMode ? 'duel_guess' : 'discussion');
      soundService.playBid();
    }
  };

  // 2. Cast Vote during Pass-The-Laptop
  const handleCastVote = (suspectId) => {
    const updated = { ...votes, [currentVoter.id]: suspectId };
    setVotes(updated);

    if (currentVoterIdx + 1 < activePlayers.length) {
      setCurrentVoterIdx((prev) => prev + 1);
    } else {
      // Tally votes
      const voteCounts = {};
      Object.values(updated).forEach((id) => {
        voteCounts[id] = (voteCounts[id] || 0) + 1;
      });

      let highestVotedId = null;
      let maxV = -1;
      Object.entries(voteCounts).forEach(([id, count]) => {
        if (count > maxV) {
          maxV = count;
          highestVotedId = id;
        }
      });

      const liarCaught = highestVotedId === liarPlayerId;
      finalizeGame(liarCaught);
    }
  };

  // 3. Finalize game and score
  const finalizeGame = (liarCaught) => {
    setPhase('final_reveal');
    soundService.playSold();

    const liarObj = activePlayers.find((p) => p.id === liarPlayerId);

    if (liarCaught) {
      // Regular players win
      activePlayers
        .filter((p) => p.id !== liarPlayerId)
        .forEach((p) => {
          onAnswer({
            playerId: p.id,
            answer: `Caught Liar (${liarObj?.name})`,
            isCorrect: true,
            points: 500,
            item,
            explanation: `Successfully voted out the Liar (${liarObj?.name}) who answered Question B!`,
          });
        });
    } else {
      // Liar wins
      onAnswer({
        playerId: liarPlayerId,
        answer: 'Liar deceived the group!',
        isCorrect: true,
        points: 1000,
        item,
        explanation: `${liarObj?.name} tricked everyone! Their answer fooled the group.`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-battle-border">
        <div className="flex items-center gap-2">
          <Badge variant="neon" className="font-mono text-xs font-bold">
            Round {roundNumber} of {totalRounds}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs font-mono text-battle-muted">
            {isDuelMode ? '1-vs-1 Deception Match' : 'Find The Liar'}
          </span>
        </div>

        <div className="text-xs font-mono text-brand-neon font-bold flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-brand-neon" />
          <span>Category: {item?.category || 'General'}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =================================================================== */}
        {/* PHASE 1: PASS-THE-LAPTOP SECRET QUESTION & ANSWER INPUT */}
        {/* =================================================================== */}
        {phase === 'pass_answer' && (
          <motion.div
            key={`secret_player_${currentSecretPlayerIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PassTheLaptopScreen
              player={currentSecretPlayer}
              phaseTitle="Private Question & Answer Submission"
              subInstruction="Read your assigned question and type your answer. Keep it secret!"
              revealButtonText="Read My Question"
            >
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="p-5 rounded-2xl bg-battle-bg border border-brand-neon/40 space-y-3">
                  <span className="text-xs font-mono text-brand-neon font-bold uppercase tracking-wider block">
                    Your Assigned Prompt:
                  </span>
                  <h3 className="font-broadcast text-xl sm:text-2xl font-black text-white leading-snug">
                    {questionForCurrent}
                  </h3>
                  <p className="text-[11px] text-battle-muted italic">
                    Type a genuine, short answer (1 to 5 words). All answers will be shown together without showing the question!
                  </p>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={currentTypedAnswer}
                    onChange={(e) => setCurrentTypedAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-battle-surface border border-battle-border text-white text-base focus:border-brand-neon focus:outline-none transition-all"
                    autoFocus
                  />
                </div>

                <Button
                  variant="primary"
                  size="xl"
                  type="submit"
                  disabled={!currentTypedAnswer.trim()}
                  className="w-full font-broadcast text-base shadow-glow-neon bg-brand-neon hover:bg-lime-400 text-dark-950 font-black flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 fill-current" />
                  <span>SUBMIT & PASS TO NEXT PLAYER</span>
                </Button>
              </form>
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 2: PUBLIC DISCUSSION & ALL ANSWERS SHOWN TOGETHER */}
        {/* =================================================================== */}
        {phase === 'discussion' && (
          <motion.div
            key="discussion_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-neon/40 shadow-2xl space-y-6 text-center"
          >
            {/* Header with timer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-battle-border">
              <div className="text-left">
                <span className="text-xs font-mono font-bold text-brand-neon uppercase tracking-wider block">
                  Public Inquiry Phase
                </span>
                <h3 className="font-broadcast text-2xl font-black text-white">
                  Compare Answers & Spot the Liar
                </h3>
              </div>

              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono font-black text-xl ${
                  timeLeft <= 15
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-battle-surface border-battle-border text-white'
                }`}
              >
                <Clock className="w-5 h-5 text-brand-neon" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            <p className="text-xs text-battle-muted text-left">
              Most players answered Question A, but ONE person was asked a completely different Question B! Look closely at everyone's answer:
            </p>

            {/* Grid of all submitted answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {activePlayers.map((p) => {
                const answer = playerAnswers[p.id] || 'No answer submitted';
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-battle-bg border border-battle-border text-left space-y-2 relative overflow-hidden"
                  >
                    <div
                      className="absolute top-0 left-0 bottom-0 w-1.5"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex items-center gap-2 pl-2">
                      <span className="text-lg">{p.avatar}</span>
                      <span className="font-broadcast font-bold text-sm text-white">
                        {p.name}
                      </span>
                    </div>

                    <div className="pl-2 pt-1">
                      <span className="text-[10px] font-mono text-battle-muted uppercase block font-bold">
                        Submitted Answer:
                      </span>
                      <p className="font-broadcast text-xl font-black text-amber-300 tracking-wide mt-0.5">
                        "{answer}"
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => setPhase('pass_vote')}
              className="w-full font-broadcast text-base shadow-glow-neon bg-brand-neon hover:bg-lime-400 text-dark-950 font-black flex items-center justify-center gap-2"
            >
              <Gavel className="w-5 h-5" />
              <span>START SECRET VOTING ON WHO IS THE LIAR</span>
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
              phaseTitle="Secret Ballot: Who is the Liar?"
              subInstruction="Select the player whose answer does not fit Question A. Vote secretly!"
              revealButtonText="Open Ballot"
            >
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                  Select Who You Vote as the LIAR:
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {activePlayers
                    .filter((p) => p.id !== currentVoter.id) // No self-voting
                    .map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleCastVote(candidate.id)}
                        className="p-3.5 rounded-2xl border border-battle-border hover:border-brand-neon bg-battle-surface hover:bg-battle-surface/80 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: candidate.color }}
                          >
                            {candidate.avatar}
                          </span>
                          <div className="text-left">
                            <span className="font-broadcast font-bold text-sm text-white group-hover:text-brand-neon block">
                              {candidate.name}
                            </span>
                            <span className="text-[11px] font-mono text-amber-300">
                              "{playerAnswers[candidate.id]}"
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-mono font-bold text-battle-muted group-hover:text-brand-neon">
                          VOTE LIAR →
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 4: 2-PLAYER DUEL GUESS */}
        {/* =================================================================== */}
        {phase === 'duel_guess' && (
          <motion.div
            key="duel_guess_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-neon/40 shadow-2xl text-center space-y-6"
          >
            <h3 className="font-broadcast text-2xl font-black text-white">
              1-vs-1 Answer Faceoff
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {activePlayers.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
                  <span className="text-2xl">{p.avatar}</span>
                  <h4 className="font-broadcast font-bold text-sm" style={{ color: p.color }}>
                    {p.name}
                  </h4>
                  <p className="font-broadcast text-xl font-black text-amber-300">
                    "{playerAnswers[p.id]}"
                  </p>
                </div>
              ))}
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => finalizeGame(true)}
              className="w-full font-broadcast text-base shadow-glow-neon bg-brand-neon text-dark-950 font-black"
            >
              REVEAL QUESTIONS & FINALIZE DUEL
            </Button>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 5: FINAL REVEAL & OUTCOME */}
        {/* =================================================================== */}
        {phase === 'final_reveal' && (
          <motion.div
            key="final_reveal_screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-purple/50 shadow-2xl text-center space-y-6"
          >
            <span className="text-4xl block">🤥</span>
            <h3 className="font-broadcast text-3xl font-black text-white uppercase tracking-wider">
              The Questions Revealed!
            </h3>

            <div className="p-5 rounded-2xl bg-battle-bg border border-battle-border space-y-3 text-left">
              <div>
                <span className="text-[10px] font-mono text-brand-cyan uppercase font-bold block">
                  Question A (Majority of Players):
                </span>
                <p className="font-broadcast text-base text-white">
                  {item?.questionA || item?.duelA}
                </p>
              </div>

              <div className="pt-2 border-t border-battle-border">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-bold block">
                  Question B (Secret Liar Question):
                </span>
                <p className="font-broadcast text-base text-amber-300">
                  {item?.questionB || item?.duelB}
                </p>
              </div>

              {!isDuelMode && (
                <div className="pt-2 border-t border-battle-border text-center">
                  <p className="text-sm font-mono text-white">
                    The Secret Liar Was:{' '}
                    <strong className="text-rose-400 font-broadcast text-xl">
                      {activePlayers.find((p) => p.id === liarPlayerId)?.name}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-battle-muted">
              Click "Next Turn / Round" at top right to proceed.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
