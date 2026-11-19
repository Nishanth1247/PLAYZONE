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
  Upload
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import { GAME_REGISTRY } from '../../services/party/gameRegistry';

export const PartyArenaHome = ({ onSwitchToAuction }) => {
  const { openGameLobby } = usePartyGame();

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-grid-pattern pb-16">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[350px] bg-brand-purple/15 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[450px] h-[300px] bg-brand-cyan/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[320px] bg-brand-orange/15 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-10">
        
        {/* 1. CINEMATIC HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto pt-4 space-y-4">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-battle-surface/90 border border-brand-purple/40 text-xs font-bold text-brand-purple shadow-glow-purple">
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-battle-text">BIDBATTLE 8.0 • Party Arena</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon" />
            <span className="text-brand-neon font-black tracking-wider">2–4 LOCAL PLAYERS • 1 LAPTOP</span>
          </div>

          <h1 className="font-broadcast text-5xl sm:text-7xl font-black tracking-wider uppercase text-white leading-none">
            PARTY <span className="neon-text-purple">ARENA</span>
          </h1>

          <p className="text-sm sm:text-base text-battle-muted max-w-2xl mx-auto leading-relaxed">
            The ultimate local multiplayer party game night experience. Play high-stakes Dumb Charades with secret prompt passing or deduce identities in Who Am I? on a single shared screen!
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-battle-bg border border-battle-border text-xs font-mono text-battle-muted">
              <Upload className="w-3.5 h-3.5 text-brand-neon" />
              <span>Universal JSON / CSV / TXT Import</span>
            </div>

            {onSwitchToAuction && (
              <Button
                variant="ghost"
                size="md"
                onClick={onSwitchToAuction}
                className="font-broadcast text-xs text-brand-orange hover:bg-brand-orange/10 flex items-center gap-2"
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
                className="battle-panel rounded-3xl p-6 sm:p-8 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-2xl"
                style={{
                  borderColor: `${game.accentColor}50`,
                }}
              >
                {/* Glow highlight */}
                <div
                  className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-25 group-hover:opacity-45 transition-opacity pointer-events-none"
                  style={{ backgroundColor: game.accentColor }}
                />

                <div className="space-y-5 relative z-10">
                  {/* Card Top Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <span className="text-4xl p-3.5 rounded-2xl bg-battle-bg border border-battle-border shadow-inner">
                        {game.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-mono font-black tracking-wider uppercase"
                            style={{ color: game.accentColor }}
                          >
                            Official Party Game
                          </span>
                          <span className="text-battle-muted text-xs">•</span>
                          <Badge 
                            variant={isDumbCharades ? 'purple' : 'cyan'} 
                            className="text-[10px] px-2 py-0"
                          >
                            {game.badge}
                          </Badge>
                        </div>
                        <h2 className="font-broadcast text-2xl sm:text-3xl font-black text-white tracking-wide">
                          {game.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-battle-bg border border-battle-border text-[11px] font-mono font-bold text-battle-muted">
                        <Users className="w-3 h-3 text-brand-cyan" />
                        <span>2–4 Franchises</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-battle-muted leading-relaxed min-h-[48px]">
                    {game.shortDesc}
                  </p>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {game.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-xl bg-battle-bg border border-battle-border text-[11px] font-mono text-battle-text"
                      >
                        {tag}
                      </span>
                    ))}
                    <span 
                      className="px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold"
                      style={{
                        backgroundColor: `${game.accentColor}15`,
                        borderColor: `${game.accentColor}40`,
                        color: game.accentColor,
                      }}
                    >
                      Universal Content Import
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-5 mt-6 border-t border-battle-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                  <span className="text-[11px] font-mono text-battle-muted flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-neon" />
                    <span>
                      {isDumbCharades
                        ? 'Pass-the-Laptop Privacy Screen'
                        : 'Shared-Screen Guesser Setup'}
                    </span>
                  </span>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => openGameLobby(game.id)}
                    className="font-broadcast text-xs font-black shadow-glow flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: game.accentColor,
                      borderColor: game.accentColor,
                      color: '#080A12',
                    }}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>PLAY {game.title.toUpperCase()}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. FOUR FIXED PLAYERS SHOWCASE FOOTER */}
        <div className="battle-panel rounded-3xl p-6 border border-battle-border text-center space-y-4 max-w-6xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-battle-muted">
            The Fixed Four Squad (Single Shared Screen)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { name: 'Nishanth', color: '#9147FF', avatar: '👑', title: 'The Mastermind' },
              { name: 'Ajmal', color: '#00D9FF', avatar: '⚡', title: 'The Speedster' },
              { name: 'Praneeth', color: '#FF8A35', avatar: '🔥', title: 'The Strategist' },
              { name: 'Nagulan', color: '#B7F34A', avatar: '🛡️', title: 'The Enforcer' },
            ].map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-2xl bg-battle-bg border border-battle-border flex items-center gap-3 text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow"
                  style={{ backgroundColor: p.color }}
                >
                  {p.avatar}
                </div>
                <div>
                  <h4 className="font-broadcast font-bold text-sm text-white">{p.name}</h4>
                  <span className="text-[10px] font-mono text-battle-muted block">{p.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
