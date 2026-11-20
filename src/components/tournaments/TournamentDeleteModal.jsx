import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';
import { Button } from '../ui/Button';

export const TournamentDeleteModal = ({
  isOpen,
  tournament,
  onClose,
  onConfirmDelete,
  onArchiveInstead,
}) => {
  if (!isOpen || !tournament) return null;

  const isActive = tournament.status === 'active' || tournament.status === 'paused';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#222F43] border border-rose-500/50 shadow-2xl p-6 sm:p-8 my-12 space-y-6"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-black text-xl text-[#F5F3EE] uppercase tracking-wide">
                Delete Tournament?
              </h3>
              <p className="text-xs text-[#AEB9CC] mt-1 leading-relaxed">
                You are about to permanently delete{' '}
                <strong className="text-[#F5F3EE]">"{tournament.name}"</strong>.
              </p>
            </div>
          </div>

          {/* Warning Banner if Active */}
          {isActive && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-heading font-bold space-y-1">
              <div className="flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Active Tournament Warning</span>
              </div>
              <p className="font-normal text-[#AEB9CC]">
                This tournament currently has active or paused matches. Deleting it will permanently destroy all ongoing auction lots, player squads, and match scores.
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#111827] border border-[#39465A] text-xs text-[#AEB9CC] space-y-2">
            <div className="flex justify-between">
              <span>Franchises:</span>
              <span className="font-bold text-[#F5F3EE]">{tournament.franchiseIds?.length || 0} Teams</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-mono uppercase font-bold text-[#D4B879]">{tournament.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Game Modes:</span>
              <span className="font-mono font-bold text-[#F5F3EE]">{tournament.gameModes?.join(', ').toUpperCase()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            {onArchiveInstead && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => {
                  onArchiveInstead(tournament.id);
                  onClose();
                }}
                className="w-full sm:w-auto border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
              >
                <Archive className="w-4 h-4" />
                <span>Archive Instead</span>
              </Button>
            )}

            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => {
                onConfirmDelete(tournament.id);
                onClose();
              }}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/40"
            >
              <Trash2 className="w-4 h-4" />
              <span>Confirm Delete</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
