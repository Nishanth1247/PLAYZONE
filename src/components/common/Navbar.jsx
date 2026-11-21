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
  Compass
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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const arenasMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (arenasMenuRef.current && !arenasMenuRef.current.contains(e.target)) {
        setIsArenasMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreMenuOpen(false);
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
          ? 'rgba(244, 241, 232, 0.96)' 
          : themeId === 'party'
          ? 'rgba(248, 241, 235, 0.96)'
          : themeId === 'auction'
          ? 'rgba(16, 44, 39, 0.96)'
          : 'rgba(16, 27, 50, 0.96)',
        borderColor: theme.colors.border,
        color: theme.colors.text,
      }}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        
        {/* ========================================================= */}
        {/* LEFT: BRAND OR ARENA CONTEXT                              */}
        {/* ========================================================= */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo / Arena Indicator */}
          <button 
            type="button"
            onClick={() => setPlatformMode('home')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                color: '#FFFFFF'
              }}
            >
              {platformMode === 'auction' ? (
                <Gavel className="w-4 h-4" />
              ) : platformMode === 'battle' ? (
                <Swords className="w-4 h-4" />
              ) : platformMode === 'party' ? (
                <Gamepad2 className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>

            <div className="hidden sm:block">
              <span className="font-heading font-black text-lg tracking-tight leading-none block" style={{ color: theme.colors.text }}>
                PLAYZONE
              </span>
              <span className="text-[10px] font-mono tracking-wider uppercase block" style={{ color: theme.colors.textSecondary }}>
                {platformMode === 'auction'
                  ? 'Auction Arena'
                  : platformMode === 'battle'
                  ? 'Battle Arena'
                  : platformMode === 'party'
                  ? 'Party Arena'
                  : 'Tournament Platform'}
              </span>
            </div>
          </button>

          {/* Active Tournament Breadcrumb (If launched from a tournament) */}
          {activeTournament && (
            <div className="hidden md:flex items-center gap-2 pl-3 border-l" style={{ borderColor: theme.colors.border }}>
              <div 
                className="px-2.5 py-1 rounded-lg text-xs font-heading font-semibold flex items-center gap-1.5"
                style={{
                  backgroundColor: theme.colors.surfaceSecondary,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                }}
              >
                <Trophy className="w-3.5 h-3.5" style={{ color: theme.colors.accentPrimary }} />
                <span className="truncate max-w-[150px]">{activeTournament.name}</span>
              </div>

              {isArenaMode && (
                <button
                  type="button"
                  onClick={handleReturnToHub}
                  className="text-[11px] font-heading font-bold px-2 py-1 rounded hover:underline flex items-center gap-1 transition-colors"
                  style={{ color: theme.colors.accentAction }}
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
          {/* 1. MAIN WEBSITE NAVIGATION (Alpine Editorial) */}
          {!isArenaMode ? (
            <nav className="flex items-center gap-1 font-heading text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPlatformMode('home')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'home' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: platformMode === 'home' ? theme.colors.accentPrimary : 'transparent',
                  color: platformMode === 'home' ? '#FFFFFF' : theme.colors.text,
                }}
              >
                HOME
              </button>

              <button
                type="button"
                onClick={() => setPlatformMode('tournaments')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'tournaments' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: platformMode === 'tournaments' ? theme.colors.accentPrimary : 'transparent',
                  color: platformMode === 'tournaments' ? '#FFFFFF' : theme.colors.text,
                }}
              >
                TOURNAMENTS
              </button>

              {/* ARENAS DROPDOWN */}
              <div className="relative" ref={arenasMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsArenasMenuOpen(!isArenasMenuOpen)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:opacity-80 transition-all"
                  style={{ color: theme.colors.text }}
                >
                  <span>ARENAS</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isArenasMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isArenasMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-72 rounded-2xl shadow-xl p-2 z-50 border"
                      style={{
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('auction');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:opacity-90 transition-all"
                        style={{ backgroundColor: 'rgba(16, 44, 39, 0.08)' }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#102C27] text-[#C5A46D] flex items-center justify-center shrink-0">
                          <Gavel className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5">
                            <span>Auction Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#C5A46D]/20 text-[#C5A46D]">EMERALD</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5" style={{ color: theme.colors.textSecondary }}>
                            Tactical franchise auction with live bidding & hidden ratings.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('battle');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:opacity-90 transition-all mt-1"
                        style={{ backgroundColor: 'rgba(16, 27, 50, 0.08)' }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#101B32] text-[#6198E8] flex items-center justify-center shrink-0">
                          <Swords className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5">
                            <span>Battle Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#6198E8]/20 text-[#6198E8]">COBALT</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5" style={{ color: theme.colors.textSecondary }}>
                            Head-to-head combat with tactical draft & secret reveals.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPlatformMode('party');
                          setIsArenasMenuOpen(false);
                        }}
                        className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:opacity-90 transition-all mt-1"
                        style={{ backgroundColor: 'rgba(217, 117, 103, 0.08)' }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#F8F1EB] text-[#D97567] flex items-center justify-center shrink-0 border border-[#E4D6DC]">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-heading font-bold text-xs flex items-center gap-1.5">
                            <span>Party Arena</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D97567]/20 text-[#D97567]">CORAL</span>
                          </div>
                          <p className="text-[11px] leading-tight mt-0.5" style={{ color: theme.colors.textSecondary }}>
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
                  platformMode === 'franchises' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: platformMode === 'franchises' ? theme.colors.accentPrimary : 'transparent',
                  color: platformMode === 'franchises' ? '#FFFFFF' : theme.colors.text,
                }}
              >
                FRANCHISES
              </button>

              <button
                type="button"
                onClick={() => setPlatformMode('statistics')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  platformMode === 'statistics' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: platformMode === 'statistics' ? theme.colors.accentPrimary : 'transparent',
                  color: platformMode === 'statistics' ? '#FFFFFF' : theme.colors.text,
                }}
              >
                STATISTICS
              </button>

              <button
                type="button"
                onClick={handleOpenBroadcast}
                className="px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 hover:opacity-80"
                style={{
                  backgroundColor: 'transparent',
                  color: theme.colors.accentAction,
                }}
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
                  activePage === 'setup' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: activePage === 'setup' ? theme.colors.accentPrimary : 'transparent',
                  color: activePage === 'setup' ? '#102C27' : theme.colors.text,
                }}
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
                      activePage === 'live' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activePage === 'live' ? theme.colors.accentAction : 'transparent',
                      color: activePage === 'live' ? '#FFFFFF' : theme.colors.text,
                    }}
                  >
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>Live Arena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('teams')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'teams' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activePage === 'teams' ? theme.colors.accentPrimary : 'transparent',
                      color: activePage === 'teams' ? '#102C27' : theme.colors.text,
                    }}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Teams ({auction.teams?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('unsold')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'unsold' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activePage === 'unsold' ? theme.colors.accentPrimary : 'transparent',
                      color: activePage === 'unsold' ? '#102C27' : theme.colors.text,
                    }}
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Unsold ({unsoldItemsCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivePage('results')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                      activePage === 'results' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activePage === 'results' ? theme.colors.accentPrimary : 'transparent',
                      color: activePage === 'results' ? '#102C27' : theme.colors.text,
                    }}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Podium</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={handleReturnToHub}
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 flex items-center gap-1 border"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.textSecondary,
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Arena</span>
              </button>
            </nav>
          ) : platformMode === 'battle' ? (
            /* 3. ADAPTIVE BATTLE ARENA SUB-NAV */
            <nav className="flex items-center gap-2 font-heading text-xs">
              <div 
                className="px-3 py-1.5 rounded-lg border flex items-center gap-2"
                style={{
                  backgroundColor: theme.colors.surfaceSecondary,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }}
              >
                <Swords className="w-3.5 h-3.5" style={{ color: theme.colors.accentPrimary }} />
                <span>Stage: <strong className="uppercase">{battleState.phase.replace('_', ' ')}</strong></span>
              </div>

              <button
                type="button"
                onClick={handleReturnToHub}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 flex items-center gap-1 border"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.textSecondary,
                }}
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
                  partyView === 'arena' ? 'font-bold shadow-sm' : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor: partyView === 'arena' ? theme.colors.accentPrimary : 'transparent',
                  color: partyView === 'arena' ? '#FFFFFF' : theme.colors.text,
                }}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>Party Games</span>
              </button>

              {partyView === 'playing' && (
                <div 
                  className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: theme.colors.accentAction,
                    color: '#FFFFFF'
                  }}
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{selectedGame?.title || 'Live Game'}</span>
                </div>
              )}

              {partyView === 'results' && (
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5"
                  style={{
                    backgroundColor: theme.colors.accentPrimary,
                    color: '#FFFFFF',
                  }}
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Results</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleReturnToHub}
                className="ml-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 flex items-center gap-1 border"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.textSecondary,
                }}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Exit Party</span>
              </button>
            </nav>
          )}
        </div>

        {/* ========================================================= */}
        {/* RIGHT: UTILITIES & MORE MENU                              */}
        {/* ========================================================= */}
        <div className="flex items-center gap-2">
          {/* Rules Action */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('bidbattle_open_rules', { detail: { tab: isArenaMode ? platformMode : 'auction' } }));
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all border"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
            title="Official Game Rulebooks"
          >
            <BookOpen className="w-3.5 h-3.5" style={{ color: theme.colors.accentPrimary }} />
            <span>RULES</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className="p-2 rounded-lg transition-all border"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: isMuted ? theme.colors.textSecondary : theme.colors.accentPrimary,
            }}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-lg transition-all border hidden sm:flex"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg transition-all border lg:hidden"
            style={{
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              color: theme.colors.text,
            }}
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
            className="lg:hidden border-t px-4 py-3 space-y-2 font-heading text-xs"
            style={{
              backgroundColor: theme.colors.bg,
              borderColor: theme.colors.border,
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setPlatformMode('home'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                🏠 Home
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('tournaments'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                🏆 Tournaments
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('auction'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border text-[#C5A46D]"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                🔨 Auction Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('battle'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border text-[#6198E8]"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                ⚔️ Battle Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('party'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border text-[#D97567]"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                🎮 Party Arena
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('franchises'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                👥 Franchises
              </button>
              <button
                type="button"
                onClick={() => { setPlatformMode('statistics'); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
              >
                📊 Statistics
              </button>
              <button
                type="button"
                onClick={() => { handleOpenBroadcast(); setIsMobileMenuOpen(false); }}
                className="p-2 rounded-lg font-bold text-left border"
                style={{ backgroundColor: theme.colors.card, borderColor: theme.colors.border }}
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
