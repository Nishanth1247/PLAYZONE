import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Users, 
  Clock, 
  Trash2, 
  Layers, 
  Code2, 
  Eye, 
  Play, 
  ArrowLeft,
  Film
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FIXED_PARTY_PLAYERS } from '../../../services/party/gameRegistry';
import { parseDumbCharadesInput } from '../../../services/party/dumbCharadesParser';
import { DUMB_CHARADES_TAMIL, DUMB_CHARADES_MCU } from '../../../services/party/offlineDatabase';
import { getSavedDumbCharadesState, clearDumbCharadesState, createDumbCharadesTournament } from '../../../services/party/dumbCharadesEngine';
import { CopyContentPromptCard } from '../../common/CopyContentPromptCard';
import { DUMB_CHARADES_CHATGPT_PROMPT } from '../../../services/chatGptPrompts';
import { toast } from 'sonner';

export const DumbCharadesSetup = ({ onLaunchTournament, onBack }) => {
  // Check for saved tournament in progress
  const [savedTournament, setSavedTournament] = useState(() => {
    const s = getSavedDumbCharadesState();
    return s && !s.isCompleted && s.shuffledQueue ? s : null;
  });

  // 1. Team count target: 2 | 3 | 4
  const [teamCountTarget, setTeamCountTarget] = useState(4);

  // 2. Explicitly selected team IDs
  const [selectedTeamIds, setSelectedTeamIds] = useState(['p1', 'p2', 'p3', 'p4']);

  // 3. Timer Duration: 30 | 45 | 60 | 90 (Default: 60)
  const [timerDuration, setTimerDuration] = useState(60);

  // 4. Scoring Configuration (BIDBATTLE 8.1)
  const [basePoints, setBasePoints] = useState(1);
  const [streakBonusEnabled, setStreakBonusEnabled] = useState(false);
  const [skipPenalty, setSkipPenalty] = useState(0);
  const [timeoutPenalty, setTimeoutPenalty] = useState(0);

  // 5. Import / Source State
  const [importMode, setImportMode] = useState('preset'); // 'preset' | 'file' | 'manual'
  const [activePreset, setActivePreset] = useState('tamil'); // 'tamil' | 'mcu' | 'mixed'
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importedData, setImportedData] = useState(null); // { isValid, prompts, categories, totalCount, name, errors }
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Toggle or select a team
  const handleToggleTeam = (teamId) => {
    if (selectedTeamIds.includes(teamId)) {
      if (selectedTeamIds.length === 1) {
        toast.error('You must keep at least 1 team selected.');
        return;
      }
      setSelectedTeamIds(selectedTeamIds.filter((id) => id !== teamId));
    } else {
      if (selectedTeamIds.length >= teamCountTarget) {
        // Replace last selected if exceeding target
        const trimmed = selectedTeamIds.slice(0, teamCountTarget - 1);
        setSelectedTeamIds([...trimmed, teamId]);
      } else {
        setSelectedTeamIds([...selectedTeamIds, teamId]);
      }
    }
  };

  // Adjust team count target
  const handleTargetCountChange = (target) => {
    setTeamCountTarget(target);
    // Adjust selectedTeamIds to match target count
    if (selectedTeamIds.length > target) {
      setSelectedTeamIds(selectedTeamIds.slice(0, target));
    } else if (selectedTeamIds.length < target) {
      // Add missing teams from fixed players in order
      const remaining = FIXED_PARTY_PLAYERS.filter((p) => !selectedTeamIds.includes(p.id));
      const needed = target - selectedTeamIds.length;
      const additional = remaining.slice(0, needed).map((p) => p.id);
      setSelectedTeamIds([...selectedTeamIds, ...additional]);
    }
  };

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['json', 'csv', 'txt'].includes(ext)) {
      toast.error('Unsupported file format. Please upload .json, .csv, or .txt file.');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const parsed = parseDumbCharadesInput(text, ext, {
        listNameFallback: file.name.replace(/\.[^/.]+$/, ''),
        minPrompts: selectedTeamIds.length,
      });
      setImportedData(parsed);
      if (parsed.isValid) {
        toast.success(`Imported ${parsed.totalCount} prompts from ${file.name}!`);
      } else {
        toast.error('Import validation failed. Check errors below.');
      }
    };
    reader.readAsText(file);
  };

  const handleManualParse = () => {
    if (!rawText.trim()) {
      toast.error('Please enter prompt text first.');
      return;
    }
    const parsed = parseDumbCharadesInput(rawText, 'auto', {
      listNameFallback: 'Manual Input List',
      minPrompts: selectedTeamIds.length,
    });
    setImportedData(parsed);
    if (parsed.isValid) {
      toast.success(`Validated ${parsed.totalCount} manual prompts!`);
    } else {
      toast.error('Validation errors found in manual text.');
    }
  };

  // Clear imported list
  const handleClearImport = () => {
    setImportedData(null);
    setFileName('');
    setRawText('');
    setImportMode('preset');
  };

  // Determine active prompt list
  const getPresetList = () => {
    let source = DUMB_CHARADES_TAMIL;
    let title = 'Verified Tamil Cinema Hits';
    if (activePreset === 'mcu') {
      source = DUMB_CHARADES_MCU;
      title = 'Marvel Cinematic Universe Hits';
    } else if (activePreset === 'mixed') {
      source = [...DUMB_CHARADES_TAMIL, ...DUMB_CHARADES_MCU];
      title = 'Cinema Multiverse (Kollywood & MCU)';
    }

    return {
      name: title,
      prompts: source.map((it, idx) => ({
        id: it.id || `built_in_${idx + 1}`,
        name: it.title,
        title: it.title,
        category: it.category || 'Cinema',
        hint: it.hint || it.stars || '',
        year: it.year || '',
      })),
    };
  };

  const presetData = getPresetList();

  const activePromptList = importedData && importedData.isValid
    ? importedData.prompts
    : presetData.prompts;

  const activeListName = importedData && importedData.isValid
    ? importedData.name
    : presetData.name;

  // Validation status
  const isTeamCountValid = selectedTeamIds.length === teamCountTarget;
  const isPromptCountValid = activePromptList.length >= selectedTeamIds.length;
  const isImportValid = !importedData || importedData.isValid;
  const canStartTournament = isTeamCountValid && isPromptCountValid && isImportValid;

  // Selected team objects in configured turn order
  const selectedTeams = selectedTeamIds
    .map((id) => FIXED_PARTY_PLAYERS.find((p) => p.id === id))
    .filter(Boolean);

  const handleStart = () => {
    if (!canStartTournament) {
      if (!isTeamCountValid) {
        toast.error(`Please select exactly ${teamCountTarget} teams (currently selected: ${selectedTeamIds.length}).`);
      } else if (!isPromptCountValid) {
        toast.error(`Insufficient prompts! Need at least ${selectedTeamIds.length} prompts.`);
      }
      return;
    }

    onLaunchTournament({
      prompts: activePromptList,
      listName: activeListName,
      selectedTeams,
      timerDuration: Number(timerDuration) || 60,
      scoringConfig: {
        basePoints: Number(basePoints) || 1,
        streakBonusEnabled: Boolean(streakBonusEnabled),
        skipPenalty: Number(skipPenalty) || 0,
        timeoutPenalty: Number(timeoutPenalty) || 0,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs text-battle-muted hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Exit to Party Arena</span>
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="purple">DUMB CHARADES 2.0</Badge>
          <Badge variant="neon">TOURNAMENT EDITION</Badge>
        </div>
      </div>

      {/* Main Title Hero */}
      <div className="rounded-3xl battle-panel p-6 sm:p-8 border border-brand-purple/50 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <span className="text-4xl p-3.5 rounded-2xl bg-battle-surface border border-battle-border">
            🎭
          </span>
          <div>
            <h1 className="font-broadcast text-2xl sm:text-4xl font-black text-white uppercase tracking-wider">
              Dumb Charades <span className="neon-text-purple">Tournament Setup</span>
            </h1>
            <p className="text-xs sm:text-sm text-battle-muted mt-1 leading-relaxed">
              Import custom prompts (.json, .csv, .txt), select 2–4 contending teams, set acting countdowns, and battle turn-by-turn with 100% unique prompt consumption!
            </p>
          </div>
        </div>
      </div>

      {/* Ongoing Tournament Resume Banner */}
      {savedTournament && (
        <div className="p-4 sm:p-5 rounded-3xl bg-brand-purple/15 border-2 border-brand-purple flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow-purple">
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 rounded-xl bg-battle-surface border border-battle-border">
              ⚡
            </span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="purple" pulse className="text-[10px]">
                  ONGOING SESSION IN PROGRESS
                </Badge>
                <span className="text-xs font-mono text-battle-muted">
                  Turn #{savedTournament.turnHistory?.length + 1 || 1}
                </span>
              </div>
              <h4 className="font-broadcast font-bold text-white text-base">
                {savedTournament.listName}
              </h4>
              <span className="text-xs font-mono text-brand-orange">
                {savedTournament.shuffledQueue.length - (savedTournament.consumedPromptIds?.length || 0)} Unconsumed Prompts Remaining
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={() => onLaunchTournament({ isResume: true })}
              className="flex-1 sm:flex-initial font-broadcast text-xs font-black bg-brand-purple hover:bg-purple-600 text-white shadow-glow-purple flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>RESUME TOURNAMENT</span>
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => {
                clearDumbCharadesState();
                setSavedTournament(null);
                toast.info('Ongoing tournament discarded.');
              }}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
            >
              Discard
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TEAM SELECTION & TIMER (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION B: TEAM SELECTION */}
          <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block">
                  1. Team Count Selection
                </label>
                <Badge variant={isTeamCountValid ? 'neon' : 'orange'} className="text-[10px]">
                  {selectedTeamIds.length} / {teamCountTarget} Selected
                </Badge>
              </div>

              {/* Team count pills: 2, 3, 4 */}
              <div className="grid grid-cols-3 gap-2">
                {[2, 3, 4].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => handleTargetCountChange(cnt)}
                    className={`p-2.5 rounded-2xl border font-broadcast text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      teamCountTarget === cnt
                        ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple'
                        : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{cnt} Teams</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Team Toggles (Nishanth, Ajmal, Praneeth, Nagulan) */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-battle-muted block">
                Select exactly {teamCountTarget} teams (determines turn rotation):
              </span>

              <div className="space-y-2">
                {FIXED_PARTY_PLAYERS.map((team) => {
                  const isSelected = selectedTeamIds.includes(team.id);
                  const orderIndex = selectedTeamIds.indexOf(team.id);
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => handleToggleTeam(team.id)}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-battle-surface border-brand-purple shadow-sm'
                          : 'bg-battle-bg/50 border-battle-border/60 opacity-40 hover:opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow"
                          style={{ backgroundColor: team.color }}
                        >
                          {team.avatar}
                        </div>
                        <div>
                          <h4 className="font-broadcast font-bold text-xs text-white">
                            {team.name}
                          </h4>
                          <span className="text-[10px] font-mono text-battle-muted">
                            {team.tagline}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-brand-purple px-1.5 py-0.5 rounded bg-brand-purple/10 border border-brand-purple/30">
                            Turn #{orderIndex + 1}
                          </span>
                          <CheckCircle2 className="w-4 h-4 text-brand-purple" />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-battle-muted">Click to pick</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION C: TIMER SETTINGS */}
          <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block">
                2. Acting Timer Per Turn
              </label>
              <span className="text-xs font-mono font-bold text-amber-400">
                {timerDuration} Seconds
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-xs font-bold">
              {[30, 45, 60, 90].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTimerDuration(sec)}
                  className={`py-3 rounded-2xl border text-center transition-all ${
                    timerDuration === sec
                      ? 'bg-brand-orange text-dark-950 font-black border-brand-orange shadow-glow-orange'
                      : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                  }`}
                >
                  <span className="block font-black text-sm">{sec}s</span>
                  {sec === 60 && <span className="text-[9px] block opacity-80">Default</span>}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION D: CONFIGURABLE SCORING & RULES (BIDBATTLE 8.1) */}
          <div className="rounded-3xl battle-panel p-6 border border-battle-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block">
                3. Scoring & Streak Rules
              </label>
              <Badge variant={streakBonusEnabled ? 'neon' : 'secondary'} className="text-[10px]">
                {streakBonusEnabled ? 'STREAKS ON' : 'STANDARD'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              {/* Base Points */}
              <div className="p-3 rounded-2xl bg-battle-surface/60 border border-battle-border space-y-1.5">
                <span className="text-battle-muted text-[11px] block">Base Points / Found</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => setBasePoints(pts)}
                      className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                        basePoints === pts
                          ? 'bg-brand-purple text-white border border-brand-purple'
                          : 'bg-battle-bg text-battle-muted hover:text-white'
                      }`}
                    >
                      +{pts}
                    </button>
                  ))}
                </div>
              </div>

              {/* Streak Bonus Toggle */}
              <div className="p-3 rounded-2xl bg-battle-surface/60 border border-battle-border space-y-1.5">
                <span className="text-battle-muted text-[11px] block">Streak Bonuses</span>
                <button
                  type="button"
                  onClick={() => setStreakBonusEnabled(!streakBonusEnabled)}
                  className={`w-full py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    streakBonusEnabled
                      ? 'bg-amber-500 text-dark-950 font-black shadow-sm'
                      : 'bg-battle-bg text-battle-muted hover:text-white'
                  }`}
                >
                  {streakBonusEnabled ? '🔥 +2 (3x), +5 (5x)' : 'Disabled'}
                </button>
              </div>

              {/* Skip Penalty */}
              <div className="p-3 rounded-2xl bg-battle-surface/60 border border-battle-border space-y-1.5">
                <span className="text-battle-muted text-[11px] block">Skip Penalty</span>
                <button
                  type="button"
                  onClick={() => setSkipPenalty(skipPenalty === 0 ? 1 : 0)}
                  className={`w-full py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    skipPenalty > 0
                      ? 'bg-red-500 text-white font-black shadow-sm'
                      : 'bg-battle-bg text-battle-muted hover:text-white'
                  }`}
                >
                  {skipPenalty > 0 ? '-1 Pt' : '0 (No Penalty)'}
                </button>
              </div>

              {/* Timeout Penalty */}
              <div className="p-3 rounded-2xl bg-battle-surface/60 border border-battle-border space-y-1.5">
                <span className="text-battle-muted text-[11px] block">Timeout Penalty</span>
                <button
                  type="button"
                  onClick={() => setTimeoutPenalty(timeoutPenalty === 0 ? 1 : 0)}
                  className={`w-full py-1.5 px-2 rounded-xl font-bold transition-all text-center ${
                    timeoutPenalty > 0
                      ? 'bg-red-500 text-white font-black shadow-sm'
                      : 'bg-battle-bg text-battle-muted hover:text-white'
                  }`}
                >
                  {timeoutPenalty > 0 ? '-1 Pt' : '0 (No Penalty)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IMPORT PROMPT LIST (7 COLS) */}
        <div className="lg:col-span-7 rounded-3xl battle-panel p-6 sm:p-8 border border-battle-border space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block">
                  3. Prompt List Source
                </label>
                <span className="text-[11px] text-battle-muted font-mono">
                  Upload custom tournament file or use built-in catalog
                </span>
              </div>

              {importedData && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearImport}
                  className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom File</span>
                </Button>
              )}
            </div>

            {/* CREATE YOUR OWN PROMPT COLLECTION — Copy Content Prompt Card */}
            <CopyContentPromptCard
              title="CREATE YOUR OWN PROMPT COLLECTION"
              description="Choose any topic and let ChatGPT generate a prompt collection that you can import directly into Dumb Charades."
              promptText={DUMB_CHARADES_CHATGPT_PROMPT}
              targetGame="Dumb Charades 2.0"
              badgeText="DUMB CHARADES"
              accentColor="#9147FF"
            />

            {/* Mode Tabs */}
            <div className="flex gap-2 p-1 rounded-2xl bg-battle-bg border border-battle-border">
              <button
                type="button"
                onClick={() => setImportMode('preset')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-broadcast font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  importMode === 'preset'
                    ? 'bg-battle-surface text-brand-purple border border-brand-purple/40 shadow-sm'
                    : 'text-battle-muted hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                PRESETS
              </button>
              <button
                type="button"
                onClick={() => setImportMode('file')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-broadcast font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  importMode === 'file'
                    ? 'bg-battle-surface text-brand-orange border border-brand-orange/40 shadow-sm'
                    : 'text-battle-muted hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                FILE (.JSON / .CSV / .TXT)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('manual')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-broadcast font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  importMode === 'manual'
                    ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-battle-muted hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                MANUAL TEXT
              </button>
            </div>

            {/* TAB 1: PRESET ROSTER */}
            {importMode === 'preset' && !importedData && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Preset 1: Tamil Cinema */}
                  <button
                    type="button"
                    onClick={() => setActivePreset('tamil')}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                      activePreset === 'tamil'
                        ? 'bg-brand-purple/15 border-brand-purple shadow-glow-purple/20'
                        : 'bg-battle-surface/40 border-battle-border hover:border-brand-purple/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🎬</span>
                      <Badge variant={activePreset === 'tamil' ? 'purple' : 'secondary'} className="text-[10px]">
                        30 Films
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-broadcast font-bold text-xs text-white">Tamil Cinema Hits</h4>
                      <span className="text-[10px] font-mono text-battle-muted block">Baasha, Enthiran, Vikram, Leo...</span>
                    </div>
                  </button>

                  {/* Preset 2: MCU */}
                  <button
                    type="button"
                    onClick={() => setActivePreset('mcu')}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                      activePreset === 'mcu'
                        ? 'bg-brand-cyan/15 border-brand-cyan shadow-glow-cyan/20'
                        : 'bg-battle-surface/40 border-battle-border hover:border-brand-cyan/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🛡️</span>
                      <Badge variant={activePreset === 'mcu' ? 'cyan' : 'secondary'} className="text-[10px]">
                        16 Films
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-broadcast font-bold text-xs text-white">Marvel / MCU</h4>
                      <span className="text-[10px] font-mono text-battle-muted block">Endgame, Iron Man, Thor...</span>
                    </div>
                  </button>

                  {/* Preset 3: Mixed Multiverse */}
                  <button
                    type="button"
                    onClick={() => setActivePreset('mixed')}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1.5 ${
                      activePreset === 'mixed'
                        ? 'bg-brand-orange/15 border-brand-orange shadow-glow-orange/20'
                        : 'bg-battle-surface/40 border-battle-border hover:border-brand-orange/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">⚡</span>
                      <Badge variant={activePreset === 'mixed' ? 'orange' : 'secondary'} className="text-[10px]">
                        46 Films
                      </Badge>
                    </div>
                    <div>
                      <h4 className="font-broadcast font-bold text-xs text-white">Cinema Multiverse</h4>
                      <span className="text-[10px] font-mono text-battle-muted block">Kollywood & MCU Superpack</span>
                    </div>
                  </button>
                </div>

                <p className="text-[11px] text-battle-muted font-mono leading-relaxed bg-battle-bg p-3 rounded-2xl border border-battle-border">
                  ✓ Ready to play immediately. Each movie title will be randomly shuffled and strictly consumed once revealed.
                </p>
              </div>
            )}

            {/* TAB 2: FILE UPLOAD (DRAG & DROP) */}
            {importMode === 'file' && (
              <div className="space-y-3">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-brand-orange bg-brand-orange/10 scale-[1.01]'
                      : 'border-battle-border hover:border-brand-orange/60 bg-battle-bg/80'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                  <h4 className="font-broadcast font-bold text-sm text-white mb-0.5">
                    {fileName ? fileName : 'Drag & drop .json, .csv, or .txt file'}
                  </h4>
                  <span className="text-xs text-battle-muted block font-mono">
                    or click to browse files
                  </span>
                </div>
              </div>
            )}

            {/* TAB 3: MANUAL TEXT ENTRY */}
            {importMode === 'manual' && (
              <div className="space-y-3">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Enter prompts (one per line, CSV, or JSON):\nBaasha, Tamil Cinema\nLeo, Tamil Cinema\nVikram, Tamil Cinema`}
                  rows={5}
                  className="w-full rounded-2xl p-3 bg-battle-bg border border-battle-border font-mono text-xs text-battle-text focus:outline-none focus:border-brand-cyan resize-none"
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleManualParse}
                    className="text-xs bg-brand-cyan hover:bg-cyan-600 text-dark-950 font-broadcast font-bold"
                  >
                    Validate & Parse
                  </Button>
                </div>
              </div>
            )}

            {/* VALIDATION ERROR BANNER */}
            {importedData && !importedData.isValid && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-broadcast font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>Validation Error ({importedData.errors.length} Issues)</span>
                </div>
                <ul className="text-xs font-mono space-y-1 pl-5 list-disc max-h-32 overflow-y-auto">
                  {importedData.errors.map((err, idx) => (
                    <li key={idx} className="text-rose-300">
                      {err}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* VALID IMPORT SUMMARY & PREVIEW */}
            {importedData && importedData.isValid && (
              <div className="space-y-3">
                {/* Status card */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex items-center justify-between text-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-broadcast font-bold text-xs text-white">
                        {importedData.name}
                      </h4>
                      <span className="text-[11px] text-emerald-300 font-mono">
                        {importedData.totalCount} Prompts Loaded • Valid & Ready
                      </span>
                    </div>
                  </div>
                  <Badge variant="neon" className="text-[10px]">
                    ✓ Verified
                  </Badge>
                </div>

                {/* Category breakdown pill list */}
                {Object.keys(importedData.categories).length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-battle-muted">Categories:</span>
                    {Object.entries(importedData.categories).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="px-2 py-0.5 rounded-lg bg-battle-surface border border-battle-border text-[10px] font-mono text-white"
                      >
                        {cat} ({count})
                      </span>
                    ))}
                  </div>
                )}

                {/* Prompt Preview */}
                <div className="p-3 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
                  <div className="flex items-center justify-between text-xs text-battle-muted font-mono">
                    <span>Prompt Preview (First 15 of {importedData.prompts.length})</span>
                    <span>Hidden during live turns</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {importedData.prompts.slice(0, 15).map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="px-2.5 py-1.5 rounded-xl bg-battle-surface/60 border border-battle-border text-[11px] font-mono text-white truncate"
                        title={p.name}
                      >
                        #{idx + 1} {p.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Active Pool Overview Banner */}
            <div className={`p-4 rounded-2xl border text-xs font-mono ${
              isPromptCountValid
                ? 'bg-brand-purple/10 border-brand-purple/40 text-purple-200'
                : 'bg-rose-950/40 border-rose-800 text-rose-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">Active Pool Status:</span>
                <span>{activePromptList.length} Unique Prompts</span>
              </div>
              <p className="text-[11px] opacity-90">
                {isPromptCountValid
                  ? `✓ Sufficient. Shuffled queue ready for ${selectedTeamIds.length} competing teams.`
                  : `⚠️ Insufficient prompts! Need at least ${selectedTeamIds.length} prompts.`}
              </p>
            </div>
          </div>

          {/* Action Button: Start Tournament */}
          <div className="pt-4 border-t border-battle-border">
            <Button
              variant="primary"
              size="xl"
              disabled={!canStartTournament}
              onClick={handleStart}
              className="w-full font-broadcast text-base shadow-glow-purple bg-brand-purple hover:bg-purple-600 text-white font-black flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>START DUMB CHARADES TOURNAMENT</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
