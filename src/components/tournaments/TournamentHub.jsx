import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  PlusCircle, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Crown, 
  Play, 
  Clock, 
  CheckCircle2, 
  Users, 
  Download, 
  Upload, 
  Archive, 
  Sparkles, 
  Layers, 
  Gavel, 
  Swords, 
  Gamepad2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TournamentCard } from './TournamentCard';
import { TournamentWizard } from './TournamentWizard';
import { TournamentDetails } from './TournamentDetails';
import { TournamentDeleteModal } from './TournamentDeleteModal';
import { tournamentHubService } from '../../services/tournamentHubService';
import { toast } from 'sonner';

export const TournamentHub = ({ onNavigateToArena }) => {
  // Navigation / sub-view state: 'hub' | 'create' | 'details'
  const [viewMode, setViewMode] = useState('hub');
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);

  // Tournament list & stats
  const [tournaments, setTournaments] = useState(() => tournamentHubService.getAllTournaments());
  const [stats, setStats] = useState(() => tournamentHubService.getOverviewStats());

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'upcoming' | 'completed' | 'archived'
  const [modeFilter, setModeFilter] = useState('all'); // 'all' | 'auction' | 'battle' | 'party'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Cinema' | 'Cricket' etc.
  const [sortBy, setSortBy] = useState('updated'); // 'updated' | 'name' | 'created'

  // Delete modal state
  const [deleteModalTournament, setDeleteModalTournament] = useState(null);

  // Real-time synchronization
  const refreshTournaments = () => {
    setTournaments(tournamentHubService.getAllTournaments());
    setStats(tournamentHubService.getOverviewStats());
  };

  useEffect(() => {
    window.addEventListener('playzone_tournaments_updated', refreshTournaments);
    return () => window.removeEventListener('playzone_tournaments_updated', refreshTournaments);
  }, []);

  // Filter & Sort Logic
  const filteredTournaments = useMemo(() => {
    let result = [...tournaments];

    // Status filter
    if (statusFilter === 'active') {
      result = result.filter((t) => t.status === 'active' || t.status === 'paused');
    } else if (statusFilter === 'upcoming') {
      result = result.filter((t) => t.status === 'upcoming' || t.status === 'draft');
    } else if (statusFilter === 'completed') {
      result = result.filter((t) => t.status === 'completed');
    } else if (statusFilter === 'archived') {
      result = result.filter((t) => t.status === 'archived');
    } else {
      // 'all' excludes archived unless specifically viewing archived tab
      result = result.filter((t) => t.status !== 'archived');
    }

    // Mode filter
    if (modeFilter !== 'all') {
      result = result.filter((t) => Array.isArray(t.gameModes) && t.gameModes.includes(modeFilter));
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter((t) => t.category?.toLowerCase() === categoryFilter.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.season?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'created') {
        return (b.createdAt || 0) - (a.createdAt || 0);
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });

    return result;
  }, [tournaments, statusFilter, modeFilter, categoryFilter, searchQuery, sortBy]);

  // Section Breakdown
  const activeTournaments = useMemo(() => {
    return tournaments.filter((t) => t.status === 'active' || t.status === 'paused');
  }, [tournaments]);

  const upcomingTournaments = useMemo(() => {
    return tournaments.filter((t) => t.status === 'upcoming' || t.status === 'draft');
  }, [tournaments]);

  const completedTournaments = useMemo(() => {
    return tournaments.filter((t) => t.status === 'completed');
  }, [tournaments]);

  // Actions
  const handleLaunchArena = (tournament) => {
    tournamentHubService.setActiveTournamentId(tournament.id);

    // If upcoming or draft, mark as active
    if (tournament.status === 'upcoming' || tournament.status === 'draft') {
      tournamentHubService.setTournamentStatus(tournament.id, 'active');
    }

    // Determine target arena
    let primaryArena = 'auction';
    if (tournament.gameModes?.includes('auction')) {
      primaryArena = 'auction';
    } else if (tournament.gameModes?.includes('battle')) {
      primaryArena = 'battle';
    } else if (tournament.gameModes?.includes('party')) {
      primaryArena = 'party';
    }

    onNavigateToArena?.(primaryArena, tournament);
    toast.success(`Launching "${tournament.name}" in ${primaryArena.toUpperCase()} Arena!`);
  };

  const handleDuplicate = (id) => {
    try {
      const dup = tournamentHubService.duplicateTournament(id);
      toast.success(`Duplicated: "${dup.name}"`);
    } catch (e) {
      toast.error('Failed to duplicate tournament.');
    }
  };

  const handleArchive = (id) => {
    try {
      tournamentHubService.archiveTournament(id);
      toast.info('Tournament moved to archive storage.');
    } catch (e) {
      toast.error('Failed to archive tournament.');
    }
  };

  const handleRestore = (id) => {
    try {
      tournamentHubService.restoreTournament(id);
      toast.success('Tournament restored from archive.');
    } catch (e) {
      toast.error('Failed to restore tournament.');
    }
  };

  const handleConfirmDelete = (id) => {
    try {
      tournamentHubService.deleteTournament(id);
      toast.success('Tournament permanently deleted.');
    } catch (e) {
      toast.error('Failed to delete tournament.');
    }
  };

  const handleExportJSON = () => {
    try {
      const jsonStr = tournamentHubService.exportTournaments();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playzone_tournaments_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Exported all tournaments as JSON backup.');
    } catch (e) {
      toast.error('Failed to export tournaments.');
    }
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        const result = tournamentHubService.importTournaments(String(content));
        toast.success(`Imported ${result.importedCount} new, updated ${result.updatedCount} tournaments.`);
      } catch (err) {
        toast.error(err.message || 'Failed to import JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // If in Create Mode
  if (viewMode === 'create') {
    return (
      <TournamentWizard
        onCancel={() => setViewMode('hub')}
        onCreated={(newTourn) => {
          setViewMode('details');
          setSelectedTournamentId(newTourn.id);
        }}
      />
    );
  }

  // If in Details Mode
  if (viewMode === 'details' && selectedTournamentId) {
    return (
      <TournamentDetails
        tournamentId={selectedTournamentId}
        onBack={() => {
          setViewMode('hub');
          setSelectedTournamentId(null);
        }}
        onLaunchArena={handleLaunchArena}
        onArchive={handleArchive}
        onDelete={(tourn) => setDeleteModalTournament(tourn)}
      />
    );
  }

  return (
    <div className="max-w-[1700px] mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* 1. BROADCAST HERO BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#39465A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#222F43] border border-[#39465A] text-xs font-heading font-bold text-[#D4B879] mb-3 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Multi-Tournament Season Control Room</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#39465A]" />
            <span className="text-[#AEB9CC] font-mono">SEASON MANAGER</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-wide text-[#F5F3EE] uppercase leading-none">
            TOURNAMENT HUB
          </h1>

          <p className="text-xs sm:text-sm text-[#AEB9CC] max-w-2xl mt-2 leading-relaxed">
            Create, configure, launch, track, and archive independent franchise competitions with isolated squads, live bidding, and points standings.
          </p>
        </div>

        {/* Global Hub Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="px-3.5 py-2.5 rounded-2xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] transition-all cursor-pointer flex items-center gap-2 shadow-sm">
            <Upload className="w-4 h-4 text-[#D4B879]" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3.5 py-2.5 rounded-2xl bg-[#222F43] hover:bg-[#2C394C] border border-[#39465A] text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] transition-all flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4 text-[#00D9FF]" />
            <span>Export Backup</span>
          </button>

          <Button
            variant="primary"
            size="lg"
            onClick={() => setViewMode('create')}
            className="flex items-center gap-2 font-heading font-black text-xs sm:text-sm shadow-xl shadow-[#45C4A1]/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>CREATE TOURNAMENT</span>
          </Button>
        </div>
      </div>

      {/* 2. OVERVIEW DASHBOARD (COMPACT STATISTICS CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Tournaments */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-[#39465A] space-y-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#AEB9CC]">
            Total Tournaments
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#F5F3EE]">
            {stats.totalCount}
          </div>
          <span className="text-[10px] text-[#AEB9CC] block font-mono">
            {stats.archivedCount} archived
          </span>
        </div>

        {/* Active Tournaments */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-emerald-500/40 space-y-1 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-emerald-300">
            {stats.activeCount}
          </div>
          <span className="text-[10px] text-emerald-400/80 block font-mono">
            In competition
          </span>
        </div>

        {/* Upcoming / Draft */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-sky-500/40 space-y-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-sky-400">
            Upcoming
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-sky-300">
            {stats.upcomingCount}
          </div>
          <span className="text-[10px] text-sky-400/80 block font-mono">
            Ready to launch
          </span>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-[#D4B879]/40 space-y-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#D4B879]">
            Completed
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#D4B879]">
            {stats.completedCount}
          </div>
          <span className="text-[10px] text-[#D4B879]/80 block font-mono">
            Podium finalized
          </span>
        </div>

        {/* Participating Franchises */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-[#39465A] space-y-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#AEB9CC]">
            Active Franchises
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#00D9FF]">
            {stats.totalParticipatingFranchises}
          </div>
          <span className="text-[10px] text-[#AEB9CC] block font-mono">
            Across competitions
          </span>
        </div>

        {/* Latest Champion */}
        <div className="p-4 rounded-3xl bg-[#222F43] border border-[#39465A] space-y-1">
          <span className="text-[10px] font-heading font-bold uppercase tracking-wider text-[#D4B879] flex items-center gap-1">
            <Crown className="w-3 h-3 text-[#D4B879]" />
            Latest Champion
          </span>
          <div className="text-sm font-heading font-black text-[#F5F3EE] truncate">
            {stats.latestChampion ? (
              <span className="flex items-center gap-1 truncate" style={{ color: stats.latestChampion.teamColor }}>
                <span>{stats.latestChampion.teamLogo}</span>
                <span className="truncate">{stats.latestChampion.teamName}</span>
              </span>
            ) : (
              <span className="text-xs text-[#AEB9CC] font-normal italic">None yet</span>
            )}
          </div>
          <span className="text-[10px] text-[#AEB9CC] block font-mono truncate">
            {stats.latestChampion?.tournamentName || 'Play to crown champion'}
          </span>
        </div>
      </div>

      {/* 3. SEARCH, FILTERS & CONTROLS TOOLBAR */}
      <div className="rounded-3xl bg-[#222F43] p-4 sm:p-5 border border-[#39465A] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#AEB9CC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tournaments by name, category, or season..."
              className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-[#111827] border border-[#39465A] text-xs text-[#F5F3EE] placeholder-[#AEB9CC]/60 focus:border-[#D4B879] focus:outline-none transition-all"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-[#39465A] overflow-x-auto text-xs font-heading font-bold">
            {[
              { id: 'all', label: `All (${tournaments.filter(t => t.status !== 'archived').length})` },
              { id: 'active', label: `Active (${activeTournaments.length})` },
              { id: 'upcoming', label: `Upcoming (${upcomingTournaments.length})` },
              { id: 'completed', label: `Completed (${completedTournaments.length})` },
              { id: 'archived', label: `Archived (${stats.archivedCount})` },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  statusFilter === st.id
                    ? 'bg-[#45C4A1] text-[#101418] font-black shadow-sm'
                    : 'text-[#A5B2B8] hover:text-[#EDF2F3]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Sort & Secondary Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Filter */}
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="py-2 px-3 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:border-[#D4B879] focus:outline-none"
            >
              <option value="all">All Arenas</option>
              <option value="auction">Auction Arena</option>
              <option value="battle">Battle Arena</option>
              <option value="party">Party Arena</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-heading font-bold text-[#F5F3EE] focus:border-[#D4B879] focus:outline-none"
            >
              <option value="updated">Recently Updated</option>
              <option value="name">Name (A-Z)</option>
              <option value="created">Recently Created</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. TOURNAMENT CARDS GRID */}
      {filteredTournaments.length === 0 ? (
        <div className="rounded-3xl bg-[#222F43] border border-[#39465A] p-12 text-center space-y-4">
          <Trophy className="w-12 h-12 text-[#AEB9CC] mx-auto opacity-50" />
          <h3 className="text-xl font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
            No Tournaments Found
          </h3>
          <p className="text-xs text-[#AEB9CC] max-w-md mx-auto">
            {searchQuery
              ? `No competitions match your search query "${searchQuery}". Try clearing filters.`
              : statusFilter === 'archived'
              ? 'No archived tournaments found in storage.'
              : 'Get started by creating your first multi-arena tournament.'}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {searchQuery && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setModeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="champagne"
              size="md"
              onClick={() => setViewMode('create')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Tournament</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              onViewDetails={(id) => {
                setSelectedTournamentId(id);
                setViewMode('details');
              }}
              onContinue={handleLaunchArena}
              onDuplicate={handleDuplicate}
              onArchive={handleArchive}
              onRestore={handleRestore}
              onDelete={(t) => setDeleteModalTournament(t)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <TournamentDeleteModal
        isOpen={Boolean(deleteModalTournament)}
        tournament={deleteModalTournament}
        onClose={() => setDeleteModalTournament(null)}
        onConfirmDelete={handleConfirmDelete}
        onArchiveInstead={handleArchive}
      />
    </div>
  );
};
