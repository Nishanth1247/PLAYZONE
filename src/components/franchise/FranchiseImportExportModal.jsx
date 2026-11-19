import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Upload, X, Check, FileJson, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { franchiseService } from '../../services/franchiseService';
import { toast } from 'sonner';

export const FranchiseImportExportModal = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState('export'); // 'export' | 'import'
  const [jsonText, setJsonText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const jsonString = franchiseService.exportFranchises();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `playzone-franchises-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Franchise configuration exported successfully!');
    } catch (err) {
      toast.error('Failed to export franchises: ' + err.message);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setJsonText(content);
        toast.info('JSON loaded into text area. Review and click "Import Franchises".');
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = () => {
    if (!jsonText.trim()) {
      toast.error('Please paste or upload JSON content first.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = franchiseService.importFranchises(jsonText);
      toast.success(
        `Import complete: ${result.importedCount} new created, ${result.updatedCount} updated (${result.totalCount} total active franchises).`
      );
      if (onImportComplete) onImportComplete();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-[#222F43] border border-[#39465A] rounded-3xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between border-b border-[#39465A] pb-3">
          <div className="flex items-center gap-2">
            <FileJson className="w-5 h-5 text-[#D4B879]" />
            <h3 className="font-heading font-black text-lg text-[#F5F3EE]">
              Backup & Transfer Franchises
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#2C394C] text-[#AEB9CC] hover:text-[#F5F3EE]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-[#111827] p-1 border border-[#39465A]">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'export'
                ? 'bg-[#2C394C] text-[#F5F3EE] shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-[#2C394C] text-[#F5F3EE] shadow-sm'
                : 'text-[#AEB9CC] hover:text-[#F5F3EE]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>
        </div>

        {/* Tab 1: Export */}
        {activeTab === 'export' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#2C394C] border border-[#39465A] space-y-2 text-left">
              <span className="text-xs font-mono font-bold text-[#D4B879] uppercase block">
                EXPORT ALL FRANCHISE DATA
              </span>
              <p className="text-xs text-[#AEB9CC] leading-relaxed">
                Download all active and archived franchise configurations, brand colors, custom logos, and metadata as a standard JSON file. You can easily share this with friends or restore it on another device.
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={handleDownload}
              className="w-full font-heading text-xs font-bold bg-[#D4B879] hover:bg-white text-[#111827] py-3.5 shadow-md flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD FRANCHISES (.JSON)</span>
            </Button>
          </div>
        )}

        {/* Tab 2: Import */}
        {activeTab === 'import' && (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-heading font-bold text-[#F5F3EE]">
                Paste JSON or Upload File:
              </label>
              <label className="cursor-pointer text-xs font-mono text-[#D4B879] hover:underline flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload JSON File</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="Paste exported franchise JSON here..."
              rows={6}
              className="w-full p-3 rounded-2xl bg-[#111827] border border-[#39465A] font-mono text-xs text-[#F5F3EE] placeholder-[#AEB9CC]/40 focus:outline-none focus:ring-1 focus:ring-[#D97858]"
            />

            <Button
              variant="primary"
              size="lg"
              onClick={handleImportSubmit}
              disabled={isProcessing || !jsonText.trim()}
              className="w-full font-heading text-xs font-bold bg-[#D97858] hover:bg-white text-[#F5F3EE] hover:text-[#111827] py-3 shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>IMPORT FRANCHISES</span>
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
