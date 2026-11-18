import React, { createContext, useContext, useState, useEffect } from 'react';
import { GAME_REGISTRY, FIXED_PARTY_PLAYERS, getGameById } from '../services/party/gameRegistry';
import { generateGameContent } from '../services/party/aiContentService';
import { soundService } from '../services/soundService';
import { toast } from 'sonner';

const PartyGameContext = createContext(null);

export const PartyGameProvider = ({ children }) => {
  // Navigation: 'arena' (Party Arena home) | 'lobby' | 'playing' | 'results'
  const [partyView, setPartyView] = useState('arena');

  // Currently selected game
  const [selectedGame, setSelectedGame] = useState(() => GAME_REGISTRY[0]);

  // Selected player roster (2 to 4 players)
  const [activePlayers, setActivePlayers] = useState(() => FIXED_PARTY_PLAYERS.slice(0, 4));

  // Game configuration options
  const [gameDifficulty, setGameDifficulty] = useState('mixed');
  const [selectedCategory, setSelectedCategory] = useState('mixed');
  const [roundsCount, setRoundsCount] = useState(5);
  const [timerDuration, setTimerDuration] = useState(20);

  // Active game session state
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [scores, setScores] = useState({});
  const [playerStreaks, setPlayerStreaks] = useState({});
  const [sessionLog, setSessionLog] = useState([]);
  const [contentItems, setContentItems] = useState([]);
  const [contentSource, setContentSource] = useState('offline');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Privacy pass-the-laptop guard
  const [passLaptopState, setPassLaptopState] = useState(null);

  // Open Lobby for a selected game
  const openGameLobby = (gameId) => {
    const game = getGameById(gameId);
    setSelectedGame(game);
    setRoundsCount(game.defaultRounds || 5);
    setTimerDuration(game.defaultTimer || 20);
    setSelectedCategory('mixed');
    setPartyView('lobby');
  };

  // Launch the active game session
  const launchGameSession = async (config = {}) => {
    const targetGame = config.game || selectedGame;
    const targetPlayers = config.players || activePlayers;
    const targetDifficulty = config.difficulty || gameDifficulty;
    const targetRounds = config.rounds || roundsCount;
    const targetCategory = config.category || selectedCategory || 'mixed';
    const targetTimer = config.timerDuration || timerDuration || targetGame?.defaultTimer || 45;

    if (config.timerDuration) {
      setTimerDuration(config.timerDuration);
    }
    if (config.category) {
      setSelectedCategory(config.category);
    }

    setIsLoadingContent(true);

    try {
      const generated = await generateGameContent({
        gameId: targetGame.id,
        universe: targetGame.universe,
        difficulty: targetDifficulty,
        category: targetCategory,
        count: targetRounds * (targetGame.mechanic === 'rapid_fire' ? 8 : 1),
        playerCount: targetPlayers.length,
      });

      setContentItems(generated.items || []);
      setContentSource(generated.source || 'offline');

      if (generated.notice) {
        toast.info(generated.notice);
      } else if (generated.source === 'ai') {
        toast.success(`⚡ AI Content Generated for ${targetGame.title}!`);
      }

      // Initialize scoreboard
      const initialScores = {};
      const initialStreaks = {};
      targetPlayers.forEach((p) => {
        initialScores[p.id] = 0;
        initialStreaks[p.id] = 0;
      });

      setScores(initialScores);
      setPlayerStreaks(initialStreaks);
      setSessionLog([]);
      setCurrentRoundIndex(0);
      setCurrentPlayerIndex(0);
      setPartyView('playing');
    } catch (err) {
      toast.error(`Failed to launch game: ${err.message}`);
    } finally {
      setIsLoadingContent(false);
    }
  };

  // Submit an answer / turn outcome
  const recordTurnResult = ({
    playerId,
    answer,
    isCorrect,
    points = 100,
    timeSpent = 0,
    item = null,
    explanation = '',
  }) => {
    const activePId = playerId || activePlayers[currentPlayerIndex]?.id;

    // Sound effect
    if (isCorrect) {
      soundService.playBid();
    } else {
      soundService.playGavel();
    }

    // Update score and streaks
    setScores((prev) => ({
      ...prev,
      [activePId]: Math.max(0, (prev[activePId] || 0) + (isCorrect ? points : 0)),
    }));

    setPlayerStreaks((prev) => ({
      ...prev,
      [activePId]: isCorrect ? (prev[activePId] || 0) + 1 : 0,
    }));

    // Log event
    setSessionLog((prev) => [
      ...prev,
      {
        round: currentRoundIndex + 1,
        playerId: activePId,
        playerName: activePlayers.find((p) => p.id === activePId)?.name || 'Player',
        answer,
        isCorrect,
        pointsAwarded: isCorrect ? points : 0,
        timeSpent,
        item,
        explanation,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Advance to next turn or next round
  const advanceTurn = () => {
    const nextPlayer = (currentPlayerIndex + 1) % activePlayers.length;
    setCurrentPlayerIndex(nextPlayer);

    // If full rotation is complete, advance round
    if (nextPlayer === 0) {
      const nextRound = currentRoundIndex + 1;
      if (nextRound >= roundsCount || nextRound >= contentItems.length) {
        completeGameSession();
        return;
      }
      setCurrentRoundIndex(nextRound);
    }
  };

  // Finish session and navigate to results screen
  const completeGameSession = () => {
    soundService.playSold();
    setPartyView('results');
  };

  // Exit back to party arena home
  const returnToArenaHome = () => {
    setPassLaptopState(null);
    setPartyView('arena');
  };

  return (
    <PartyGameContext.Provider
      value={{
        partyView,
        setPartyView,
        selectedGame,
        setSelectedGame,
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
        currentRoundIndex,
        currentPlayerIndex,
        activePlayer: activePlayers[currentPlayerIndex] || activePlayers[0],
        scores,
        playerStreaks,
        sessionLog,
        contentItems,
        contentSource,
        isLoadingContent,
        passLaptopState,
        setPassLaptopState,
        openGameLobby,
        launchGameSession,
        recordTurnResult,
        advanceTurn,
        completeGameSession,
        returnToArenaHome,
      }}
    >
      {children}
    </PartyGameContext.Provider>
  );
};

export const usePartyGame = () => {
  const context = useContext(PartyGameContext);
  if (!context) {
    throw new Error('usePartyGame must be used within a PartyGameProvider');
  }
  return context;
};
