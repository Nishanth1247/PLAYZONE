import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Trash2, X, Archive, Radio } from 'lucide-react';
import { Button } from '../ui/Button';
import { franchiseService } from '../../services/franchiseService';
import { toast } from 'sonner';

export const FranchiseDeleteModal = ({
  isOpen,
  franchise,
  participationCount = 0,
  isActiveTournament = false,
  onClose,
  onDeleted,
  onArchiveInstead,
}) => {
  if (!isOpen || !franchise) return null;

  const handleDelete = () => {
    try {
      franchiseService.deleteFranchise(franchise.id);
      toast.success(`Franchise "${franchise.name}" deleted successfully.`);
      if (onDeleted) onDeleted(franchise);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete franchise');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#222F43] border border-[#39465A] rounded-3xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            {isActiveTournament ? <Radio className="w-6 h-6 animate-pulse" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h3 className="font-heading font-black text-xl text-[#F5F3EE]">
            {isActiveTournament ? 'Franchise In Active Tournament' : `Delete "${franchise.name}"?`}
          </h3>
          <p className="text-xs text-[#AEB9CC] mt-1 leading-relaxed">
            {isActiveTournament ? (
              <span className="text-rose-300">
                <strong>{franchise.name}</strong> is currently participating in an active live tournament in Auction or Battle Arena. To maintain state integrity, deletion is strictly locked while this tournament is in progress.
              </span>
            ) : participationCount > 0 ? (
              <span>
                <strong>{franchise.name}</strong> has participated in <strong>{participationCount} tournament(s)</strong>. Deleting it will remove it from future selections, but historical match records will retain its past snapshots. Alternatively, you can <strong>Archive</strong> it to hide it while keeping it in the manager.
              </span>
            ) : (
              <span>
                Are you sure you want to permanently delete <strong>{franchise.name}</strong>? This action cannot be undone.
              </span>
            )}
          </p>
        </div>

        {/* Franchise Profile Strip */}
        <div className="p-3 rounded-2xl bg-[#2C394C] border border-[#39465A] flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow shrink-0"
            style={{ backgroundColor: franchise.color, color: '#111827' }}
          >
            {franchise.logo || franchise.shortName?.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-heading font-bold text-sm text-[#F5F3EE] truncate">
              {franchise.name}
            </h4>
            <span className="text-[11px] font-mono text-[#AEB9CC] block">
              Code: {franchise.shortName} • {franchise.owner}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            variant="ghost"
            size="md"
            onClick={onClose}
            className="text-xs font-heading text-[#AEB9CC] hover:text-[#F5F3EE]"
          >
            Cancel
          </Button>

          {isActiveTournament ? (
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="text-xs font-heading font-bold bg-[#2C394C] border-[#39465A] text-[#F5F3EE]"
            >
              Close
            </Button>
          ) : (
            <>
              {participationCount > 0 && onArchiveInstead && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    onArchiveInstead(franchise);
                    onClose();
                  }}
                  className="font-heading text-xs font-bold text-[#D4B879] border-[#39465A] hover:bg-[#39465A]"
                >
                  <Archive className="w-3.5 h-3.5 mr-1" />
                  <span>Archive Instead</span>
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleDelete}
                className="font-heading text-xs font-black bg-rose-600 hover:bg-rose-500 text-white border-rose-600 px-4"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                <span>Confirm Delete</span>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
