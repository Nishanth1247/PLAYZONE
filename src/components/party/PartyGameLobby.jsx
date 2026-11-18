import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Users, Sliders, Clock, Sparkles, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import { FIXED_PARTY_PLAYERS } from '../../services/party/gameRegistry';
import { DumbCharadesSetup } from './views/DumbCharadesSetup';
import { createDumbCharadesTournament } from '../../services/party/dumbCharadesEngine';

export const PartyGameLobby = () => {
  const {
    selectedGame,
    activePlayers,
    setActivePlayers,
    gameDifficulty,
    setGameDifficulty,
    selectedCategory,
    setSelectedCategory,
    roundsCount,
    setRoundsCount,
    timerDuration,
    setTimerDuration,
    launchGameSession,
    isLoadingContent,
    returnToArenaHome,
    setPartyView,
  } = usePartyGame();

  if (selectedGame?.id === 'party_dumb_charades') {
    return (
      <DumbCharadesSetup
        onLaunchTournament={(config) => {
          if (!config?.isResume) {
            createDumbCharadesTournament(config);
            setActivePlayers(config.selectedTeams);
          }
          setPartyView('playing');
        }}
        onBack={returnToArenaHome}
      />
    );
  }

  const [playerCount, setPlayerCount] = useState(activePlayers.length || 4);
  const [activeCategory, setActiveCategory] = useState(selectedCategory || 'mixed');
  const [activeTimer, setActiveTimer] = useState(timerDuration || selectedGame?.defaultTimer || 45);

  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    setActivePlayers(FIXED_PARTY_PLAYERS.slice(0, count));
  };

  const handleLaunch = () => {
    launchGameSession({
      game: selectedGame,
      players: FIXED_PARTY_PLAYERS.slice(0, playerCount),
      difficulty: gameDifficulty,
      category: activeCategory,
      timerDuration: activeTimer,
      rounds: roundsCount,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={returnToArenaHome}
        className="text-xs text-battle-muted hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to Party Arena</span>
      </Button>

      {/* Lobby Header Card */}
      <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-brand-purple/50 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <span className="text-4xl p-3 rounded-2xl bg-battle-surface border border-battle-border">
            {selectedGame?.icon || '🎮'}
          </span>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="purple" className="text-[10px]">
                {selectedGame?.universe?.replace('_', ' ')}
              </Badge>
              <span className="text-xs font-mono text-battle-muted">2–4 Local Players</span>
            </div>
            <h2 className="font-broadcast text-2xl sm:text-3xl font-black text-white uppercase">
              {selectedGame?.title}
            </h2>
            <p className="text-xs text-battle-muted mt-1 leading-relaxed">
              {selectedGame?.shortDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-battle-border space-y-6">
        {/* 1. Player Count Selector */}
        <div>
          <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3">
            Local Pass-and-Play Players (On this Laptop)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[2, 3, 4].map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handlePlayerCountChange(cnt)}
                className={`p-3 rounded-2xl border font-broadcast text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  playerCount === cnt
                    ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple'
                    : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>{cnt} Players</span>
              </button>
            ))}
          </div>

          {/* Active Contenders Avatar Row */}
          <div className="grid grid-cols-4 gap-2 mt-3">
            {FIXED_PARTY_PLAYERS.map((p, idx) => {
              const isIncluded = idx < playerCount;
              return (
                <div
                  key={p.id}
                  className={`p-2.5 rounded-xl border transition-all text-center ${
                    isIncluded
                      ? 'bg-battle-surface border-battle-border'
                      : 'bg-black/20 border-battle-border/40 opacity-30'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg mx-auto mb-1 flex items-center justify-center text-xs font-bold text-white shadow"
                    style={{ backgroundColor: p.color }}
                  >
                    {p.avatar}
                  </div>
                  <span className="text-[11px] font-bold text-white block truncate">{p.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Category Selection (for Dumb Charades & Multi-category games) */}
        {(selectedGame?.id === 'party_dumb_charades' || selectedGame?.hasCategories) && (
          <div>
            <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3">
              Select Charades Category: <span className="text-brand-cyan font-mono font-black">{
                activeCategory === 'tamil' ? 'Tamil Cinema' : activeCategory === 'mcu' ? 'Marvel MCU' : 'Mixed Challenge'
              }</span>
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold font-broadcast">
              {[
                { id: 'tamil', label: '🎬 Tamil Cinema', desc: 'Kollywood hits' },
                { id: 'mcu', label: '⚡ Marvel MCU', desc: 'Avengers & heroes' },
                { id: 'mixed', label: '🔀 Mixed Challenge', desc: 'Tamil + Marvel' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand-cyan text-black font-black border-brand-cyan shadow-glow-cyan'
                      : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                  }`}
                >
                  <span className="block font-bold">{cat.label}</span>
                  <span className="text-[10px] font-mono opacity-80 block mt-0.5">{cat.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Acting Time Selection (for Dumb Charades) */}
        {selectedGame?.id === 'party_dumb_charades' ? (
          <div>
            <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3">
              Acting Time Per Turn: <span className="text-amber-400 font-mono font-black">{activeTimer} Seconds</span>
            </label>
            <div className="grid grid-cols-3 gap-2 font-mono text-xs font-bold">
              {[
                { sec: 30, label: '30s Speed Blitz' },
                { sec: 45, label: '45s Standard' },
                { sec: 60, label: '60s Relaxed' },
              ].map((t) => (
                <button
                  key={t.sec}
                  type="button"
                  onClick={() => setActiveTimer(t.sec)}
                  className={`py-3 rounded-2xl border transition-all ${
                    activeTimer === t.sec
                      ? 'bg-brand-orange text-black font-black border-brand-orange shadow-glow-orange'
                      : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                  }`}
                >
                  <span className="block text-sm font-black">{t.sec}s</span>
                  <span className="text-[10px] font-broadcast block opacity-80">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Difficulty Selector for Quiz/Puzzles */
          <div>
            <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs font-bold font-broadcast">
              {['easy', 'medium', 'hard', 'mixed'].map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setGameDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border uppercase tracking-wider transition-all ${
                    gameDifficulty === diff
                      ? 'bg-brand-cyan text-black font-black border-brand-cyan shadow-glow-cyan'
                      : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Rounds Count */}
        <div>
          <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-3">
            Rounds / Questions: <span className="text-brand-neon font-mono font-black">{roundsCount} Rounds</span>
          </label>
          <div className="grid grid-cols-4 gap-2 font-mono text-xs font-bold">
            {[3, 5, 7, 10].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRoundsCount(r)}
                className={`py-2 rounded-xl border transition-all ${
                  roundsCount === r
                    ? 'bg-brand-neon text-black font-black border-brand-neon'
                    : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                }`}
              >
                {r} Rounds
              </button>
            ))}
          </div>
        </div>

        {/* Launch Button */}
        <Button
          variant="primary"
          size="xl"
          onClick={handleLaunch}
          disabled={isLoadingContent}
          className="w-full shadow-glow-purple font-broadcast text-base mt-4 group"
        >
          {isLoadingContent ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-neon animate-spin" />
              <span>Generating Arena Challenges...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current text-brand-neon group-hover:scale-110 transition-transform" />
              <span>START SHOWDOWN NOW</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
