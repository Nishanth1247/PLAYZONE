import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Edit3, 
  Copy, 
  Trash2, 
  Archive, 
  RotateCcw, 
  Radio, 
  Sparkles, 
  ShieldAlert,
  Palette
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { getContrastTextColor } from '../../services/franchiseService';

export const FranchiseCard = ({
  franchise,
  participationCount = 0,
  isActiveTournament = false,
  onEdit,
  onDuplicate,
  onToggleArchive,
  onDelete,
}) => {
  const contrastText = getContrastTextColor(franchise.color);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      className={`rounded-3xl bg-[#222F43] border transition-all p-5 shadow-lg relative overflow-hidden flex flex-col justify-between ${
        franchise.isArchived 
          ? 'border-[#39465A]/60 opacity-70' 
          : isActiveTournament
          ? 'border-[#D97858] shadow-glow-orange'
          : 'border-[#39465A] hover:border-[#AEB9CC]'
      }`}
    >
      {/* Left accent vertical stripe */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1.5 transition-colors"
        style={{ backgroundColor: franchise.color }}
      />

      <div>
        {/* Top Header Strip: Status Badges & Quick Indicators */}
        <div className="flex items-center justify-between gap-2 pl-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: franchise.color,
                color: contrastText,
              }}
            >
              {franchise.shortName}
            </span>

            {franchise.isDefault && (
              <Badge variant="subtle" className="text-[9px] font-mono py-0 px-1.5">
                DEFAULT
              </Badge>
            )}

            {isActiveTournament && (
              <Badge variant="orange" pulse className="text-[9px] font-mono py-0 px-1.5 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5" /> LIVE TOURNAMENT
              </Badge>
            )}
          </div>

          <div>
            {franchise.isArchived ? (
              <Badge variant="outline" className="border-[#39465A] text-[#AEB9CC] text-[9px] font-mono py-0">
                ARCHIVED
              </Badge>
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#91A98B] inline-block shadow-sm" title="Active" />
            )}
          </div>
        </div>

        {/* Franchise Identity: Avatar & Titles */}
        <div className="flex items-start gap-3.5 pl-2 mb-3">
          {/* Avatar box */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-heading font-black text-xl shadow-md border shrink-0 transition-transform hover:scale-105"
            style={{
              backgroundColor: franchise.color,
              borderColor: `${franchise.color}cc`,
              color: contrastText,
            }}
          >
            {franchise.logo || franchise.shortName?.slice(0, 2) || '🛡️'}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-heading font-black text-lg sm:text-xl text-[#F5F3EE] truncate leading-tight">
              {franchise.name}
            </h3>
            <p className="text-[11px] font-mono text-[#AEB9CC] truncate mt-0.5">
              Owner: <span className="text-[#F5F3EE] font-bold">{franchise.owner || franchise.name}</span>
            </p>
            {franchise.description && (
              <p className="text-xs text-[#AEB9CC] line-clamp-2 mt-1 leading-snug">
                {franchise.description}
              </p>
            )}
          </div>
        </div>

        {/* Color Palette & Tournament Stat Strip */}
        <div className="pl-2 mb-4 p-2.5 rounded-2xl bg-[#2C394C] border border-[#39465A] flex items-center justify-between text-xs">
          {/* Colors swatch */}
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-[#AEB9CC]" />
            <div className="flex items-center gap-1.5">
              <span 
                className="w-4 h-4 rounded-full border border-black/40 shadow-inner" 
                style={{ backgroundColor: franchise.color }}
                title={`Primary: ${franchise.color}`}
              />
              {franchise.secondaryColor && (
                <span 
                  className="w-4 h-4 rounded-full border border-black/40 shadow-inner -ml-2" 
                  style={{ backgroundColor: franchise.secondaryColor }}
                  title={`Secondary: ${franchise.secondaryColor}`}
                />
              )}
              <span className="font-mono text-[10px] text-[#AEB9CC] ml-1 uppercase">
                {franchise.color}
              </span>
            </div>
          </div>

          {/* Tournaments tally */}
          <div className="flex items-center gap-1 font-mono text-[11px] text-[#AEB9CC]">
            <Trophy className="w-3.5 h-3.5 text-[#D4B879]" />
            <span>
              <strong className="text-[#F5F3EE]">{participationCount}</strong> {participationCount === 1 ? 'Tourney' : 'Tourneys'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pl-2 pt-2 border-t border-[#39465A] flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(franchise)}
            className="text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#39465A] hover:bg-[#2C394C]"
            title="Edit Franchise"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1 text-[#F5F3EE]" />
            <span>Edit</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDuplicate(franchise)}
            className="text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#39465A] hover:bg-[#2C394C]"
            title="Duplicate Franchise"
          >
            <Copy className="w-3.5 h-3.5 mr-1" />
            <span>Copy</span>
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onToggleArchive(franchise)}
            className="text-xs font-heading font-bold text-[#AEB9CC] hover:text-[#F5F3EE] px-2 py-1.5 rounded-lg hover:bg-[#2C394C]"
            title={franchise.isArchived ? 'Restore Franchise to Active' : 'Archive Franchise'}
          >
            {franchise.isArchived ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 mr-1 text-[#91A98B]" />
                <span className="text-[#91A98B]">Restore</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5 mr-1 text-[#AEB9CC]" />
                <span>Archive</span>
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(franchise)}
            disabled={isActiveTournament}
            className={`text-xs font-heading font-bold px-2 py-1.5 rounded-lg hover:bg-[#2C394C] ${
              isActiveTournament
                ? 'opacity-40 cursor-not-allowed text-[#AEB9CC]'
                : 'text-red-400 hover:text-red-300'
            }`}
            title={isActiveTournament ? 'Cannot delete while participating in active tournament' : 'Delete Franchise'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
