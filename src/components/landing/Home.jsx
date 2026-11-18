import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { storageService } from '../../services/storageService';
import { AUCTION_PRESETS } from '../../services/presets';
import { toast } from 'sonner';
import { 
  Gavel, 
  Play, 
  PlusCircle, 
  Upload, 
  HelpCircle, 
  Trophy, 
  Users, 
  Sparkles, 
  History, 
  Flame, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Coins, 
  Radio, 
  FileJson, 
  Trash2, 
  Download, 
  Zap, 
  Target, 
  Clock, 
  Layers, 
  ChevronRight,
  Edit,
  Copy,
  Calendar,
  AlertTriangle,
  FolderDown,
  FileCode2,
  Sliders
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { formatCurrency } from '../common/CurrencyDisplay';
import { TournamentLaunchModal } from './TournamentLaunchModal';
import { ImportTournamentModal } from '../custom/ImportTournamentModal';
import { TournamentEditorModal } from '../custom/TournamentEditorModal';

export const Home = ({ onSwitchToParty }) => {
  const { 
    setActivePage, 
    auction, 
    loadPresetAuction, 
    setAuction,
    customTournaments,
    refreshCustomTournaments,
    launchCustomTournamentPlayNow,
    saveAndLaunchCustomTournament
  } = useAuction();

  const [stats, setStats] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPresetForLaunch, setSelectedPresetForLaunch] = useState(null);

  // Custom Tournament Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [editorState, setEditorState] = useState({
    isOpen: false,
    tournament: null,
    mode: 'edit_only', // 'edit_only' | 'edit_and_play'
  });
  const [deletingTournament, setDeletingTournament] = useState(null);

  useEffect(() => {
    setStats(storageService.getGlobalStats());
    setHistoryList(storageService.getAuctionHistory());
  }, []);

  const handleOpenImport = () => {
    setShowImportModal(true);
  };

  const handleCreateCustom = () => {
    setEditorState({
      isOpen: true,
      tournament: null,
      mode: 'edit_only',
    });
  };

  const handleEditOnly = (tourney) => {
    setEditorState({
      isOpen: true,
      tournament: tourney,
      mode: 'edit_only',
    });
  };

  const handleEditAndPlay = (tourney) => {
    setEditorState({
      isOpen: true,
      tournament: tourney,
      mode: 'edit_and_play',
    });
  };

  const handleDuplicate = (id) => {
    const duplicated = storageService.duplicateCustomTournament(id);
    if (duplicated) {
      refreshCustomTournaments();
      toast.success(`Duplicated "${duplicated.name}"!`);
    }
  };

  const handleExport = (tourney) => {
    storageService.exportCustomTournament(tourney);
    toast.success(`Exported "${tourney.name}.json"!`);
  };

  const handleDeleteConfirm = () => {
    if (!deletingTournament) return;
    storageService.deleteCustomTournament(deletingTournament.id);
    refreshCustomTournaments();
    toast.success(`Deleted tournament "${deletingTournament.name}"`);
    setDeletingTournament(null);
  };

  const handleDownloadSample = () => {
    storageService.downloadSampleTemplate();
    toast.success('Downloaded sample tournament template!');
  };

  const handleExportAllBackup = () => {
    storageService.exportAllCustomTournaments();
    toast.success('Exported all custom tournaments backup!');
  };

  const hasActiveAuction = auction && auction.items && auction.items.length > 0;
  const currentPendingCount = auction?.items?.filter(i => i.status === 'pending').length || 0;
  const currentSoldCount = auction?.items?.filter(i => i.status === 'sold').length || 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-grid-pattern">
      {/* Dynamic atmospheric backlights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-brand-purple/20 blur-[150px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[420px] h-[320px] bg-brand-cyan/20 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-2/3 right-1/4 w-[500px] h-[350px] bg-brand-orange/15 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* 1. CINEMATIC HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-battle-surface/90 border border-brand-purple/40 text-xs font-bold text-brand-purple mb-6 shadow-glow-purple"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span className="text-battle-text">IPL-Style Real-time Local Multiplayer</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon" />
            <span className="text-brand-neon font-black tracking-wider">100% OFFLINE</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-broadcast text-6xl sm:text-8xl font-black tracking-wider uppercase text-white leading-none mb-5"
          >
            THE ULTIMATE <br />
            <span className="bg-gradient-to-r from-brand-cyan via-purple-300 to-brand-orange bg-clip-text text-transparent drop-shadow-sm">
              AUCTION SHOWDOWN
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-xl text-battle-muted font-normal max-w-2xl mx-auto leading-relaxed mb-10"
          >
            Gather your friends around one laptop. Manage franchise purses, outbid your rivals, slam the gavel, and recruit the ultimate dream roster in live esports broadcast style!
          </motion.p>

          {/* Primary Action Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            {hasActiveAuction && (
              <Button
                variant="danger"
                size="xl"
                onClick={() => setActivePage('live')}
                className="shadow-xl shadow-red-600/30 group"
              >
                <Radio className="w-5 h-5 text-white animate-pulse" />
                <span>Resume Live Arena</span>
                <span className="text-xs bg-black/40 px-2.5 py-0.5 rounded-full font-mono">
                  {currentSoldCount}/{auction.items.length} Done
                </span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}

            <Button
              variant="primary"
              size="xl"
              onClick={handleOpenImport}
              className="shadow-xl shadow-brand-purple/25"
            >
              <Upload className="w-5 h-5" />
              <span>Import Tournament</span>
              <Sparkles className="w-4 h-4 text-brand-cyan" />
            </Button>

            <Button
              variant="secondary"
              size="xl"
              onClick={handleCreateCustom}
            >
              <PlusCircle className="w-5 h-5 text-brand-neon" />
              <span>Create Custom</span>
            </Button>

            {onSwitchToParty && (
              <Button
                variant="secondary"
                size="xl"
                onClick={onSwitchToParty}
                className="border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10 shadow-glow-cyan"
              >
                <Zap className="w-5 h-5 text-brand-cyan" />
                <span>Party Arena</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="xl"
              onClick={() => setShowHowToPlay(true)}
              className="text-battle-text hover:text-white"
            >
              <HelpCircle className="w-5 h-5 text-brand-cyan" />
              <span>How To Play</span>
            </Button>
          </motion.div>
        </div>

        {/* 2. MY CUSTOM TOURNAMENTS SECTION */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-cyan" />
                <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wider">
                  My Custom Tournaments ({customTournaments.length})
                </h2>
                <Badge variant="purple" className="text-[10px]">
                  Bespoke Presets
                </Badge>
              </div>
              <p className="text-xs text-battle-muted mt-0.5">
                Saved offline tournaments, imported JSON rosters, and custom team budgets
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenImport}
                className="font-broadcast text-xs shadow-glow-purple"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>+ Import Tournament</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateCustom}
                className="font-broadcast text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-brand-neon" />
                <span>+ Create Tournament</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="font-broadcast text-xs border-battle-border text-battle-muted hover:text-white"
                title="Download Sample JSON Template"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-brand-cyan" />
                <span>Template</span>
              </Button>

              {customTournaments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAllBackup}
                  className="font-broadcast text-xs border-battle-border text-battle-muted hover:text-white"
                  title="Export All Custom Tournaments as JSON"
                >
                  <FolderDown className="w-3.5 h-3.5 mr-1 text-amber-400" />
                  <span>Backup All</span>
                </Button>
              )}
            </div>
          </div>

          {/* Custom Tournaments Content: Empty State vs Cards Grid */}
          {customTournaments.length === 0 ? (
            <div className="rounded-3xl battle-panel p-8 sm:p-12 border-2 border-dashed border-battle-border text-center flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-brand-purple/10 border border-brand-purple/30 text-brand-purple flex items-center justify-center mb-4">
                <FileCode2 className="w-8 h-8 text-brand-cyan" />
              </div>
              <h3 className="font-broadcast text-xl font-bold text-white mb-2 uppercase tracking-wide">
                No Custom Tournaments Yet
              </h3>
              <p className="text-xs text-battle-muted max-w-md leading-relaxed mb-6">
                Import any JSON tournament schema, or create your own custom roster with bespoke ratings, starting prices, and franchise purses.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenImport}
                  className="shadow-glow-purple"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Import Tournament JSON</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateCustom}
                >
                  <PlusCircle className="w-4 h-4 mr-2 text-brand-neon" />
                  <span>Create from Scratch</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSample}
                  className="text-xs text-battle-muted border-battle-border"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5 text-brand-cyan" />
                  <span>Get Sample Template</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customTournaments.map((tourney, idx) => {
                const totalLots = tourney.items?.length || tourney.entries?.length || 0;
                const defaultPurse = tourney.teamBudgets?.defaultPurse || 100;
                const sym = tourney.currency?.symbol || '₹';
                const unit = tourney.currency?.unit || 'Cr';

                return (
                  <motion.div
                    key={tourney.id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="rounded-3xl battle-panel p-6 border border-brand-purple/40 hover:border-brand-cyan/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                  >
                    {/* Top ambient glow */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-15 pointer-events-none bg-brand-purple group-hover:opacity-30 transition-opacity" />

                    <div>
                      {/* Top Badges & Date */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="purple" className="text-[10px] uppercase font-bold tracking-wider">
                            Custom
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-battle-border text-battle-muted">
                            {tourney.category || 'General'}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-battle-muted">
                          {new Date(tourney.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-broadcast text-2xl font-bold text-white mb-1.5 group-hover:text-brand-cyan transition-colors">
                        {tourney.name}
                      </h3>
                      <p className="text-xs text-battle-muted mb-4 line-clamp-2 leading-relaxed">
                        {tourney.description || 'Custom tournament ready for live auction showdown.'}
                      </p>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-2xl bg-battle-surface/80 border border-battle-border text-xs mb-4 font-broadcast">
                        <div>
                          <span className="text-battle-muted block text-[9px]">TOTAL LOTS</span>
                          <span className="font-black text-brand-neon text-sm">
                            {totalLots} Lots
                          </span>
                        </div>
                        <div>
                          <span className="text-battle-muted block text-[9px]">METRIC</span>
                          <span className="font-black text-brand-cyan text-sm truncate block" title={tourney.scoreLabel}>
                            {tourney.scoreLabel || 'Points'}
                          </span>
                        </div>
                        <div>
                          <span className="text-battle-muted block text-[9px]">START PURSE</span>
                          <span className="font-black text-amber-400 text-sm">
                            {sym}{defaultPurse} {unit}
                          </span>
                        </div>
                      </div>

                      {/* 4 Fixed Contending Franchises */}
                      <div className="mb-5 p-2 rounded-xl bg-battle-surface/50 border border-battle-border/60">
                        <div className="flex items-center justify-between text-[9px] uppercase font-bold text-battle-muted tracking-wider mb-1.5 font-broadcast">
                          <span>4 Contenders:</span>
                          <span className="text-brand-purple font-mono font-bold">4 Franchises Active</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-center">
                          <span className="text-[10px] font-bold text-white bg-black/40 py-1 rounded">👑 Nishanth</span>
                          <span className="text-[10px] font-bold text-white bg-black/40 py-1 rounded">⚡ Ajmal</span>
                          <span className="text-[10px] font-bold text-white bg-black/40 py-1 rounded">🔥 Praneeth</span>
                          <span className="text-[10px] font-bold text-white bg-black/40 py-1 rounded">🛡️ Nagulan</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="space-y-2 pt-2 border-t border-battle-border/60">
                      {/* Primary Actions Row: Play Now & Edit & Play */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => {
                            launchCustomTournamentPlayNow(tourney);
                            toast.success(`Launched ${tourney.name}! Starting Lot #1...`);
                          }}
                          className="w-full font-broadcast text-xs shadow-glow-purple group/btn"
                        >
                          <Play className="w-3.5 h-3.5 mr-1 fill-current group-hover/btn:scale-110 transition-transform" />
                          <span>PLAY NOW</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => handleEditAndPlay(tourney)}
                          className="w-full font-broadcast text-xs"
                        >
                          <Sliders className="w-3.5 h-3.5 mr-1 text-brand-cyan" />
                          <span>EDIT & PLAY</span>
                        </Button>
                      </div>

                      {/* Secondary Utility Actions */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOnly(tourney)}
                          className="text-[11px] h-7 px-2 text-battle-muted hover:text-white"
                        >
                          <Edit className="w-3 h-3 mr-1 text-brand-purple" />
                          <span>Edit Details</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicate(tourney.id)}
                            title="Duplicate Tournament"
                            className="p-1.5 rounded-lg bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-brand-cyan" />
                          </button>

                          <button
                            onClick={() => handleExport(tourney)}
                            title="Export JSON (schemaVersion: 1)"
                            className="p-1.5 rounded-lg bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          <button
                            onClick={() => setDeletingTournament(tourney)}
                            title="Delete Custom Tournament"
                            className="p-1.5 rounded-lg bg-battle-surface hover:bg-rose-950/40 border border-battle-border text-battle-muted hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. INSTANT PLAY PRESET SECTION */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-brand-orange" />
                <h2 className="text-2xl font-black text-white font-broadcast uppercase tracking-wider">
                  Instant Play Tournaments ({AUCTION_PRESETS.length})
                </h2>
              </div>
              <p className="text-xs text-battle-muted">Jump straight into high-stakes bidding with curated superstars and movies</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenImport}
                className="cursor-pointer text-xs font-bold px-3.5 py-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:text-white transition-all flex items-center gap-2 font-broadcast tracking-wide"
              >
                <Upload className="w-3.5 h-3.5 text-brand-purple" />
                <span>Import JSON</span>
              </button>

              {historyList.length > 0 && (
                <button
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-text hover:text-white transition-all flex items-center gap-2 font-broadcast tracking-wide"
                >
                  <History className="w-3.5 h-3.5 text-brand-cyan" />
                  <span>Past Tournaments ({historyList.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-broadcast font-bold tracking-wider uppercase transition-all ${
                selectedFilter === 'all'
                  ? 'bg-brand-purple text-white shadow-glow-purple'
                  : 'bg-battle-surface text-battle-muted hover:text-white border border-battle-border'
              }`}
            >
              All Tournaments (6)
            </button>
            <button
              onClick={() => setSelectedFilter('tamil')}
              className={`px-4 py-1.5 rounded-full text-xs font-broadcast font-bold tracking-wider uppercase transition-all ${
                selectedFilter === 'tamil'
                  ? 'bg-amber-500 text-black font-black shadow-glow-orange'
                  : 'bg-battle-surface text-battle-muted hover:text-white border border-battle-border'
              }`}
            >
              Tamil Cinema Specials (3)
            </button>
            <button
              onClick={() => setSelectedFilter('multiverse')}
              className={`px-4 py-1.5 rounded-full text-xs font-broadcast font-bold tracking-wider uppercase transition-all ${
                selectedFilter === 'multiverse'
                  ? 'bg-brand-cyan text-black font-black shadow-glow-cyan'
                  : 'bg-battle-surface text-battle-muted hover:text-white border border-battle-border'
              }`}
            >
              Heroes & Multiverse (3)
            </button>
          </div>

          {/* 6 Tournament Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUCTION_PRESETS.filter((preset) => {
              if (selectedFilter === 'tamil') {
                return ['tamil-queen-auction', 'tamil-legends-auction', 'tamil-movie-imdb-auction'].includes(preset.id);
              }
              if (selectedFilter === 'multiverse') {
                return ['tamil-hero-auction', 'mcu-superhero-auction', 'pan-india-hero-auction'].includes(preset.id);
              }
              return true;
            }).map((preset, index) => {
              const presetEmojis = {
                'tamil-hero-auction': '🎬',
                'mcu-superhero-auction': '⚡',
                'pan-india-hero-auction': '🌟',
                'tamil-queen-auction': '👑',
                'tamil-legends-auction': '🔥',
                'tamil-movie-imdb-auction': '🍿',
              };

              const badgeVariants = {
                'tamil-hero-auction': 'gold',
                'mcu-superhero-auction': 'cyan',
                'pan-india-hero-auction': 'orange',
                'tamil-queen-auction': 'purple',
                'tamil-legends-auction': 'danger',
                'tamil-movie-imdb-auction': 'gold',
              };

              const primaryColor = preset.theme?.primary || '#9147FF';

              return (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  style={{
                    borderColor: 'var(--border-color, #232A44)',
                  }}
                  className="rounded-3xl battle-panel p-6 border border-battle-border hover:border-brand-cyan/70 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Subtle corner glow accent matching preset theme */}
                  <div 
                    className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  />

                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl p-2.5 rounded-2xl bg-battle-surface border border-battle-border shadow-inner">
                        {presetEmojis[preset.id] || '⭐'}
                      </span>
                      <div className="text-right">
                        <Badge variant={badgeVariants[preset.id] || 'purple'}>
                          {preset.category}
                        </Badge>
                        {preset.scoreMetric === 'imdb' ? (
                          <span className="block text-[10px] text-amber-400 font-bold mt-1 font-broadcast">
                            ★ IMDb 1–10 (Norm. 100)
                          </span>
                        ) : (
                          <span className="block text-[10px] text-battle-muted font-bold mt-1 font-broadcast">
                            ★ {preset.scoreLabel} (1-100)
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-broadcast text-2xl font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-battle-muted mb-5 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>

                    {/* 4 Fixed Teams Strip */}
                    <div className="mb-5 p-2.5 rounded-2xl bg-battle-surface/80 border border-battle-border/80">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-battle-muted tracking-wider mb-2 font-broadcast">
                        <span>4 Contending Franchises:</span>
                        <span className="text-brand-neon">Equal ₹100 Cr Purse</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {preset.teams.map((t) => (
                          <div
                            key={t.id}
                            title={t.name}
                            className="p-1.5 rounded-xl bg-battle-card border border-battle-border flex flex-col items-center justify-center text-center"
                          >
                            <span className="text-base">{t.logo}</span>
                            <span className="text-[10px] font-broadcast font-bold text-white truncate max-w-full">
                              {t.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 py-3 px-3.5 rounded-2xl bg-battle-surface/80 border border-battle-border text-xs mb-6 font-broadcast">
                      <div>
                        <span className="text-battle-muted block text-[10px]">ROSTER</span>
                        <span className="font-black text-white text-sm">
                          {preset.items.length} {preset.category === 'Movies' ? 'Films' : 'Stars'}
                        </span>
                      </div>
                      <div>
                        <span className="text-battle-muted block text-[10px]">METRIC</span>
                        <span className="font-black text-brand-cyan text-sm truncate block">
                          {preset.scoreMetric === 'imdb' ? 'IMDb Score' : preset.scoreLabel.split(' ')[0]}
                        </span>
                      </div>
                      <div>
                        <span className="text-battle-muted block text-[10px]">START PURSE</span>
                        <span className="font-black text-amber-400 text-sm">
                          {preset.currency.symbol}{preset.teams[0].purse} Cr
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => {
                      setSelectedPresetForLaunch(preset);
                    }}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Configure & Launch
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 3. LOCAL HALL OF FAME STATS */}
        {stats && (
          <div className="mb-16 rounded-3xl battle-panel p-8 border border-battle-border relative overflow-hidden">
            <div className="flex items-center gap-2.5 mb-6">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-battle-muted font-broadcast">
                Local Record Hall of Fame
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-battle-surface/80 border border-battle-border">
                <span className="text-3xl sm:text-4xl font-black text-white font-broadcast">
                  {stats.totalAuctionsStarted}
                </span>
                <p className="text-xs text-battle-muted mt-1 font-semibold uppercase tracking-wider">Auctions Run</p>
              </div>

              <div className="p-5 rounded-2xl bg-battle-surface/80 border border-battle-border">
                <span className="text-3xl sm:text-4xl font-black text-brand-cyan font-broadcast">
                  {stats.totalItemsSold}
                </span>
                <p className="text-xs text-battle-muted mt-1 font-semibold uppercase tracking-wider">Superstars Sold</p>
              </div>

              <div className="p-5 rounded-2xl bg-battle-surface/80 border border-battle-border">
                <span className="text-3xl sm:text-4xl font-black text-brand-purple font-broadcast">
                  {stats.totalTeamsCreated}
                </span>
                <p className="text-xs text-battle-muted mt-1 font-semibold uppercase tracking-wider">Teams Battled</p>
              </div>

              <div className="p-5 rounded-2xl bg-battle-surface/80 border border-battle-border">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-broadcast truncate block">
                  {stats.highestSaleAmount > 0 
                    ? `${stats.highestSaleCurrency} ${stats.highestSaleAmount}` 
                    : '—'}
                </span>
                <p className="text-xs text-battle-muted mt-1 font-semibold uppercase tracking-wider truncate">
                  Record High: {stats.highestSalePlayer || 'None yet'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. HOW IT WORKS 3-TIER FEATURE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-3xl battle-panel border border-battle-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 text-brand-cyan flex items-center justify-center mb-4 shadow-glow-cyan">
              <Radio className="w-6 h-6" />
            </div>
            <h4 className="font-broadcast text-lg font-black text-white mb-2 uppercase tracking-wide">
              Live Broadcast Arena
            </h4>
            <p className="text-xs text-battle-muted leading-relaxed">
              Esports-grade stage, real-time purse deductions, ticking countdown urgency, and glowing leader spotlights.
            </p>
          </div>

          <div className="p-6 rounded-3xl battle-panel border border-battle-border">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-4 shadow-glow-orange">
              <Gavel className="w-6 h-6" />
            </div>
            <h4 className="font-broadcast text-lg font-black text-white mb-2 uppercase tracking-wide">
              Procedural Web Audio SFX
            </h4>
            <p className="text-xs text-battle-muted leading-relaxed">
              Synthesized realistic gavel strikes, confetti fanfare, electronic bid bells, and outbid tension whooshes offline.
            </p>
          </div>

          <div className="p-6 rounded-3xl battle-panel border border-battle-border">
            <div className="w-12 h-12 rounded-2xl bg-brand-purple/15 text-brand-purple flex items-center justify-center mb-4 shadow-glow-purple">
              <Users className="w-6 h-6" />
            </div>
            <h4 className="font-broadcast text-lg font-black text-white mb-2 uppercase tracking-wide">
              1 Laptop Local Multiplayer
            </h4>
            <p className="text-xs text-battle-muted leading-relaxed">
              Pass-and-play local party game. No signup, no Wi-Fi required, with multi-level instant undo for accidental clicks.
            </p>
          </div>
        </div>

      </div>

      {/* HOW TO PLAY MODAL */}
      <AnimatePresence>
        {showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full rounded-3xl battle-panel p-8 border border-brand-purple/40 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowHowToPlay(false)}
                className="absolute top-6 right-6 text-battle-muted hover:text-white text-2xl p-1 font-bold"
              >
                &times;
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-cyan/20 text-brand-cyan flex items-center justify-center shadow-glow-cyan">
                  <HelpCircle className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                    How To Play BIDBATTLE
                  </h3>
                  <p className="text-xs text-battle-muted">Official rules of the local multiplayer auction showdown</p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-battle-text leading-relaxed">
                <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex gap-4">
                  <span className="font-broadcast font-black text-brand-cyan text-lg">01</span>
                  <div>
                    <strong className="text-white block font-broadcast text-sm uppercase mb-1">Setup Your Tournament:</strong>
                    Choose lots (Cricket, Football, Characters, Friends!) and give each franchise a purse. Or click any instant preset!
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex gap-4">
                  <span className="font-broadcast font-black text-brand-cyan text-lg">02</span>
                  <div>
                    <strong className="text-white block font-broadcast text-sm uppercase mb-1">Take Turns Bidding on 1 Laptop:</strong>
                    When an item is up, friends shout bids. Click your franchise's button to place the bid. Timer resets on every valid bid!
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex gap-4">
                  <span className="font-broadcast font-black text-brand-cyan text-lg">03</span>
                  <div>
                    <strong className="text-white block font-broadcast text-sm uppercase mb-1">Budget & Anti-Self Bidding:</strong>
                    You cannot bid more than your remaining purse. The anti-self-bidding rule prevents bidding against your own existing high bid.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex gap-4">
                  <span className="font-broadcast font-black text-brand-cyan text-lg">04</span>
                  <div>
                    <strong className="text-white block font-broadcast text-sm uppercase mb-1">SOLD / UNSOLD Gavel:</strong>
                    When the clock runs down, the host hits SOLD to celebrate with confetti and victory fanfare, or marks UNSOLD.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex gap-4">
                  <span className="font-broadcast font-black text-brand-cyan text-lg">05</span>
                  <div>
                    <strong className="text-white block font-broadcast text-sm uppercase mb-1">Re-Auctions & Championship Podium:</strong>
                    Re-auction any unsold stars in Round 2, then check the podium to crown the champion franchise!
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowHowToPlay(false)}
                className="mt-6 w-full"
              >
                Let's Battle!
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAST TOURNAMENTS MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full rounded-3xl battle-panel p-8 border border-brand-purple/40 shadow-2xl relative max-h-[85vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-6 right-6 text-battle-muted hover:text-white text-2xl p-1 font-bold"
              >
                &times;
              </button>

              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/20 text-brand-purple flex items-center justify-center shadow-glow-purple">
                  <History className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
                    Saved Tournaments & Archives
                  </h3>
                  <p className="text-xs text-battle-muted">Resume, export JSON, or inspect past champions</p>
                </div>
              </div>

              <div className="space-y-3">
                {historyList.map((hist) => {
                  const sold = hist.items?.filter(i => i.status === 'sold').length || 0;
                  return (
                    <div
                      key={hist.id}
                      className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm font-broadcast">{hist.name}</h4>
                          <Badge variant="purple">{hist.category}</Badge>
                        </div>
                        <p className="text-xs text-battle-muted mt-1">
                          {hist.teams?.length || 0} Teams • {sold}/{hist.items?.length || 0} Sold • {new Date(hist.savedAt || hist.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setAuction(hist);
                            storageService.saveActiveAuction(hist);
                            setShowHistoryModal(false);
                            setActivePage(hist.status === 'finished' ? 'results' : 'live');
                          }}
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          Open
                        </Button>

                        <button
                          onClick={() => storageService.exportAuctionJSON(hist)}
                          title="Download JSON"
                          className="p-2 rounded-xl bg-battle-card hover:bg-battle-border text-battle-muted hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            const updated = storageService.deleteFromHistory(hist.id);
                            setHistoryList(updated);
                            toast.success('Deleted tournament archive');
                          }}
                          title="Delete tournament"
                          className="p-2 rounded-xl bg-battle-card hover:bg-rose-950/60 text-battle-muted hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tournament Launch & Team Budget Setup Modal */}
      {selectedPresetForLaunch && (
        <TournamentLaunchModal
          preset={selectedPresetForLaunch}
          isOpen={Boolean(selectedPresetForLaunch)}
          onClose={() => setSelectedPresetForLaunch(null)}
          onLaunch={(configuredTeams, selectedMode) => {
            const p = selectedPresetForLaunch;
            setSelectedPresetForLaunch(null);
            loadPresetAuction(p.id, configuredTeams, selectedMode);
            toast.success(`Launched ${p.name} with custom franchise budgets!`);
          }}
        />
      )}

      {/* Delete Custom Tournament Confirmation Modal */}
      <AnimatePresence>
        {deletingTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-3xl battle-panel p-6 border border-rose-500/40 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white font-broadcast uppercase">
                    Delete Custom Tournament?
                  </h3>
                  <p className="text-xs text-battle-muted">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-battle-text mb-6 leading-relaxed">
                Are you sure you want to delete <strong className="text-white">"{deletingTournament.name}"</strong>? This will permanently remove this preset from your custom tournaments library. Any active auction in progress or past tournament history will remain completely untouched.
              </p>

              <div className="flex items-center justify-end gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingTournament(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDeleteConfirm}
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
                  <span>Delete Tournament</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Import Custom Tournament Modal */}
      <ImportTournamentModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={() => {
          refreshCustomTournaments();
        }}
      />

      {/* Tournament Editor Modal */}
      <TournamentEditorModal
        isOpen={editorState.isOpen}
        tournament={editorState.tournament}
        initialMode={editorState.mode}
        onClose={() => setEditorState({ isOpen: false, tournament: null, mode: 'edit_only' })}
        onSave={(compiled) => {
          storageService.saveCustomTournament(compiled);
          refreshCustomTournaments();
        }}
        onSaveAndLaunch={(compiled) => {
          saveAndLaunchCustomTournament(compiled);
        }}
      />

    </div>
  );
};
