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

export const CreateWithChatGPTCard = ({
  title = 'CREATE YOUR OWN TOURNAMENT',
  description = 'Generate a custom tournament using ChatGPT. Copy our prompt, create your JSON file, and import it here.',
  promptText = '',
  targetPlatform = 'Auction Arena',
  badgeText = 'AI GENERATOR',
  accentColor = '#00D9FF', // default cyan
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
        toast.success('Prompt copied! Paste it into ChatGPT.');
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
          toast.success('Prompt copied! Paste it into ChatGPT.');
          setTimeout(() => setCopied(false), 2500);
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }

      // If all automatic copies fail, show manual copy container
      setCopyError(true);
      setShowPreview(true);
      toast.error('Could not auto-copy to clipboard. Please copy manually from the preview below.');
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
          <div className="w-10 h-10 rounded-2xl bg-brand-cyan/15 border border-brand-cyan/40 flex items-center justify-center text-brand-cyan shadow-sm flex-shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Badge variant="cyan" className="text-[10px] font-mono py-0">
                {badgeText}
              </Badge>
              <span className="text-[11px] font-mono text-battle-muted">
                ChatGPT Ready
              </span>
            </div>
            <h3 className="font-broadcast font-black text-sm sm:text-base text-white uppercase tracking-wider">
              {title}
            </h3>
          </div>
        </div>

        {/* Copy Prompt Button */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleCopyPrompt}
            className={`font-broadcast text-xs font-black shadow-glow-cyan flex items-center gap-2 transition-all ${
              copied
                ? 'bg-brand-neon text-dark-950 border-brand-neon'
                : 'bg-brand-cyan hover:bg-cyan-600 text-dark-950 border-brand-cyan'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY CHATGPT PROMPT</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-battle-muted leading-relaxed relative z-10">
        {description}
      </p>

      {/* Workflow Step Indicator */}
      <div className="p-3 rounded-2xl bg-battle-bg/80 border border-battle-border/80 flex items-center justify-between text-[11px] font-mono text-battle-muted flex-wrap gap-2 relative z-10">
        <div className="flex items-center gap-1.5 text-brand-cyan font-bold">
          <span className="w-5 h-5 rounded-full bg-brand-cyan/20 border border-brand-cyan/40 flex items-center justify-center text-[10px]">
            1
          </span>
          <span>COPY PROMPT</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-battle-muted/60 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-purple-300 font-bold">
          <span className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-[10px]">
            2
          </span>
          <span>GENERATE IN CHATGPT</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-battle-muted/60 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-amber-300 font-bold">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px]">
            3
          </span>
          <span>DOWNLOAD .JSON</span>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-battle-muted/60 hidden sm:block" />
        <div className="flex items-center gap-1.5 text-brand-neon font-bold">
          <span className="w-5 h-5 rounded-full bg-brand-neon/20 border border-brand-neon/40 flex items-center justify-center text-[10px]">
            4
          </span>
          <span>IMPORT & PLAY</span>
        </div>
      </div>

      {/* Toggle View Prompt Preview */}
      <div className="pt-1 flex items-center justify-between text-[11px] font-mono relative z-10">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-battle-muted hover:text-white flex items-center gap-1 transition-colors"
        >
          {showPreview ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Hide prompt template</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-brand-cyan" />
              <span>Preview prompt template</span>
            </>
          )}
        </button>

        {copyError && (
          <span className="text-rose-400 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Auto-copy blocked. Please copy manually below.
          </span>
        )}
      </div>

      {/* Collapsible Prompt Preview / Fallback manual copy container */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative z-10"
          >
            <div className="p-3.5 rounded-2xl bg-battle-bg border border-battle-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-battle-muted uppercase tracking-wider">
                  Complete Prompt Template ({promptText.length} characters)
                </span>
                <span className="text-[10px] font-mono text-brand-cyan font-bold">
                  Select All & Copy (Ctrl+C / Cmd+C)
                </span>
              </div>
              <textarea
                readOnly
                value={promptText}
                onClick={(e) => e.target.select()}
                rows={6}
                className="w-full p-2.5 rounded-xl bg-battle-surface/80 border border-battle-border font-mono text-[11px] text-battle-text focus:outline-none focus:border-brand-cyan resize-none selection:bg-brand-cyan selection:text-black"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
