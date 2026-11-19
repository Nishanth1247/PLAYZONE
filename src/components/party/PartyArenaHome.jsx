import React from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Sparkles, 
  Play, 
  Users, 
  ArrowRight, 
  Gavel, 
  CheckCircle2, 
  HelpCircle,
  Film,
  Upload,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import { GAME_REGISTRY } from '../../services/party/gameRegistry';
import { openGameRules } from '../rules/GameRules';

export const PartyArenaHome = ({ onSwitchToAuction }) => {
  const { openGameLobby } = usePartyGame();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#111827] pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10">
        
        {/* 1. MIDNIGHT NAVY & SLATE HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#AEB9CC] shadow-sm">
            <Sparkles className="w-4 h-4 text-[#D4B879]" />
            <span className="text-[#F5F3EE]">Party Arena</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39465A]" />
            <span className="text-[#AEB9CC] font-mono tracking-wider">2–4 LOCAL PLAYERS • 1 LAPTOP</span>
          </div>

          <h1 className="font-title text-5xl sm:text-7xl font-black tracking-wider uppercase text-[#F5F3EE] leading-none">
            PARTY ARENA
          </h1>

          <p className="text-sm sm:text-base text-[#AEB9CC] max-w-2xl mx-auto leading-relaxed">
            The ultimate local multiplayer party game night experience. Play high-stakes Dumb Charades with secret prompt passing or deduce identities in Who Am I? on a single shared screen!
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-mono text-[#AEB9CC]">
              <Upload className="w-3.5 h-3.5 text-[#D4B879]" />
              <span>Universal JSON / CSV / TXT Import</span>
            </div>

            <Button
              variant="champagne"
              size="md"
              onClick={() => openGameRules('charades')}
              className="font-heading text-xs flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Party Rulebooks</span>
            </Button>

            {onSwitchToAuction && (
              <Button
                variant="ghost"
                size="md"
                onClick={onSwitchToAuction}
                className="font-heading text-xs text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#222F43] flex items-center gap-2"
              >
                <Gavel className="w-4 h-4" />
                <span>AUCTION ARENA →</span>
              </Button>
            )}
          </div>
        </div>

        {/* 2. OFFICIAL GAMES GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto pt-2">
          {GAME_REGISTRY.map((game) => {
            const isDumbCharades = game.id === 'party_dumb_charades';

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] hover:border-[#D97858]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-5 relative z-10">
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="text-4xl p-3.5 rounded-2xl bg-[#2C394C] border border-[#39465A] shadow-inner">
                        {game.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#AEB9CC]">
                            Official Party Game
                          </span>
                          <span className="text-[#39465A] text-xs">•</span>
                          <Badge 
                            variant="subtle" 
                            className="text-[10px] px-2 py-0 bg-[#2C394C] text-[#D4B879] border border-[#39465A]"
                          >
                            {game.badge}
                          </Badge>
                        </div>
                        <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#F5F3EE] tracking-wide">
                          {game.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-[11px] font-mono font-bold text-[#AEB9CC]">
                        <Users className="w-3 h-3 text-[#D4B879]" />
                        <span>2–4 Franchises</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed min-h-[48px]">
                    {game.shortDesc}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-xl bg-[#2C394C] border border-[#39465A] text-[11px] font-mono text-[#AEB9CC]"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-xl border border-[#39465A] bg-[#111827] text-[11px] font-mono font-bold text-[#91A98B]">
                      Universal Content Import
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-6 border-t border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <span className="text-[11px] font-mono text-[#AEB9CC] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#91A98B]" />
                    <span>
                      {isDumbCharades
                        ? 'Pass-the-Laptop Privacy Screen'
                        : 'Shared-Screen Guesser Setup'}
                    </span>
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => openGameRules(isDumbCharades ? 'charades' : 'whoami')}
                      className="font-heading text-xs flex items-center gap-1.5 border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Rules</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => openGameLobby(game.id)}
                      className="font-heading text-xs font-black flex items-center justify-center gap-2 group-hover:scale-105 transition-transform flex-1 sm:flex-initial"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>PLAY {game.title.toUpperCase()}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. FOUR FIXED PLAYERS SHOWCASE FOOTER */}
        <div className="bg-[#222F43] rounded-3xl p-6 border border-[#39465A] text-center space-y-4 max-w-6xl mx-auto shadow-lg">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#AEB9CC]">
            The Fixed Four Squad (Single Shared Screen)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Nishanth', color: '#8875A8', avatar: '👑', title: 'The Mastermind' },
              { name: 'Ajmal', color: '#71999B', avatar: '⚡', title: 'The Speedster' },
              { name: 'Praneeth', color: '#B68B68', avatar: '🔥', title: 'The Strategist' },
              { name: 'Nagulan', color: '#84977B', avatar: '🛡️', title: 'The Enforcer' },
            ].map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center gap-3 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-[#F5F3EE] shadow"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar}
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#F5F3EE]">{p.name}</h4>
                  <span className="text-[10px] font-mono text-[#AEB9CC] block">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
