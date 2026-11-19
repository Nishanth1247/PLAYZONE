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
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#111827] pb-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10 space-y-6">
        
        {/* 1. COMPACT HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto pt-1 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#AEB9CC] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D4B879]" />
            <span className="text-[#F5F3EE]">Party Arena</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39465A]" />
            <span className="text-[#AEB9CC] font-mono tracking-wider text-[11px]">2–4 LOCAL PLAYERS • 1 LAPTOP</span>
          </div>

          <h1 className="font-title text-4xl sm:text-6xl font-black tracking-wider uppercase text-[#F5F3EE] leading-none">
            PARTY ARENA
          </h1>

          <p className="text-xs sm:text-sm text-[#AEB9CC] max-w-xl mx-auto leading-relaxed">
            The ultimate local multiplayer party game night experience. Play high-stakes Dumb Charades with secret prompt passing or deduce identities in Who Am I? on a single shared screen!
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#222F43] border border-[#39465A] text-xs font-mono text-[#AEB9CC]">
              <Upload className="w-3.5 h-3.5 text-[#D4B879]" />
              <span>Universal JSON / CSV / TXT Import</span>
            </div>

            <Button
              variant="champagne"
              size="sm"
              onClick={() => openGameRules('charades')}
              className="font-heading text-xs flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Party Rulebooks</span>
            </Button>

            {onSwitchToAuction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchToAuction}
                className="font-heading text-xs text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#222F43] flex items-center gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>AUCTION ARENA →</span>
              </Button>
            )}
          </div>
        </div>

        {/* 2. OFFICIAL GAMES GRID (BALANCED 2-COLUMN DESKTOP LAYOUT) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {GAME_REGISTRY.map((game) => {
            const isDumbCharades = game.id === 'party_dumb_charades';

            return (
              <motion.div
                key={game.id}
                whileHover={{ y: -3, scale: 1.008 }}
                transition={{ duration: 0.2 }}
                className="bg-[#222F43] rounded-3xl p-5 sm:p-6 border border-[#39465A] hover:border-[#D97858]/60 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-4 relative z-10">
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] shadow-inner">
                        {game.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#AEB9CC]">
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
                        <h2 className="font-heading text-xl sm:text-2xl font-black text-[#F5F3EE] tracking-wide">
                          {game.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-[11px] font-mono font-bold text-[#AEB9CC] self-start sm:self-auto">
                      <Users className="w-3 h-3 text-[#D4B879]" />
                      <span>2–4 Franchises</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
                    {game.shortDesc}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5">
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
                <div className="pt-4 mt-5 border-t border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
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
                      size="sm"
                      onClick={() => openGameRules(isDumbCharades ? 'charades' : 'whoami')}
                      className="font-heading text-xs flex items-center gap-1.5 border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Rules</span>
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openGameLobby(game.id)}
                      className="font-heading text-xs font-black flex items-center justify-center gap-2 group-hover:scale-102 transition-transform flex-1 sm:flex-initial px-5 py-2 shadow-md"
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

        {/* 3. COMPACT FOUR FIXED PLAYERS SHOWCASE FOOTER */}
        <div className="bg-[#222F43] rounded-2xl p-4 border border-[#39465A] text-center space-y-3 max-w-6xl mx-auto shadow-md">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#AEB9CC]">
            The Fixed Four Squad (Single Shared Screen)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-4xl mx-auto">
            {[
              { name: 'Nishanth', color: '#8875A8', avatar: '👑', title: 'The Mastermind' },
              { name: 'Ajmal', color: '#71999B', avatar: '⚡', title: 'The Speedster' },
              { name: 'Praneeth', color: '#B68B68', avatar: '🔥', title: 'The Strategist' },
              { name: 'Nagulan', color: '#84977B', avatar: '🛡️', title: 'The Enforcer' },
            ].map((p) => (
              <div
                key={p.name}
                className="p-2.5 rounded-xl bg-[#111827] border border-[#39465A] flex items-center gap-2.5 text-left"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base font-bold text-[#F5F3EE] shadow"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="font-heading font-bold text-xs text-[#F5F3EE] truncate">{p.name}</h4>
                  <span className="text-[9px] font-mono text-[#AEB9CC] block truncate">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
