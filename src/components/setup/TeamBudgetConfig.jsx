import React, { useState, useEffect, useMemo } from 'react';
import { FIXED_TEAMS } from '../../services/presets';
import { RotateCcw, AlertCircle, Coins, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const BUDGET_PRESETS = [50, 75, 100, 150, 200];

export const TeamBudgetConfig = ({
  initialTeams = null,
  currency = { symbol: '₹', unit: 'Cr' },
  onChange,
}) => {
  // Mode: 'common' or 'custom'
  const [mode, setMode] = useState('common');
  const [commonPurseInput, setCommonPurseInput] = useState('100');

  // Stable base teams definition
  const baseTeams = useMemo(() => {
    return initialTeams && initialTeams.length >= 2 ? initialTeams : FIXED_TEAMS;
  }, [initialTeams ? initialTeams.map(t => `${t.id}:${t.name}`).join(',') : '']);

  // Individual budgets state keyed by team id
  const [teamBudgets, setTeamBudgets] = useState(() => {
    const defaultObj = {};
    baseTeams.forEach((t) => {
      defaultObj[t.id] = String(t.initialPurse || t.purse || 100);
    });
    return defaultObj;
  });

  // Sync team budgets when baseTeams changes (e.g. dynamic team selection)
  useEffect(() => {
    setTeamBudgets((prev) => {
      const updated = { ...prev };
      let changed = false;
      baseTeams.forEach((t) => {
        if (updated[t.id] === undefined) {
          updated[t.id] = String(t.initialPurse || t.purse || commonPurseInput || '100');
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [baseTeams, commonPurseInput]);

  const [fieldErrors, setFieldErrors] = useState({});

  // Validate budgets and report to parent
  useEffect(() => {
    const errors = {};
    let hasError = false;
    let totalPurse = 0;

    const configuredTeams = baseTeams.map((t) => {
      const rawVal = teamBudgets[t.id] !== undefined ? teamBudgets[t.id] : String(t.initialPurse || t.purse || '100');
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        errors[t.id] = 'Budget is required';
        hasError = true;
        return { ...t, initialPurse: 0, purse: 0 };
      }

      const num = Number(rawVal);
      if (isNaN(num)) {
        errors[t.id] = 'Must be a valid number';
        hasError = true;
        return { ...t, initialPurse: 0, purse: 0 };
      }

      if (num <= 0) {
        errors[t.id] = 'Must be greater than 0';
        hasError = true;
        return { ...t, initialPurse: 0, purse: 0 };
      }

      totalPurse += num;
      return {
        ...t,
        initialPurse: num,
        purse: num,
      };
    });

    setFieldErrors(errors);

    if (onChange) {
      onChange({
        isValid: !hasError,
        teams: configuredTeams,
        totalPurse: Number(totalPurse.toFixed(2)),
        budgetMap: teamBudgets,
      });
    }
  }, [teamBudgets, baseTeams]);

  // Handle common purse change
  const handleCommonPurseChange = (valStr) => {
    setCommonPurseInput(valStr);
    const updated = {};
    baseTeams.forEach((t) => {
      updated[t.id] = valStr;
    });
    setTeamBudgets(updated);
  };

  // Handle quick preset button click
  const applyPreset = (presetVal) => {
    handleCommonPurseChange(String(presetVal));
  };

  // Handle individual team input change
  const handleIndividualChange = (teamId, valStr) => {
    setTeamBudgets((prev) => ({
      ...prev,
      [teamId]: valStr,
    }));
  };

  // Reset to default (100 Cr each)
  const handleResetDefaults = () => {
    setMode('common');
    handleCommonPurseChange('100');
  };

  const currentTotal = Object.values(teamBudgets).reduce((sum, v) => {
    const num = Number(v);
    return !isNaN(num) && num > 0 ? sum + num : sum;
  }, 0);

  return (
    <div className="rounded-3xl battle-panel p-5 border border-battle-border space-y-5">
      {/* Header with Mode Toggle & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-battle-border">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="font-broadcast font-black text-lg text-white uppercase tracking-wider">
              Franchise Starting Purse Configuration ({baseTeams.length} Teams)
            </h3>
          </div>
          <p className="text-xs text-battle-muted">
            Configure equal starting capital or assign custom budgets to each contender.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Equal vs Custom Mode Switcher */}
          <div className="p-1 rounded-xl bg-battle-surface border border-battle-border flex items-center gap-1 font-broadcast text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('common')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'common'
                  ? 'bg-brand-purple text-white shadow-glow-purple'
                  : 'text-battle-muted hover:text-white'
              }`}
            >
              Equal Purse
            </button>
            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'custom'
                  ? 'bg-brand-cyan text-dark-950 font-black shadow-glow-cyan'
                  : 'text-battle-muted hover:text-white'
              }`}
            >
              Custom Purses
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefaults}
            title="Restore default 100 Cr purse for all teams"
            className="p-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Common Quick Preset Buttons */}
      <div className="p-3.5 rounded-2xl bg-battle-surface/60 border border-battle-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-xs font-bold text-battle-muted font-broadcast uppercase tracking-wider">
          Quick Purse Presets:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {BUDGET_PRESETS.map((preset) => {
            const isSelected = mode === 'common' && String(preset) === commonPurseInput;
            return (
              <button
                type="button"
                key={preset}
                onClick={() => {
                  setMode('common');
                  applyPreset(preset);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                  isSelected
                    ? 'bg-amber-400 text-dark-950 border-amber-300 shadow-glow-orange font-black'
                    : 'bg-battle-bg border-battle-border text-battle-text hover:border-amber-400/60 hover:text-white'
                }`}
              >
                {currency.symbol}{preset} {currency.unit}
              </button>
            );
          })}
        </div>
      </div>

      {/* Individual Contender Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${baseTeams.length === 2 ? 'lg:grid-cols-2 max-w-2xl mx-auto' : baseTeams.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-3.5`}>
        {baseTeams.map((team) => {
          const hasError = Boolean(fieldErrors[team.id]);
          const currentVal = teamBudgets[team.id] ?? '100';

          return (
            <div
              key={team.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                hasError
                  ? 'bg-rose-950/20 border-rose-500/80 shadow-lg shadow-rose-950/30'
                  : 'bg-battle-surface/80 border-battle-border hover:border-battle-borderLight'
              }`}
            >
              {/* Top Accent Stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: team.color }}
              />

              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-2xl p-1.5 rounded-xl bg-battle-bg border border-battle-border shadow-inner">
                    {team.logo}
                  </span>
                  <div>
                    <h4
                      className="font-broadcast font-black text-sm tracking-wide"
                      style={{ color: team.color }}
                    >
                      {team.name}
                    </h4>
                    <span className="text-[10px] text-battle-muted uppercase font-broadcast font-bold">
                      Contending Franchise
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-battle-muted uppercase tracking-wider block font-broadcast">
                    Starting Purse ({currency.unit}):
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-battle-muted font-mono font-bold text-xs">
                      {currency.symbol}
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={currentVal}
                      disabled={mode === 'common'}
                      onChange={(e) => handleIndividualChange(team.id, e.target.value)}
                      placeholder="100.0"
                      className={`w-full pl-7 pr-3 py-2 rounded-xl text-sm font-mono font-bold transition-all focus:outline-none ${
                        mode === 'common'
                          ? 'bg-battle-bg/50 border border-battle-border text-battle-muted cursor-not-allowed'
                          : hasError
                          ? 'bg-rose-950/40 border-2 border-rose-500 text-rose-300 focus:border-rose-400'
                          : 'bg-battle-bg border border-battle-border text-amber-300 focus:border-brand-cyan focus:shadow-glow-cyan'
                      }`}
                    />
                  </div>

                  {/* Validation Error Message */}
                  {hasError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-400 font-broadcast font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors[team.id]}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-battle-border/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-battle-muted">Active:</span>
                <span className="font-bold text-white">
                  {currency.symbol}{!hasError && currentVal ? Number(currentVal).toFixed(2) : '—'} {currency.unit}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats Footer */}
      <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-broadcast">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-neon" />
          <span className="text-battle-muted font-bold uppercase tracking-wider">
            Combined League Capital:
          </span>
          <span className="text-base font-black text-brand-neon font-mono">
            {currency.symbol}{currentTotal.toFixed(2)} {currency.unit}
          </span>
        </div>

        <div className="flex items-center gap-4 text-battle-muted font-bold">
          <span>
            Average: <strong className="text-white font-mono">{currency.symbol}{(currentTotal / (baseTeams.length || 1)).toFixed(2)} {currency.unit}</strong>
          </span>
          <span className="text-battle-border">|</span>
          <span>
            Format: <strong className="text-brand-cyan">{mode === 'common' ? 'Equal Starting Purse' : 'Custom Individual Purses'}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};
