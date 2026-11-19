import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Gamepad2, 
  Sparkles, 
  Play, 
  Users, 
  ArrowRight, 
  Gavel, 
  CheckCircle2, 
  Cpu 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import { GAME_REGISTRY } from '../../services/party/gameRegistry';
import { AISettingsModal } from './AISettingsModal';
import { isAIConfigured } from '../../services/party/aiContentService';

export const PartyArenaHome = ({ onSwitchToAuction }) => {
  const { openGameLobby } = usePartyGame();
  const [showAISettings, setShowAISettings] = useState(false);

  const aiActive = isAIConfigured();

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
            <span className="text-battle-text">BIDBATTLE 7.9 • Party Arena</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon" />
            <span className="text-brand-neon font-black tracking-wider">2–4 LOCAL PLAYERS • 1 LAPTOP</span>
          </div>

          <h1 className="font-broadcast text-5xl sm:text-7xl font-black tracking-wider uppercase text-white leading-none">
            PARTY <span className="neon-text-purple">ARENA</span>
          </h1>

          <p className="text-sm sm:text-base text-battle-muted max-w-2xl mx-auto leading-relaxed">
            The ultimate silent acting party showdown for game night. Pass the laptop secretly to view your movie prompt, act silently without speaking or lip-syncing, and crown the party champion!
          </p>

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setShowAISettings(true)}
              className="font-broadcast text-xs border-battle-border hover:border-brand-purple text-battle-muted hover:text-white flex items-center gap-2"
            >
              <Cpu className="w-4 h-4 text-brand-purple" />
              <span>AI CONTENT ENGINE</span>
              {aiActive && <span className="w-2 h-2 rounded-full bg-brand-neon" />}
            </Button>

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

        {/* 2. DUMB CHARADES OFFICIAL GAME CARD */}
        <div className="max-w-4xl mx-auto pt-2">
          {GAME_REGISTRY.map((game) => (
            <motion.div
              key={game.id}
              whileHover={{ y: -4, scale: 1.005 }}
              transition={{ duration: 0.2 }}
              className="battle-panel rounded-3xl p-6 sm:p-10 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between group shadow-2xl"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl p-4 rounded-2xl bg-battle-bg border border-battle-border shadow-inner">
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
                        <Badge variant="purple" className="text-[10px] px-2 py-0">
                          {game.badge}
                        </Badge>
                      </div>
                      <h2 className="font-broadcast text-3xl sm:text-4xl font-black text-white tracking-wide">
                        {game.title}
                      </h2>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-battle-muted">
                      <Users className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>2–4 Franchises</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-battle-bg border border-battle-border text-xs font-mono font-bold text-brand-neon">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Importable Prompts</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm sm:text-base text-battle-muted leading-relaxed">
                  {game.shortDesc}
                </p>

                {/* Feature Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {game.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-xl bg-battle-bg border border-battle-border text-xs font-mono text-battle-text"
                    >
                      {tag}
                    </span>
                  ))}
                  <span className="px-3 py-1 rounded-xl bg-brand-purple/10 border border-brand-purple/30 text-xs font-mono text-brand-purple font-bold">
                    Custom JSON / CSV / TXT
                  </span>
                  <span className="px-3 py-1 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-mono text-brand-cyan font-bold">
                    Create with ChatGPT
                  </span>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="pt-6 mt-8 border-t border-battle-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <span className="text-xs font-mono text-battle-muted flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-neon" />
                  <span>Pass-the-Laptop Privacy Screen & Anti-Cheat Guards</span>
                </span>

                <Button
                  variant="primary"
                  size="xl"
                  onClick={() => openGameLobby(game.id)}
                  className="font-broadcast text-sm font-black shadow-glow-purple flex items-center justify-center gap-2 group-hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: game.accentColor,
                    borderColor: game.accentColor,
                    color: '#080A12',
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>PLAY DUMB CHARADES</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 3. FOUR FIXED PLAYERS SHOWCASE FOOTER */}
        <div className="battle-panel rounded-3xl p-6 border border-battle-border text-center space-y-4">
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

      {/* AI Settings Modal */}
      {showAISettings && (
        <AISettingsModal
          isOpen={showAISettings}
          onClose={() => setShowAISettings(false)}
        />
      )}
    </div>
  );
};
