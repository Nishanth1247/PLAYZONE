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
  BookOpen,
  Tv,
  Clock,
  Shield,
  Flame,
  Award
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { usePartyGame } from '../../context/PartyGameContext';
import { GAME_REGISTRY } from '../../services/party/gameRegistry';
import { openGameRules } from '../rules/GameRules';

export const PartyArenaHome = ({ onSwitchToAuction }) => {
  const { openGameLobby } = usePartyGame();

  const dumbCharadesGame = GAME_REGISTRY.find(g => g.id === 'party_dumb_charades');
  const whoAmIGame = GAME_REGISTRY.find(g => g.id === 'party_who_am_i');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#F8F1EB] text-[#342B3B] pb-16">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 space-y-8">
        
        {/* 1. HERO HEADER */}
        <div className="text-center max-w-3xl mx-auto pt-2 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFFFFF] border border-[#E4D6DC] text-xs font-heading font-bold text-[#776B7D] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#D97567]" />
            <span className="text-[#342B3B]">Local Multiplayer Game Night</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E4D6DC]" />
            <span className="text-[#776B7D] font-mono tracking-wider text-[11px]">1 LAPTOP • 2–4 FRANCHISES</span>
          </div>

          <h1 className="font-title text-5xl sm:text-7xl font-black tracking-wider uppercase text-[#342B3B] leading-none">
            PARTY ARENA
          </h1>

          <p className="text-sm sm:text-base text-[#776B7D] max-w-xl mx-auto leading-relaxed">
            The ultimate local pass-and-play party games. Act silently in Dumb Charades with pass-the-laptop secrecy or deduce personas in Who Am I? on a shared screen.
          </p>

          {/* Quick Action Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openGameRules('charades')}
              className="font-heading text-xs flex items-center gap-1.5 bg-[#FFFFFF] border-[#E4D6DC] text-[#342B3B] hover:bg-[#F0E5EC]"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#D97567]" />
              <span>Party Rulebooks</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('bidbattle_open_broadcast', {
                  detail: { arena: 'party', mode: 'live' }
                }));
              }}
              className="font-heading text-xs flex items-center gap-1.5 bg-[#FFFFFF] border-[#E4D6DC] text-[#D97567] hover:bg-[#F0E5EC]"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Spectator Broadcast</span>
            </Button>

            {onSwitchToAuction && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSwitchToAuction}
                className="font-heading text-xs text-[#776B7D] hover:text-[#342B3B] hover:bg-[#F0E5EC] flex items-center gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" />
                <span>AUCTION ARENA →</span>
              </Button>
            )}
          </div>
        </div>

        {/* 2. OFFICIAL TWO GAMES CARDS (PART 7.1) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          
          {/* GAME 1: DUMB CHARADES */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E4D6DC] shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#D97567]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F0E5EC] border border-[#E4D6DC] flex items-center justify-center text-2xl shadow-sm">
                  🎭
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0E5EC] text-[#D97567] font-bold border border-[#E4D6DC]">
                    Pass-the-Screen
                  </span>
                  <Badge variant="outline" className="text-[10px] border-[#E4D6DC] text-[#776B7D]">
                    2–4 Teams
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#342B3B]">
                  Dumb Charades
                </h3>
                <p className="text-xs sm:text-sm text-[#776B7D] leading-relaxed mt-1">
                  Pass the laptop secretly to view your movie prompt. Act silently without speaking or mouthing words while your teammates guess against the countdown clock!
                </p>
              </div>

              {/* Game Feature Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-heading">
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Clock className="w-3.5 h-3.5 text-[#D97567]" />
                  <span>Early Guess Bonus (+1)</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Flame className="w-3.5 h-3.5 text-[#D7AC64]" />
                  <span>Streak Multipliers</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Shield className="w-3.5 h-3.5 text-[#9581B5]" />
                  <span>Pass Screen Privacy</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Award className="w-3.5 h-3.5 text-[#D97567]" />
                  <span>Tamil Cinema Database</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => dumbCharadesGame && openGameLobby(dumbCharadesGame)}
                className="flex-1 bg-[#D97567] hover:bg-[#c46457] text-[#FFFFFF] font-black uppercase tracking-wider text-xs shadow-md shadow-[#D97567]/20"
              >
                <Play className="w-4 h-4 fill-current mr-1" />
                <span>Start Dumb Charades</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => openGameRules('charades')}
                className="border-[#E4D6DC] text-[#776B7D] hover:text-[#342B3B] hover:bg-[#F0E5EC]"
              >
                <span>Rules</span>
              </Button>
            </div>
          </motion.div>

          {/* GAME 2: WHO AM I? */}
          <motion.div
            whileHover={{ y: -4, transition: { duration: 0.15 } }}
            className="rounded-3xl p-6 sm:p-8 bg-[#FFFFFF] border border-[#E4D6DC] shadow-md flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#9581B5]" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#F0E5EC] border border-[#E4D6DC] flex items-center justify-center text-2xl shadow-sm">
                  ❓
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F0E5EC] text-[#9581B5] font-bold border border-[#E4D6DC]">
                    Shared Screen
                  </span>
                  <Badge variant="outline" className="text-[10px] border-[#E4D6DC] text-[#776B7D]">
                    2–4 Teams
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-title text-2xl sm:text-3xl font-black uppercase tracking-wider text-[#342B3B]">
                  Who Am I?
                </h3>
                <p className="text-xs sm:text-sm text-[#776B7D] leading-relaxed mt-1">
                  The guesser looks away while the audience sees the secret persona! Ask Yes/No questions to deduce your identity within 20 questions before the clock expires.
                </p>
              </div>

              {/* Game Feature Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs font-heading">
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <HelpCircle className="w-3.5 h-3.5 text-[#9581B5]" />
                  <span>20 Questions Tracker</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Clock className="w-3.5 h-3.5 text-[#D7AC64]" />
                  <span>Speed Bonus (&le; 10 Qs)</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Shield className="w-3.5 h-3.5 text-[#D97567]" />
                  <span>Guesser Privacy Guard</span>
                </div>
                <div className="p-2 rounded-xl bg-[#F8F1EB] border border-[#E4D6DC] flex items-center gap-2 text-[#342B3B]">
                  <Award className="w-3.5 h-3.5 text-[#9581B5]" />
                  <span>Universal Character Bank</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => whoAmIGame && openGameLobby(whoAmIGame)}
                className="flex-1 bg-[#9581B5] hover:bg-[#836fa3] text-[#FFFFFF] font-black uppercase tracking-wider text-xs shadow-md shadow-[#9581B5]/20"
              >
                <Play className="w-4 h-4 fill-current mr-1" />
                <span>Start Who Am I?</span>
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => openGameRules('whoami')}
                className="border-[#E4D6DC] text-[#776B7D] hover:text-[#342B3B] hover:bg-[#F0E5EC]"
              >
                <span>Rules</span>
              </Button>
            </div>
          </motion.div>

        </div>

      </div>
    </div>
  );
};
