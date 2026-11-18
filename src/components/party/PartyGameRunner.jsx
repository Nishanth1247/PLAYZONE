import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePartyGame } from '../../context/PartyGameContext';
import { useAuction } from '../../context/AuctionContext';
import { ArrowRight, Trophy, RotateCcw, Home, Sparkles, Volume2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

// Dedicated 4 Game Views for BIDBATTLE 7.2
import { DumbCharadesView } from './views/DumbCharadesView';
import { ImpostorView } from './views/ImpostorView';
import { SpyfallView } from './views/SpyfallView';
import { FindTheLiarView } from './views/FindTheLiarView';

export const PartyGameRunner = () => {
  const {
    selectedGame,
    activePlayers,
    currentRoundIndex,
    currentPlayerIndex,
    activePlayer,
    scores,
    contentItems,
    contentSource,
    roundsCount,
    timerDuration,
    recordTurnResult,
    advanceTurn,
    returnToArenaHome,
  } = usePartyGame();

  const [hasAnsweredThisTurn, setHasAnsweredThisTurn] = useState(false);

  const currentItem = contentItems[currentRoundIndex] || contentItems[0] || {};

  const handleTurnAnswer = (outcome) => {
    recordTurnResult(outcome);
    if (outcome?.autoAdvance) {
      setHasAnsweredThisTurn(false);
      advanceTurn();
    } else {
      setHasAnsweredThisTurn(true);
    }
  };

  const handleNextTurnClick = () => {
    setHasAnsweredThisTurn(false);
    advanceTurn();
  };

  const renderCurrentGameView = () => {
    const props = {
      item: currentItem,
      activePlayer,
      activePlayers,
      onAnswer: handleTurnAnswer,
      roundNumber: currentRoundIndex + 1,
      totalRounds: Math.min(roundsCount, contentItems.length || roundsCount),
      timerDuration: timerDuration || selectedGame?.defaultTimer || 45,
    };

    switch (selectedGame?.mechanic) {
      case 'dumb_charades':
        return <DumbCharadesView {...props} />;
      case 'impostor':
        return <ImpostorView {...props} />;
      case 'spyfall':
        return <SpyfallView {...props} />;
      case 'find_the_liar':
        return <FindTheLiarView {...props} />;
      default:
        return <DumbCharadesView {...props} />;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 space-y-6">
      {/* Top Session Header: Game Title, Content Badge, Exit Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-battle-border/80">
        <div className="flex items-center gap-3">
          <span className="text-3xl p-2.5 rounded-2xl bg-battle-surface border border-battle-border">
            {selectedGame?.icon || '🎮'}
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-brand-purple uppercase">
                BIDBATTLE 7.2 • Party Arena
              </span>
              <span className="text-battle-muted">•</span>
              {contentSource === 'ai' ? (
                <Badge variant="cyan" className="text-[10px] flex items-center gap-1 font-mono">
                  <Sparkles className="w-3 h-3 text-brand-cyan" />
                  <span>AI Generated</span>
                </Badge>
              ) : (
                <Badge variant="neon" className="text-[10px] font-mono">
                  Verified Offline Database
                </Badge>
              )}
            </div>
            <h2 className="font-broadcast text-2xl font-black text-white uppercase">
              {selectedGame?.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasAnsweredThisTurn && (
            <Button
              variant="primary"
              size="md"
              onClick={handleNextTurnClick}
              className="shadow-glow-purple font-broadcast text-xs animate-pulse bg-brand-purple hover:bg-purple-600 text-white"
            >
              <span>Next Turn / Round</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={returnToArenaHome}
            className="text-xs text-battle-muted hover:text-white"
          >
            <Home className="w-4 h-4 mr-1" />
            <span>Exit Game</span>
          </Button>
        </div>
      </div>

      {/* Live Pass-and-Play Scoreboard Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {activePlayers.map((player) => {
          const isTurn = player.id === activePlayer.id;
          const playerScore = scores[player.id] || 0;

          return (
            <motion.div
              key={player.id}
              animate={{ scale: isTurn ? 1.02 : 1 }}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                isTurn
                  ? 'bg-battle-surface border-brand-cyan shadow-glow-cyan'
                  : 'bg-battle-surface/50 border-battle-border'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow"
                  style={{ backgroundColor: player.color }}
                >
                  {player.avatar}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">
                    {player.name}
                  </span>
                  {isTurn && (
                    <span className="text-[9px] font-mono text-brand-neon uppercase font-bold block">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-black font-mono text-base text-white">
                  {playerScore}
                </span>
                <span className="text-[9px] text-battle-muted uppercase block font-bold">
                  Pts
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Dynamic Gameplay Arena */}
      <main className="w-full pt-2">
        {renderCurrentGameView()}
      </main>
    </div>
  );
};
