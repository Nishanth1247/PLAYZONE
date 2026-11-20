import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Layers, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  X,
  Tv,
  Eye,
  EyeOff
} from 'lucide-react';

export const BroadcastController = ({
  currentSceneIndex,
  totalScenes,
  sceneTitle,
  isAutoAdvancing,
  onToggleAutoAdvance,
  onPrevScene,
  onNextScene,
  onReplayScene,
  showScoreboard,
  onToggleScoreboard,
  soundEnabled,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onExitBroadcast,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minimized Pill */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="px-4 py-2 rounded-full bg-[#111827]/90 border border-[#D4B879]/50 text-[#D4B879] shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-heading font-black hover:bg-[#192231] transition-all"
        >
          <Tv className="w-4 h-4 animate-pulse" />
          <span>BROADCAST CONTROLS</span>
          <Eye className="w-3.5 h-3.5 text-[#AEB9CC]" />
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 sm:gap-3 px-3.5 sm:px-5 py-2.5 rounded-2xl bg-[#111827]/95 border border-[#39465A] shadow-2xl backdrop-blur-xl text-[#F5F3EE] transition-opacity duration-300 ${
            isHovered ? 'opacity-100 ring-2 ring-[#D4B879]/30' : 'opacity-85 sm:opacity-95'
          }`}
        >
          {/* Live Broadcast Badge & Scene Indicator */}
          <div className="flex items-center gap-2 pr-2 sm:pr-3 border-r border-[#39465A]">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono font-bold text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span className="hidden sm:inline">ON AIR</span>
            </div>
            <div className="text-left hidden md:block">
              <span className="text-[10px] font-mono font-bold text-[#AEB9CC] block leading-none">
                SCENE {currentSceneIndex + 1}/{totalScenes}
              </span>
              <span className="text-xs font-heading font-bold text-[#D4B879] truncate max-w-[150px] block leading-tight">
                {sceneTitle}
              </span>
            </div>
          </div>

          {/* Navigation Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrevScene}
              disabled={currentSceneIndex <= 0}
              title="Previous Scene (Left Arrow ←)"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] disabled:opacity-40 disabled:cursor-not-allowed text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleAutoAdvance}
              title={isAutoAdvancing ? 'Pause Auto-Advance (Space)' : 'Play Auto-Advance (Space)'}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-heading font-black flex items-center gap-1.5 transition-all shadow-md ${
                isAutoAdvancing
                  ? 'bg-amber-400 text-[#0B0F17] hover:bg-amber-300'
                  : 'bg-[#D4B879] text-[#0B0F17] hover:bg-[#c9ad6a]'
              }`}
            >
              {isAutoAdvancing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span className="hidden lg:inline">{isAutoAdvancing ? 'PAUSE' : 'AUTO'}</span>
            </button>

            <button
              onClick={onNextScene}
              disabled={currentSceneIndex >= totalScenes - 1}
              title="Next Scene (Right Arrow →)"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] disabled:opacity-40 disabled:cursor-not-allowed text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-[#39465A] hidden sm:block" />

          {/* Feature Toggles: Scoreboard, Replay, Sound */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleScoreboard}
              title={`Toggle Scoreboard Overlay (Key 'S') - Currently ${showScoreboard ? 'ON' : 'OFF'}`}
              className={`p-2 rounded-xl border text-xs font-heading font-bold flex items-center gap-1.5 transition-all ${
                showScoreboard
                  ? 'bg-[#00D9FF]/20 border-[#00D9FF] text-[#00D9FF]'
                  : 'bg-[#222F43] border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="hidden xl:inline">Ticker</span>
            </button>

            <button
              onClick={onReplayScene}
              title="Replay Current Presentation Scene"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSound}
              title={`Toggle Broadcast Audio (Key 'M') - Currently ${soundEnabled ? 'ON' : 'MUTED'}`}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-[#222F43] border-[#39465A] text-[#00D9FF]'
                  : 'bg-rose-950/40 border-rose-900/60 text-rose-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          {/* Separator */}
          <div className="h-6 w-px bg-[#39465A] hidden sm:block" />

          {/* Right Utilities: Settings, Fullscreen, Minimize, Exit */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenSettings}
              title="Broadcast Settings"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleFullscreen}
              title="Toggle Fullscreen (Key 'F')"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsMinimized(true)}
              title="Minimize Control Bar"
              className="p-2 rounded-xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors hidden sm:flex"
            >
              <EyeOff className="w-4 h-4" />
            </button>

            <button
              onClick={onExitBroadcast}
              title="Exit Broadcast Mode (Esc)"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/40 text-rose-300 hover:text-white transition-all text-xs font-heading font-bold flex items-center gap-1.5"
            >
              <X className="w-4 h-4" />
              <span className="hidden md:inline">EXIT</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
