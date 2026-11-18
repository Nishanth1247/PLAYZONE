/**
 * BIDBATTLE 7.0 - AI Content Generation Engine
 * Flexible, provider-independent AI service with Gemini, OpenAI, Claude, and local Ollama support.
 * Automatically falls back to verified offline content on timeout or error.
 */

import { validateGameContent } from './contentValidationService';
import { getOfflineContentForGame } from './questionBankService';

const AI_SETTINGS_KEY = 'bidbattle_party_ai_settings_v1';

export const AI_PROVIDERS = {
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash'],
  },
  OPENAI: {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o'],
  },
  CLAUDE: {
    id: 'claude',
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  },
  OLLAMA: {
    id: 'ollama',
    name: 'Local Ollama (Offline LLM)',
    defaultModel: 'llama3:latest',
    defaultUrl: 'http://localhost:11434',
    models: ['llama3:latest', 'mistral:latest', 'qwen2.5:latest'],
  },
  CUSTOM: {
    id: 'custom',
    name: 'Custom Server Proxy',
    defaultModel: 'default',
  },
};

export function getAISettings() {
  try {
    const raw = localStorage.getItem(AI_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }

  return {
    enabled: false,
    provider: 'gemini',
    model: 'gemini-1.5-flash',
    apiKey: '',
    customUrl: '',
    offlineOnly: false,
    timeoutMs: 9000,
  };
}

export function saveAISettings(settings) {
  try {
    localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save AI settings:', e);
    return false;
  }
}

export function isAIConfigured() {
  const settings = getAISettings();
  if (settings.offlineOnly) return false;
  if (!settings.enabled) return false;
  if (settings.provider === 'ollama') return Boolean(settings.customUrl || 'http://localhost:11434');
  return Boolean(settings.apiKey && settings.apiKey.trim().length > 5);
}

/**
 * Tests connection to configured AI endpoint
 */
export async function testAIConnection() {
  const settings = getAISettings();
  if (!isAIConfigured()) {
    return { success: false, message: 'AI is not configured or disabled. In offline mode.' };
  }

  try {
    const res = await fetch('/api/ai/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey,
        customUrl: settings.customUrl,
      }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: `Connection test failed: ${err.message}. Using offline mode.`,
    };
  }
}

/**
 * Generates fresh questions using AI, or falls back to offline engine seamlessly.
 */
export async function generateGameContent({
  gameId,
  universe,
  difficulty = 'mixed',
  category = 'mixed',
  count = 5,
  playerCount = 4,
}) {
  const settings = getAISettings();

  // If AI is disabled or offline-only, return verified offline content immediately
  if (!isAIConfigured() || settings.offlineOnly) {
    const offlineItems = getOfflineContentForGame(gameId, count, difficulty, category);
    return {
      success: true,
      items: offlineItems,
      source: 'offline',
      message: 'Loaded verified offline challenge set',
    };
  }

  // Attempt AI Generation via secure server proxy
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), settings.timeoutMs || 9000);

    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        provider: settings.provider,
        model: settings.model,
        apiKey: settings.apiKey,
        customUrl: settings.customUrl,
        gameId,
        universe,
        difficulty,
        count,
        playerCount,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI proxy returned HTTP status ${response.status}`);
    }

    const result = await response.json();
    if (!result.success || !Array.isArray(result.items)) {
      throw new Error(result.error || 'Empty or invalid response from AI');
    }

    // Validate generated content
    const validation = validateGameContent(gameId, result.items);
    if (!validation.isValid || validation.validItems.length === 0) {
      throw new Error('AI content failed structural validation');
    }

    return {
      success: true,
      items: validation.validItems,
      source: 'ai',
      modelUsed: settings.model,
    };
  } catch (err) {
    console.warn(`AI Generation failed or timed out: ${err.message}. Switching to verified offline content.`);
    const offlineItems = getOfflineContentForGame(gameId, count, difficulty, category);
    return {
      success: true,
      items: offlineItems,
      source: 'offline',
      error: err.message,
      notice: 'AI content unavailable — switching to offline content.',
    };
  }
}
