import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Radio, 
  Trophy, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Users, 
  X, 
  Maximize, 
  Minimize, 
  Play, 
  ChevronRight, 
  Sparkles,
  Layers,
  Settings,
  Shield,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { tournamentHubService } from '../../services/tournamentHubService';
import { broadcastService, DEFAULT_BROADCAST_SETTINGS } from '../../services/broadcastService';
import { BroadcastController } from './BroadcastController';
import { BroadcastScoreboard } from './BroadcastScoreboard';
import { BroadcastSettingsModal } from './BroadcastSettingsModal';
import { FranchiseIntroduction } from './FranchiseIntroduction';
import { AuctionBroadcast } from './AuctionBroadcast';
import { BattleBroadcast } from './BattleBroadcast';
import { PartyBroadcast } from './PartyBroadcast';
import { ChampionshipCeremony } from './ChampionshipCeremony';
import { useAuction } from '../../context/AuctionContext';
import { useBattleArena } from '../../context/BattleArenaContext';
import { usePartyGame } from '../../context/PartyGameContext';

export const BroadcastMode = ({
  isOpen,
  onClose,
  initialTournamentId = null,
  initialMode = 'live', // 'live' | 'ceremony'
  initialArena = null, // 'auction' | 'battle' | 'party'
}) => {
  // Context states
  const { auction } = useAuction();
  const { battleState } = useBattleArena();
  const { selectedGame, partyState } = usePartyGame();

  // Settings & Tournament Resolution
  const [settings, setSettings] = useState(() => broadcastService.getSettings());
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(true);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);

  // Broadcast Navigation Phase: 'home' | 'active'
  const [broadcastPhase, setBroadcastPhase] = useState('home');
  const [currentMode, setCurrentMode] = useState(initialMode || 'live');
  const [selectedTournamentId, setSelectedTournamentId] = useState(
    initialTournamentId || tournamentHubService.getActiveTournamentId()
  );

  // Scene indexing for Live mode: 0 = Franchise Intros, 1 = Live Arena, 2 = Standings
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  // Sync initial props when opened
  useEffect(() => {
    if (isOpen) {
      const activeId = initialTournamentId || tournamentHubService.getActiveTournamentId();
      setSelectedTournamentId(activeId);
      setCurrentMode(initialMode || 'live');
      setBroadcastPhase('home');
      setCurrentSceneIndex(0);
      setSettings(broadcastService.getSettings());
    }
  }, [isOpen, initialTournamentId, initialMode]);

  // Load tournament object
  const tournament = useMemo(() => {
    if (!selectedTournamentId) return null;
    return tournamentHubService.getTournamentById(selectedTournamentId);
  }, [selectedTournamentId]);

  // Contending franchises snapshot (uses tournament snapshot for isolation)
  const franchises = useMemo(() => {
    if (tournament?.franchisesSnapshot && tournament.franchisesSnapshot.length > 0) {
      return tournament.franchisesSnapshot;
    }
    if (battleState?.teams && battleState.teams.length > 0) {
      return battleState.teams;
    }
    if (auction?.teams && auction.teams.length > 0) {
      return auction.teams;
    }
    return [];
  }, [tournament, battleState, auction]);

  // Active arena mode
  const activeArena = useMemo(() => {
    if (initialArena) return initialArena;
    if (tournament?.enabledModes?.length > 0) {
      if (tournament.enabledModes.includes('auction')) return 'auction';
      if (tournament.enabledModes.includes('battle')) return 'battle';
      if (tournament.enabledModes.includes('party')) return 'party';
    }
    if (battleState && battleState.teams?.length > 0) return 'battle';
    if (auction && auction.items?.length > 0) return 'auction';
    return 'auction';
  }, [initialArena, tournament, battleState, auction]);

  // Derived standings
  const standings = useMemo(() => {
    return broadcastService.getStandings(tournament, auction, battleState);
  }, [tournament, auction, battleState]);

  // Scene definitions for Live mode
  const scenes = useMemo(() => {
    return [
      { id: 'intros', title: 'Franchise Intros' },
      { id: 'arena', title: activeArena === 'auction' ? 'Live Auction' : activeArena === 'battle' ? 'Battle Clash' : 'Party Showdown' },
      { id: 'standings', title: 'Live Standings' },
    ];
  }, [activeArena]);

  // Fullscreen toggle handler
  const handleToggleFullscreen = useCallback(() => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Fullscreen request failed:', e);
    }
  }, []);

  // Keyboard shortcut controller
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Guard against typing in input fields
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (showSettingsModal) {
            setShowSettingsModal(false);
          } else {
            onClose();
          }
          break;
        case ' ':
          e.preventDefault();
          setIsAutoAdvancing((prev) => !prev);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentSceneIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1));
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          setShowScoreboard((prev) => !prev);
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setSettings((prev) => {
            const next = broadcastService.saveSettings({ soundEnabled: !prev.soundEnabled });
            return next;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showSettingsModal, scenes.length, handleToggleFullscreen, onClose]);

  // Settings update handler
  const handleUpdateSettings = (newPartial) => {
    const updated = broadcastService.saveSettings(newPartial);
    setSettings(updated);
  };

  const handleResetSettings = () => {
    const reset = broadcastService.resetSettings();
    setSettings(reset);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0B0F17] text-[#F5F3EE] flex flex-col overflow-hidden select-none">
      {/* Background Cinematic Gradient Aura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#222F43]/40 via-[#111827] to-[#0B0F17] pointer-events-none" />

      {/* ======================================================== */}
      {/* BROADCAST HOME SCREEN (Before starting the presentation) */}
      {/* ======================================================== */}
      {broadcastPhase === 'home' ? (
        <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between relative z-10 overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-[#39465A]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#D4B879]/20 border border-[#D4B879]/40 flex items-center justify-center text-[#D4B879]">
                <Tv className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-xl text-[#F5F3EE] tracking-wide">
                    PLAYZONE BROADCAST CONTROL
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400 uppercase">
                    PRO BROADCAST
                  </span>
                </div>
                <p className="text-xs text-[#AEB9CC] font-sans">
                  Cinematic pass-and-play spectator presentation system
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
              title="Close Broadcast (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Control Card */}
          <div className="my-auto py-6 space-y-6">
            <div className="rounded-3xl p-6 sm:p-8 bg-[#192231] border border-[#39465A] shadow-2xl relative overflow-hidden space-y-6">
              {/* Tournament Meta Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#39465A]">
                <div>
                  <span className="text-xs font-mono font-bold text-[#D4B879] uppercase tracking-wider block">
                    {tournament?.category || 'Championship Arena'} • {tournament?.season || 'Current Season'}
                  </span>
                  <h1 className="font-heading font-black text-3xl sm:text-4xl text-[#F5F3EE] mt-1">
                    {tournament?.name || (activeArena === 'auction' ? 'Auction Arena' : activeArena === 'battle' ? 'Battle Arena' : 'Party Arena')}
                  </h1>
                  <p className="text-xs text-[#AEB9CC] font-sans mt-1">
                    Status: <span className="font-bold text-emerald-400 uppercase">{tournament?.status || 'Active Session'}</span> • {franchises.length} Contending Franchises
                  </p>
                </div>

                {/* Mode Selector Tabs */}
                <div className="p-1 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center gap-1">
                  <button
                    onClick={() => setCurrentMode('live')}
                    className={`px-4 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center gap-1.5 ${
                      currentMode === 'live'
                        ? 'bg-[#00D9FF] text-[#0B0F17] shadow-sm'
                        : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>LIVE BROADCAST</span>
                  </button>

                  <button
                    onClick={() => setCurrentMode('ceremony')}
                    className={`px-4 py-2 rounded-xl text-xs font-heading font-black transition-all flex items-center gap-1.5 ${
                      currentMode === 'ceremony'
                        ? 'bg-[#D4B879] text-[#0B0F17] shadow-sm'
                        : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>CEREMONY</span>
                  </button>
                </div>
              </div>

              {/* Contending Franchises Badges */}
              <div className="space-y-2">
                <span className="text-xs font-heading font-bold text-[#AEB9CC] uppercase block">
                  CONTENDING FRANCHISES:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {franchises.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center gap-2.5 truncate"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: f.color || '#D4B879' }}
                      />
                      <span className="font-heading font-bold text-xs text-[#F5F3EE] truncate">
                        {f.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Broadcast Primary Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs font-heading text-[#AEB9CC]">
                  <Sparkles className="w-4 h-4 text-[#D4B879]" />
                  <span>Supports 1920x1080 & 1366x768 landscape broadcasts with zero state loss.</span>
                </div>

                <Button
                  variant={currentMode === 'live' ? 'cyan' : 'champagne'}
                  size="lg"
                  onClick={() => {
                    broadcastService.playAudio('intro');
                    setBroadcastPhase('active');
                  }}
                  className="w-full sm:w-auto px-8 font-heading font-black text-sm shadow-2xl flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>START {currentMode === 'live' ? 'LIVE BROADCAST' : 'CEREMONY'}</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Shortcuts Hint */}
          <div className="pt-3 border-t border-[#39465A] text-center text-xs text-[#AEB9CC] font-mono">
            Keyboard Shortcuts: Space (Play/Pause) • Left/Right (Scenes) • S (Scoreboard) • M (Mute) • F (Fullscreen) • Esc (Exit)
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* ACTIVE BROADCAST STAGE & SCENE PRESENTATION              */
        /* ======================================================== */
        <div className="flex-1 w-full flex flex-col relative overflow-hidden">
          {/* Live Scoreboard Overlay Ticker */}
          {showScoreboard && (
            <BroadcastScoreboard
              mode={activeArena}
              style={settings.scoreboardStyle}
              auctionState={auction}
              battleState={battleState}
              partyState={partyState}
              tournament={tournament}
              standings={standings}
            />
          )}

          {/* Active Scene Container */}
          <div className="flex-1 flex flex-col pt-16 pb-20">
            {currentMode === 'ceremony' ? (
              <ChampionshipCeremony
                tournament={tournament}
                standings={standings}
                onViewResults={() => {
                  setBroadcastPhase('home');
                }}
                onExitCeremony={onClose}
              />
            ) : (
              /* LIVE BROADCAST SCENES */
              <>
                {currentSceneIndex === 0 && (
                  <FranchiseIntroduction
                    franchises={franchises}
                    tournament={tournament}
                    onComplete={() => setCurrentSceneIndex(1)}
                    autoAdvance={settings.autoAdvance}
                    slideDuration={settings.slideDuration}
                  />
                )}

                {currentSceneIndex === 1 && (
                  <>
                    {activeArena === 'auction' && (
                      <AuctionBroadcast
                        auctionState={auction}
                        tournament={tournament}
                      />
                    )}
                    {activeArena === 'battle' && (
                      <BattleBroadcast
                        battleState={battleState}
                        tournament={tournament}
                        standings={standings}
                      />
                    )}
                    {activeArena === 'party' && (
                      <PartyBroadcast
                        partyState={partyState}
                        selectedGame={selectedGame}
                        tournament={tournament}
                        standings={standings}
                      />
                    )}
                  </>
                )}

                {currentSceneIndex === 2 && (
                  <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between text-[#F5F3EE]">
                    <div className="text-center space-y-2">
                      <span className="px-3 py-1 rounded-full bg-[#D4B879]/20 border border-[#D4B879] text-xs font-mono font-black text-[#D4B879] uppercase">
                        LIVE TOURNAMENT LEADERBOARD
                      </span>
                      <h2 className="font-heading font-black text-3xl sm:text-4xl">
                        STANDINGS & SQUAD METRICS
                      </h2>
                    </div>

                    <div className="my-auto py-4 space-y-3">
                      {standings.map((s, idx) => (
                        <div
                          key={s.teamId || idx}
                          className="p-4 rounded-2xl bg-[#192231] border border-[#39465A] flex items-center justify-between gap-4 relative overflow-hidden"
                        >
                          <div
                            className="absolute top-0 left-0 bottom-0 w-2"
                            style={{ backgroundColor: s.color || '#D4B879' }}
                          />
                          <div className="flex items-center gap-3 pl-2">
                            <span className="font-mono font-black text-base text-[#D4B879]">
                              #{s.rank || idx + 1}
                            </span>
                            <span className="font-heading font-bold text-lg text-[#F5F3EE]">
                              {s.teamName}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 font-mono text-xs">
                            <span className="text-[#AEB9CC]">
                              Remaining Purse: <strong className="text-[#00D9FF]">₹{s.purseRemaining} Cr</strong>
                            </span>
                            <span className="font-black text-sm text-[#D4B879]">
                              {s.points} PTS
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="text-center text-xs text-[#AEB9CC] font-mono">
                      All scores and standings synchronize directly with active arena engines.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Docked Host Controller Bar */}
          <BroadcastController
            currentSceneIndex={currentSceneIndex}
            totalScenes={scenes.length}
            sceneTitle={currentMode === 'ceremony' ? 'Championship Ceremony' : scenes[currentSceneIndex]?.title || 'Broadcast'}
            isAutoAdvancing={isAutoAdvancing}
            onToggleAutoAdvance={() => setIsAutoAdvancing((prev) => !prev)}
            onPrevScene={() => setCurrentSceneIndex((prev) => Math.max(0, prev - 1))}
            onNextScene={() => setCurrentSceneIndex((prev) => Math.min(scenes.length - 1, prev + 1))}
            onReplayScene={() => {
              broadcastService.playAudio('intro');
            }}
            showScoreboard={showScoreboard}
            onToggleScoreboard={() => setShowScoreboard((prev) => !prev)}
            soundEnabled={settings.soundEnabled}
            onToggleSound={() => {
              setSettings((prev) => broadcastService.saveSettings({ soundEnabled: !prev.soundEnabled }));
            }}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onOpenSettings={() => setShowSettingsModal(true)}
            onExitBroadcast={onClose}
          />
        </div>
      )}

      {/* Broadcast Settings Modal */}
      <BroadcastSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
      />
    </div>
  );
};
