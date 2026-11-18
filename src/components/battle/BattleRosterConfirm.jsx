import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Swords, 
  ArrowRight, 
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useBattleArena } from '../../context/BattleArenaContext';

export const BattleRosterConfirm = () => {
  const {
    battleState,
    reAuctionUnsoldLots,
    startRound2Battles,
    resetBattleTournament,
  } = useBattleArena();

  const { teams, squadSize, tournamentName, unsoldPool } = battleState;

  const allComplete = teams.every((t) => t.squad.length === squadSize);
  const anyIncomplete = teams.some((t) => t.squad.length < squadSize);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Title Card */}
      <div className="text-center rounded-3xl battle-panel p-6 sm:p-8 border border-brand-orange/40 shadow-2xl relative overflow-hidden space-y-3">
        <Badge variant="orange" className="font-mono text-xs uppercase">
          Auction Concluded • Roster Validation
        </Badge>
        <h2 className="font-broadcast text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
          Team Roster Confirmation
        </h2>
        <p className="text-xs sm:text-sm text-battle-muted max-w-xl mx-auto">
          Every participating team must finish Round 1 with exactly <strong className="text-white">{squadSize} acquired players</strong> before Round 2 battles can commence.
        </p>
      </div>

      {/* Team Roster Status Table */}
      <div className="rounded-3xl battle-panel border border-battle-border overflow-hidden shadow-xl">
        <div className="p-4 bg-battle-surface border-b border-battle-border flex items-center justify-between">
          <span className="font-broadcast font-bold text-xs uppercase tracking-wider text-battle-muted flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" />
            <span>Participating Franchises ({teams.length})</span>
          </span>
          <span className="text-xs font-mono font-bold text-brand-neon">
            Required: {squadSize} / Team
          </span>
        </div>

        <div className="divide-y divide-battle-border/60">
          {teams.map((t) => {
            const count = t.squad.length;
            const isReady = count === squadSize;
            const isShort = count < squadSize;

            return (
              <div
                key={t.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-battle-bg/50 hover:bg-battle-surface/40 transition-colors"
              >
                {/* Team Info */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.logo}
                  </span>
                  <div>
                    <h4 className="font-broadcast font-bold text-base text-white">
                      {t.name}
                    </h4>
                    <span className="text-[11px] font-mono text-battle-muted">
                      Purse Left: ₹{t.purse} Cr
                    </span>
                  </div>
                </div>

                {/* Acquired Lots Preview (Names without ratings) */}
                <div className="flex-1 flex flex-wrap gap-1.5 max-w-md">
                  {t.squad.map((player) => (
                    <span
                      key={player.id}
                      className="px-2.5 py-1 rounded-lg bg-battle-surface border border-battle-border text-xs font-mono text-white truncate max-w-[130px]"
                      title={player.name}
                    >
                      {player.name}
                    </span>
                  ))}
                  {isShort && (
                    <span className="px-2.5 py-1 rounded-lg border border-dashed border-rose-500/50 bg-rose-950/20 text-rose-300 text-xs font-mono">
                      +{squadSize - count} Slot(s) Needed
                    </span>
                  )}
                </div>

                {/* Status Column */}
                <div className="text-right flex-shrink-0 flex items-center gap-3">
                  <div>
                    <span className={`font-mono text-lg font-black block ${isReady ? 'text-brand-neon' : 'text-rose-400'}`}>
                      {count} / {squadSize}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-battle-muted block">
                      Acquired
                    </span>
                  </div>

                  {isReady ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-950/60 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-rose-950/60 border border-rose-500 text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-3xl battle-panel border border-battle-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          {allComplete ? (
            <div className="flex items-center gap-2 text-emerald-400 font-broadcast font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>All teams have exact equal squads of {squadSize} fighters. Ready for Round 2!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-rose-400 font-broadcast font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>One or more teams have incomplete squads. Re-auction unsold lots to fill all slots!</span>
            </div>
          )}
          <span className="text-xs text-battle-muted font-mono block mt-0.5">
            Unsold Pool available: {unsoldPool.length} Lots
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {anyIncomplete && unsoldPool.length > 0 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={reAuctionUnsoldLots}
              className="w-full sm:w-auto border-brand-orange text-brand-orange hover:bg-brand-orange/10 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RE-AUCTION UNSOLD LOTS</span>
            </Button>
          )}

          <Button
            variant="primary"
            size="xl"
            disabled={!allComplete}
            onClick={startRound2Battles}
            className="w-full sm:w-auto shadow-glow-orange bg-brand-orange hover:bg-orange-600 text-dark-950 font-black font-broadcast flex items-center justify-center gap-2"
          >
            <Swords className="w-5 h-5" />
            <span>PROCEED TO ROUND 2: BATTLES</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
