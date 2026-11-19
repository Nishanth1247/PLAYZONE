import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Coins, 
  EyeOff,
  Code2,
  Search
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { validateBattleTournamentJSON } from '../../services/battleImportService';
import { CreateWithChatGPTCard } from '../common/CreateWithChatGPTCard';
import { BATTLE_ARENA_CHATGPT_PROMPT } from '../../services/chatGptPrompts';
import { ImportConfigForm } from '../custom/ImportConfigForm';
import { extractImportTournamentDefaults } from '../../services/importConfigService';
import { useBattleArena } from '../../context/BattleArenaContext';
import { toast } from 'sonner';

export const BattleImportModal = ({
  isOpen,
  onClose,
  teamCount = 4,
  squadSize = 3,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  const { initializeBattleTournament } = useBattleArena();

  const [modalStage, setModalStage] = useState('input'); // 'input' | 'config'
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [searchPreview, setSearchPreview] = useState('');

  const fileInputRef = useRef(null);

  const requiredLots = teamCount * squadSize;

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

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a valid .json tournament file.');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      setJsonText(content);
      runValidation(content);
    };
    reader.readAsText(file);
  };

  const runValidation = (rawJson) => {
    const result = validateBattleTournamentJSON(rawJson, { teamCount, squadSize });
    setValidationResult(result);
  };

  const handleValidateClick = () => {
    if (!jsonText.trim()) {
      toast.error('Please paste JSON text first.');
      return;
    }
    runValidation(jsonText);
  };

  const isValid = Boolean(validationResult && validationResult.isValid);
  const hasErrors = Boolean(validationResult && !validationResult.isValid);

  const extractedDefaults = React.useMemo(() => {
    if (!validationResult || !validationResult.isValid) return null;
    const raw = validationResult.rawParsed || validationResult.tournament;
    return extractImportTournamentDefaults(raw, 'battle');
  }, [validationResult]);

  const handleLaunchBattle = (runtimeConfig) => {
    try {
      const success = initializeBattleTournament({
        teamCount: runtimeConfig.teams.length,
        selectedTeams: runtimeConfig.teams,
        squadSize: runtimeConfig.squadSize || squadSize,
        startingPurse: runtimeConfig.teamBudgets?.defaultPurse || 100,
        countdownDuration: runtimeConfig.rules?.countdownSeconds || 20,
        customItems: runtimeConfig.items,
        customTournament: runtimeConfig,
      });

      if (success) {
        toast.success(`Launched Battle Arena with "${runtimeConfig.name}"!`);
        if (onImportSuccess) {
          onImportSuccess({
            tournament: runtimeConfig,
            items: runtimeConfig.items,
            runtimeConfig,
          });
        }
        onClose();
      }
    } catch (e) {
      toast.error(`Failed to launch battle tournament: ${e.message}`);
    }
  };

  const handleSaveToSetup = (runtimeConfig) => {
    if (onImportSuccess) {
      onImportSuccess({
        tournament: runtimeConfig,
        items: runtimeConfig.items,
        runtimeConfig,
      });
    }
    toast.success(`Loaded "${runtimeConfig.name}" into Battle Arena setup!`);
    onClose();
  };

  const handleConfirmImport = () => {
    if (!isValid || !validationResult?.tournament) {
      toast.error('Cannot import invalid tournament file.');
      return;
    }

    const { tournament, items } = validationResult;
    onImportSuccess({
      tournament,
      items,
      fileName,
    });
    toast.success(`Imported "${tournament.name}" into Battle Arena!`, {
      description: `${items.length} lots loaded. Ready for Round 1 auction.`,
    });
    onClose();
  };

  const filteredPreviewItems = (validationResult?.items || []).filter((item) => {
    if (!searchPreview) return true;
    const q = searchPreview.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.movie && item.movie.toLowerCase().includes(q)) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.actor && item.actor.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl rounded-3xl battle-panel border border-brand-orange/50 shadow-2xl p-6 sm:p-8 overflow-hidden my-8"
      >
        {/* Glow ambient background halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-brand-orange" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="orange" pulse>
                BATTLE ARENA SETUP
              </Badge>
              <Badge variant="cyan" className="font-mono text-[10px]">
                {modalStage === 'config' ? 'Universal Configuration' : 'JSON COMPATIBLE'}
              </Badge>
            </div>
            <h2 className="text-xl sm:text-2xl font-broadcast font-black text-white tracking-wider uppercase">
              {modalStage === 'config' ? 'Configure Battle Tournament' : 'Import Tournament Roster'}
            </h2>
            <p className="text-xs text-battle-muted mt-0.5">
              {modalStage === 'config'
                ? 'Customize franchises, squad quotas, purses, and battle rules before entering the arena.'
                : 'Load a custom tournament JSON for Battle Arena. Entries will enter the Round 1 auction block.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-battle-surface/60 hover:bg-battle-surface border border-battle-border hover:border-battle-borderLight text-battle-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {modalStage === 'config' && extractedDefaults ? (
          <div className="relative z-10">
            <ImportConfigForm
              importedData={validationResult.rawParsed || validationResult.tournament}
              defaults={extractedDefaults}
              arenaType="battle"
              onBackToUpload={() => setModalStage('input')}
              onLaunch={handleLaunchBattle}
              onSaveOnly={handleSaveToSetup}
            />
          </div>
        ) : (
          <>
            {/* Section: CREATE YOUR OWN BATTLE TOURNAMENT — Create with ChatGPT */}
            <div className="mb-5 relative z-10">
              <CreateWithChatGPTCard
                title="CREATE YOUR OWN BATTLE TOURNAMENT"
                description="Generate a custom Battle Arena tournament with ChatGPT. Copy our prompt, create characters with power ratings, and import them here."
                promptText={BATTLE_ARENA_CHATGPT_PROMPT}
                targetPlatform="Battle Arena"
                badgeText="BATTLE AI GENERATOR"
                accentColor="#FF8A35"
              />
            </div>

            {/* Target Requirement Notice */}
            <div className="mb-5 p-3 rounded-2xl bg-battle-surface/70 border border-battle-border flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-2 text-battle-text">
                <Layers className="w-4 h-4 text-brand-orange flex-shrink-0" />
                <span>
                  Target Requirement: <strong className="text-white">{teamCount} Teams</strong> ×{' '}
                  <strong className="text-white">{squadSize} Squad Size</strong>
                </span>
              </div>
              <span className="font-bold text-brand-orange px-2 py-0.5 rounded-lg bg-brand-orange/10 border border-brand-orange/30">
                Min {requiredLots} Entries Required
              </span>
            </div>

        {/* Mode Selector Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-battle-bg border border-battle-border mb-5 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-broadcast font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-battle-surface text-brand-orange border border-brand-orange/40 shadow-sm'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            FILE UPLOAD (.JSON)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-broadcast font-bold tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-battle-surface text-brand-cyan border border-brand-cyan/40 shadow-sm'
                : 'text-battle-muted hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            PASTE JSON TEXT
          </button>
        </div>

        {/* TAB 1: FILE DRAG & DROP */}
        {activeTab === 'upload' && (
          <div className="space-y-4 relative z-10">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-brand-orange bg-brand-orange/10 scale-[1.01]'
                  : 'border-battle-border hover:border-brand-orange/60 bg-battle-bg/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-center text-brand-orange mb-3 shadow-lg">
                <Upload className="w-7 h-7" />
              </div>
              <h3 className="font-broadcast font-bold text-sm text-white mb-1">
                {fileName ? fileName : 'Drag & drop your tournament JSON here'}
              </h3>
              <p className="text-xs text-battle-muted max-w-sm mx-auto">
                Supports standard BIDBATTLE tournament JSON files with schemaVersion 1 and entries list.
              </p>
              <div className="mt-3">
                <Button size="sm" variant="secondary" className="text-xs pointer-events-none">
                  Browse File
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PASTE JSON */}
        {activeTab === 'paste' && (
          <div className="space-y-3 relative z-10">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='Paste tournament JSON structure here, e.g. { "schemaVersion": 1, "tournament": { ... }, "entries": [ ... ] }'
              rows={6}
              className="w-full rounded-2xl p-4 bg-battle-bg border border-battle-border font-mono text-xs text-battle-text focus:outline-none focus:border-brand-cyan transition-colors resize-none"
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={handleValidateClick}
                className="text-xs bg-brand-cyan hover:bg-cyan-600 text-dark-950 font-broadcast font-bold"
              >
                Validate JSON Content
              </Button>
            </div>
          </div>
        )}

        {/* VALIDATION RESULTS SECTION */}
        {validationResult && (
          <div className="mt-5 space-y-4 relative z-10">
            {/* ERRORS BANNER */}
            {hasErrors && (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-200 space-y-2">
                <div className="flex items-center gap-2 text-rose-400 font-broadcast font-bold text-sm">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>Validation Failed ({validationResult.errors.length} Errors Found)</span>
                </div>
                <ul className="text-xs font-mono space-y-1 pl-6 list-disc max-h-36 overflow-y-auto">
                  {validationResult.errors.map((err, idx) => (
                    <li key={idx} className="text-rose-300">
                      <strong>{err.field}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* SUCCESS BANNER & PREVIEW */}
            {isValid && (
              <div className="space-y-4">
                {/* Verified Header */}
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800 flex flex-wrap items-center justify-between gap-3 text-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-broadcast font-bold text-sm text-white">
                        {validationResult.tournament.name}
                      </h4>
                      <span className="text-xs text-emerald-300 font-mono">
                        {validationResult.tournament.category} • {validationResult.entryCount} Entries Available
                      </span>
                    </div>
                  </div>
                  <Badge variant="neon" className="px-2.5 py-1 text-xs">
                    ✓ Verified for {teamCount} Teams ({requiredLots} Min)
                  </Badge>
                </div>

                {/* Entry Previews (Hidden ratings enforced) */}
                <div className="rounded-2xl border border-battle-border bg-battle-bg/90 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-broadcast text-xs font-bold text-white uppercase tracking-wider">
                        Roster Preview ({validationResult.items.length} Lots)
                      </span>
                      <span className="text-[10px] text-battle-muted flex items-center gap-1 font-mono">
                        <EyeOff className="w-3 h-3 text-battle-muted" /> Ratings hidden during auction
                      </span>
                    </div>
                    <div className="relative w-44">
                      <Search className="w-3.5 h-3.5 text-battle-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchPreview}
                        onChange={(e) => setSearchPreview(e.target.value)}
                        placeholder="Search lots..."
                        className="w-full pl-8 pr-2 py-1 text-[11px] rounded-lg bg-battle-surface border border-battle-border text-white placeholder-battle-muted focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredPreviewItems.slice(0, 30).map((lot, idx) => (
                      <div
                        key={lot.id || idx}
                        className="p-2.5 rounded-xl bg-battle-surface/60 border border-battle-border/80 text-left flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <h5 className="font-broadcast font-bold text-xs text-white truncate">
                            #{idx + 1} {lot.name}
                          </h5>
                          <span className="text-[10px] text-battle-muted font-mono block truncate">
                            {lot.movie ? `${lot.movie} • ` : ''}{lot.category}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono font-bold text-brand-orange">
                            ₹{lot.basePrice} Cr
                          </span>
                          <span className="text-[9px] text-battle-muted block font-mono">
                            ★ Hidden
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {filteredPreviewItems.length > 30 && (
                    <p className="text-[10px] text-battle-muted text-center font-mono">
                      Showing first 30 of {filteredPreviewItems.length} entries
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-battle-border relative z-10">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {isValid && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmImport}
                className="text-xs border-battle-border hover:border-brand-orange/40 font-bold"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-brand-neon" />
                <span>Import with Defaults</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              disabled={!isValid}
              onClick={() => {
                if (isValid && extractedDefaults) {
                  setModalStage('config');
                } else {
                  handleConfirmImport();
                }
              }}
              className="text-xs bg-brand-orange hover:bg-orange-600 text-dark-950 font-broadcast font-black shadow-glow-orange flex items-center gap-1.5"
            >
              <span>CONFIGURE TOURNAMENT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
