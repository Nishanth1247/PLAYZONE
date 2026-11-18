import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  HelpCircle, 
  MapPin, 
  Gavel, 
  AlertTriangle,
  Compass,
  Trophy
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { soundService } from '../../../services/soundService';
import { PassTheLaptopScreen } from '../common/PassTheLaptopScreen';
import { SPYFALL_LOCATIONS } from '../../../services/party/offlineDatabase';

export const SpyfallView = ({
  item,
  activePlayers = [],
  onAnswer,
  roundNumber,
  totalRounds,
  timerDuration = 90,
}) => {
  const isDuelMode = activePlayers.length === 2;

  // Phases:
  // 3-4 players: 'pass_secret' -> 'questioning' -> 'accusation_vote' | 'spy_guess' -> 'final_reveal'
  // 2 players: 'pass_secret' -> 'duel_interrogation' -> 'spy_guess' -> 'final_reveal'
  const [phase, setPhase] = useState('pass_secret');

  const [currentSecretPlayerIdx, setCurrentSecretPlayerIdx] = useState(0);

  // Random Spy assignment
  const [spyPlayerId] = useState(() => {
    const rand = Math.floor(Math.random() * activePlayers.length);
    return activePlayers[rand]?.id || activePlayers[0]?.id;
  });

  // Questioning countdown timer
  const [timeLeft, setTimeLeft] = useState(timerDuration || 90);

  // Accusation voting state
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const [votes, setVotes] = useState({});

  // Spy Guess Location state
  const [selectedGuessLocation, setSelectedGuessLocation] = useState('');
  const [showSampleQuestions, setShowSampleQuestions] = useState(false);

  // Location choices for Spy guess
  const [locationChoices] = useState(() => {
    const locName = item?.name || 'Space Station';
    const others = SPYFALL_LOCATIONS.filter((l) => l.name !== locName)
      .slice(0, 5)
      .map((l) => l.name);
    return [locName, ...others].sort(() => Math.random() - 0.5);
  });

  // Questioning timer
  useEffect(() => {
    if (phase !== 'questioning' && phase !== 'duel_interrogation') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('accusation_vote');
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
  const isCurrentSpy = currentSecretPlayer.id === spyPlayerId;
  const currentVoter = activePlayers[currentVoterIdx] || activePlayers[0];

  const assignedRole = item?.roles?.[currentSecretPlayerIdx % (item?.roles?.length || 1)] || 'Visitor';

  // 1. Advance Pass-The-Laptop Secret
  const handleFinishSecretPass = () => {
    if (currentSecretPlayerIdx + 1 < activePlayers.length) {
      setCurrentSecretPlayerIdx((prev) => prev + 1);
    } else {
      setPhase(isDuelMode ? 'duel_interrogation' : 'questioning');
      soundService.playBid();
    }
  };

  // 2. Cast Vote during Accusation
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

      const spyIdentified = highestVotedId === spyPlayerId;

      if (spyIdentified) {
        // Spy caught! Spy gets a chance to guess location
        setPhase('spy_guess');
        soundService.playGavel();
      } else {
        // Wrong innocent player accused -> Spy wins!
        finalizeGame(false, false, 'Innocent player accused! Spy escapes.');
      }
    }
  };

  // 3. Spy Guess Location Submission
  const handleSpyLocationGuessSubmit = (locName) => {
    setSelectedGuessLocation(locName);
    const isCorrect = locName === item?.name;
    finalizeGame(true, isCorrect, isCorrect ? 'Spy guessed the secret location!' : 'Spy guessed the wrong location!');
  };

  // 4. Finalize Game & Award Points
  const finalizeGame = (spyCaught, spyGuessedLocation, contextNote) => {
    setPhase('final_reveal');
    soundService.playSold();

    const spyObj = activePlayers.find((p) => p.id === spyPlayerId);

    if (spyGuessedLocation) {
      // Spy wins by deducing location!
      onAnswer({
        playerId: spyPlayerId,
        answer: `Spy guessed location: ${item?.name}`,
        isCorrect: true,
        points: 1000,
        item,
        explanation: `${spyObj?.name} won as the SPY! Correctly identified "${item?.name}". ${contextNote}`,
      });
    } else if (spyCaught && !spyGuessedLocation) {
      // Innocents win!
      activePlayers
        .filter((p) => p.id !== spyPlayerId)
        .forEach((p) => {
          onAnswer({
            playerId: p.id,
            answer: `Exposed Spy (${spyObj?.name})`,
            isCorrect: true,
            points: 500,
            item,
            explanation: `Successfully unmasked the Spy (${spyObj?.name}) at "${item?.name}". ${contextNote}`,
          });
        });
    } else {
      // Spy wins because innocents failed to accuse them
      onAnswer({
        playerId: spyPlayerId,
        answer: 'Spy evaded detection!',
        isCorrect: true,
        points: 1000,
        item,
        explanation: `${spyObj?.name} won as the SPY! Players failed to accuse them. ${contextNote}`,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Progress Header */}
      <div className="flex items-center justify-between pb-3 border-b border-battle-border">
        <div className="flex items-center gap-2">
          <Badge variant="orange" className="font-mono text-xs font-bold">
            Round {roundNumber} of {totalRounds}
          </Badge>
          <span className="text-battle-muted text-xs">•</span>
          <span className="text-xs font-mono text-battle-muted">
            {isDuelMode ? '1-vs-1 Spy Duel' : 'Undercover Interrogation'}
          </span>
        </div>

        <div className="text-xs font-mono text-brand-orange font-bold flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5 text-brand-orange" />
          <span>Spyfall Arena</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* =================================================================== */}
        {/* PHASE 1: PASS-THE-LAPTOP SECRET LOCATION & ROLE */}
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
              phaseTitle="Top Secret Mission Briefing"
              subInstruction="Inspect your location and undercover role. Keep the screen completely hidden from others!"
              revealButtonText="Open Mission Briefing"
              hideButtonText="Hide & Pass to Next Player"
              onFinishPass={handleFinishSecretPass}
            >
              {isCurrentSpy ? (
                // Spy View
                <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-500/60 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-900/60 border border-rose-700 text-rose-300 text-xs font-mono font-bold">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>YOU ARE THE SPY!</span>
                  </div>

                  <p className="text-sm font-bold text-white leading-relaxed">
                    You have NO IDEA what the secret location is! Everyone else is at the same location.
                  </p>

                  <div className="p-4 rounded-xl bg-battle-bg border border-battle-border text-xs text-battle-muted space-y-1.5 text-left">
                    <p className="font-bold text-brand-orange flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Spy Objective:</span>
                    </p>
                    <p>1. Listen carefully to questions and answers without looking suspicious.</p>
                    <p>2. Give vague, flexible answers that fit multiple locations.</p>
                    <p>3. Deducing the secret location grants you an instant victory!</p>
                  </div>
                </div>
              ) : (
                // Innocent Player View
                <div className="p-6 rounded-2xl bg-battle-bg border border-brand-orange/40 text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>AGENT BRIEFING: INNOCENT</span>
                  </div>

                  <div>
                    <span className="text-xs font-mono text-battle-muted uppercase tracking-wider block">
                      Secret Location:
                    </span>
                    <h3 className="font-broadcast text-3xl sm:text-4xl font-black text-amber-300 tracking-wider">
                      {item?.name || 'Space Station'}
                    </h3>
                    <span className="text-xs font-mono text-brand-orange mt-0.5 block">
                      Theme: {item?.category || 'General'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-battle-surface border border-battle-border text-xs text-left space-y-1">
                    <p className="text-battle-muted">
                      Your Suggested Role:{' '}
                      <strong className="text-brand-cyan font-bold">{assignedRole}</strong>
                    </p>
                    <p className="text-battle-muted text-[11px] italic">
                      {item?.description}
                    </p>
                  </div>
                </div>
              )}
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 2: QUESTIONING PHASE (3-4 PLAYERS) */}
        {/* =================================================================== */}
        {phase === 'questioning' && (
          <motion.div
            key="questioning_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-orange/40 shadow-2xl space-y-6 text-center"
          >
            {/* Top Bar with Timer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-battle-border">
              <div className="text-left">
                <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider block">
                  Interrogation in Progress
                </span>
                <h3 className="font-broadcast text-2xl font-black text-white">
                  Ask Subtle Probing Questions
                </h3>
              </div>

              <div
                className={`flex items-center gap-2 px-5 py-2 rounded-2xl border font-mono font-black text-xl ${
                  timeLeft <= 15
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 animate-pulse'
                    : 'bg-battle-surface border-battle-border text-white'
                }`}
              >
                <Clock className="w-5 h-5 text-brand-orange" />
                <span>{timeLeft}s</span>
              </div>
            </div>

            {/* Public Rules & Guidance */}
            <div className="p-5 rounded-2xl bg-battle-bg border border-battle-border text-left space-y-3">
              <h4 className="font-broadcast text-sm font-bold text-white uppercase flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-orange" />
                <span>Interrogation Rules:</span>
              </h4>
              <ul className="text-xs text-battle-muted space-y-1.5 list-disc list-inside">
                <li>Player A asks Player B a question about the location (e.g., "Is it cold here?", "Are you wearing a uniform?").</li>
                <li>Player B answers, then asks someone else (cannot ask Player A back immediately).</li>
                <li>Be subtle! If your question or answer is too obvious, the Spy will deduce the location.</li>
              </ul>

              {/* Sample Questions Toggle */}
              {item?.sampleQuestions && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSampleQuestions(!showSampleQuestions)}
                    className="text-xs font-mono font-bold text-brand-cyan hover:underline flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showSampleQuestions ? 'Hide Sample Questions' : 'Show Sample Questions for Players'}</span>
                  </button>

                  {showSampleQuestions && (
                    <div className="mt-2 p-3 rounded-xl bg-battle-surface border border-battle-border text-xs text-battle-muted space-y-1">
                      {item.sampleQuestions.map((q, idx) => (
                        <p key={idx} className="font-mono text-white/90">
                          • "{q}"
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                size="xl"
                onClick={() => setPhase('accusation_vote')}
                className="font-broadcast text-sm shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-black font-black flex items-center justify-center gap-2"
              >
                <Gavel className="w-5 h-5" />
                <span>START ACCUSATION VOTE</span>
              </Button>

              <Button
                variant="secondary"
                size="xl"
                onClick={() => setPhase('spy_guess')}
                className="font-broadcast text-sm border-battle-border hover:border-brand-cyan text-brand-cyan flex items-center justify-center gap-2"
              >
                <Compass className="w-5 h-5" />
                <span>SPY CALLS LOCATION GUESS</span>
              </Button>
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 3: PASS-THE-LAPTOP ACCUSATION VOTE (3-4 PLAYERS) */}
        {/* =================================================================== */}
        {phase === 'accusation_vote' && (
          <motion.div
            key={`accusation_player_${currentVoterIdx}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <PassTheLaptopScreen
              player={currentVoter}
              phaseTitle="Secret Accusation Ballot"
              subInstruction="Select who you accuse of being the SPY. Your ballot is strictly private!"
              revealButtonText="Open Private Ballot"
            >
              <div className="space-y-4">
                <span className="text-xs font-mono font-bold text-battle-muted uppercase block">
                  Select Who You Accuse as SPY:
                </span>

                <div className="grid grid-cols-1 gap-2.5">
                  {activePlayers
                    .filter((p) => p.id !== currentVoter.id) // No self voting
                    .map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => handleCastVote(candidate.id)}
                        className="p-3.5 rounded-2xl border border-battle-border hover:border-brand-orange bg-battle-surface hover:bg-battle-surface/80 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                            style={{ backgroundColor: candidate.color }}
                          >
                            {candidate.avatar}
                          </span>
                          <span className="font-broadcast font-bold text-sm text-white group-hover:text-brand-orange">
                            {candidate.name}
                          </span>
                        </div>

                        <span className="text-xs font-mono font-bold text-battle-muted group-hover:text-brand-orange">
                          ACCUSE →
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            </PassTheLaptopScreen>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 4: SPY GUESS LOCATION */}
        {/* =================================================================== */}
        {phase === 'spy_guess' && (
          <motion.div
            key="spy_guess_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-cyan/40 shadow-2xl text-center space-y-6"
          >
            <div className="space-y-2">
              <span className="text-4xl block">🎯</span>
              <h3 className="font-broadcast text-3xl font-black text-brand-cyan uppercase tracking-wider">
                Spy Location Deduction
              </h3>
              <p className="text-xs text-battle-muted">
                The Spy ({activePlayers.find((p) => p.id === spyPlayerId)?.name}) can win (+1000 pts) by correctly selecting the location!
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {locationChoices.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleSpyLocationGuessSubmit(loc)}
                  className="p-4 rounded-2xl border border-battle-border hover:border-brand-cyan bg-battle-surface hover:bg-battle-surface/80 font-broadcast font-bold text-sm text-white hover:text-brand-cyan transition-all text-center flex items-center justify-center min-h-[70px]"
                >
                  <span>{loc}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 5: 2-PLAYER DUEL INTERROGATION */}
        {/* =================================================================== */}
        {phase === 'duel_interrogation' && (
          <motion.div
            key="duel_interrogation_screen"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-orange/40 shadow-2xl text-center space-y-6"
          >
            <div>
              <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider block">
                1-vs-1 Spy Duel
              </span>
              <h3 className="font-broadcast text-2xl font-black text-white">
                Undercover Interrogation
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
                <span className="text-2xl">🕵️‍♂️</span>
                <h4 className="font-broadcast font-bold text-sm text-brand-orange">
                  Agent (Knows Location)
                </h4>
                <p className="text-xs text-battle-muted">
                  Ask 3 questions to expose the Spy's lack of knowledge.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
                <span className="text-2xl">🔍</span>
                <h4 className="font-broadcast font-bold text-sm text-brand-cyan">
                  Spy (Location Unknown)
                </h4>
                <p className="text-xs text-battle-muted">
                  Answer plausibly and deduce what place is being described.
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="xl"
              onClick={() => setPhase('spy_guess')}
              className="w-full font-broadcast text-base shadow-glow-orange bg-brand-orange text-black font-black"
            >
              PROCEED TO SPY'S FINAL GUESS
            </Button>
          </motion.div>
        )}

        {/* =================================================================== */}
        {/* PHASE 6: FINAL REVEAL & OUTCOME */}
        {/* =================================================================== */}
        {phase === 'final_reveal' && (
          <motion.div
            key="final_reveal_screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="battle-panel rounded-3xl p-6 sm:p-8 border border-brand-purple/50 shadow-2xl text-center space-y-6"
          >
            <span className="text-4xl block">🔍</span>
            <h3 className="font-broadcast text-3xl font-black text-white uppercase tracking-wider">
              Mission Debriefing
            </h3>

            <div className="p-5 rounded-2xl bg-battle-bg border border-battle-border space-y-2 text-center">
              <span className="text-xs font-mono text-battle-muted uppercase block">
                The Top Secret Location
              </span>
              <h4 className="font-broadcast text-3xl font-black text-amber-300">
                {item?.name}
              </h4>
              <p className="text-sm text-white font-mono mt-1">
                The Undercover Spy was:{' '}
                <strong className="text-rose-400 font-broadcast text-xl">
                  {activePlayers.find((p) => p.id === spyPlayerId)?.name}
                </strong>
              </p>
            </div>

            <p className="text-xs text-battle-muted">
              Click "Next Turn / Round" at top right to pass the laptop for the next round.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
