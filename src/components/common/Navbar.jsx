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
    <header className="sticky top-0 z-40 w-full border-b border-battle-border/80 bg-battle-bg/85 backdrop-blur-xl">
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-purple via-brand-pink to-brand-cyan p-[1.5px] shadow-lg shadow-brand-purple/20 group-hover:shadow-brand-cyan/40 transition-all duration-300">
            <div className="w-full h-full bg-battle-bg rounded-[10px] flex items-center justify-center">
              {platformMode === 'party' ? (
                <Gamepad2 className="w-5 h-5 text-brand-cyan group-hover:scale-110 transition-transform duration-300" />
              ) : platformMode === 'battle' ? (
                <Swords className="w-5 h-5 text-brand-orange group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Gavel className="w-5 h-5 text-brand-cyan group-hover:rotate-12 transition-transform duration-300" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-broadcast text-xl sm:text-2xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-brand-cyan bg-clip-text text-transparent">
                BIDBATTLE
              </span>
              <span className="text-[10px] uppercase font-black tracking-widest px-1.5 py-0.5 rounded bg-brand-orange/20 text-brand-orange border border-brand-orange/40 font-mono">
                8.1
              </span>
            </div>
            <p className="text-[11px] text-battle-muted font-medium tracking-tight -mt-1 hidden sm:block">
              {platformMode === 'party'
                ? 'Party Arena • Local Multiplayer'
                : platformMode === 'battle'
                ? 'Battle Arena • Tournament & Clash'
                : 'IPL-Style Auction Arena'}
            </p>
          </div>
        </div>

        {/* Global Platform Mode Switcher: Auction vs Party vs Battle Arena */}
        <div className="flex items-center p-1 rounded-2xl bg-battle-surface border border-battle-border font-broadcast text-xs font-bold shadow-inner">
          <button
            type="button"
            onClick={() => setPlatformMode('auction')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              platformMode === 'auction'
                ? 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-glow-purple font-black'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            <Gavel className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AUCTION</span>
            <span className="sm:hidden">AUCT</span>
            {hasLiveAuction && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('party')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              platformMode === 'party'
                ? 'bg-gradient-to-r from-brand-purple to-brand-cyan text-white shadow-glow-purple font-black'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PARTY</span>
            <span className="sm:hidden">PARTY</span>
          </button>

          <button
            type="button"
            onClick={() => setPlatformMode('battle')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              platformMode === 'battle'
                ? 'bg-gradient-to-r from-brand-orange to-red-600 text-white shadow-glow-orange font-black'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">BATTLE ARENA</span>
            <span className="sm:hidden">BATTLE</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-battle-surface/90 border border-battle-border text-xs font-semibold relative">
          {platformMode === 'party' ? (
            partyNavItems.map((item) => {
              const isActive = partyView === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.onClick || (() => {})}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors z-10 font-broadcast tracking-wide ${
                    isActive ? 'text-white font-bold' : 'text-battle-muted hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.isLive ? 'text-brand-cyan animate-pulse' : ''}`} />
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
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors z-10 font-broadcast tracking-wide ${
                    isActive ? 'text-white font-bold' : 'text-battle-muted hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.isLive ? 'text-red-400 animate-pulse' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-brand-orange/20 text-brand-orange border border-brand-orange/40 font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Right Controls: Sound, Fullscreen, AI Settings */}
        <div className="flex items-center gap-2">
          {platformMode === 'party' && (
            <button
              onClick={() => setShowAISettings(true)}
              title="AI Generation Settings"
              className="p-2 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-brand-cyan hover:border-brand-cyan/50 transition-all flex items-center gap-1 text-xs font-broadcast"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden xl:inline">AI Config</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-red-950/40 border-red-800 text-red-400 hover:bg-red-900/50'
                : 'bg-battle-surface border-battle-border text-battle-muted hover:text-white hover:border-brand-cyan/50 hover:shadow-glow-cyan'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-brand-cyan" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Broadcast Fullscreen'}
            className="p-2 rounded-xl bg-battle-surface border border-battle-border text-battle-muted hover:text-white hover:border-slate-700 transition-all hidden sm:flex"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Host Menu for live tournament in Auction Mode */}
          {platformMode === 'auction' && hasLiveAuction && (
            <div className="relative">
              <button
                onClick={() => setShowExitConfirm(!showExitConfirm)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:text-white transition-all font-broadcast tracking-wide"
              >
                <RotateCcw className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline">Host Controls</span>
                <ChevronDown className="w-3.5 h-3.5 text-battle-muted" />
              </button>

              {showExitConfirm && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl battle-panel border border-battle-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-battle-border text-[11px] font-bold text-battle-muted uppercase tracking-wider">
                    Tournament Admin
                  </div>
                  <button
                    onClick={() => {
                      finishAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-battle-text hover:text-white hover:bg-brand-purple/20 rounded-lg flex items-center gap-2 mt-1"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>Conclude Tournament</span>
                  </button>
                  <button
                    onClick={() => {
                      resetAuction();
                      setShowExitConfirm(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg flex items-center gap-2"
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
