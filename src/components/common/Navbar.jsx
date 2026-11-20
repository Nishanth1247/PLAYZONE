import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { usePartyGame } from '../../context/PartyGameContext';
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
  BookOpen
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { tournamentHubService } from '../../services/tournamentHubService';

export const Navbar = ({ platformMode = 'party', setPlatformMode }) => {
  const { 
    activePage, 
    setActivePage, 
    isMuted, 
    setIsMuted, 
    auction, 
    resetAuction,
    finishAuction 
  } = useAuction();

  const {
    partyView,
    setPartyView,
    selectedGame,
    returnToArenaHome,
  } = usePartyGame();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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

  const hasLiveAuction = auction && auction.items && auction.items.length > 0;
  const unsoldItemsCount = auction?.items?.filter(i => i.status === 'unsold').length || 0;

  // Auction Nav Items
  const auctionNavItems = [
    { id: 'home', label: 'Auction Home', icon: Home },
    { id: 'setup', label: 'Setup', icon: PlusCircle },
    ...(hasLiveAuction
      ? [
          { id: 'live', label: 'Live Arena', icon: Radio, isLive: true },
          { id: 'teams', label: `Teams (${auction.teams?.length || 0})`, icon: Users },
          { id: 'unsold', label: 'Unsold Pool', icon: Archive, badge: unsoldItemsCount },
          { id: 'results', label: 'Podium', icon: Trophy },
        ]
      : []),
  ];

  // Party Nav Items
  const partyNavItems = [
    { id: 'arena', label: 'Party Arena', icon: Gamepad2, onClick: returnToArenaHome },
    ...(partyView === 'playing'
      ? [{ id: 'playing', label: selectedGame?.title || 'Live Game', icon: Radio, isLive: true }]
      : []),
    ...(partyView === 'results'
      ? [{ id: 'results', label: 'Podium & Stats', icon: Trophy }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#39465A] bg-[#111827]/95 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Tag */}
        <div 
          onClick={() => {
            if (platformMode === 'party') {
              returnToArenaHome();
            } else if (platformMode === 'battle') {
              // Stay on battle
            } else if (platformMode === 'rules' || platformMode === 'franchises') {
              setPlatformMode('auction');
            } else {
              setActivePage('home');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[#222F43] border border-[#39465A] p-[1px] shadow-sm group-hover:border-[#D97858] transition-all">
            <div className="w-full h-full bg-[#111827] rounded-[7px] flex items-center justify-center">
              {platformMode === 'party' ? (
                <Gamepad2 className="w-4 h-4 text-[#D97858] group-hover:scale-105 transition-transform" />
              ) : platformMode === 'battle' ? (
                <Swords className="w-4 h-4 text-[#D97858] group-hover:scale-105 transition-transform" />
              ) : platformMode === 'rules' ? (
                <BookOpen className="w-4 h-4 text-[#D4B879] group-hover:scale-105 transition-transform" />
              ) : platformMode === 'franchises' ? (
                <Users className="w-4 h-4 text-[#D97858] group-hover:scale-105 transition-transform" />
              ) : (
                <Gavel className="w-4 h-4 text-[#D97858] group-hover:rotate-6 transition-transform" />
              )}
            </div>
          </div>
          <div>
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F5F3EE] block leading-tight">
              BIDBATTLE
            </span>
            <p className="text-[11px] text-[#AEB9CC] font-medium tracking-tight -mt-0.5 hidden sm:block">
              {platformMode === 'party'
                ? 'Party Arena • Local Pass & Play'
                : platformMode === 'battle'
                ? 'Battle Arena • Tactical Clash'
                : platformMode === 'tournaments'
                ? 'Tournament Hub • Season Manager'
                : platformMode === 'rules'
                ? 'Official Rulebooks & Guides'
                : platformMode === 'franchises'
                ? 'Franchise Manager • Team Branding'
                : 'Auction Arena • Franchise Bidding'}
            </p>
          </div>
        </div>

        {/* Global Platform Mode Switcher: Auction vs Party vs Battle Arena vs Rules */}
        <div className="flex items-center p-1 rounded-xl bg-[#222F43] border border-[#39465A] font-heading text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPlatformMode('auction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'auction'
                ? 'bg-[#D97858] text-[#F5F3EE] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AUCTION</span>
            <span className="sm:hidden">AUCT</span>
            {hasLiveAuction && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#F5F3EE] animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('party')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'party'
                ? 'bg-[#D97858] text-[#F5F3EE] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PARTY</span>
            <span className="sm:hidden">PARTY</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'battle'
                ? 'bg-[#D97858] text-[#F5F3EE] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATTLE ARENA</span>
            <span className="sm:hidden">BATTLE</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'rules'
                ? 'bg-[#D4B879] text-[#111827] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">RULES</span>
            <span className="sm:hidden">RULES</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('tournaments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'tournaments'
                ? 'bg-[#D4B879] text-[#111827] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
            <span className="hidden sm:inline">TOURNAMENTS</span>
            <span className="sm:hidden">HUB</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('franchises')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              platformMode === 'franchises'
                ? 'bg-[#D97858] text-[#F5F3EE] font-bold shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FRANCHISES</span>
            <span className="sm:hidden">TEAMS</span>
          </button>
        </div>

        {/* Navigation Tabs (if inside party or auction mode) */}
        {platformMode !== 'rules' && platformMode !== 'franchises' && platformMode !== 'tournaments' && (
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-medium relative font-heading">
            {platformMode === 'party' ? (
              partyNavItems.map((item) => {
                const isActive = partyView === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={item.onClick || (() => {})}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all z-10 ${
                      isActive ? 'bg-[#2C394C] text-[#F5F3EE] font-semibold border border-[#39465A]' : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            ) : platformMode === 'auction' ? (
              auctionNavItems.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActivePage(item.id)}
                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all z-10 ${
                      isActive ? 'bg-[#2C394C] text-[#F5F3EE] font-semibold border border-[#39465A]' : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#111827] text-[#D4B879] border border-[#39465A] font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })
            ) : null}
          </nav>
        )}

        {/* Right Controls: Sound, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Active Tournament Indicator */}
          {activeTournament && (platformMode === 'auction' || platformMode === 'battle') && (
            <button
              onClick={() => setPlatformMode('tournaments')}
              title={`Active Tournament: ${activeTournament.name}. Click to view in Tournament Hub.`}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#D4B879]/15 border border-[#D4B879]/30 text-[#D4B879] hover:bg-[#D4B879]/25 hover:text-[#F5F3EE] text-xs font-semibold font-heading transition-all"
            >
              <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
              <span className="truncate max-w-[130px]">{activeTournament.name}</span>
              <span className="text-[10px] text-[#AEB9CC] font-normal">Hub →</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-[#222F43] border-rose-900/60 text-rose-300'
                : 'bg-[#222F43] border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] hover:border-[#D97858]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F5F3EE]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Broadcast Fullscreen'}
            className="p-2 rounded-xl bg-[#222F43] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] hover:border-[#D97858] transition-all hidden sm:flex"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4 text-[#F5F3EE]" />}
          </button>

          {/* Host Menu for live tournament in Auction Mode */}
          {platformMode === 'auction' && hasLiveAuction && (
            <div className="relative">
              <button
                onClick={() => setShowExitConfirm(!showExitConfirm)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#F5F3EE] transition-all font-heading"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#AEB9CC]" />
                <span className="hidden sm:inline">Host Controls</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#AEB9CC]" />
              </button>

              {showExitConfirm && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#222F43] border border-[#39465A] shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-[#39465A] text-[10px] font-bold text-[#AEB9CC] uppercase tracking-wider font-heading">
                    Tournament Admin
                  </div>
                  <button
                    onClick={() => {
                      finishAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#F5F3EE] hover:bg-[#2C394C] rounded-lg flex items-center gap-2 mt-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
                    <span>Conclude Tournament</span>
                  </button>
                  <button
                    onClick={() => {
                      resetAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/30 rounded-lg flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset & Exit to Home</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
