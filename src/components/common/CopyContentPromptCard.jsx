import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  Bot, 
  Download, 
  Upload, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  FileJson
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { toast } from 'sonner';

/**
 * BIDBATTLE 8.0 - Universal Copy Content Prompt Card
 * Replaces old integrated AI with an offline copy-to-clipboard system.
 * Zero external API calls from the client.
 * Instructs ChatGPT to interview the user and output 100% compatible JSON.
 */
export const CopyContentPromptCard = ({
  title = 'CREATE WITH CHATGPT',
  description = 'Generate a custom collection using ChatGPT. Copy our tailored prompt, paste it into ChatGPT, download your JSON file, and import it here.',
  promptText = '',
  targetGame = 'Party Arena',
  badgeText = 'OFFLINE PROMPT GENERATOR',
  accentColor = '#00D9FF',
}) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopyPrompt = async () => {
    if (!promptText) {
      toast.error('Prompt content is empty.');
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(promptText);
        setCopied(true);
        setCopyError(false);
        toast.success(`Prompt copied! Paste it into ChatGPT for ${targetGame}.`);
        setTimeout(() => setCopied(false), 2500);
        return;
      }
      throw new Error('Clipboard API not available');
    } catch (err) {
      // Fallback mechanism: textarea selection
      try {
        const textarea = document.createElement('textarea');
        textarea.value = promptText;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);

        if (successful) {
          setCopied(true);
          setCopyError(false);
          toast.success(`Prompt copied! Paste it into ChatGPT for ${targetGame}.`);
          setTimeout(() => setCopied(false), 2500);
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }

      setCopyError(true);
      setShowPreview(true);
      toast.error('Could not auto-copy. Please copy manually from the preview below.');
    }
  };

  return (
    <div className="rounded-3xl p-5 sm:p-6 bg-battle-surface/60 border border-brand-cyan/40 relative overflow-hidden shadow-lg space-y-4">
      {/* Background ambient lighting */}
      <div 
        className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[90px] opacity-20 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 border"
            style={{ 
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}50`,
              color: accentColor 
            }}
          >
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge 
                variant="cyan" 
                className="text-[10px] font-mono py-0"
                style={{ borderColor: `${accentColor}50`, color: accentColor }}
              >
                {badgeText}
              </Badge>
              <span className="text-[11px] font-mono text-battle-muted">
                100% Offline • Zero API Keys
              </span>
            </div>
            <h3 className="font-broadcast font-bold text-lg text-white tracking-wide">
              {title}
            </h3>
          </div>
        </div>

        {/* Copy Prompt Action Button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleCopyPrompt}
          className="font-broadcast text-xs font-black shadow-glow flex items-center justify-center gap-2 flex-shrink-0"
          style={{
            backgroundColor: copied ? '#10B981' : accentColor,
            borderColor: copied ? '#10B981' : accentColor,
            color: '#080A12',
          }}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>COPIED TO CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>COPY PROMPT FOR CHATGPT</span>
            </>
          )}
        </Button>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-battle-muted leading-relaxed relative z-10">
        {description}
      </p>

      {/* 4-Step Visual Flow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 relative z-10">
        <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border/80 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-brand-cyan">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-battle-muted">Step 1</span>
            <Copy className="w-3.5 h-3.5" />
          </div>
          <span className="font-broadcast text-xs font-bold text-white">Click Copy Prompt</span>
          <span className="text-[10px] text-battle-muted leading-tight">Copies tailored prompt to clipboard</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border/80 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-brand-purple">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-battle-muted">Step 2</span>
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="font-broadcast text-xs font-bold text-white">Paste into ChatGPT</span>
          <span className="text-[10px] text-battle-muted leading-tight">Answer questions for your theme</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border/80 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-brand-neon">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-battle-muted">Step 3</span>
            <Download className="w-3.5 h-3.5" />
          </div>
          <span className="font-broadcast text-xs font-bold text-white">Download JSON</span>
          <span className="text-[10px] text-battle-muted leading-tight">Save generated .json file locally</span>
        </div>

        <div className="p-2.5 rounded-2xl bg-battle-bg border border-battle-border/80 flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between text-brand-orange">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-battle-muted">Step 4</span>
            <Upload className="w-3.5 h-3.5" />
          </div>
          <span className="font-broadcast text-xs font-bold text-white">Import & Play</span>
          <span className="text-[10px] text-battle-muted leading-tight">Upload or paste below to launch</span>
        </div>
      </div>

      {/* Copy Error Notice (if clipboard API blocked) */}
      {copyError && (
        <div className="p-3 rounded-2xl bg-brand-orange/10 border border-brand-orange/40 text-brand-orange flex items-center gap-2 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Clipboard access denied by browser. Please select and copy the prompt text below manually.</span>
        </div>
      )}

      {/* Collapsible Prompt Preview Accordion */}
      <div className="pt-1 relative z-10 border-t border-battle-border/60">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between py-1 text-xs font-mono text-battle-muted hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <FileJson className="w-3.5 h-3.5 text-brand-cyan" />
            <span>{showPreview ? 'Hide Prompt Instructions' : 'View Prompt Instructions'}</span>
          </span>
          {showPreview ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mt-2"
            >
              <div className="relative">
                <textarea
                  readOnly
                  value={promptText}
                  rows={8}
                  className="w-full p-3 rounded-2xl bg-battle-bg border border-battle-border font-mono text-xs text-battle-muted selection:bg-brand-purple selection:text-white focus:outline-none focus:border-brand-purple resize-none"
                  onClick={(e) => e.target.select()}
                />
                <div className="text-[10px] font-mono text-battle-muted mt-1 text-right">
                  Tip: Click text box to select all, then press Ctrl+C (Cmd+C).
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
