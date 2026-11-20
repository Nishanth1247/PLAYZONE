import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Swords, 
  Shield, 
  Layers, 
  Crown, 
  CheckCircle2, 
  Clock, 
  Play, 
  Lock, 
  Sparkles, 
  ArrowRight,
  Filter,
  List,
  Grid,
  Zap,
  RotateCcw
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FORMAT_TYPES, FORMAT_METADATA } from '../../services/tournamentFormatService';

export const ChampionshipBracket = ({
  tournament,
  bracketData,
  onLaunchMatch,
  isReadOnly = false,
}) => {
  const [viewMode, setViewMode] = useState('bracket'); // 'bracket' | 'list'
  const [stageFilter, setStageFilter] = useState('all'); // 'all' | stageId

  if (!bracketData || !bracketData.stages || bracketData.stages.length === 0) {
    return (
      <div className="p-8 text-center bg-[#222F43] border border-[#39465A] rounded-3xl space-y-3">
        <Trophy className="w-10 h-10 text-[#D4B879] mx-auto opacity-70" />
        <h3 className="text-base font-heading font-black text-[#F5F3EE] uppercase">
          No Bracket Generated
        </h3>
        <p className="text-xs text-[#AEB9CC] max-w-md mx-auto">
          This tournament does not have an active bracket structure. Please launch the tournament from the Tournament Hub to initialize fixtures.
        </p>
      </div>
    );
  }

  const format = bracketData.format || FORMAT_TYPES.ROUND_ROBIN;
  const meta = FORMAT_METADATA[format] || FORMAT_METADATA[FORMAT_TYPES.ROUND_ROBIN];

  // Match statistics
  const allMatches = useMemo(() => {
    return bracketData.stages.flatMap((s) => s.matches || []);
  }, [bracketData]);

  const completedCount = allMatches.filter((m) => m.status === 'completed').length;
  const readyMatches = allMatches.filter((m) => m.status === 'ready');
  const totalPlayableCount = allMatches.filter((m) => !m.autoBye && !m.isConditionalReset).length;
  const percentComplete = totalPlayableCount > 0 ? Math.round((completedCount / totalPlayableCount) * 100) : 0;

  // Next available match to play
  const nextPlayableMatch = readyMatches[0] || null;

  return (
    <div className="space-y-6">
      {/* Format Header & Progress Bar */}
      <div className="p-5 rounded-3xl bg-[#222F43] border border-[#39465A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-[#39465A] flex items-center justify-center text-[#D4B879] shadow-inner font-heading font-black">
              {format === FORMAT_TYPES.SINGLE_ELIMINATION ? (
                <Swords className="w-5 h-5 text-[#00D9FF]" />
              ) : format === FORMAT_TYPES.DOUBLE_ELIMINATION ? (
                <Shield className="w-5 h-5 text-[#FF8A35]" />
              ) : format === FORMAT_TYPES.GROUP_STAGE_KNOCKOUT ? (
                <Layers className="w-5 h-5 text-[#B7F34A]" />
              ) : (
                <Trophy className="w-5 h-5 text-[#D4B879]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-heading font-black text-[#F5F3EE] tracking-wide uppercase">
                  {meta.name}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#111827] text-[#D4B879] border border-[#39465A]">
                  {meta.badge}
                </span>
                {bracketData.championId && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-[#D4B879] border border-[#D4B879]/40 flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>CHAMPION DECIDED</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[#AEB9CC] mt-0.5">
                {meta.shortDescription}
              </p>
            </div>
          </div>

          {/* Quick Action: Play Next Ready Match */}
          {nextPlayableMatch && !isReadOnly && (
            <Button
              variant="champagne"
              size="md"
              onClick={() => onLaunchMatch?.(nextPlayableMatch)}
              className="flex items-center gap-2 font-heading font-black text-xs shadow-lg animate-pulse"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY NEXT MATCH ({nextPlayableMatch.roundName || `Match ${nextPlayableMatch.matchNumber}`})</span>
            </Button>
          )}
        </div>

        {/* Progress Telemetry Bar */}
        <div className="space-y-1.5 pt-2 border-t border-[#39465A]/50">
          <div className="flex items-center justify-between text-xs font-mono text-[#AEB9CC]">
            <span>Completed Matches: <strong className="text-[#F5F3EE]">{completedCount}</strong> of <strong className="text-[#F5F3EE]">{totalPlayableCount}</strong></span>
            <span className="font-bold text-[#D4B879]">{percentComplete}% Complete</span>
          </div>
          <div className="w-full bg-[#111827] rounded-full h-2 overflow-hidden border border-[#39465A]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00D9FF] via-[#D4B879] to-[#B7F34A] transition-all duration-500"
              style={{ width: `${Math.max(4, Math.min(100, percentComplete))}%` }}
            />
          </div>
        </div>

        {/* Controls Toolbar: View Mode Toggle & Filters */}
        <div className="flex items-center justify-between gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#AEB9CC] font-heading font-bold text-[11px] uppercase hidden sm:inline">
              Layout View:
            </span>
            <div className="flex items-center p-0.5 rounded-xl bg-[#111827] border border-[#39465A]">
              <button
                type="button"
                onClick={() => setViewMode('bracket')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-heading text-xs font-bold transition-all ${
                  viewMode === 'bracket'
                    ? 'bg-[#2C394C] text-[#F5F3EE] shadow-sm'
                    : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Interactive Bracket</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-heading text-xs font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-[#2C394C] text-[#F5F3EE] shadow-sm'
                    : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Fixture List</span>
              </button>
            </div>
          </div>

          {/* Stage Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[#AEB9CC] font-heading font-bold text-[11px] uppercase hidden sm:inline">
              Filter Stage:
            </span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              aria-label="Filter tournament stages"
              className="px-2.5 py-1 rounded-xl bg-[#111827] border border-[#39465A] text-xs font-mono font-bold text-[#F5F3EE] focus:outline-none focus:border-[#D4B879]"
            >
              <option value="all">All Stages ({bracketData.stages.length})</option>
              {bracketData.stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Podium Showcase Card (When Champion Decided) */}
      {bracketData.championId && (
        <PodiumBanner bracketData={bracketData} tournament={tournament} />
      )}

      {/* Main Visual Content: Bracket or List View */}
      {viewMode === 'list' ? (
        <FixtureListView
          stages={bracketData.stages}
          stageFilter={stageFilter}
          onLaunchMatch={onLaunchMatch}
          isReadOnly={isReadOnly}
        />
      ) : format === FORMAT_TYPES.ROUND_ROBIN ? (
        <LeagueBracketView
          bracketData={bracketData}
          onLaunchMatch={onLaunchMatch}
          isReadOnly={isReadOnly}
        />
      ) : format === FORMAT_TYPES.GROUP_STAGE_KNOCKOUT ? (
        <GroupStageBracketView
          bracketData={bracketData}
          stageFilter={stageFilter}
          onLaunchMatch={onLaunchMatch}
          isReadOnly={isReadOnly}
        />
      ) : format === FORMAT_TYPES.DOUBLE_ELIMINATION ? (
        <DoubleEliminationBracketView
          bracketData={bracketData}
          stageFilter={stageFilter}
          onLaunchMatch={onLaunchMatch}
          isReadOnly={isReadOnly}
        />
      ) : (
        <SingleEliminationBracketView
          bracketData={bracketData}
          stageFilter={stageFilter}
          onLaunchMatch={onLaunchMatch}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * PODIUM BANNER (Champion, Runner-Up & 3rd Place)
 * ----------------------------------------------------------------------------------
 */
const PodiumBanner = ({ bracketData, tournament }) => {
  const franchises = tournament?.franchisesSnapshot || [];
  const champion = franchises.find((f) => f.id === bracketData.championId) || { name: 'Champion' };
  const runnerUp = franchises.find((f) => f.id === bracketData.runnerUpId) || null;
  const thirdPlace = franchises.find((f) => f.id === bracketData.thirdPlaceId) || null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-r from-[#222F43] via-[#2C394C] to-[#222F43] border-2 border-[#D4B879]/70 shadow-2xl relative overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#111827] border-2 border-[#D4B879] flex items-center justify-center text-3xl font-heading shadow-xl">
            {champion.logo || '👑'}
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold uppercase text-[#D4B879] tracking-widest block">
              TOURNAMENT CHAMPION CROWNED
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
              {champion.name}
            </h2>
            <p className="text-xs text-[#AEB9CC] mt-0.5">
              Victorious across all tournament stages and championship finals!
            </p>
          </div>
        </div>

        {/* Podium Places */}
        <div className="flex items-center gap-3">
          {runnerUp && (
            <div className="px-4 py-2.5 rounded-2xl bg-[#111827]/80 border border-[#39465A] text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">
                2nd Place (Silver)
              </span>
              <span className="text-xs font-heading font-black text-[#F5F3EE] block">
                {runnerUp.name}
              </span>
            </div>
          )}

          {thirdPlace && (
            <div className="px-4 py-2.5 rounded-2xl bg-[#111827]/80 border border-[#39465A] text-center">
              <span className="text-[10px] font-mono font-bold uppercase text-[#D97858] block">
                3rd Place (Bronze)
              </span>
              <span className="text-xs font-heading font-black text-[#F5F3EE] block">
                {thirdPlace.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * 1. SINGLE ELIMINATION BRACKET VIEW
 * Column-based bracket tree with connectors
 * ----------------------------------------------------------------------------------
 */
const SingleEliminationBracketView = ({
  bracketData,
  stageFilter,
  onLaunchMatch,
  isReadOnly,
}) => {
  const filteredStages = useMemo(() => {
    if (stageFilter === 'all') return bracketData.stages;
    return bracketData.stages.filter((s) => s.id === stageFilter);
  }, [bracketData.stages, stageFilter]);

  return (
    <div className="overflow-x-auto pb-6">
      <div className="min-w-[750px] flex items-start gap-8">
        {filteredStages.map((stage, stageIdx) => (
          <div key={stage.id} className="flex-1 space-y-4">
            {/* Stage Header */}
            <div className="sticky top-0 z-10 px-3 py-2 rounded-xl bg-[#222F43] border border-[#39465A] shadow-md flex items-center justify-between">
              <div>
                <h4 className="text-xs font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
                  {stage.name}
                </h4>
                <span className="text-[10px] font-mono text-[#AEB9CC]">
                  {stage.matches.filter((m) => m.status === 'completed').length} / {stage.matches.length} Settled
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                  stage.status === 'completed'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : stage.status === 'active'
                    ? 'bg-[#00D9FF]/20 text-[#00D9FF] border border-[#00D9FF]/40 animate-pulse'
                    : 'bg-[#111827] text-[#AEB9CC] border border-[#39465A]'
                }`}
              >
                {stage.status}
              </span>
            </div>

            {/* Matches in this Round */}
            <div className="space-y-4">
              {stage.matches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onLaunchMatch={onLaunchMatch}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * 2. DOUBLE ELIMINATION BRACKET VIEW
 * Separates Winners Bracket, Losers Bracket, and Grand Final
 * ----------------------------------------------------------------------------------
 */
const DoubleEliminationBracketView = ({
  bracketData,
  stageFilter,
  onLaunchMatch,
  isReadOnly,
}) => {
  const wbStages = bracketData.stages.filter((s) => s.type === 'winners_knockout');
  const lbStages = bracketData.stages.filter((s) => s.type === 'losers_knockout');
  const gfStage = bracketData.stages.find((s) => s.type === 'grand_final');

  return (
    <div className="space-y-8 overflow-x-auto pb-6">
      {/* 1. Winners Bracket Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#39465A] pb-2">
          <Trophy className="w-4 h-4 text-[#D4B879]" />
          <h4 className="text-sm font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
            Winners Bracket (Upper Bracket • 0 Defeats)
          </h4>
        </div>
        <div className="min-w-[700px] flex items-start gap-6">
          {wbStages.map((stage) => (
            <div key={stage.id} className="flex-1 space-y-3">
              <div className="px-2.5 py-1.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[11px] font-heading font-bold text-[#D4B879] uppercase">
                {stage.name}
              </div>
              <div className="space-y-3">
                {stage.matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onLaunchMatch={onLaunchMatch}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Losers Bracket Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-[#39465A] pb-2">
          <Shield className="w-4 h-4 text-[#FF8A35]" />
          <h4 className="text-sm font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
            Losers Bracket (Lower Bracket • 1 Defeat • Elimination on Loss)
          </h4>
        </div>
        <div className="min-w-[700px] flex items-start gap-6">
          {lbStages.map((stage) => (
            <div key={stage.id} className="flex-1 space-y-3">
              <div className="px-2.5 py-1.5 rounded-lg bg-[#222F43] border border-[#39465A] text-[11px] font-heading font-bold text-[#FF8A35] uppercase">
                {stage.name}
              </div>
              <div className="space-y-3">
                {stage.matches.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onLaunchMatch={onLaunchMatch}
                    isReadOnly={isReadOnly}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Grand Final Section */}
      {gfStage && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D4B879]/50 pb-2">
            <Crown className="w-4 h-4 text-[#D4B879]" />
            <h4 className="text-sm font-heading font-black text-[#D4B879] uppercase tracking-wide">
              Championship Grand Final & Reset Stage
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            {gfStage.matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onLaunchMatch={onLaunchMatch}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * 3. GROUP STAGE + KNOCKOUT VIEW
 * Displays Group tables with standings, followed by Knockout bracket
 * ----------------------------------------------------------------------------------
 */
const GroupStageBracketView = ({
  bracketData,
  stageFilter,
  onLaunchMatch,
  isReadOnly,
}) => {
  const groups = bracketData.groups || {};
  const knockoutStages = bracketData.stages.filter((s) => s.type === 'knockout');

  return (
    <div className="space-y-8">
      {/* 1. Group Tables Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#39465A] pb-2">
          <Layers className="w-4 h-4 text-[#B7F34A]" />
          <h4 className="text-sm font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
            Group Stage Tables & Standings
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groups).map(([letter, grp]) => (
            <div key={letter} className="p-4 rounded-2xl bg-[#222F43] border border-[#39465A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-heading font-black text-sm text-[#F5F3EE] uppercase">
                  {grp.name}
                </span>
                <span className="text-[10px] font-mono text-[#AEB9CC]">
                  Top {bracketData.formatConfig?.qualifyCountPerGroup || 2} Advance
                </span>
              </div>

              {/* Group Standings Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#39465A] text-[#AEB9CC] text-[10px]">
                      <th className="py-1 px-1.5">#</th>
                      <th className="py-1 px-1.5">Franchise</th>
                      <th className="py-1 px-1 text-center">P</th>
                      <th className="py-1 px-1 text-center">W</th>
                      <th className="py-1 px-1 text-center">D</th>
                      <th className="py-1 px-1 text-center">L</th>
                      <th className="py-1 px-1 text-center">GD</th>
                      <th className="py-1 px-1.5 text-right font-bold text-[#F5F3EE]">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grp.standings.map((s, idx) => {
                      const isQual = idx < (bracketData.formatConfig?.qualifyCountPerGroup || 2);
                      return (
                        <tr
                          key={s.id}
                          className={`border-b border-[#39465A]/40 transition-colors ${
                            isQual ? 'bg-emerald-500/10' : ''
                          }`}
                        >
                          <td className="py-2 px-1.5 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-1.5 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="font-sans font-bold text-[#F5F3EE] truncate max-w-[120px]">
                              {s.name}
                            </span>
                            {isQual && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                QUAL
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-1 text-center text-[#AEB9CC]">{s.played}</td>
                          <td className="py-2 px-1 text-center text-[#AEB9CC]">{s.won}</td>
                          <td className="py-2 px-1 text-center text-[#AEB9CC]">{s.drawn}</td>
                          <td className="py-2 px-1 text-center text-[#AEB9CC]">{s.lost}</td>
                          <td className="py-2 px-1 text-center text-[#AEB9CC]">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                          <td className="py-2 px-1.5 text-right font-bold text-[#D4B879]">{s.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Group Round Robin Fixtures */}
      <div className="space-y-3">
        <h4 className="text-xs font-heading font-black text-[#AEB9CC] uppercase tracking-wide">
          Group Round Robin Fixtures
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bracketData.stages
            .filter((s) => s.type === 'group_stage')
            .flatMap((s) => s.matches)
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onLaunchMatch={onLaunchMatch}
                isReadOnly={isReadOnly}
              />
            ))}
        </div>
      </div>

      {/* 3. Linked Knockout Stage */}
      {knockoutStages.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-[#39465A]">
          <div className="flex items-center gap-2 border-b border-[#39465A] pb-2">
            <Swords className="w-4 h-4 text-[#00D9FF]" />
            <h4 className="text-sm font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
              Championship Knockout Stage
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {knockoutStages.map((stage) => (
              <div key={stage.id} className="space-y-3">
                <span className="text-xs font-heading font-bold text-[#D4B879] uppercase block">
                  {stage.name}
                </span>
                <div className="space-y-3">
                  {stage.matches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      onLaunchMatch={onLaunchMatch}
                      isReadOnly={isReadOnly}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * 4. LEAGUE / ROUND ROBIN BRACKET VIEW
 * Full standings table + round-by-round fixture cards
 * ----------------------------------------------------------------------------------
 */
const LeagueBracketView = ({ bracketData, onLaunchMatch, isReadOnly }) => {
  const standings = bracketData.standings || [];
  const matches = bracketData.stages[0]?.matches || [];

  return (
    <div className="space-y-8">
      {/* Standings Table */}
      <div className="p-5 rounded-3xl bg-[#222F43] border border-[#39465A] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#D4B879]" />
            <h4 className="text-sm font-heading font-black text-[#F5F3EE] uppercase tracking-wide">
              League Standings Table (3-1-0 Points System)
            </h4>
          </div>
          <span className="text-xs font-mono text-[#AEB9CC]">
            Win: 3 pts • Draw: 1 pt • Loss: 0 pts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#39465A] text-[#AEB9CC] text-[11px]">
                <th className="py-2 px-3">Pos</th>
                <th className="py-2 px-3">Franchise</th>
                <th className="py-2 px-2 text-center">Played</th>
                <th className="py-2 px-2 text-center">Won</th>
                <th className="py-2 px-2 text-center">Drawn</th>
                <th className="py-2 px-2 text-center">Lost</th>
                <th className="py-2 px-2 text-center">Score For</th>
                <th className="py-2 px-2 text-center">Score Against</th>
                <th className="py-2 px-2 text-center">Diff</th>
                <th className="py-2 px-3 text-right font-bold text-[#F5F3EE]">Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr
                  key={s.id}
                  className={`border-b border-[#39465A]/40 transition-colors ${
                    idx === 0 ? 'bg-[#D4B879]/10' : idx === 1 ? 'bg-[#00D9FF]/5' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-[#F5F3EE]">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="font-sans font-bold text-[#F5F3EE]">
                      {s.name}
                    </span>
                    {idx === 0 && (
                      <Crown className="w-3.5 h-3.5 text-[#D4B879]" />
                    )}
                  </td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.played}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.won}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.drawn}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.lost}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.goalsFor}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">{s.goalsAgainst}</td>
                  <td className="py-2.5 px-2 text-center text-[#AEB9CC]">
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-sm text-[#D4B879]">
                    {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Round-by-Round Fixture Cards */}
      <div className="space-y-4">
        <h4 className="text-xs font-heading font-black text-[#AEB9CC] uppercase tracking-wide">
          League Fixtures & Results
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              onLaunchMatch={onLaunchMatch}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * 5. COMPACT FIXTURE LIST VIEW (Mobile friendly alternative)
 * ----------------------------------------------------------------------------------
 */
const FixtureListView = ({ stages, stageFilter, onLaunchMatch, isReadOnly }) => {
  const filtered = useMemo(() => {
    if (stageFilter === 'all') return stages;
    return stages.filter((s) => s.id === stageFilter);
  }, [stages, stageFilter]);

  return (
    <div className="space-y-6">
      {filtered.map((stage) => (
        <div key={stage.id} className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#39465A] pb-2">
            <h4 className="text-xs font-heading font-black text-[#D4B879] uppercase tracking-wide">
              {stage.name}
            </h4>
            <span className="text-[10px] font-mono text-[#AEB9CC]">
              {stage.matches.filter((m) => m.status === 'completed').length} / {stage.matches.length} Finished
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stage.matches.map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                onLaunchMatch={onLaunchMatch}
                isReadOnly={isReadOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * ----------------------------------------------------------------------------------
 * REUSABLE MATCH CARD COMPONENT
 * Renders team logos, colors, status badges, scores, and launch actions
 * ----------------------------------------------------------------------------------
 */
export const MatchCard = ({ match, onLaunchMatch, isReadOnly = false }) => {
  const isCompleted = match.status === 'completed';
  const isReady = match.status === 'ready';
  const isPending = match.status === 'pending';
  const isUnneeded = match.status === 'unneeded';
  const isBye = match.autoBye;

  const winnerA = isCompleted && match.winnerId === match.teamAId;
  const winnerB = isCompleted && match.winnerId === match.teamBId;

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden shadow-md ${
        isCompleted
          ? 'bg-[#1C2636] border-[#39465A]'
          : isReady
          ? 'bg-[#222F43] border-[#00D9FF]/60 hover:border-[#00D9FF] hover:shadow-lg'
          : isUnneeded
          ? 'bg-[#111827]/60 border-[#39465A]/40 opacity-50'
          : 'bg-[#182232] border-[#39465A]/60 opacity-80'
      }`}
    >
      {/* Top Match Header */}
      <div className="flex items-center justify-between text-[10px] font-mono mb-2.5 pb-1.5 border-b border-[#39465A]/50">
        <span className="text-[#AEB9CC] font-bold">
          {match.roundName || `Match ${match.matchNumber}`}
          {match.groupName ? ` • ${match.groupName}` : ''}
        </span>
        <span
          className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
            isCompleted
              ? 'bg-emerald-500/20 text-emerald-400'
              : isReady
              ? 'bg-[#00D9FF]/20 text-[#00D9FF] animate-pulse'
              : isBye
              ? 'bg-[#D4B879]/20 text-[#D4B879]'
              : 'bg-[#111827] text-[#AEB9CC]'
          }`}
        >
          {isBye ? 'BYE ADVANCE' : match.status}
        </span>
      </div>

      {/* Team A Row */}
      <div className={`flex items-center justify-between p-2 rounded-xl mb-1.5 transition-colors ${
        winnerA ? 'bg-emerald-500/15 border border-emerald-500/40 font-black' : 'bg-[#111827]/70'
      }`}>
        <div className="flex items-center gap-2 truncate pr-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: match.teamAColor || '#39465A' }}
          />
          <span className="text-sm font-sans font-bold text-[#F5F3EE] truncate">
            {match.teamAName || 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted && (
            <span className={`font-mono font-black text-sm ${winnerA ? 'text-emerald-400' : 'text-[#AEB9CC]'}`}>
              {match.teamAScore}
            </span>
          )}
          {winnerA && (
            <Crown className="w-3.5 h-3.5 text-[#D4B879]" />
          )}
        </div>
      </div>

      {/* Team B Row */}
      <div className={`flex items-center justify-between p-2 rounded-xl mb-2.5 transition-colors ${
        winnerB ? 'bg-emerald-500/15 border border-emerald-500/40 font-black' : 'bg-[#111827]/70'
      }`}>
        <div className="flex items-center gap-2 truncate pr-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{ backgroundColor: match.teamBColor || '#39465A' }}
          />
          <span className="text-sm font-sans font-bold text-[#F5F3EE] truncate">
            {match.teamBName || 'TBD'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {isCompleted && (
            <span className={`font-mono font-black text-sm ${winnerB ? 'text-emerald-400' : 'text-[#AEB9CC]'}`}>
              {match.teamBScore}
            </span>
          )}
          {winnerB && (
            <Crown className="w-3.5 h-3.5 text-[#D4B879]" />
          )}
        </div>
      </div>

      {/* Footer / Match Actions */}
      {isReady && !isReadOnly && (
        <Button
          variant="champagne"
          size="sm"
          onClick={() => onLaunchMatch?.(match)}
          className="w-full flex items-center justify-center gap-1.5 font-heading font-black text-xs py-1.5 shadow-md hover:scale-[1.01]"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>PLAY BATTLE CLASH</span>
        </Button>
      )}

      {isPending && (
        <div className="text-[10px] font-mono text-center text-[#AEB9CC] flex items-center justify-center gap-1 py-1">
          <Lock className="w-3 h-3" />
          <span>Prerequisites Locked</span>
        </div>
      )}

      {isUnneeded && (
        <div className="text-[10px] font-mono text-center text-[#AEB9CC] py-1 italic">
          Unneeded Match
        </div>
      )}
    </div>
  );
};
