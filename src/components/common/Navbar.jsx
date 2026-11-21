import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { usePartyGame } from '../../context/PartyGameContext';
import { useBattleArena } from '../../context/BattleArenaContext';
import { useTheme } from '../../theme/ThemeProvider';
import { toast } from 'sonner';
import { 
  Gavel, 
  Gamepad2,
  Swords,
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Radio, 
  Users, 
  Archive, 
  Trophy, 
  Home, 
  PlusCircle, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Layers,
  Settings,
  BookOpen,
  Tv,
  BarChart3,
  ArrowLeft,
  Menu,
  X,
  Compass,
  Flame,
  Shield
} from 'lucide-react';
import { tournamentHubService } from '../../services/tournamentHubService';

export const Navbar = ({ platformMode = 'home', setPlatformMode }) => {
  const { 
    activePage, 
    setActivePage, 
    isMuted, 
    setIsMuted, 
    auction 
  } = useAuction();

  const {
    partyView,
    setPartyView,
    selectedGame,
    returnToArenaHome,
  } = usePartyGame();

  const { battleState } = useBattleArena();
  const { theme, themeId, isDark } = useTheme();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isArenasMenuOpen, setIsArenasMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const arenasMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (arenasMenuRef.current && !arenasMenuRef.current.contains(e.target)) {
        setIsArenasMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeTournId = tournamentHubService.getActiveTournamentId();
  const activeTournament = activeTournId ? tournamentHubService.getTournamentById(activeTournId) : null;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    toast(next ? '🔇 Sound effects muted' : '🔊 Sound effects active', {
      duration: 1800,
    });
  };

  const handleOpenBroadcast = () => {
    window.dispatchEvent(new CustomEvent('bidbattle_open_broadcast', {
      detail: { 
        arena: platformMode === 'auction' ? 'auction' : platformMode === 'battle' ? 'battle' : platformMode === 'party' ? 'party' : null,
        mode: 'live',
        tournamentId: activeTournId || null
      }
    }));
  };

  const hasLiveAuction = auction && auction.items && auction.items.length > 0;
  const unsoldItemsCount = auction?.items?.filter(i => i.status === 'unsold').length || 0;

  // Determine navbar mode: 'website' | 'auction' | 'battle' | 'party'
  const isArenaMode = platformMode === 'auction' || platformMode === 'battle' || platformMode === 'party';

  // Return to hub without mutating or resetting arena state
  const handleReturnToHub = () => {
    setPlatformMode('tournaments');
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b transition-colors duration-200 backdrop-blur-md"
      style={{
        backgroundColor: themeId === 'website' 
          ? 'rgba(16, 20, 24, 0.94)' 
          : themeId === 'party'
          ? 'rgba(27, 21, 33, 0.94)'
          : themeId === 'auction'
          ? 'rgba(11, 33, 29, 0.94)'
          : 'rgba(10, 18, 36, 0.94)',
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* ========================================================= */}
        {/* LEFT: REFINED BRANDING OR ARENA CONTEXT                   */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo / Arena Indicator */}
          <button 
            type="button"
            onClick={() => setPlatformMode('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-all group-hover:scale-105 border"
              style={{
                backgroundColor: themeId === 'website' ? '#1C252D' : theme.colors.card,
                borderColor: themeId === 'website' ? '#34414A' : theme.colors.border,
                color: theme.colors.accentPrimary
              }}
            >
              {platformMode === 'auction' ? (
                <Gavel className="w-4 h-4 text-[#C5A46D]" />
              ) : platformMode === 'battle' ? (
                <Swords className="w-4 h-4 text-[#568BE0]" />
              ) : platformMode === 'party' ? (
                <Gamepad2 className="w-4 h-4 text-[#C77B79]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#45C4A1]" />
              )}
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center">
                <span className="font-heading font-black text-lg tracking-wider leading-none text-[#EDF2F3]">
                  PLAY<span className="text-[#45C4A1]">ZONE</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#45C4A1] ml-1 mb-1.5 animate-pulse" />
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase block text-[#788890]">
                {platformMode === 'auction'
                  ? 'Auction Arena • Emerald'
                  : platformMode === 'battle'
                  ? 'Battle Arena • Cobalt'
                  : platformMode === 'party'
                  ? 'Party Arena • Plum'
                  : 'Sports-Tech Gaming Hub'}
              </span>
            </div>
          </button>

          {/* Active Tournament Breadcrumb (If launched from a tournament) */}
          {activeTournament && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#34414A]">
              <div 
                className="px-2.5 py-1 rounded-lg text-xs font-heading font-semibold flex items-center gap-1.5 border"
                style={{
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }}
              >
                <Trophy className="w-3.5 h-3.5 text-[#D6A568]" />
                <span className="truncate max-w-[150px]">{activeTournament.name}</span>
              </div>

              {isArenaMode && (
                <button
                  type="button"
                  onClick={handleReturnToHub}
                  className="text-[11px] font-heading font-bold px-2 py-1 rounded hover:underline flex items-center gap-1 transition-colors text-[#45C4A1]"
                  title="Return to Tournament workspace (gameplay saved)"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Return to Hub</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CENTRE: ADAPTIVE NAVIGATION                               */}
        {/* ========================================================= */}
        <div className="hidden lg:flex items-center gap-1">
          {/* 1. MAIN WEBSITE NAVIGATION (Midnight Obsidian) */}
          {!isArenaMode ? (
            <nav className="flex items-center gap-1 font-heading text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPlatformMode('home')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'home'
                    ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 font-bold shadow-sm'
                    : 'text-[#A5B2B8] hover:text-[#EDF2F3] hover:bg-[#1C252D]'
                }`}
              >
                HOME
              </button>

              <button
                type="button"
                onClick={() => setPlatformMode('tournaments')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'tournaments'
                    ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 font-bold shadow-sm'
                    : 'text-[#A5B2B8] hover:text-[#EDF2F3] hover:bg-[#1C252D]'
                }`}
              >
                TOURNAMENTS
              </button>

              {/* ARENAS DROPDOWN */}
              <div className="relative" ref={arenasMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsArenasMenuOpen(!isArenasMenuOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all ${
                    isArenasMenuOpen
                      ? 'bg-[#1C252D] text-[#EDF2F3]'
                      : 'text-[#A5B2B8] hover:text-[#EDF2F3] hover:bg-[#1C252D]'
                  }`}
                >
                  <span>ARENAS</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isArenasMenuOpen ? 'rotate-180 text-[#45C4A1]' : ''}`} />
                </button>

                <AnimatePresence>
                  {isArenasMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-80 rounded-2xl shadow-2xl p-2.5 z-50 border bg-[#1C252D] border-[#34414A]"
                    >
                      <div className="px-2 py-1 mb-1 text-[10px] font-mono text-[#788890] uppercase tracking-wider">
                        Choose Arena
                      </div>

                      {/* 1. Auction Arena Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('auction');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:bg-[#15352D]/40 transition-all border border-transparent hover:border-[#244F43]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0B211D] border border-[#244F43] text-[#C5A46D] flex items-center justify-center shrink-0">
                          <Gavel className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5 text-[#F5F0E5]">
                            <span>Auction Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A46D]/20 text-[#C5A46D] border border-[#C5A46D]/30 font-mono">EMERALD</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5 text-[#B6C5B5]">
                            Tactical franchise auction with live bidding & hidden ratings.
                          </p>
                        </div>
                      </button>

                      {/* 2. Battle Arena Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('battle');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:bg-[#172744]/40 transition-all mt-1 border border-transparent hover:border-[#2C4468]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#0A1224] border border-[#2C4468] text-[#568BE0] flex items-center justify-center shrink-0">
                          <Swords className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5 text-[#F0F3F8]">
                            <span>Battle Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#568BE0]/20 text-[#568BE0] border border-[#568BE0]/30 font-mono">COBALT</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5 text-[#AAB8CB]">
                            Head-to-head combat with tactical draft & secret reveals.
                          </p>
                        </div>
                      </button>

                      {/* 3. Party Arena Option */}
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('party');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:bg-[#302438]/40 transition-all mt-1 border border-transparent hover:border-[#4A3A54]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#1B1521] border border-[#4A3A54] text-[#C77B79] flex items-center justify-center shrink-0">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5 text-[#F5EFF8]">
                            <span>Party Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C77B79]/20 text-[#C77B79] border border-[#C77B79]/30 font-mono">PLUM</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5 text-[#B3A2BC]">
                            Local pass-the-laptop Dumb Charades & Who Am I?
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={() => setPlatformMode('franchises')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'franchises'
                    ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 font-bold shadow-sm'
                    : 'text-[#A5B2B8] hover:text-[#EDF2F3] hover:bg-[#1C252D]'
                }`}
              >
                FRANCHISES
              </button>

              <button
                type="button"
                onClick={() => setPlatformMode('statistics')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'statistics'
                    ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 font-bold shadow-sm'
                    : 'text-[#A5B2B8] hover:text-[#EDF2F3] hover:bg-[#1C252D]'
                }`}
              >
                STATISTICS
              </button>

              <button
                type="button"
                onClick={handleOpenBroadcast}
                className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-[#D6A568] hover:bg-[#D6A568]/10"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>BROADCAST</span>
              </button>
            </nav>
          ) : platformMode === 'auction' ? (
            /* 2. ADAPTIVE AUCTION ARENA SUB-NAV */
            <nav className="flex items-center gap-1 font-heading text-xs">
              <button
                type="button"
                onClick={() => setActivePage('setup')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activePage === 'setup'
                    ? 'bg-[#C5A46D] text-[#0B211D] font-bold shadow-sm'
                    : 'text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Setup</span>
              </button>

              {hasLiveAuction && (
                <>
                  <button
                    type="button"
                    onClick={() => setActivePage('live')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'live'
                        ? 'bg-[#D17B55] text-white font-bold shadow-sm'
                        : 'text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Live Arena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('teams')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'teams'
                        ? 'bg-[#C5A46D] text-[#0B211D] font-bold shadow-sm'
                        : 'text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teams ({auction.teams?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('unsold')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'unsold'
                        ? 'bg-[#C5A46D] text-[#0B211D] font-bold shadow-sm'
                        : 'text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]'
                    }`}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Unsold ({unsoldItemsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('results')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'results'
                        ? 'bg-[#C5A46D] text-[#0B211D] font-bold shadow-sm'
                        : 'text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Podium</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleReturnToHub}
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#244F43] text-[#B6C5B5] hover:text-[#F5F0E5] hover:bg-[#15352D]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Arena</span>
              </button>
            </nav>
          ) : platformMode === 'battle' ? (
            /* 3. ADAPTIVE BATTLE ARENA SUB-NAV */
            <nav className="flex items-center gap-2 font-heading text-xs">
              <div className="px-3 py-1.5 rounded-lg border border-[#2C4468] bg-[#172744] text-[#F0F3F8] flex items-center gap-2">
                <Swords className="w-3.5 h-3.5 text-[#568BE0]" />
                <span>Stage: <strong className="uppercase">{battleState.phase.replace('_', ' ')}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleReturnToHub}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#2C4468] text-[#AAB8CB] hover:text-[#F0F3F8] hover:bg-[#172744]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Battle</span>
              </button>
            </nav>
          ) : (
            /* 4. ADAPTIVE PARTY ARENA SUB-NAV */
            <nav className="flex items-center gap-1 font-heading text-xs">
              <button
                type="button"
                onClick={returnToArenaHome}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  partyView === 'arena'
                    ? 'bg-[#C77B79] text-white font-bold shadow-sm'
                    : 'text-[#B3A2BC] hover:text-[#F5EFF8] hover:bg-[#302438]'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Party Games</span>
              </button>

              {partyView === 'playing' && (
                <div className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm bg-[#D6A568] text-[#1B1521]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{selectedGame?.title || 'Live Game'}</span>
                </div>
              )}

              {partyView === 'results' && (
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 bg-[#C77B79] text-white"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Results</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReturnToHub}
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#4A3A54] text-[#B3A2BC] hover:text-[#F5EFF8] hover:bg-[#302438]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Party</span>
              </button>
            </nav>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT: UTILITIES & ACTIONS                                */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2">
          {/* Rules Action */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('bidbattle_open_rules', { detail: { tab: isArenaMode ? platformMode : 'auction' } }));
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] hover:border-[#45C4A1]/50"
            title="Official Game Rulebooks"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#45C4A1]" />
            <span>RULES</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-lg transition-all border border-[#34414A] bg-[#1C252D] hover:border-[#45C4A1]/50"
            style={{
              color: isMuted ? '#788890' : '#45C4A1',
            }}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg transition-all border border-[#34414A] bg-[#1C252D] text-[#A5B2B8] hover:text-[#EDF2F3] hover:border-[#45C4A1]/50 hidden sm:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg transition-all border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] lg:hidden"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE EXPANDED MENU                                      */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t px-4 py-3 space-y-2 font-heading text-xs bg-[#101418] border-[#34414A]"
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setPlatformMode('home'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] hover:border-[#45C4A1]"
              >
                🏠 Home
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('tournaments'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] hover:border-[#45C4A1]"
              >
                🏆 Tournaments
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('auction'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#244F43] bg-[#0B211D] text-[#C5A46D]"
              >
                🔨 Auction Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('battle'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#2C4468] bg-[#0A1224] text-[#568BE0]"
              >
                ⚔️ Battle Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('party'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#4A3A54] bg-[#1B1521] text-[#C77B79]"
              >
                🎮 Party Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('franchises'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] hover:border-[#45C4A1]"
              >
                👥 Franchises
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('statistics'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#34414A] bg-[#1C252D] text-[#EDF2F3] hover:border-[#45C4A1]"
              >
                📊 Statistics
              </button>
              <button
                type="button"
                onClick={() => { handleOpenBroadcast(); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border border-[#34414A] bg-[#1C252D] text-[#D6A568]"
              >
                📺 Broadcast
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
