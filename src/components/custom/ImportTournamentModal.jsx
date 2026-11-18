import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Layers, 
  Coins, 
  Trophy, 
  RefreshCw,
  Code2
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { validateTournamentJSON, normalizeTournamentData, generateUniqueId } from '../../services/tournamentSchema';
import { storageService } from '../../services/storageService';
import { toast } from 'sonner';

export const ImportTournamentModal = ({ isOpen, onClose, onImportSuccess }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [jsonText, setJsonText] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [validationResult, setValidationResult] = useState(null); // { valid, errors, data }
  const [isDuplicateId, setIsDuplicateId] = useState(false);
  const [importAsCopy, setImportAsCopy] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef(null);

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
      toast.error('Please upload a valid .json file');
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
    setIsProcessing(true);
    const res = validateTournamentJSON(rawJson);
    setValidationResult(res);
    setIsProcessing(false);

    const isVal = (res.valid ?? res.isValid) && (!res.errors || res.errors.length === 0);
    const tourneyData = res.data ?? res.rawParsed ?? res.normalizedData;

    if (isVal && tourneyData) {
      const tourney = tourneyData.tournament || tourneyData;
      const targetId = tourney.id;
      const customList = storageService.getCustomTournaments() || [];
      const duplicate = Boolean(
        typeof storageService.isTournamentIdDuplicate === 'function'
          ? storageService.isTournamentIdDuplicate(targetId)
          : customList.some((t) => t.id === targetId)
      );
      setIsDuplicateId(duplicate);
      if (duplicate) {
        setImportAsCopy(true);
      }
    } else {
      setIsDuplicateId(false);
      setImportAsCopy(false);
    }
  };

  const handleValidateClick = () => {
    if (!jsonText.trim()) {
      toast.error('Please paste JSON text first');
      return;
    }
    runValidation(jsonText);
  };

  const isValid = Boolean(
    validationResult && 
    (validationResult.valid || validationResult.isValid) && 
    (!validationResult.errors || validationResult.errors.length === 0)
  );
  const hasErrors = Boolean(
    validationResult && 
    (!isValid || (validationResult.errors && validationResult.errors.length > 0))
  );

  const parsedData = validationResult?.data || validationResult?.rawParsed || validationResult?.normalizedData;
  const parsedTournament = parsedData?.tournament || parsedData;
  const parsedEntries = parsedData?.entries || parsedData?.items || [];

  const handleSaveTournament = () => {
    if (!isValid || !parsedData) {
      toast.error('Please fix validation errors before creating tournament');
      return;
    }

    try {
      const normalized = validationResult.normalizedData || normalizeTournamentData(parsedData);
      
      // Handle ID collision if user chose to import as new copy or duplicate detected
      if (isDuplicateId || importAsCopy) {
        normalized.id = generateUniqueId('custom_tourney');
        normalized.name = `${normalized.name} (Copy)`;
      }

      // Save to localStorage preset store ONLY
      const saved = storageService.saveCustomTournament(normalized);
      
      toast.success(`Tournament "${saved.name}" created and saved to My Custom Tournaments!`, {
        description: `${saved.items.length} lots loaded. Ready to play anytime.`,
      });

      if (onImportSuccess) {
        onImportSuccess(saved);
      }
      onClose();
    } catch (err) {
      toast.error(`Failed to save tournament: ${err.message}`);
    }
  };

  const handleDownloadSample = () => {
    storageService.downloadSampleTemplate();
    toast.success('Sample tournament template downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl rounded-3xl battle-panel border border-brand-purple/50 shadow-2xl p-6 sm:p-8 overflow-hidden my-8"
      >
        {/* Glow ambient background halo */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none bg-brand-purple" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 mb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="purple" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-cyan" />
                <span>Custom Tournament</span>
              </Badge>
              <Badge variant="outline" className="border-battle-border text-battle-muted text-[10px] font-mono">
                schemaVersion: 1
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-broadcast uppercase tracking-wide">
              Import Tournament JSON
            </h2>
            <p className="text-xs text-battle-muted mt-1 max-w-xl">
              Import any custom tournament into your saved presets. The tournament will be saved safely for you to launch whenever you're ready.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadSample}
              className="text-xs border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10"
            >
              <Download className="w-3.5 h-3.5 mr-1" />
              <span>Sample Template</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stage 1: Input method tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-battle-border pb-3">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-broadcast tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'upload'
                ? 'bg-brand-purple text-white shadow-glow-purple'
                : 'bg-battle-surface text-battle-muted hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-broadcast tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'paste'
                ? 'bg-brand-purple text-white shadow-glow-purple'
                : 'bg-battle-surface text-battle-muted hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Paste JSON Text</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="mb-6">
          {activeTab === 'upload' ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-brand-cyan bg-brand-cyan/10' 
                  : 'border-battle-border hover:border-brand-purple/60 bg-battle-surface/40 hover:bg-battle-surface/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-brand-purple/20 border border-brand-purple/40 flex items-center justify-center text-brand-purple">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-white font-broadcast mb-1">
                {fileName ? fileName : 'Choose a JSON file or drag and drop here'}
              </p>
              <p className="text-xs text-battle-muted">
                Standard BidBattle Tournament Schema (.json)
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Paste your JSON tournament structure here, e.g. { "schemaVersion": 1, "tournament": { ... }, "entries": [ ... ] }'
                rows={8}
                className="w-full rounded-2xl bg-battle-surface border border-battle-border p-4 font-mono text-xs text-battle-text focus:outline-none focus:border-brand-purple resize-none"
              />
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleValidateClick}
                  disabled={!jsonText.trim() || isProcessing}
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Validate JSON</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Validation Errors Display */}
        {hasErrors && validationResult?.errors && validationResult.errors.length > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-3">
            <div className="flex items-center gap-2 text-red-400 font-broadcast font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>Validation Failed ({validationResult.errors.length} {validationResult.errors.length === 1 ? 'Error' : 'Errors'})</span>
            </div>
            <p className="text-xs text-battle-muted">
              Please fix the following issues in your JSON structure:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
              {validationResult.errors.map((err, idx) => {
                const fieldName = typeof err === 'object' && err !== null && err.field ? err.field : (typeof err === 'string' && err.includes(':') ? err.split(':')[0] : 'schema');
                const errMsg = typeof err === 'object' && err !== null && err.message ? err.message : (typeof err === 'string' && err.includes(':') ? err.split(':').slice(1).join(':').trim() : String(err));
                return (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/40 border border-red-500/20 text-xs">
                    {fieldName && (
                      <span className="font-mono font-bold text-red-300 bg-red-500/20 px-2 py-0.5 rounded text-[11px] flex-shrink-0">
                        {fieldName}
                      </span>
                    )}
                    <span className="text-battle-text">{errMsg}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stage 3: Preview Section (when valid) */}
        {isValid && parsedTournament && (
          <div className="space-y-6 mb-6">
            {/* Duplicate ID Warning */}
            {isDuplicateId && (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-300 font-broadcast uppercase">
                      ID Conflict Detected
                    </h4>
                    <p className="text-xs text-battle-muted mt-0.5">
                      A tournament with ID <code className="text-amber-200 font-mono">{parsedTournament.id}</code> already exists in your library.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant={importAsCopy ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setImportAsCopy(true)}
                    className="text-xs font-bold"
                  >
                    Import as New Copy
                  </Button>
                </div>
              </div>
            )}

            {/* Tournament Summary Card */}
            <div className="p-5 rounded-2xl bg-battle-surface/80 border border-battle-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-battle-border/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-brand-purple uppercase">
                      {parsedTournament.category || 'Custom Category'}
                    </span>
                    <span className="text-battle-muted">•</span>
                    <span className="text-xs text-brand-cyan font-bold">
                      {parsedTournament.scoreLabel || 'Points'}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white font-broadcast uppercase">
                    {parsedTournament.name} {importAsCopy ? '(Copy)' : ''}
                  </h3>
                  {parsedTournament.description && (
                    <p className="text-xs text-battle-muted mt-1 max-w-xl">
                      {parsedTournament.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-battle-muted block">Total Lots</span>
                    <span className="text-lg font-black font-mono text-brand-neon">
                      {parsedEntries.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-battle-muted block">Default Purse</span>
                    <span className="text-lg font-black font-mono text-brand-cyan">
                      {parsedTournament.currency?.symbol || '₹'}
                      {parsedTournament.teamBudgets?.defaultPurse || 100} {parsedTournament.currency?.unit || 'Cr'}
                    </span>
                  </div>
                </div>
              </div>

              {/* First 5 Preview Lots */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-battle-muted font-broadcast">
                    Preview First 5 Lots ({Math.min(5, parsedEntries.length)} of {parsedEntries.length})
                  </h4>
                  <span className="text-[10px] font-mono text-battle-muted">
                    Full roster ready for Fisher–Yates randomization
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {parsedEntries.slice(0, 5).map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="p-3 rounded-xl bg-battle-card border border-battle-border hover:border-brand-purple/40 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono text-battle-muted">#{idx + 1}</span>
                          <span className="text-[10px] font-mono font-bold text-brand-purple bg-brand-purple/10 px-1.5 py-0.5 rounded">
                            {entry.category || 'Entry'}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white truncate" title={entry.name}>
                          {entry.name}
                        </h5>
                        <p className="text-[10px] text-battle-muted truncate">
                          {entry.role || entry.category || 'Lot'}
                        </p>
                      </div>
                      <div className="mt-2 pt-2 border-t border-battle-border/40 text-[11px] font-mono font-bold text-brand-cyan">
                        {parsedTournament.currency?.symbol || '₹'}{entry.basePrice} {parsedTournament.currency?.unit || 'Cr'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-battle-border">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveTournament}
            disabled={!isValid || isProcessing}
            className="shadow-glow-purple group"
          >
            <CheckCircle2 className="w-4 h-4 mr-2 text-brand-neon group-hover:scale-110 transition-transform" />
            <span>CREATE TOURNAMENT</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
