import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Sparkles, RotateCcw, Home, CheckCircle2, XCircle, ArrowRight, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import confetti from 'canvas-confetti';

export const PartyResultsScreen = () => {
  const {
    selectedGame,
    activePlayers,
    scores,
    sessionLog,
    launchGameSession,
    returnToArenaHome,
  } = usePartyGame();

  // Sort players by score descending
  const rankedPlayers = [...activePlayers].sort((a, b) => {
    return (scores[b.id] || 0) - (scores[a.id] || 0);
  });

  const champion = rankedPlayers[0];

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Champion Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center rounded-3xl battle-panel p-8 sm:p-12 border border-brand-purple/60 relative overflow-hidden shadow-2xl"
      >
        <div className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl shadow-glow-purple border-2 border-white/20"
          style={{ backgroundColor: champion?.color || '#9147FF' }}
        >
          {champion?.avatar || '👑'}
        </div>

        <Badge variant="gold" className="text-xs uppercase font-mono mb-2">
          🏆 Champion of the Arena
        </Badge>
        <h2 className="font-broadcast text-4xl sm:text-6xl font-black text-white uppercase tracking-wider mb-2">
          {champion?.name} WINS!
        </h2>
        <p className="text-sm font-mono text-brand-neon font-bold">
          {scores[champion?.id] || 0} Total Points
        </p>
      </motion.div>

      {/* Podium Rankings Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {rankedPlayers.map((player, idx) => {
          const rankColors = ['text-amber-400 border-amber-500/50 shadow-glow-gold/10', 'text-slate-300 border-slate-400/40', 'text-amber-600 border-amber-700/40', 'text-battle-muted border-battle-border'];
          const rankMedals = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th'];

          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-5 rounded-2xl battle-panel border text-center flex flex-col justify-between ${rankColors[idx]}`}
            >
              <div>
                <span className="font-mono font-bold text-xs uppercase block mb-1">
                  {rankMedals[idx]}
                </span>
                <div
                  className="w-10 h-10 rounded-xl mx-auto my-2 flex items-center justify-center font-bold text-white shadow"
                  style={{ backgroundColor: player.color }}
                >
                  {player.avatar}
                </div>
                <h4 className="font-bold text-white text-base truncate">{player.name}</h4>
              </div>
              <div className="mt-4 pt-3 border-t border-battle-border/60">
                <span className="font-black font-mono text-xl text-white block">
                  {scores[player.id] || 0}
                </span>
                <span className="text-[10px] text-battle-muted uppercase font-bold">Pts</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Arena Performance Metrics Row */}
      {sessionLog.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl battle-panel border border-battle-border text-center">
            <span className="text-[10px] font-mono uppercase text-battle-muted font-bold block mb-1">
              Correct Guesses
            </span>
            <span className="text-2xl font-mono font-black text-brand-neon">
              {sessionLog.filter((s) => s.isCorrect).length}
            </span>
          </div>

          <div className="p-4 rounded-2xl battle-panel border border-battle-border text-center">
            <span className="text-[10px] font-mono uppercase text-battle-muted font-bold block mb-1">
              Skipped / Missed
            </span>
            <span className="text-2xl font-mono font-black text-rose-400">
              {sessionLog.filter((s) => !s.isCorrect).length}
            </span>
          </div>

          <div className="p-4 rounded-2xl battle-panel border border-battle-border text-center">
            <span className="text-[10px] font-mono uppercase text-battle-muted font-bold block mb-1">
              Success Rate
            </span>
            <span className="text-2xl font-mono font-black text-brand-cyan">
              {Math.round((sessionLog.filter((s) => s.isCorrect).length / (sessionLog.length || 1)) * 100)}%
            </span>
          </div>

          <div className="p-4 rounded-2xl battle-panel border border-battle-border text-center">
            <span className="text-[10px] font-mono uppercase text-battle-muted font-bold block mb-1">
              Best Round Turn
            </span>
            <span className="text-2xl font-mono font-black text-amber-400">
              +{Math.max(...sessionLog.map((s) => s.pointsAwarded || 0), 0)} Pts
            </span>
          </div>
        </div>
      )}

      {/* Round-by-Round Breakdown Log */}
      {sessionLog.length > 0 && (
        <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-4">
          <div className="flex items-center justify-between border-b border-battle-border/80 pb-3">
            <h4 className="font-broadcast text-lg font-black text-white uppercase">
              Round Breakdown ({sessionLog.length} Turns)
            </h4>
            <span className="text-xs font-mono text-battle-muted">
              {sessionLog.filter((s) => s.isCorrect).length} Correct / {sessionLog.length} Total
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {sessionLog.map((log, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-battle-surface border border-battle-border flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {log.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="font-bold text-white block truncate">
                      R{log.round}: {log.playerName} answered "{log.answer}"
                    </span>
                    {log.explanation && (
                      <span className="text-[11px] text-battle-muted truncate block">
                        {log.explanation}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 font-mono font-bold">
                  <span className={log.isCorrect ? 'text-brand-neon' : 'text-battle-muted'}>
                    +{log.pointsAwarded} Pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Button
          variant="primary"
          size="xl"
          onClick={() => launchGameSession({ game: selectedGame })}
          className="shadow-glow-purple font-broadcast"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          <span>PLAY AGAIN</span>
        </Button>

        <Button
          variant="secondary"
          size="xl"
          onClick={returnToArenaHome}
          className="font-broadcast"
        >
          <Home className="w-5 h-5 mr-2 text-brand-cyan" />
          <span>RETURN TO PARTY ARENA</span>
        </Button>
      </div>
    </div>
  );
};
