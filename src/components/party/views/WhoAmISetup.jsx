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
  HelpCircle, 
  Eye, 
  Play, 
  ArrowLeft,
  BookmarkPlus,
  HelpCircle as QuestionIcon,
  Shield,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { FIXED_PARTY_PLAYERS } from '../../../services/party/gameRegistry';
import { parseWhoAmIInput } from '../../../services/party/whoAmIParser';
import { 
  WHO_AM_I_PRESETS, 
  WHO_AM_I_TAMIL, 
  getWhoAmIPresetById 
} from '../../../services/party/whoAmIDatabase';
import { 
  getSavedWhoAmIState, 
  clearWhoAmIState, 
  createWhoAmISession,
  getSavedWhoAmICustomCollections,
  saveWhoAmICustomCollection,
  deleteWhoAmICustomCollection
} from '../../../services/party/whoAmIEngine';
import { CopyContentPromptCard } from '../../common/CopyContentPromptCard';
import { WHO_AM_I_CHATGPT_PROMPT } from '../../../services/chatGptPrompts';
import { toast } from 'sonner';

export const WhoAmISetup = ({ onLaunchTournament, onBack }) => {
  // Check for saved tournament in progress
  const [savedTournament, setSavedTournament] = useState(() => {
    const s = getSavedWhoAmIState();
    return s && !s.isCompleted && s.turns ? s : null;
  });

  // 1. Team count target: 2 | 3 | 4
  const [teamCountTarget, setTeamCountTarget] = useState(4);

  // 2. Explicitly selected team IDs
  const [selectedTeamIds, setSelectedTeamIds] = useState(['p1', 'p2', 'p3', 'p4']);

  // 3. Turn & Game Settings
  const [timerDuration, setTimerDuration] = useState(60); // 45 | 60 | 90 | 120
  const [roundsCount, setRoundsCount] = useState(3); // 2 | 3 | 4 | 5
  const [questionLimit, setQuestionLimit] = useState(0); // 0 = unlimited, 15, 20, 25

  // 4. Import / Source State
  const [importMode, setImportMode] = useState('preset'); // 'preset' | 'file' | 'manual'
  const [activePresetId, setActivePresetId] = useState(WHO_AM_I_TAMIL.id);
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [importedData, setImportedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Custom persistent collections
  const [customCollections, setCustomCollections] = useState(() => getSavedWhoAmICustomCollections());
  const [selectedCustomId, setSelectedCustomId] = useState(null);

  const fileInputRef = useRef(null);

  // Toggle team selection
  const handleToggleTeam = (teamId) => {
    if (selectedTeamIds.includes(teamId)) {
      if (selectedTeamIds.length === 2) {
        toast.error('You must keep at least 2 teams selected for Who Am I.');
        return;
      }
      const updated = selectedTeamIds.filter((id) => id !== teamId);
      setSelectedTeamIds(updated);
      setTeamCountTarget(updated.length);
    } else {
      if (selectedTeamIds.length >= 4) {
        toast.error('Maximum 4 teams can participate.');
        return;
      }
      const updated = [...selectedTeamIds, teamId];
      setSelectedTeamIds(updated);
      setTeamCountTarget(updated.length);
    }
  };

  // Set preset team count target
  const handleSetTeamCount = (count) => {
    setTeamCountTarget(count);
    const sliced = FIXED_PARTY_PLAYERS.slice(0, count).map((p) => p.id);
    setSelectedTeamIds(sliced);
  };

  // File parsing
  const handleProcessFile = (file) => {
    if (!file) return;
    setFileName(file.name);

    let formatHint = 'auto';
    if (file.name.endsWith('.json')) formatHint = 'json';
    else if (file.name.endsWith('.csv')) formatHint = 'csv';
    else if (file.name.endsWith('.txt')) formatHint = 'txt';

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const parsed = parseWhoAmIInput(content, formatHint, {
        collectionNameFallback: file.name.replace(/\.[^/.]+$/, ''),
        minCharacters: 2,
      });
      setImportedData(parsed);

      if (parsed.isValid) {
        toast.success(`Loaded ${parsed.totalCount} characters from ${file.name}!`);
      } else {
        toast.error(`Import failed: ${parsed.errors[0] || 'Invalid file format'}`);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read the file.');
    };
    reader.readAsText(file);
  };

  // Drag and drop handlers
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
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Manual raw text parsing
  const handleParseManualText = () => {
    if (!rawText.trim()) {
      toast.error('Please enter character text first.');
      return;
    }
    const parsed = parseWhoAmIInput(rawText, 'auto', {
      collectionNameFallback: 'Manual Character List',
      minCharacters: 2,
    });
    setImportedData(parsed);
    if (parsed.isValid) {
      toast.success(`Successfully parsed ${parsed.totalCount} characters!`);
    } else {
      toast.error(parsed.errors[0] || 'Failed to parse character list.');
    }
  };

  // Save current imported data as custom collection
  const handleSaveAsCustom = () => {
    if (!importedData || !importedData.isValid) {
      toast.error('No valid imported characters to save.');
      return;
    }

    const newColl = {
      id: `custom_${Date.now()}`,
      name: importedData.name || 'Custom Character Collection',
      category: 'Custom Import',
      description: `User-imported collection of ${importedData.totalCount} characters.`,
      icon: '📁',
      badge: 'Custom',
      characters: importedData.characters,
      createdAt: new Date().toISOString(),
    };

    const updated = saveWhoAmICustomCollection(newColl);
    setCustomCollections(updated);
    toast.success(`Saved "${newColl.name}" to custom collections!`);
  };

  // Resolve current active collection
  let activeCollection = null;
  if (importMode === 'preset') {
    activeCollection = getWhoAmIPresetById(activePresetId);
  } else if (importMode === 'custom' && selectedCustomId) {
    activeCollection = customCollections.find((c) => c.id === selectedCustomId) || WHO_AM_I_TAMIL;
  } else if ((importMode === 'file' || importMode === 'manual') && importedData?.isValid) {
    activeCollection = {
      id: 'custom_import',
      name: importedData.name,
      category: 'Custom Content',
      characters: importedData.characters,
    };
  } else {
    activeCollection = getWhoAmIPresetById(activePresetId);
  }

  const selectedTeams = FIXED_PARTY_PLAYERS.filter((p) => selectedTeamIds.includes(p.id));
  const totalTurnsNeeded = selectedTeams.length * roundsCount;
  const availableCharactersCount = activeCollection?.characters?.length || 0;

  // Launch session
  const handleStartGame = () => {
    if (selectedTeams.length < 2) {
      toast.error('Please select at least 2 teams.');
      return;
    }

    if (!activeCollection || !activeCollection.characters || activeCollection.characters.length < 2) {
      toast.error('Please select or import a collection with at least 2 characters.');
      return;
    }

    try {
      const session = createWhoAmISession({
        collection: activeCollection,
        selectedTeams,
        roundsCount,
        timerDuration,
        questionLimit,
      });

      onLaunchTournament({
        session,
        selectedTeams,
        isResume: false,
      });
      toast.success(`Who Am I started with ${selectedTeams.length} franchises!`);
    } catch (err) {
      toast.error(err.message || 'Failed to start Who Am I session.');
    }
  };

  // Resume saved session
  const handleResumeGame = () => {
    if (!savedTournament) return;
    onLaunchTournament({
      session: savedTournament,
      selectedTeams: savedTournament.selectedTeams,
      isResume: true,
    });
  };

  // Discard saved tournament
  const handleDiscardSavedGame = () => {
    clearWhoAmIState();
    setSavedTournament(null);
    toast.info('Saved session discarded.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-battle-border pb-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-battle-muted hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Party Arena</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">❓</span>
              <h1 className="font-broadcast text-2xl sm:text-3xl font-black text-white tracking-wide">
                WHO AM I? <span className="neon-text-cyan">SETUP</span>
              </h1>
            </div>
            <span className="text-xs font-mono text-battle-muted">
              Shared Screen • Guesser Faces Away • 2–4 Franchises
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-battle-surface border border-brand-cyan/40 text-xs font-mono font-bold text-brand-cyan">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Local Multiplayer</span>
          </div>
        </div>
      </div>

      {/* RESUME SAVED SESSION BANNER */}
      {savedTournament && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-5 bg-battle-surface border border-brand-neon/50 relative overflow-hidden shadow-glow-neon/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="neon" className="text-[10px] py-0">
                SESSION IN PROGRESS
              </Badge>
              <span className="font-broadcast text-sm font-bold text-white">
                {savedTournament.collectionName}
              </span>
            </div>
            <p className="text-xs text-battle-muted">
              Turn {savedTournament.currentTurnIndex + 1} of {savedTournament.turns?.length || '?'}{' '}
              • {savedTournament.selectedTeams?.length || 0} teams active
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscardSavedGame}
              className="text-xs text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleResumeGame}
              className="font-broadcast text-xs bg-brand-neon text-battle-bg border-brand-neon font-black"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              RESUME GAME
            </Button>
          </div>
        </motion.div>
      )}

      {/* 1. PHYSICAL RULE & GAMEPLAY NOTICE */}
      <div className="p-4 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-start gap-3 text-xs text-battle-text">
        <QuestionIcon className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-broadcast font-bold text-brand-cyan block text-sm">
            HOW WHO AM I? WORKS ON A SINGLE LAPTOP:
          </span>
          <p className="text-battle-muted leading-relaxed">
            During each round, the designated <strong>Guesser</strong> stands behind the laptop facing <strong>AWAY</strong> from the screen. All other players sit in front of the screen and see the secret character. The guesser asks Yes/No questions aloud, and the audience responds <strong>YES, NO, or MAYBE</strong>!
          </p>
        </div>
      </div>

      {/* 2. TEAM SELECTION */}
      <div className="battle-panel rounded-3xl p-6 border border-battle-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cyan" />
            <h3 className="font-broadcast font-bold text-sm tracking-wider text-white">
              SELECT PARTICIPATING TEAMS ({selectedTeamIds.length} SELECTED)
            </h3>
          </div>

          {/* Preset 2/3/4 Team Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-battle-bg border border-battle-border">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => handleSetTeamCount(count)}
                className={`px-3 py-1 rounded-xl text-xs font-broadcast font-bold transition-all ${
                  teamCountTarget === count && selectedTeamIds.length === count
                    ? 'bg-brand-cyan text-battle-bg shadow-glow-cyan'
                    : 'text-battle-muted hover:text-white'
                }`}
              >
                {count} TEAMS
              </button>
            ))}
          </div>
        </div>

        {/* 4 Team Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {FIXED_PARTY_PLAYERS.map((player) => {
            const isSelected = selectedTeamIds.includes(player.id);
            return (
              <button
                key={player.id}
                type="button"
                onClick={() => handleToggleTeam(player.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-center gap-3 ${
                  isSelected
                    ? 'bg-battle-surface shadow-md'
                    : 'bg-battle-bg/50 border-battle-border/50 opacity-40 hover:opacity-75'
                }`}
                style={{
                  borderColor: isSelected ? player.color : undefined,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold text-white shadow-inner flex-shrink-0"
                  style={{ backgroundColor: player.color }}
                >
                  {player.avatar}
                </div>
                <div className="min-w-0">
                  <h4 className="font-broadcast font-bold text-sm text-white truncate">
                    {player.name}
                  </h4>
                  <span className="text-[10px] font-mono text-battle-muted block truncate">
                    {player.tagline}
                  </span>
                </div>
                {isSelected && (
                  <div
                    className="absolute top-2 right-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TURN & QUESTION CONFIGURATION */}
      <div className="battle-panel rounded-3xl p-6 border border-battle-border space-y-5">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-orange" />
          <h3 className="font-broadcast font-bold text-sm tracking-wider text-white">
            ROUND & TIMER SETTINGS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Turn Timer Duration */}
          <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
            <span className="text-xs font-mono text-battle-muted block">
              Timer Per Turn
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[45, 60, 90, 120].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimerDuration(t)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    timerDuration === t
                      ? 'bg-brand-orange text-battle-bg shadow-sm'
                      : 'text-battle-muted hover:text-white bg-battle-surface/40'
                  }`}
                >
                  {t}s
                </button>
              ))}
            </div>
            <span className="text-[10px] text-battle-muted block">
              +5 Speed bonus awarded if solved in first {Math.floor(timerDuration / 2)}s
            </span>
          </div>

          {/* Rounds Count */}
          <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
            <span className="text-xs font-mono text-battle-muted block">
              Rounds (Turns Per Player)
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoundsCount(r)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    roundsCount === r
                      ? 'bg-brand-cyan text-battle-bg shadow-sm'
                      : 'text-battle-muted hover:text-white bg-battle-surface/40'
                  }`}
                >
                  {r} Rds
                </button>
              ))}
            </div>
            <span className="text-[10px] text-battle-muted block">
              Total turns: {totalTurnsNeeded} turns across all teams
            </span>
          </div>

          {/* Question Limit */}
          <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
            <span className="text-xs font-mono text-battle-muted block">
              Question Limit
            </span>
            <div className="grid grid-cols-4 gap-1">
              {[
                { val: 0, label: 'No Limit' },
                { val: 15, label: '15 Qs' },
                { val: 20, label: '20 Qs' },
                { val: 25, label: '25 Qs' },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setQuestionLimit(opt.val)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    questionLimit === opt.val
                      ? 'bg-brand-neon text-battle-bg shadow-sm'
                      : 'text-battle-muted hover:text-white bg-battle-surface/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[10px] text-battle-muted block">
              {questionLimit === 0 ? 'Unlimited questions until timer expires' : `Max ${questionLimit} questions allowed per turn`}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CONTENT SELECTION & UNIVERSAL IMPORT */}
      <div className="battle-panel rounded-3xl p-6 border border-battle-border space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-cyan" />
            <h3 className="font-broadcast font-bold text-sm tracking-wider text-white">
              CHARACTER COLLECTION & CONTENT IMPORT
            </h3>
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-battle-bg border border-battle-border">
            <button
              type="button"
              onClick={() => setImportMode('preset')}
              className={`px-3 py-1.5 rounded-xl text-xs font-broadcast font-bold transition-all ${
                importMode === 'preset'
                  ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                  : 'text-battle-muted hover:text-white'
              }`}
            >
              PRESETS
            </button>
            <button
              type="button"
              onClick={() => setImportMode('file')}
              className={`px-3 py-1.5 rounded-xl text-xs font-broadcast font-bold transition-all ${
                importMode === 'file'
                  ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                  : 'text-battle-muted hover:text-white'
              }`}
            >
              FILE UPLOAD
            </button>
            <button
              type="button"
              onClick={() => setImportMode('manual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-broadcast font-bold transition-all ${
                importMode === 'manual'
                  ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                  : 'text-battle-muted hover:text-white'
              }`}
            >
              MANUAL ENTRY
            </button>
            {customCollections.length > 0 && (
              <button
                type="button"
                onClick={() => setImportMode('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-broadcast font-bold transition-all ${
                  importMode === 'custom'
                    ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-battle-muted hover:text-white'
                }`}
              >
                SAVED ({customCollections.length})
              </button>
            )}
          </div>
        </div>

        {/* COPY CONTENT PROMPT CARD */}
        <CopyContentPromptCard
          title="GENERATE WHO AM I? CHARACTERS WITH CHATGPT"
          description="Create custom character packs (cinema heroes, sports legends, anime characters, or historical figures). Copy our prompt into ChatGPT, download the generated JSON, and upload it below."
          promptText={WHO_AM_I_CHATGPT_PROMPT}
          targetGame="Who Am I?"
          badgeText="WHO AM I? PROMPT"
          accentColor="#00D9FF"
        />

        {/* TAB 1: PRESETS */}
        {importMode === 'preset' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WHO_AM_I_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setActivePresetId(preset.id)}
                  className={`p-4 rounded-2xl border text-left transition-all space-y-2 relative ${
                    isSelected
                      ? 'bg-brand-cyan/10 border-brand-cyan shadow-glow-cyan/20'
                      : 'bg-battle-bg border-battle-border hover:border-brand-cyan/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{preset.icon}</span>
                    <Badge variant={isSelected ? 'cyan' : 'secondary'} className="text-[10px]">
                      {preset.characters.length} Characters
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-broadcast font-bold text-sm text-white">
                      {preset.name}
                    </h4>
                    <p className="text-xs text-battle-muted line-clamp-2 mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* TAB 2: FILE UPLOAD */}
        {importMode === 'file' && (
          <div className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 rounded-3xl border-2 border-dashed text-center cursor-pointer transition-all space-y-3 ${
                dragActive
                  ? 'border-brand-cyan bg-brand-cyan/10 scale-[1.01]'
                  : 'border-battle-border hover:border-brand-cyan/50 bg-battle-bg/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.txt"
                onChange={(e) => handleProcessFile(e.target.files?.[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/40 text-brand-cyan flex items-center justify-center mx-auto shadow-sm">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-broadcast font-bold text-sm text-white">
                  DROP YOUR FILE HERE OR BROWSE
                </h4>
                <p className="text-xs text-battle-muted font-mono">
                  Supports JSON (.json), CSV (.csv), and Text (.txt) formats
                </p>
              </div>
              {fileName && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-battle-surface border border-brand-cyan/40 text-xs font-mono text-brand-cyan">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{fileName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL ENTRY */}
        {importMode === 'manual' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-battle-muted">
              <span>Paste characters (one per line, CSV, or raw JSON):</span>
              <span className="text-[11px] text-brand-cyan">Example: Leo Das, LCU, Easy</span>
            </div>
            <textarea
              rows={6}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Baasha, Classic, Easy, Bombay don&#10;Rolex, LCU, Easy, Luxury watch cartel kingpin&#10;Chitti, Sci-Fi, Easy, 1 Terahertz android"
              className="w-full p-3.5 rounded-2xl bg-battle-bg border border-battle-border font-mono text-xs text-battle-text focus:outline-none focus:border-brand-cyan resize-none"
            />
            <div className="flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleParseManualText}
                className="font-broadcast text-xs text-brand-cyan border-brand-cyan/40 hover:bg-brand-cyan/10"
              >
                PARSE & VALIDATE
              </Button>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED CUSTOM COLLECTIONS */}
        {importMode === 'custom' && (
          <div className="space-y-3">
            {customCollections.length === 0 ? (
              <p className="text-xs font-mono text-battle-muted text-center py-4">
                No saved custom collections found. Import a file or paste characters to save one!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customCollections.map((coll) => {
                  const isSelected = selectedCustomId === coll.id;
                  return (
                    <div
                      key={coll.id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-brand-cyan/10 border-brand-cyan shadow-glow-cyan/20'
                          : 'bg-battle-bg border-battle-border'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedCustomId(coll.id)}
                        className="text-left flex-1 space-y-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{coll.icon || '📁'}</span>
                          <h4 className="font-broadcast font-bold text-sm text-white">
                            {coll.name}
                          </h4>
                        </div>
                        <span className="text-xs font-mono text-brand-cyan block">
                          {coll.characters?.length || 0} Characters
                        </span>
                      </button>

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={() => {
                          const updated = deleteWhoAmICustomCollection(coll.id);
                          setCustomCollections(updated);
                          if (selectedCustomId === coll.id) setSelectedCustomId(null);
                          toast.info(`Deleted "${coll.name}".`);
                        }}
                        className="text-battle-muted hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VALIDATION PREVIEW CARD (When file or manual text parsed) */}
        {importedData && (importMode === 'file' || importMode === 'manual') && (
          <div
            className={`p-4 rounded-2xl border space-y-3 ${
              importedData.isValid
                ? 'bg-battle-surface/80 border-emerald-500/50'
                : 'bg-battle-surface/80 border-red-500/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {importedData.isValid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-broadcast font-bold text-sm text-white">
                    {importedData.isValid ? 'VALID COLLECTION LOADED' : 'IMPORT ERRORS DETECTED'}
                  </h4>
                  <span className="text-xs font-mono text-battle-muted">
                    {importedData.totalCount} Characters Parsed • {Object.keys(importedData.categories).length} Categories
                  </span>
                </div>
              </div>

              {importedData.isValid && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleSaveAsCustom}
                  className="font-mono text-xs text-brand-neon hover:bg-brand-neon/10 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Save to Collections</span>
                </Button>
              )}
            </div>

            {/* Difficulties Breakdown */}
            {importedData.isValid && (
              <div className="flex flex-wrap gap-2 pt-1 border-t border-battle-border/60">
                <span className="text-[11px] font-mono text-battle-muted self-center">Difficulties:</span>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 font-mono text-[10px]">
                  Easy: {importedData.difficulties.Easy}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 font-mono text-[10px]">
                  Medium: {importedData.difficulties.Medium}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-red-500/15 text-red-300 font-mono text-[10px]">
                  Hard: {importedData.difficulties.Hard}
                </span>
              </div>
            )}

            {/* Error messages */}
            {importedData.errors.length > 0 && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-300 space-y-1">
                {importedData.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {/* Warnings list */}
            {importedData.warnings.length > 0 && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 space-y-1">
                {importedData.warnings.slice(0, 3).map((w, i) => (
                  <div key={i}>• {w}</div>
                ))}
                {importedData.warnings.length > 3 && (
                  <div>• ...and {importedData.warnings.length - 3} more warnings</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. LAUNCH ACTION FOOTER */}
      <div className="battle-panel rounded-3xl p-6 border border-battle-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white">Active Collection:</span>
            <span className="text-xs font-mono text-brand-cyan font-black">
              {activeCollection?.name || 'Tamil Cinema Icons'}
            </span>
            <Badge variant="cyan" className="text-[10px] py-0">
              {availableCharactersCount} available
            </Badge>
          </div>
          <span className="text-[11px] font-mono text-battle-muted block">
            {selectedTeams.length} Franchises • {roundsCount} Rounds ({totalTurnsNeeded} turns total) • {timerDuration}s per turn
          </span>
        </div>

        <Button
          variant="primary"
          size="xl"
          onClick={handleStartGame}
          className="font-broadcast text-sm font-black shadow-glow-cyan flex items-center justify-center gap-2 bg-brand-cyan text-battle-bg border-brand-cyan hover:scale-105 transition-transform"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>START WHO AM I?</span>
        </Button>
      </div>
    </div>
  );
};
