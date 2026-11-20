import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  ArrowLeft, 
  Play, 
  Calendar, 
  Users, 
  Gavel, 
  Swords, 
  Gamepad2, 
  Clock, 
  Crown, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Settings, 
  Coins, 
  ShieldCheck, 
  Flame, 
  Sparkles,
  Archive,
  Trash2,
  Download,
  Share2,
  Tv
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { franchiseService } from '../../services/franchiseService';
import { tournamentHubService } from '../../services/tournamentHubService';
import { ChampionshipBracket } from './ChampionshipBracket';
import { tournamentFormatService, FORMAT_TYPES } from '../../services/tournamentFormatService';
import { toast } from 'sonner';

export const TournamentDetails = ({
  tournamentId,
  onBack,
  onLaunchArena,
  onArchive,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'franchises' | 'arenas' | 'standings' | 'log' | 'settings'

  // Load tournament
  const [tournament, setTournament] = useState(() => tournamentHubService.getTournamentById(tournamentId));

  // Refresh if updated
  React.useEffect(() => {
    const handleUpdate = () => {
      setTournament(tournamentHubService.getTournamentById(tournamentId));
    };
    window.addEventListener('playzone_tournaments_updated', handleUpdate);
    return () => window.removeEventListener('playzone_tournaments_updated', handleUpdate);
  }, [tournamentId]);

  if (!tournament) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-[#222F43] border border-[#39465A] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-heading font-black text-[#F5F3EE] uppercase">
          Tournament Not Found
        </h2>
        <p className="text-xs text-[#AEB9CC]">
          The tournament requested could not be located. It may have been deleted or moved.
        </p>
        <Button variant="champagne" size="md" onClick={onBack}>
          Return to Tournament Hub
        </Button>
      </div>
    );
  }

  const {
    id,
    name,
    description,
    category,
    logo,
    themeColor = '#D4B879',
    season,
    status,
    franchiseIds = [],
    franchisesSnapshot = [],
    gameModes = [],
    auctionConfig,
    battleConfig,
    partyConfig,
    arenaState,
    progress = { percentage: 0, currentStage: 'Ready' },
    results,
    historyLog = [],
    createdAt,
    updatedAt,
  } = tournament;

  // Resolved franchises
  const franchises = useMemo(() => {
    if (franchisesSnapshot && franchisesSnapshot.length > 0) {
      return franchisesSnapshot;
    }
    return franchiseIds.map((fId) => franchiseService.getFranchiseById(fId)).filter(Boolean);
  }, [franchisesSnapshot, franchiseIds]);

  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const isPaused = status === 'paused';

  const formattedCreated = new Date(createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Resolve authoritative bracket data
  const resolvedBracketData = useMemo(() => {
    if (tournament.bracketData) return tournament.bracketData;
    if (franchises.length >= 2) {
      try {
        return tournamentFormatService.generateTournamentBracket({
          tournamentId: tournament.id,
          format: tournament.format || FORMAT_TYPES.ROUND_ROBIN,
          franchises,
          config: tournament.formatConfig || {},
        });
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [tournament, franchises]);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#AEB9CC] hover:text-[#F5F3EE] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Tournament Hub</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Broadcast Mode Action */}
          <Button
            variant="secondary"
            size="md"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('bidbattle_open_broadcast', {
                detail: { tournamentId: tournament.id, mode: isCompleted ? 'ceremony' : 'live' }
              }));
            }}
            className="flex items-center gap-2 font-heading font-black text-xs border-[#D4B879]/40 text-[#D4B879] hover:bg-[#D4B879]/15 shadow-md"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>BROADCAST MODE</span>
          </Button>

          {/* Quick Action Button */}
          <Button
            variant="champagne"
            size="md"
            onClick={() => onLaunchArena(tournament)}
            className="flex items-center gap-2 font-heading font-black text-xs shadow-md"
          >
            {isActive || isPaused ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>CONTINUE ARENA</span>
              </>
            ) : isCompleted ? (
              <>
                <Trophy className="w-3.5 h-3.5" />
                <span>VIEW ARENA PODIUM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>LAUNCH ARENA</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Hero Tournament Banner Card */}
      <div
        className="rounded-3xl p-6 sm:p-8 border bg-[#222F43] relative overflow-hidden shadow-2xl space-y-6"
        style={{
          borderColor: isActive ? '#00D9FF' : isCompleted ? '#D4B879' : '#39465A',
        }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-2"
          style={{ backgroundColor: themeColor || '#D4B879' }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-2xl border flex items-center justify-center shrink-0 font-heading font-black text-3xl shadow-xl overflow-hidden"
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

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-xs font-mono font-bold text-[#D4B879]">
                  {category}
                </span>
                {season && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#2C394C] border border-[#39465A] text-xs font-heading font-bold text-[#AEB9CC]">
                    {season}
                  </span>
                )}
                {tournament.format && (
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#00D9FF]">
                    {tournament.format.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-heading font-black tracking-wider uppercase border ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm animate-pulse'
                    : isCompleted
                    ? 'bg-[#D4B879]/15 text-[#D4B879] border-[#D4B879]/40'
                    : 'bg-sky-500/15 text-sky-400 border-sky-500/40'
                }`}>
                  {status}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-wide text-[#F5F3EE]">
                {name}
              </h1>

              <p className="text-xs text-[#AEB9CC] max-w-2xl leading-relaxed">
                {description || 'Comprehensive multi-arena tournament with independent franchise rosters, live bidding, and points standings.'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex md:flex-col items-end justify-between gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block">
                Contending Format
              </span>
              <span className="font-heading font-black text-lg sm:text-xl text-[#F5F3EE]">
                {franchises.length} Franchises
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-heading font-bold text-[#AEB9CC] uppercase block">
                Progress Status
              </span>
              <span className="font-mono font-bold text-sm text-[#00D9FF]">
                {progress.percentage || (isCompleted ? 100 : 0)}% Complete
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-[#AEB9CC]">
            <span>Current Stage: <strong className="text-[#F5F3EE]">{progress.currentStage || 'Ready'}</strong></span>
            <span>{progress.percentage || (isCompleted ? 100 : 0)}%</span>
          </div>
          <div className="w-full bg-[#111827] rounded-full h-2.5 overflow-hidden border border-[#39465A]">
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
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#222F43] border border-[#39465A] overflow-x-auto text-xs font-heading font-bold">
        {[
          { id: 'overview', label: 'Overview', icon: Trophy },
          { id: 'brackets', label: 'Fixtures & Brackets', icon: Swords },
          { id: 'franchises', label: `Franchises (${franchises.length})`, icon: Users },
          { id: 'arenas', label: 'Arenas & Stages', icon: Layers },
          { id: 'standings', label: 'Standings & Results', icon: Crown },
          { id: 'log', label: 'Activity Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#D97858] text-[#F5F3EE] font-black shadow-md'
                  : 'text-[#AEB9CC] hover:text-[#F5F3EE] hover:bg-[#2C394C]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Fixtures & Brackets */}
      {activeTab === 'brackets' && (
        <div className="space-y-6">
          <ChampionshipBracket
            tournament={tournament}
            bracketData={resolvedBracketData}
            onLaunchMatch={(match) => {
              window.dispatchEvent(new CustomEvent('playzone_launch_bracket_match', {
                detail: { tournamentId: tournament.id, matchId: match.id }
              }));
              onLaunchArena(tournament);
            }}
            isReadOnly={isCompleted}
          />
        </div>
      )}

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#222F43] border border-[#39465A] space-y-1">
              <span className="text-[10px] font-heading font-bold uppercase text-[#AEB9CC]">
                Participating Franchises
              </span>
              <div className="text-2xl font-heading font-black text-[#F5F3EE]">
                {franchises.length} Teams
              </div>
              <span className="text-[11px] text-[#AEB9CC] block">
                Independent squad rosters
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#222F43] border border-[#39465A] space-y-1">
              <span className="text-[10px] font-heading font-bold uppercase text-[#AEB9CC]">
                Active Arenas
              </span>
              <div className="text-2xl font-heading font-black text-[#00D9FF]">
                {gameModes.length} Modes
              </div>
              <span className="text-[11px] text-[#AEB9CC] block capitalize">
                {gameModes.join(', ')}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#222F43] border border-[#39465A] space-y-1">
              <span className="text-[10px] font-heading font-bold uppercase text-[#AEB9CC]">
                Starting Purse
              </span>
              <div className="text-2xl font-heading font-black text-[#D4B879]">
                ₹{auctionConfig?.defaultPurse || battleConfig?.startingPurse || 100} Cr
              </div>
              <span className="text-[11px] text-[#AEB9CC] block">
                Equal starting capital
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#222F43] border border-[#39465A] space-y-1">
              <span className="text-[10px] font-heading font-bold uppercase text-[#AEB9CC]">
                Created On
              </span>
              <div className="text-2xl font-heading font-black text-[#F5F3EE]">
                {formattedCreated}
              </div>
              <span className="text-[11px] text-[#AEB9CC] block">
                Self-contained persistence
              </span>
            </div>
          </div>

          {/* Champion Highlight if Completed */}
          {isCompleted && results?.championTeamName && (
            <div className="p-6 rounded-3xl bg-[#D4B879]/10 border border-[#D4B879]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{results.championLogo || '👑'}</span>
                <div>
                  <span className="text-xs font-heading font-black uppercase tracking-wider text-[#D4B879]">
                    Official Tournament Champion
                  </span>
                  <h3 className="text-2xl font-heading font-black text-[#F5F3EE]">
                    {results.championTeamName}
                  </h3>
                  {results.summaryNotes && (
                    <p className="text-xs text-[#AEB9CC] mt-0.5">{results.summaryNotes}</p>
                  )}
                </div>
              </div>

              {results.finalScores && results.championTeamId && (
                <div className="px-5 py-2.5 rounded-2xl bg-[#111827] border border-[#D4B879]/50 text-center">
                  <span className="text-[10px] font-heading font-bold uppercase text-[#AEB9CC] block">
                    Championship Score
                  </span>
                  <span className="text-2xl font-mono font-black text-[#D4B879]">
                    {results.finalScores[results.championTeamId] || 0} PTS
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Participating Contenders Preview */}
          <div className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-black text-base text-[#F5F3EE] uppercase tracking-wide flex items-center gap-2">
                <Users className="w-4 h-4 text-[#D4B879]" />
                <span>Contending Franchises</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveTab('franchises')}
                className="text-xs font-heading font-bold text-[#D4B879] hover:underline"
              >
                View Full Squads →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {franchises.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#39465A] flex items-center gap-3 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 bottom-0 w-1.5"
                    style={{ backgroundColor: f.color }}
                  />
                  <div
                    className="w-10 h-10 rounded-xl border flex items-center justify-center font-heading font-black text-base shrink-0"
                    style={{
                      backgroundColor: f.color,
                      color: franchiseService.getContrastTextColor(f.color),
                    }}
                  >
                    {f.logo && !f.logo.startsWith('http') && !f.logo.startsWith('data:') ? (
                      <span>{f.logo}</span>
                    ) : (
                      <span>{f.shortName || f.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-heading font-black text-sm text-[#F5F3EE] truncate">
                      {f.name}
                    </h4>
                    <span className="text-[11px] text-[#AEB9CC] truncate block">
                      @{f.owner || f.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Franchises & Squads */}
      {activeTab === 'franchises' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {franchises.map((f) => {
              // Extract squad items from arenaState if available
              const auctionTeam = arenaState?.auction?.teams?.find((t) => t.id === f.id);
              const battleTeam = arenaState?.battle?.teams?.find((t) => t.id === f.id);
              const squad = auctionTeam?.itemsPurchased || battleTeam?.squad || [];
              const currentPurse = auctionTeam?.purse != null ? auctionTeam.purse : battleTeam?.purse != null ? battleTeam.purse : f.initialPurse || 100;

              return (
                <div
                  key={f.id}
                  className="rounded-3xl bg-[#222F43] border border-[#39465A] p-5 space-y-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: f.color }} />

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl border flex items-center justify-center font-heading font-black text-xl shrink-0"
                        style={{
                          backgroundColor: f.color,
                          color: franchiseService.getContrastTextColor(f.color),
                        }}
                      >
                        {f.logo && !f.logo.startsWith('http') && !f.logo.startsWith('data:') ? (
                          <span>{f.logo}</span>
                        ) : (
                          <span>{f.shortName || f.name.slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-lg text-[#F5F3EE]" style={{ color: f.color }}>
                          {f.name}
                        </h4>
                        <span className="text-xs text-[#AEB9CC]">Owner: {f.owner || f.name}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-heading uppercase text-[#AEB9CC] block font-bold">
                        Remaining Purse
                      </span>
                      <span className="font-mono font-black text-base text-[#00D9FF]">
                        ₹{currentPurse} Cr
                      </span>
                    </div>
                  </div>

                  {/* Acquired Squad */}
                  <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-heading font-bold text-[#AEB9CC]">
                      <span>Acquired Roster ({squad.length} Lots)</span>
                      <span>Target: {auctionConfig?.maxSquadSize || battleConfig?.squadSize || 5}</span>
                    </div>

                    {squad.length === 0 ? (
                      <p className="text-xs text-[#AEB9CC]/60 italic py-2 text-center">
                        No lots acquired yet. Squad will populate during live auction.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {squad.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-xl bg-[#222F43] border border-[#39465A] flex items-center justify-between text-xs"
                          >
                            <span className="font-heading font-bold text-[#F5F3EE] truncate">
                              {item.name}
                            </span>
                            <span className="font-mono text-[#D4B879] font-bold">
                              ₹{item.soldPrice || item.price || 0} Cr
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Arenas & Stages */}
      {activeTab === 'arenas' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auction Arena */}
            {gameModes.includes('auction') && (
              <div className="rounded-3xl bg-[#222F43] border border-[#00D9FF]/40 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Gavel className="w-8 h-8 text-[#00D9FF]" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#00D9FF]/15 text-[#00D9FF] border border-[#00D9FF]/40">
                      STAGE 1
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-[#F5F3EE]">Auction Arena</h3>
                  <p className="text-xs text-[#AEB9CC] leading-relaxed">
                    High stakes bidding with progressive increments, anti-self bidding safeguards, and squad slot settlement.
                  </p>
                  <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] text-xs space-y-1 text-[#AEB9CC]">
                    <div>Purse: <strong className="text-[#F5F3EE]">₹{auctionConfig?.defaultPurse || 100} Cr</strong></div>
                    <div>Max Squad: <strong className="text-[#F5F3EE]">{auctionConfig?.maxSquadSize || 5} Superstars</strong></div>
                    <div>Countdown: <strong className="text-[#F5F3EE]">{auctionConfig?.timerDuration || 20}s</strong></div>
                  </div>
                </div>

                <Button
                  variant="champagne"
                  size="md"
                  onClick={() => onLaunchArena(tournament)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Auction Stage</span>
                </Button>
              </div>
            )}

            {/* Battle Arena */}
            {gameModes.includes('battle') && (
              <div className="rounded-3xl bg-[#222F43] border border-[#FF8A35]/40 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Swords className="w-8 h-8 text-[#FF8A35]" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#FF8A35]/15 text-[#FF8A35] border border-[#FF8A35]/40">
                      STAGE 2
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-[#F5F3EE]">Battle Arena</h3>
                  <p className="text-xs text-[#AEB9CC] leading-relaxed">
                    Round-robin tactical draft and head-to-head combat matches evaluated by the deterministic battle engine.
                  </p>
                  <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] text-xs space-y-1 text-[#AEB9CC]">
                    <div>Squad Size: <strong className="text-[#F5F3EE]">{battleConfig?.squadSize || 3} Lots</strong></div>
                    <div>Scoring: <strong className="text-[#F5F3EE]">Win: 3 | Draw: 1 | Loss: 0</strong></div>
                    <div>Schedule: <strong className="text-[#F5F3EE]">Equal Round-Robin</strong></div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onLaunchArena(tournament)}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF8A35] hover:bg-[#e77a28] text-white"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Launch Battle Arena</span>
                </Button>
              </div>
            )}

            {/* Party Arena */}
            {gameModes.includes('party') && (
              <div className="rounded-3xl bg-[#222F43] border border-[#9147FF]/40 p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Gamepad2 className="w-8 h-8 text-[#9147FF]" />
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-heading font-bold bg-[#9147FF]/15 text-[#9147FF] border border-[#9147FF]/40">
                      PARTY
                    </span>
                  </div>
                  <h3 className="font-heading font-black text-xl text-[#F5F3EE]">Party Arena</h3>
                  <p className="text-xs text-[#AEB9CC] leading-relaxed">
                    Local pass-and-play party party games with custom time limits and live scoring.
                  </p>
                  <div className="p-3 rounded-2xl bg-[#111827] border border-[#39465A] text-xs space-y-1 text-[#AEB9CC]">
                    <div>Games: <strong className="text-[#F5F3EE]">Dumb Charades, Who Am I?</strong></div>
                    <div>Timer: <strong className="text-[#F5F3EE]">{partyConfig?.roundDuration || 60}s</strong></div>
                    <div>Rounds: <strong className="text-[#F5F3EE]">{partyConfig?.totalRounds || 5}</strong></div>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => onLaunchArena(tournament)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Open Party Arena</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Standings & Results */}
      {activeTab === 'standings' && (
        <div className="space-y-6">
          {/* Points Table / Leaderboard */}
          <div className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 space-y-4">
            <h3 className="font-heading font-black text-lg text-[#F5F3EE] uppercase tracking-wide flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#D4B879]" />
              <span>Official Tournament Standings</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#39465A] text-[#AEB9CC] font-heading uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Rank</th>
                    <th className="py-3 px-3">Franchise</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3 text-right">Points / Score</th>
                    <th className="py-3 px-3 text-right">Remaining Purse</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#39465A]/40 font-mono">
                  {franchises.map((f, idx) => {
                    const score = results?.finalScores?.[f.id] || (100 - idx * 15);
                    return (
                      <tr key={f.id} className="hover:bg-[#2C394C]/40 transition-colors">
                        <td className="py-3 px-3 font-heading font-black text-sm text-[#F5F3EE]">
                          {idx === 0 ? '🥇 1st' : idx === 1 ? '🥈 2nd' : idx === 2 ? '🥉 3rd' : `${idx + 1}th`}
                        </td>
                        <td className="py-3 px-3 font-heading font-black text-sm flex items-center gap-2" style={{ color: f.color }}>
                          <span>{f.logo || '🛡️'}</span>
                          <span>{f.name}</span>
                        </td>
                        <td className="py-3 px-3 text-[#AEB9CC] font-heading font-bold">
                          @{f.owner || f.name}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-sm text-[#D4B879]">
                          {score} PTS
                        </td>
                        <td className="py-3 px-3 text-right text-[#00D9FF] font-bold">
                          ₹{f.initialPurse || 100} Cr
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Activity Log */}
      {activeTab === 'log' && (
        <div className="rounded-3xl bg-[#222F43] border border-[#39465A] p-6 space-y-4">
          <h3 className="font-heading font-black text-lg text-[#F5F3EE] uppercase tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-[#D4B879]" />
            <span>Tournament History & Audit Log</span>
          </h3>

          <div className="space-y-3">
            {historyLog.length === 0 ? (
              <p className="text-xs text-[#AEB9CC] italic py-4 text-center">
                No activity recorded yet.
              </p>
            ) : (
              [...historyLog].reverse().map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl bg-[#111827] border border-[#39465A] flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="font-heading font-black text-xs text-[#F5F3EE] block">
                      {entry.event}
                    </span>
                    {entry.details && (
                      <p className="text-xs text-[#AEB9CC]">{entry.details}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-[#AEB9CC] shrink-0">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(entry.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
