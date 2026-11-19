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
  Settings
} from 'lucide-react';
import { Badge } from '../ui/Badge';

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
    <header className="sticky top-0 z-40 w-full border-b border-[#303030] bg-[#090909]/95 backdrop-blur-md">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Tag */}
        <div 
          onClick={() => {
            if (platformMode === 'party') {
              returnToArenaHome();
            } else if (platformMode === 'battle') {
              // Stay on battle
            } else {
              setActivePage('home');
            }
          }}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[#191919] border border-[#303030] p-[1px] shadow-sm group-hover:border-[#555555] transition-all">
            <div className="w-full h-full bg-[#090909] rounded-[7px] flex items-center justify-center">
              {platformMode === 'party' ? (
                <Gamepad2 className="w-4 h-4 text-[#F2F2F0] group-hover:scale-105 transition-transform" />
              ) : platformMode === 'battle' ? (
                <Swords className="w-4 h-4 text-[#F2F2F0] group-hover:scale-105 transition-transform" />
              ) : (
                <Gavel className="w-4 h-4 text-[#F2F2F0] group-hover:rotate-6 transition-transform" />
              )}
            </div>
          </div>
          <div>
            <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-[#F2F2F0] block leading-tight">
              BIDBATTLE
            </span>
            <p className="text-[11px] text-[#A3A3A3] font-medium tracking-tight -mt-0.5 hidden sm:block">
              {platformMode === 'party'
                ? 'Party Arena • Local Pass & Play'
                : platformMode === 'battle'
                ? 'Battle Arena • Tactical Clash'
                : 'Auction Arena • Franchise Bidding'}
            </p>
          </div>
        </div>

        {/* Global Platform Mode Switcher: Auction vs Party vs Battle Arena */}
        <div className="flex items-center p-1 rounded-lg bg-[#191919] border border-[#303030] font-heading text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPlatformMode('auction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              platformMode === 'auction'
                ? 'bg-[#F2F2F0] text-[#090909] font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-[#F2F2F0]'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AUCTION</span>
            <span className="sm:hidden">AUCT</span>
            {hasLiveAuction && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#090909] animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('party')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              platformMode === 'party'
                ? 'bg-[#F2F2F0] text-[#090909] font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-[#F2F2F0]'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PARTY</span>
            <span className="sm:hidden">PARTY</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              platformMode === 'battle'
                ? 'bg-[#F2F2F0] text-[#090909] font-bold shadow-sm'
                : 'text-[#A3A3A3] hover:text-[#F2F2F0]'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">BATTLE ARENA</span>
            <span className="sm:hidden">BATTLE</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-lg bg-[#191919] border border-[#303030] text-xs font-medium relative font-heading">
          {platformMode === 'party' ? (
            partyNavItems.map((item) => {
              const isActive = partyView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick || (() => {})}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all z-10 ${
                    isActive ? 'bg-[#222222] text-[#F2F2F0] font-semibold border border-[#3A3A3A]' : 'text-[#A3A3A3] hover:text-[#F2F2F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })
          ) : (
            auctionNavItems.map((item) => {
              const isActive = activePage === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all z-10 ${
                    isActive ? 'bg-[#222222] text-[#F2F2F0] font-semibold border border-[#3A3A3A]' : 'text-[#A3A3A3] hover:text-[#F2F2F0]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#303030] text-[#F2F2F0] border border-[#444444] font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Right Controls: Sound, Fullscreen */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className={`p-2 rounded-lg border transition-all ${
              isMuted
                ? 'bg-[#191919] border-rose-900/60 text-rose-300'
                : 'bg-[#191919] border-[#303030] text-[#A3A3A3] hover:text-[#F2F2F0] hover:border-[#505050]'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#F2F2F0]" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Broadcast Fullscreen'}
            className="p-2 rounded-lg bg-[#191919] border border-[#303030] text-[#A3A3A3] hover:text-[#F2F2F0] hover:border-[#505050] transition-all hidden sm:flex"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4 text-[#F2F2F0]" />}
          </button>

          {/* Host Menu for live tournament in Auction Mode */}
          {platformMode === 'auction' && hasLiveAuction && (
            <div className="relative">
              <button
                onClick={() => setShowExitConfirm(!showExitConfirm)}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#191919] hover:bg-[#222222] border border-[#303030] text-[#F2F2F0] transition-all font-heading"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#A3A3A3]" />
                <span className="hidden sm:inline">Host Controls</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373]" />
              </button>

              {showExitConfirm && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#191919] border border-[#303030] shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-[#303030] text-[10px] font-bold text-[#737373] uppercase tracking-wider font-heading">
                    Tournament Admin
                  </div>
                  <button
                    onClick={() => {
                      finishAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-[#F2F2F0] hover:bg-[#222222] rounded-md flex items-center gap-2 mt-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-[#F2F2F0]" />
                    <span>Conclude Tournament</span>
                  </button>
                  <button
                    onClick={() => {
                      resetAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-rose-300 hover:bg-rose-950/30 rounded-md flex items-center gap-2"
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
