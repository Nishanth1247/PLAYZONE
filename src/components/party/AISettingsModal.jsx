import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Key, CheckCircle2, AlertTriangle, RefreshCw, Shield, Cpu, WifiOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { getAISettings, saveAISettings, testAIConnection, AI_PROVIDERS } from '../../services/party/aiContentService';
import { toast } from 'sonner';

export const AISettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState(getAISettings);
  const [testingStatus, setTestingStatus] = useState(null); // { loading: boolean, success: boolean, message: string }

  const handleProviderChange = (provKey) => {
    const prov = AI_PROVIDERS[provKey.toUpperCase()] || AI_PROVIDERS.GEMINI;
    setSettings((prev) => ({
      ...prev,
      provider: prov.id,
      model: prov.defaultModel || prev.model,
      customUrl: prov.defaultUrl || '',
    }));
  };

  const handleSave = () => {
    saveAISettings(settings);
    toast.success('AI generation settings saved successfully!');
    onClose();
  };

  const handleTest = async () => {
    setTestingStatus({ loading: true, message: 'Testing AI connection...' });
    const res = await testAIConnection();
    setTestingStatus({
      loading: false,
      success: res.success,
      message: res.message || (res.success ? 'Connected successfully!' : 'Connection failed.'),
    });
  };

  const currentProviderObj = Object.values(AI_PROVIDERS).find((p) => p.id === settings.provider) || AI_PROVIDERS.GEMINI;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl rounded-3xl battle-panel border border-brand-cyan/50 shadow-2xl p-6 sm:p-8 my-8"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-battle-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="cyan" className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Content Engine</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] border-battle-border text-battle-muted">
                Zero Leaks
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-white font-broadcast uppercase tracking-wide">
              AI Generation Settings
            </h3>
            <p className="text-xs text-battle-muted mt-1">
              Connect Google Gemini, OpenAI, Claude, or a local Ollama model to generate endless new challenges.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-battle-surface hover:bg-battle-card border border-battle-border text-battle-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Enable / Offline Toggle */}
          <div className="p-4 rounded-2xl bg-battle-surface border border-battle-border flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-white block">
                Enable AI Content Generation
              </span>
              <span className="text-xs text-battle-muted">
                When disabled, BIDBATTLE runs 100% offline using verified built-in content.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, enabled: !prev.enabled }))}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                settings.enabled ? 'bg-brand-cyan' : 'bg-battle-card border border-battle-border'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enabled && (
            <>
              {/* Provider Selection */}
              <div>
                <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-2">
                  AI Provider
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(AI_PROVIDERS).map(([key, prov]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleProviderChange(key)}
                      className={`p-3 rounded-xl border text-xs font-bold font-broadcast transition-all text-center ${
                        settings.provider === prov.id
                          ? 'bg-brand-purple text-white border-brand-purple shadow-glow-purple'
                          : 'bg-battle-surface text-battle-muted hover:text-white border-battle-border'
                      }`}
                    >
                      {prov.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Choice */}
              {currentProviderObj.models && (
                <div>
                  <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-2">
                    Model
                  </label>
                  <select
                    value={settings.model}
                    onChange={(e) => setSettings((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                  >
                    {currentProviderObj.models.map((m) => (
                      <option key={m} value={m} className="bg-battle-card text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* API Key (if not local Ollama) */}
              {settings.provider !== 'ollama' ? (
                <div>
                  <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-2">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => setSettings((prev) => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Enter provider API key (e.g. AIzaSy... or sk-...)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-xs font-mono focus:outline-none focus:border-brand-cyan pl-9"
                    />
                    <Key className="w-4 h-4 text-battle-muted absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-battle-muted mt-1">
                    🔒 Stored in your local session only. Never exposed in exported files or game lobbies.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold font-broadcast uppercase text-battle-muted tracking-wider block mb-2">
                    Ollama Local URL
                  </label>
                  <input
                    type="text"
                    value={settings.customUrl}
                    onChange={(e) => setSettings((prev) => ({ ...prev, customUrl: e.target.value }))}
                    placeholder="http://localhost:11434"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-battle-surface border border-battle-border text-white text-xs font-mono focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              )}

              {/* Test Status Banner */}
              {testingStatus && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testingStatus.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                }`}>
                  {testingStatus.loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                  ) : testingStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  )}
                  <span>{testingStatus.message}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-6 border-t border-battle-border mt-6">
          {settings.enabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleTest}
              disabled={testingStatus?.loading}
              className="text-xs border-brand-cyan/40 text-brand-cyan hover:bg-brand-cyan/10"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testingStatus?.loading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-brand-neon font-mono">
              <WifiOff className="w-3.5 h-3.5" />
              <span>100% Offline Mode Active</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} className="shadow-glow-purple">
              Save Settings
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
