import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Play, 
  Eye, 
  Copy, 
  Archive, 
  Trash2, 
  Calendar, 
  Users, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Clock, 
  Crown,
  CheckCircle2,
  AlertCircle,
  Pause,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { franchiseService } from '../../services/franchiseService';

/**
 * TournamentCard — Rich, responsive tournament card for Tournament Hub
 */
export const TournamentCard = ({
  tournament,
  onViewDetails,
  onContinue,
  onDuplicate,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const {
    id,
    name,
    description,
    category,
    logo,
    themeColor = '#D4B879',
    season,
    status = 'upcoming',
    franchiseIds = [],
    franchisesSnapshot = [],
    gameModes = [],
    progress = { percentage: 0, currentStage: 'Ready' },
    results,
    updatedAt,
    createdAt,
  } = tournament;

  // Resolve participating franchises
  const teams = React.useMemo(() => {
    if (franchisesSnapshot && franchisesSnapshot.length > 0) {
      return franchisesSnapshot;
    }
    return franchiseIds.map((fId) => franchiseService.getFranchiseById(fId)).filter(Boolean);
  }, [franchisesSnapshot, franchiseIds]);

  const isActive = status === 'active';
  const isPaused = status === 'paused';
  const isCompleted = status === 'completed';
  const isUpcoming = status === 'upcoming';
  const isDraft = status === 'draft';
  const isArchived = status === 'archived';

  // Status Badge Configuration
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-sm animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE ACTIVE
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/40">
            <Pause className="w-3 h-3" />
            PAUSED
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-[#D4B879]/15 text-[#D4B879] border border-[#D4B879]/40">
            <Crown className="w-3 h-3 text-[#D4B879]" />
            COMPLETED
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-sky-500/15 text-sky-400 border border-sky-500/40">
            <Clock className="w-3 h-3" />
            UPCOMING
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-slate-500/15 text-slate-300 border border-slate-500/40">
            DRAFT
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-heading font-black tracking-wider uppercase bg-zinc-700/20 text-zinc-400 border border-zinc-700/40">
            <Archive className="w-3 h-3" />
            ARCHIVED
          </span>
        );
      default:
        return null;
    }
  };

  const formattedDate = new Date(updatedAt || createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className={`rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xl ${
        isActive
          ? 'bg-[#222F43] border-[#00D9FF]/40 shadow-[#00D9FF]/10'
          : isCompleted
          ? 'bg-[#222F43] border-[#D4B879]/40'
          : 'bg-[#222F43] border-[#39465A] hover:border-[#AEB9CC]/40'
      }`}
      style={{
        boxShadow: isActive ? '0 0 25px -5px rgba(0,217,255,0.15)' : undefined,
      }}
    >
      {/* Top Accent Stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 transition-all"
        style={{
          backgroundColor: themeColor || '#D4B879',
          opacity: isActive ? 1 : 0.6,
        }}
      />

      <div className="space-y-4">
        {/* Header Tags & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-[10px] font-mono font-bold text-[#D4B879]">
              {category}
            </span>
            {season && (
              <span className="px-2.5 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-[10px] font-heading font-bold text-[#AEB9CC]">
                {season}
              </span>
            )}
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Title & Avatar */}
        <div className="flex items-start gap-3.5">
          <div
            className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 font-heading font-black text-xl shadow-md overflow-hidden"
            style={{
              backgroundColor: '#111827',
              borderColor: themeColor,
              color: '#F5F3EE',
            }}
          >
            {logo && (logo.startsWith('http') || logo.startsWith('data:')) ? (
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span>{logo || '🏆'}</span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3
              onClick={() => onViewDetails(id)}
              className="text-lg sm:text-xl font-heading font-black tracking-wide text-[#F5F3EE] truncate cursor-pointer hover:text-[#D4B879] transition-colors"
              title={name}
            >
              {name}
            </h3>
            <p className="text-xs text-[#AEB9CC] line-clamp-2 mt-0.5 leading-relaxed">
              {description || 'Comprehensive multi-arena tournament with independent franchise squads and standings.'}
            </p>
          </div>
        </div>

        {/* Participating Franchises Avatar Row */}
        <div className="p-3 rounded-2xl bg-[#111827]/70 border border-[#39465A] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-heading">
            <span className="text-[#AEB9CC] font-bold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#D4B879]" />
              <span>Participating Franchises:</span>
            </span>
            <span className="font-mono font-bold text-[#F5F3EE]">
              {teams.length} Teams
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {teams.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-heading font-black shadow-sm"
                style={{
                  backgroundColor: t.color || '#2C394C',
                  borderColor: '#F5F3EE',
                  color: franchiseService.getContrastTextColor(t.color),
                }}
                title={`${t.name} (@${t.owner || t.name})`}
              >
                {t.logo && !t.logo.startsWith('http') && !t.logo.startsWith('data:') ? (
                  <span>{t.logo}</span>
                ) : (
                  <span>{t.shortName || t.name.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
            ))}
            {teams.length > 6 && (
              <span className="w-7 h-7 rounded-xl bg-[#2C394C] border border-[#39465A] text-[10px] font-mono font-bold text-[#AEB9CC] flex items-center justify-center">
                +{teams.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Enabled Game Modes */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase tracking-wider">
            Arenas:
          </span>
          {gameModes.includes('auction') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-[10px] font-heading font-bold text-[#00D9FF]">
              <Gavel className="w-3 h-3" />
              AUCTION
            </span>
          )}
          {gameModes.includes('battle') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-[10px] font-heading font-bold text-[#FF8A35]">
              <Swords className="w-3 h-3" />
              BATTLE
            </span>
          )}
          {gameModes.includes('party') && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-[10px] font-heading font-bold text-[#9147FF]">
              <Gamepad2 className="w-3 h-3" />
              PARTY
            </span>
          )}
        </div>

        {/* Progress Bar & Stage Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#AEB9CC] truncate max-w-[200px]">
              {progress.currentStage || (isCompleted ? 'Finished' : 'Upcoming')}
            </span>
            <span className="font-bold text-[#F5F3EE]">
              {progress.percentage || (isCompleted ? 100 : 0)}%
            </span>
          </div>

          <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden border border-[#39465A]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-[#D4B879]'
                  : isActive
                  ? 'bg-gradient-to-r from-[#00D9FF] to-[#B7F34A]'
                  : 'bg-[#39465A]'
              }`}
              style={{
                width: `${Math.max(4, Math.min(100, progress.percentage || (isCompleted ? 100 : 0)))}%`,
              }}
            />
          </div>
        </div>

        {/* Champion Banner (if completed) */}
        {isCompleted && results?.championTeamName && (
          <div className="p-3 rounded-2xl bg-[#D4B879]/10 border border-[#D4B879]/40 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{results.championLogo || '👑'}</span>
              <div>
                <span className="text-[9px] font-heading uppercase tracking-wider text-[#D4B879] block font-black">
                  Tournament Champion
                </span>
                <span className="font-heading font-black text-sm text-[#F5F3EE]">
                  {results.championTeamName}
                </span>
              </div>
            </div>
            {results.finalScores && results.championTeamId && (
              <span className="text-xs font-mono font-black text-[#D4B879] px-2.5 py-1 rounded-xl bg-[#111827] border border-[#D4B879]/30">
                {results.finalScores[results.championTeamId] || 0} PTS
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer Details & Action Bar */}
      <div className="pt-4 mt-4 border-t border-[#39465A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#AEB9CC]">
          <Calendar className="w-3 h-3 text-[#AEB9CC]" />
          <span>Updated: {formattedDate}</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Main Launch / Continue Action */}
          {!isArchived && (
            <button
              type="button"
              onClick={() => onContinue(tournament)}
              className={`px-3 py-1.5 rounded-xl font-heading font-black text-xs transition-all flex items-center gap-1.5 shadow-md ${
                isActive || isPaused
                  ? 'bg-[#00D9FF] hover:bg-[#00c4e6] text-[#0B0F17]'
                  : isCompleted
                  ? 'bg-[#D4B879] hover:bg-[#c9ad6a] text-[#0B0F17]'
                  : 'bg-[#D97858] hover:bg-[#c86c4d] text-[#F5F3EE]'
              }`}
            >
              {isActive || isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>CONTINUE</span>
                </>
              ) : isCompleted ? (
                <>
                  <Trophy className="w-3.5 h-3.5" />
                  <span>VIEW PODIUM</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>LAUNCH ARENA</span>
                </>
              )}
            </button>
          )}

          {/* View Details */}
          <button
            type="button"
            onClick={() => onViewDetails(id)}
            className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#F5F3EE] transition-colors"
            title="View Details & Standings"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Duplicate */}
          <button
            type="button"
            onClick={() => onDuplicate(id)}
            className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
            title="Duplicate Tournament"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Archive / Restore */}
          {isArchived ? (
            <button
              type="button"
              onClick={() => onRestore(id)}
              className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-emerald-400 transition-colors"
              title="Restore from Archive"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onArchive(id)}
              className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-[#39465A] border border-[#39465A] text-[#AEB9CC] hover:text-amber-400 transition-colors"
              title="Archive Tournament"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete */}
          <button
            type="button"
            onClick={() => onDelete(tournament)}
            className="p-1.5 rounded-xl bg-[#2C394C] hover:bg-rose-950/60 border border-[#39465A] hover:border-rose-800 text-[#AEB9CC] hover:text-rose-400 transition-colors"
            title="Delete Tournament"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
