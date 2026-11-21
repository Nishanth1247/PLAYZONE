import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuction } from '../../context/AuctionContext';
import { storageService } from '../../services/storageService';
import { tournamentHubService } from '../../services/tournamentHubService';
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
  Radio, 
  Trash2, 
  Download, 
  Zap, 
  Clock, 
  Layers, 
  ChevronRight, 
  Edit, 
  Copy, 
  AlertTriangle, 
  FolderDown, 
  FileCode2, 
  Sliders, 
  BookOpen,
  Swords,
  Gamepad2,
  Tv,
  Calendar,
  Compass
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { TournamentLaunchModal } from './TournamentLaunchModal';
import { ImportTournamentModal } from '../custom/ImportTournamentModal';
import { TournamentEditorModal } from '../custom/TournamentEditorModal';
import { openGameRules } from '../rules/GameRules';

export const Home = ({ onSwitchToParty, onNavigateToArena }) => {
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
    mode: 'edit_only',
  });
  const [deletingTournament, setDeletingTournament] = useState(null);

  const activeTournId = tournamentHubService.getActiveTournamentId();
  const activeTournament = activeTournId ? tournamentHubService.getTournamentById(activeTournId) : null;

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

  const navigateTo = (arena) => {
    if (onNavigateToArena) {
      onNavigateToArena(arena);
    } else {
      if (arena === 'tournaments') {
        window.dispatchEvent(new CustomEvent('bidbattle_open_tournaments'));
      } else if (arena === 'party' && onSwitchToParty) {
        onSwitchToParty();
      } else if (arena === 'auction') {
        setActivePage('setup');
      }
    }
  };

  const scrollToArenas = () => {
    const el = document.getElementById('quick-arenas-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasActiveAuction = auction && auction.items && auction.items.length > 0;
  const currentSoldCount = auction?.items?.filter(i => i.status === 'sold').length || 0;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#101418] text-[#EDF2F3]">
      {/* Background subtle radial lighting for hero */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-[#45C4A1]/10 via-[#258C76]/5 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        {/* ========================================================= */}
        {/* 1. HERO SECTION – MIDNIGHT OBSIDIAN & ELECTRIC JADE       */}
        {/* ========================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-16 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#1C252D] border border-[#34414A] text-xs font-heading font-semibold text-[#A5B2B8] mb-6 shadow-sm"
          >
            <span className="flex items-center gap-1.5 text-[#45C4A1]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLAYZONE 8.6</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#34414A]" />
            <span className="text-[#EDF2F3] font-mono tracking-wider">OFFLINE LOCAL MULTIPLAYER</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-heading text-5xl sm:text-7xl font-black tracking-tight text-[#EDF2F3] leading-[1.08] mb-5"
          >
            THE TOURNAMENT ARENA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EDF2F3] via-[#45C4A1] to-[#258C76]">
              FOR STRATEGIC MULTIPLAYER
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg text-[#A5B2B8] font-normal max-w-2xl mx-auto leading-relaxed mb-8"
          >
            Gather your friends around one screen. Manage franchise purse capital, slam the auction gavel, battle head-to-head in tactical combat, and play local party games with zero online login.
          </motion.p>

          {/* Primary Action Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigateTo('tournaments')}
              className="shadow-lg shadow-[#45C4A1]/20 group px-6 py-3"
            >
              <Trophy className="w-4 h-4 mr-1 text-[#101418]" />
              <span>Open Tournament Hub</span>
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={scrollToArenas}
              className="px-6 py-3"
            >
              <Compass className="w-4 h-4 mr-1 text-[#45C4A1]" />
              <span>Explore Arenas</span>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={handleCreateCustom}
              className="px-5 py-3"
            >
              <PlusCircle className="w-4 h-4 mr-1 text-[#45C4A1]" />
              <span>+ Create Tournament</span>
            </Button>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* 2. ACTIVE TOURNAMENT BANNER (If Active)                   */}
        {/* ========================================================= */}
        {(activeTournament || hasActiveAuction) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-14 p-6 rounded-2xl bg-[#1C252D] border border-[#34414A] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-[#45C4A1] via-[#D6A568] to-[#45C4A1]" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="amber" pulse={true}>
                    Live In Progress
                  </Badge>
                  <span className="text-xs font-mono text-[#788890]">
                    {activeTournament?.season || 'Season 1'}
                  </span>
                </div>
                <h3 className="font-heading text-2xl font-bold text-[#EDF2F3]">
                  {activeTournament?.name || auction?.name || 'Active Tournament'}
                </h3>
                <p className="text-xs text-[#A5B2B8] mt-1">
                  {activeTournament?.participatingFranchises?.length || auction?.teams?.length || 4} Franchises • {activeTournament?.format || 'Auction Showdown'} • Match In Progress
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (activeTournament) {
                      navigateTo('tournaments');
                    } else if (hasActiveAuction) {
                      setActivePage('live');
                      navigateTo('auction');
                    }
                  }}
                  className="font-bold shadow-md shadow-[#45C4A1]/20"
                >
                  <Radio className="w-4 h-4 mr-1 animate-pulse" />
                  <span>Resume Live Gameplay</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* 3. QUICK ARENA ACCESS (3 Separate Visual Identities)      */}
        {/* ========================================================= */}
        <div id="quick-arenas-section" className="mb-16 scroll-mt-24">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#45C4A1]" />
                <h2 className="text-2xl font-bold font-heading text-[#EDF2F3] tracking-tight">
                  Playzone Arenas
                </h2>
              </div>
              <p className="text-xs text-[#A5B2B8] mt-0.5">
                Three specialized tournament engines, each with its own gameplay mechanics & visual identity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Arena 1: Auction Arena */}
            <div className="p-6 rounded-2xl bg-[#0B211D] border border-[#244F43] flex flex-col justify-between group hover:border-[#C5A46D]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#15352D] border border-[#244F43] text-[#C5A46D] flex items-center justify-center">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C5A46D]/20 text-[#C5A46D] border border-[#C5A46D]/30 uppercase">
                    Emerald & Ivory
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-[#F5F0E5] mb-2 group-hover:text-[#C5A46D] transition-colors">
                  Auction Arena
                </h3>
                <p className="text-xs text-[#B6C5B5] leading-relaxed mb-6">
                  High-stakes franchise bidding with progressive price brackets, purse allocation models, and strict player-rating concealment until official podium reveal.
                </p>

                <div className="space-y-2 mb-6 text-xs text-[#B6C5B5]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                    <span>2–10+ Franchises with Equal or Individual Purses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                    <span>Strict Rating Concealment & Mandatory Settlement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C5A46D]" />
                    <span>Re-auctioning of Unsold Lots in Round 2</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('auction')}
                className="w-full py-2.5 px-4 rounded-xl font-heading text-xs font-bold bg-[#C5A46D] hover:bg-[#b8955c] text-[#0B211D] flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Launch Auction Arena</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Arena 2: Battle Arena */}
            <div className="p-6 rounded-2xl bg-[#0A1224] border border-[#2C4468] flex flex-col justify-between group hover:border-[#568BE0]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#172744] border border-[#2C4468] text-[#568BE0] flex items-center justify-center">
                    <Swords className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#568BE0]/20 text-[#568BE0] border border-[#568BE0]/30 uppercase">
                    Cobalt & Steel
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-[#F0F3F8] mb-2 group-hover:text-[#568BE0] transition-colors">
                  Battle Arena
                </h3>
                <p className="text-xs text-[#AAB8CB] leading-relaxed mb-6">
                  Combat squad management featuring secret pass-the-laptop tactical drafting, 3-2-1 bout reveals, and standard 3-1-0 championship scoring.
                </p>

                <div className="space-y-2 mb-6 text-xs text-[#AAB8CB]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#568BE0]" />
                    <span>Independent Squad Size & Purse Configuration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#568BE0]" />
                    <span>Secret Lineup Locking & 3-2-1 Match Reveal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#568BE0]" />
                    <span>3-1-0 Points Table & Sudden-Death Tie Breakers</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('battle')}
                className="w-full py-2.5 px-4 rounded-xl font-heading text-xs font-bold bg-[#568BE0] hover:bg-[#4a7ecf] text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Launch Battle Arena</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Arena 3: Party Arena */}
            <div className="p-6 rounded-2xl bg-[#1B1521] border border-[#4A3A54] flex flex-col justify-between group hover:border-[#C77B79]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#302438] border border-[#4A3A54] text-[#C77B79] flex items-center justify-center">
                    <Gamepad2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#C77B79]/20 text-[#C77B79] border border-[#C77B79]/30 uppercase">
                    Dark Plum & Coral
                  </span>
                </div>

                <h3 className="font-heading text-xl font-bold text-[#F5EFF8] mb-2 group-hover:text-[#C77B79] transition-colors">
                  Party Arena
                </h3>
                <p className="text-xs text-[#B3A2BC] leading-relaxed mb-6">
                  Social party games for 2–4 teams on 1 laptop. Dumb Charades with Early-Guess bonus (+1 at &le;50% time) and Who Am I? deduction.
                </p>

                <div className="space-y-2 mb-6 text-xs text-[#B3A2BC]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77B79]" />
                    <span>Dumb Charades Early-Guess Bonus (+1 at &le;50% time)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77B79]" />
                    <span>Who Am I? Guesser Privacy Handover Screen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C77B79]" />
                    <span>ChatGPT Copy Prompt Generator & Preset Themes</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('party')}
                className="w-full py-2.5 px-4 rounded-xl font-heading text-xs font-bold bg-[#C77B79] hover:bg-[#b86e6c] text-white flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span>Launch Party Arena</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. CUSTOM TOURNAMENTS SECTION                             */}
        {/* ========================================================= */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#45C4A1]" />
                <h2 className="text-2xl font-bold text-[#EDF2F3] font-heading tracking-tight">
                  Custom Tournaments ({customTournaments.length})
                </h2>
                <Badge variant="jade" className="text-[10px]">
                  Saved Rosters
                </Badge>
              </div>
              <p className="text-xs text-[#A5B2B8] mt-0.5">
                Saved offline tournaments, imported JSON rosters, and custom franchise budgets
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenImport}
                className="text-xs"
              >
                <Upload className="w-3.5 h-3.5 mr-1" />
                <span>+ Import Tournament</span>
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateCustom}
                className="text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1 text-[#45C4A1]" />
                <span>+ Create Tournament</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="text-xs border-[#34414A] text-[#A5B2B8] hover:text-[#EDF2F3]"
                title="Download Sample JSON Template"
              >
                <Download className="w-3.5 h-3.5 mr-1 text-[#45C4A1]" />
                <span>Template</span>
              </Button>

              {customTournaments.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportAllBackup}
                  className="text-xs border-[#34414A] text-[#A5B2B8] hover:text-[#EDF2F3]"
                  title="Export All Custom Tournaments as JSON"
                >
                  <FolderDown className="w-3.5 h-3.5 mr-1 text-[#D6A568]" />
                  <span>Backup All</span>
                </Button>
              )}
            </div>
          </div>

          {/* Custom Tournaments Content: Empty State vs Cards Grid */}
          {customTournaments.length === 0 ? (
            <div className="rounded-2xl bg-[#1C252D] p-8 sm:p-12 border-2 border-dashed border-[#34414A] text-center flex flex-col items-center justify-center relative overflow-hidden">
              <div className="w-14 h-14 rounded-2xl bg-[#25313A] border border-[#34414A] text-[#45C4A1] flex items-center justify-center mb-4">
                <FileCode2 className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[#EDF2F3] mb-2">
                No Custom Tournaments Yet
              </h3>
              <p className="text-xs text-[#A5B2B8] max-w-md leading-relaxed mb-6">
                Import any JSON tournament schema, or create your own custom roster with bespoke ratings, starting prices, and franchise purses.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  variant="primary"
                  onClick={handleOpenImport}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  <span>Import Tournament JSON</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCreateCustom}
                >
                  <PlusCircle className="w-4 h-4 mr-2 text-[#45C4A1]" />
                  <span>Create from Scratch</span>
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
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.04 }}
                    className="rounded-2xl bg-[#1C252D] p-6 border border-[#34414A] hover:border-[#45C4A1]/60 transition-all duration-200 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Badges & Date */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="jade" className="text-[10px]">
                            Custom
                          </Badge>
                          <Badge variant="outline" className="text-[10px] border-[#34414A] text-[#A5B2B8]">
                            {tourney.category || 'General'}
                          </Badge>
                        </div>
                        <span className="text-[10px] font-mono text-[#788890]">
                          {new Date(tourney.createdAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-heading text-xl font-bold text-[#EDF2F3] mb-1.5 group-hover:text-[#45C4A1] transition-colors">
                        {tourney.name}
                      </h3>
                      <p className="text-xs text-[#A5B2B8] mb-4 line-clamp-2 leading-relaxed">
                        {tourney.description || 'Custom tournament ready for live auction showdown.'}
                      </p>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-[#151C22] border border-[#34414A] text-xs mb-4 font-mono">
                        <div>
                          <span className="text-[#788890] block text-[9px] font-sans">TOTAL LOTS</span>
                          <span className="font-bold text-[#45C4A1] text-xs">
                            {totalLots} Lots
                          </span>
                        </div>
                        <div>
                          <span className="text-[#788890] block text-[9px] font-sans">METRIC</span>
                          <span className="font-bold text-[#EDF2F3] text-xs truncate block" title={tourney.scoreLabel}>
                            {tourney.scoreLabel || 'Points'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#788890] block text-[9px] font-sans">START PURSE</span>
                          <span className="font-bold text-[#D6A568] text-xs">
                            {sym}{defaultPurse} {unit}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="space-y-2 pt-3 border-t border-[#34414A]">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            launchCustomTournamentPlayNow(tourney);
                            toast.success(`Launched ${tourney.name}! Starting Lot #1...`);
                          }}
                          className="w-full text-xs"
                        >
                          <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                          <span>PLAY NOW</span>
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditAndPlay(tourney)}
                          className="w-full text-xs"
                        >
                          <Sliders className="w-3.5 h-3.5 mr-1 text-[#45C4A1]" />
                          <span>EDIT & PLAY</span>
                        </Button>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditOnly(tourney)}
                          className="text-[11px] h-7 px-2 text-[#A5B2B8] hover:text-[#EDF2F3]"
                        >
                          <Edit className="w-3 h-3 mr-1 text-[#45C4A1]" />
                          <span>Edit Details</span>
                        </Button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(tourney.id)}
                            title="Duplicate Tournament"
                            className="p-1.5 rounded-lg bg-[#25313A] hover:bg-[#2B3841] border border-[#34414A] text-[#A5B2B8] hover:text-[#EDF2F3] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-[#45C4A1]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExport(tourney)}
                            title="Export JSON"
                            className="p-1.5 rounded-lg bg-[#25313A] hover:bg-[#2B3841] border border-[#34414A] text-[#A5B2B8] hover:text-[#EDF2F3] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-[#D6A568]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeletingTournament(tourney)}
                            title="Delete Custom Tournament"
                            className="p-1.5 rounded-lg bg-[#25313A] hover:bg-[#D87878]/20 border border-[#34414A] text-[#A5B2B8] hover:text-[#D87878] transition-colors"
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

        {/* ========================================================= */}
        {/* 5. INSTANT PLAY PRESET SECTION                            */}
        {/* ========================================================= */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#D6A568]" />
                <h2 className="text-2xl font-bold text-[#EDF2F3] font-heading tracking-tight">
                  Instant Play Tournaments ({AUCTION_PRESETS.length})
                </h2>
              </div>
              <p className="text-xs text-[#A5B2B8]">Jump straight into high-stakes bidding with curated superstars and movies</p>
            </div>
            
            <div className="flex items-center gap-2">
              {historyList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#1C252D] hover:bg-[#25313A] border border-[#34414A] text-[#EDF2F3] transition-all flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5 text-[#45C4A1]" />
                  <span>Past Tournaments ({historyList.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                selectedFilter === 'all'
                  ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 shadow-sm'
                  : 'bg-[#1C252D] text-[#A5B2B8] hover:text-[#EDF2F3] border border-[#34414A]'
              }`}
            >
              All Tournaments (6)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('tamil')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                selectedFilter === 'tamil'
                  ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 shadow-sm'
                  : 'bg-[#1C252D] text-[#A5B2B8] hover:text-[#EDF2F3] border border-[#34414A]'
              }`}
            >
              Tamil Cinema Specials (3)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('multiverse')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-semibold transition-all ${
                selectedFilter === 'multiverse'
                  ? 'bg-[#45C4A1]/15 text-[#45C4A1] border border-[#45C4A1]/35 shadow-sm'
                  : 'bg-[#1C252D] text-[#A5B2B8] hover:text-[#EDF2F3] border border-[#34414A]'
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

              return (
                <motion.div
                  key={preset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="rounded-2xl bg-[#1C252D] p-6 border border-[#34414A] hover:border-[#45C4A1]/60 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-3xl p-2 rounded-xl bg-[#151C22] border border-[#34414A]">
                        {presetEmojis[preset.id] || '⭐'}
                      </span>
                      <div className="text-right">
                        <Badge variant="mono">
                          {preset.category}
                        </Badge>
                        <span className="block text-[10px] text-[#D6A568] font-mono mt-1">
                          {preset.scoreLabel}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-heading text-xl font-bold text-[#EDF2F3] mb-2 group-hover:text-[#45C4A1] transition-colors">
                      {preset.name}
                    </h3>
                    <p className="text-xs text-[#A5B2B8] mb-5 leading-relaxed line-clamp-2">
                      {preset.description}
                    </p>

                    {/* Contending Franchises Strip */}
                    <div className="mb-5 p-2 rounded-xl bg-[#151C22] border border-[#34414A]">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#788890] tracking-wider mb-1.5 font-heading">
                        <span>4 Contenders:</span>
                        <span className="text-[#45C4A1] font-mono font-bold">Equal Purse</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center">
                        {preset.teams.slice(0, 4).map((t) => (
                          <span key={t.id} className="text-[10px] font-bold text-[#EDF2F3] bg-[#1C252D] py-1 px-1 rounded truncate border border-[#34414A]/50">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metric Pills */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#151C22] border border-[#34414A] text-xs mb-5 font-mono">
                      <div>
                        <span className="text-[#788890] block text-[9px] font-sans">ROSTER</span>
                        <span className="font-bold text-[#EDF2F3] text-xs">
                          {preset.items.length} Lots
                        </span>
                      </div>
                      <div>
                        <span className="text-[#788890] block text-[9px] font-sans">METRIC</span>
                        <span className="font-bold text-[#45C4A1] text-xs truncate block">
                          {preset.scoreMetric === 'imdb' ? 'IMDb' : 'Points'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#788890] block text-[9px] font-sans">START PURSE</span>
                        <span className="font-bold text-[#D6A568] text-xs">
                          {preset.currency.symbol}{preset.teams[0].purse} Cr
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      setSelectedPresetForLaunch(preset);
                    }}
                    className="w-full text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-current mr-1" />
                    Configure & Launch
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 6. LOCAL HALL OF FAME STATS & ACHIEVEMENTS                */}
        {/* ========================================================= */}
        {stats && (
          <div className="mb-14 rounded-2xl bg-[#1C252D] p-6 border border-[#34414A]">
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-4 h-4 text-[#D6A568]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#A5B2B8] font-heading">
                Local Record Hall of Fame
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
              <div className="p-4 rounded-xl bg-[#151C22] border border-[#34414A]">
                <span className="text-2xl sm:text-3xl font-bold text-[#EDF2F3]">
                  {stats.totalAuctionsStarted}
                </span>
                <p className="text-[11px] text-[#A5B2B8] mt-1 font-sans">Tournaments Run</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151C22] border border-[#34414A]">
                <span className="text-2xl sm:text-3xl font-bold text-[#45C4A1]">
                  {stats.totalItemsSold}
                </span>
                <p className="text-[11px] text-[#A5B2B8] mt-1 font-sans">Superstars Recruited</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151C22] border border-[#34414A]">
                <span className="text-2xl sm:text-3xl font-bold text-[#D6A568]">
                  {stats.totalTeamsCreated}
                </span>
                <p className="text-[11px] text-[#A5B2B8] mt-1 font-sans">Franchises Battled</p>
              </div>

              <div className="p-4 rounded-xl bg-[#151C22] border border-[#34414A]">
                <span className="text-xl sm:text-2xl font-bold text-[#EDF2F3] truncate block">
                  {stats.highestSaleAmount > 0 
                    ? `${stats.highestSaleCurrency} ${stats.highestSaleAmount}` 
                    : '—'}
                </span>
                <p className="text-[11px] text-[#A5B2B8] mt-1 font-sans truncate">
                  High: {stats.highestSalePlayer || 'None yet'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODALS */}
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

      {/* Delete Custom Tournament Modal */}
      <AnimatePresence>
        {deletingTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-md w-full rounded-2xl bg-[#1C252D] p-6 border border-[#D87878]/40 shadow-2xl relative"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#D87878]/20 text-[#D87878] flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#EDF2F3] font-heading uppercase">
                    Delete Custom Tournament?
                  </h3>
                  <p className="text-xs text-[#A5B2B8]">This action cannot be undone.</p>
                </div>
              </div>

              <p className="text-xs text-[#A5B2B8] mb-6 leading-relaxed">
                Are you sure you want to delete <strong className="text-[#EDF2F3]">"{deletingTournament.name}"</strong>? This will permanently remove this preset from your custom tournaments library.
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
        onLaunchTournament={(runtimeConfig) => {
          saveAndLaunchCustomTournament(runtimeConfig);
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
