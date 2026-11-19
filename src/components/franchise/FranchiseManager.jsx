import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Trophy,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FranchiseCard } from './FranchiseCard';
import { FranchiseFormModal } from './FranchiseFormModal';
import { FranchiseDeleteModal } from './FranchiseDeleteModal';
import { FranchiseImportExportModal } from './FranchiseImportExportModal';
import { franchiseService } from '../../services/franchiseService';
import { toast } from 'sonner';

export const FranchiseManager = ({ onNavigateToArena = null }) => {
  const [franchises, setFranchises] = useState(() => franchiseService.getAllFranchises({ includeArchived: true }));
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'active' | 'archived'
  const [sortBy, setSortBy] = useState('created'); // 'created' | 'name' | 'tournaments'

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingFranchise, setDeletingFranchise] = useState(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Reload franchises from storage
  const reloadFranchises = () => {
    const list = franchiseService.getAllFranchises({ includeArchived: true });
    setFranchises(list);
  };

  // Subscribe to storage update custom events
  useEffect(() => {
    const handleUpdate = () => reloadFranchises();
    window.addEventListener('playzone_franchises_updated', handleUpdate);
    return () => window.removeEventListener('playzone_franchises_updated', handleUpdate);
  }, []);

  // Filtered and sorted franchises
  const displayedFranchises = useMemo(() => {
    let result = [...franchises];

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter((f) => !f.isArchived);
    } else if (filterStatus === 'archived') {
      result = result.filter((f) => f.isArchived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.shortName.toLowerCase().includes(q) ||
          (f.owner && f.owner.toLowerCase().includes(q)) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'tournaments') {
        const countA = franchiseService.getTournamentParticipationCount(a.id);
        const countB = franchiseService.getTournamentParticipationCount(b.id);
        return countB - countA;
      }
      // 'created' (default: default first, then newest)
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [franchises, filterStatus, searchQuery, sortBy]);

  const activeCount = franchises.filter((f) => !f.isArchived).length;
  const archivedCount = franchises.filter((f) => f.isArchived).length;

  // Handlers
  const handleAddNew = () => {
    setEditingFranchise(null);
    setIsFormOpen(true);
  };

  const handleEdit = (franchise) => {
    setEditingFranchise(franchise);
    setIsFormOpen(true);
  };

  const handleDuplicate = (franchise) => {
    try {
      const dup = franchiseService.duplicateFranchise(franchise.id);
      toast.success(`Created duplicate "${dup.name}"!`);
      reloadFranchises();
    } catch (err) {
      toast.error(err.message || 'Failed to duplicate');
    }
  };

  const handleToggleArchive = (franchise) => {
    try {
      if (franchise.isArchived) {
        franchiseService.unarchiveFranchise(franchise.id);
        toast.success(`Franchise "${franchise.name}" restored to active.`);
      } else {
        franchiseService.archiveFranchise(franchise.id);
        toast.info(`Franchise "${franchise.name}" archived.`);
      }
      reloadFranchises();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  const handleDeletePrompt = (franchise) => {
    setDeletingFranchise(franchise);
    setIsDeleteOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#111827] text-[#F5F3EE] p-4 sm:p-6 lg:p-8 max-w-[1700px] mx-auto space-y-6 select-none">
      
      {/* 1. TOP BROADCAST HERO SECTION */}
      <div className="bg-[#222F43] rounded-3xl p-6 sm:p-8 border border-[#39465A] shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Subtle Ambient Light */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#D97858]/10 blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2C394C] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
            <Users className="w-3.5 h-3.5" />
            <span>CENTRAL FRANCHISE SYSTEM</span>
            <span>•</span>
            <span className="text-[#F5F3EE]">{activeCount} Contenders Active</span>
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl tracking-wide uppercase text-[#F5F3EE] leading-none">
            FRANCHISE MANAGER
          </h1>

          <p className="text-xs sm:text-sm text-[#AEB9CC] leading-relaxed">
            Create, brand, edit, duplicate, and customize tournament franchises. All contenders scale dynamically across Auction Arena, Battle Arena, and Leaderboards.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <Button
            variant="primary"
            size="lg"
            onClick={handleAddNew}
            className="font-heading text-xs font-black bg-[#D97858] hover:bg-white text-[#F5F3EE] hover:text-[#111827] shadow-lg px-5 py-3 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>ADD FRANCHISE</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsImportExportOpen(true)}
            className="font-heading text-xs font-bold bg-[#2C394C] border-[#39465A] hover:bg-[#39465A] text-[#F5F3EE] px-4 py-3 flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 text-[#D4B879]" />
            <span>BACKUP / TRANSFER</span>
          </Button>
        </div>
      </div>

      {/* 2. SEARCH, FILTER & SORT TOOLBAR */}
      <div className="bg-[#222F43] rounded-2xl p-3.5 border border-[#39465A] shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#AEB9CC]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search franchises by name, code, or owner..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#111827] border border-[#39465A] text-xs text-[#F5F3EE] placeholder-[#AEB9CC]/50 focus:outline-none focus:ring-1 focus:ring-[#D97858] font-heading"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#AEB9CC] hover:text-[#F5F3EE]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Right: Status Filter & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap justify-between sm:justify-end">
          {/* Status filter pills */}
          <div className="flex rounded-xl bg-[#111827] p-1 border border-[#39465A] text-xs font-heading">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#2C394C] text-[#F5F3EE] font-bold shadow-sm'
                  : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              All ({franchises.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'active'
                  ? 'bg-[#2C394C] text-[#91A98B] font-bold shadow-sm'
                  : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('archived')}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterStatus === 'archived'
                  ? 'bg-[#2C394C] text-[#AEB9CC] font-bold shadow-sm'
                  : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
              }`}
            >
              Archived ({archivedCount})
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-mono text-[#AEB9CC]">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[#F5F3EE] focus:outline-none cursor-pointer font-heading font-medium"
            >
              <option value="created" className="bg-[#111827] text-[#F5F3EE]">Sort: Standard Order</option>
              <option value="name" className="bg-[#111827] text-[#F5F3EE]">Sort: Name (A-Z)</option>
              <option value="tournaments" className="bg-[#111827] text-[#F5F3EE]">Sort: Most Tournaments</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. ADAPTIVE RESPONSIVE FRANCHISE GRID */}
      {displayedFranchises.length === 0 ? (
        <div className="bg-[#222F43] rounded-3xl p-12 border border-[#39465A] text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#2C394C] border border-[#39465A] text-[#D97858] flex items-center justify-center mx-auto shadow-md">
            <Users className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
              {searchQuery ? 'No Matching Franchises Found' : 'No Franchises In This Filter'}
            </h3>
            <p className="text-xs text-[#AEB9CC] font-mono">
              {searchQuery
                ? `No franchises match "${searchQuery}". Try a different search keyword.`
                : 'There are currently no franchises matching the active filter tab.'}
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleAddNew}
            className="font-heading text-xs font-black bg-[#D97858] hover:bg-white text-[#F5F3EE] hover:text-[#111827] px-6 py-2.5 mx-auto"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Create New Franchise</span>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {displayedFranchises.map((f) => (
              <FranchiseCard
                key={f.id}
                franchise={f}
                participationCount={franchiseService.getTournamentParticipationCount(f.id)}
                isActiveTournament={franchiseService.isFranchiseInActiveTournament(f.id)}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onToggleArchive={handleToggleArchive}
                onDelete={handleDeletePrompt}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODALS */}
      <FranchiseFormModal
        isOpen={isFormOpen}
        franchise={editingFranchise}
        onClose={() => {
          setIsFormOpen(false);
          setEditingFranchise(null);
        }}
        onSaveSuccess={reloadFranchises}
      />

      <FranchiseDeleteModal
        isOpen={isDeleteOpen}
        franchise={deletingFranchise}
        participationCount={deletingFranchise ? franchiseService.getTournamentParticipationCount(deletingFranchise.id) : 0}
        isActiveTournament={deletingFranchise ? franchiseService.isFranchiseInActiveTournament(deletingFranchise.id) : false}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingFranchise(null);
        }}
        onDeleted={reloadFranchises}
        onArchiveInstead={handleToggleArchive}
      />

      <FranchiseImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportComplete={reloadFranchises}
      />

    </div>
  );
};
