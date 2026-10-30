import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Globe,
  Sliders,
  Sun,
  Moon,
  Trash2,
  Check,
  RefreshCw,
  AlertCircle,
  HardDrive,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { resetApiBaseUrlConfig } from '../services/api';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const {
    apiBaseUrl,
    setApiBaseUrl,
    backendHealth,
    languages,
    defaultLanguage,
    fetchLanguages,
    theme,
    setTheme,
    preferences,
    updatePreferences,
    history,
    clearAllHistory,
  } = useApp();

  const [inputUrl, setInputUrl] = useState(apiBaseUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Handle URL Test and Save
  const handleSaveAndTestUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUrl = inputUrl.trim().replace(/\/+$/, '');
    if (!targetUrl) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const isConnected = await setApiBaseUrl(targetUrl);
    setIsTesting(false);

    if (isConnected) {
      setTestResult({
        success: true,
        message: `Successfully connected to backend at ${targetUrl}!`,
      });
      toast.success('API Base URL saved and verified');
      // Re-fetch languages on new endpoint
      fetchLanguages();
    } else {
      setTestResult({
        success: false,
        message: `Could not reach ${targetUrl}. Check that your server is running and CORS is permitted.`,
      });
      toast.error('Connection test failed');
    }
  };

  const handleResetUrl = () => {
    const defaultUrl = resetApiBaseUrlConfig();
    setInputUrl(defaultUrl);
    setApiBaseUrl(defaultUrl);
    toast.success('Reset to default API URL');
  };

  // Estimate storage usage
  const estimateStorageSize = () => {
    try {
      const histStr = localStorage.getItem('ocr_history_records_v1') || '';
      const prefStr = localStorage.getItem('ocr_user_preferences_v1') || '';
      const totalBytes = (histStr.length + prefStr.length) * 2; // UTF-16 approximate
      if (totalBytes < 1024) return `${totalBytes} B`;
      return `${(totalBytes / 1024).toFixed(1)} KB`;
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Application Settings</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure backend connectivity, recognition defaults, processing parameters, and local data.
        </p>
      </div>

      {/* 1. Backend API Base URL */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Backend API Configuration
          </h3>
        </div>

        <form onSubmit={handleSaveAndTestUrl} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              API Base URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="http://localhost:3000"
                className="flex-1 text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Test & Save URL</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResetUrl}
                  className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              The frontend communicates directly with the standalone OCR service.
              Default: <code className="font-mono">http://localhost:3000</code> or your deployment host.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </form>
      </div>

      {/* 2. Default Recognition Language */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Language & Recognition Defaults
          </h3>
        </div>

        <div className="max-w-xs">
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Default Language
          </label>
          <select
            value={preferences.defaultLanguage || defaultLanguage || 'eng'}
            onChange={(e) => {
              updatePreferences({ defaultLanguage: e.target.value });
              toast.success(`Default language set to ${e.target.value}`);
            }}
            className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {languages.length > 0 ? (
              languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name} ({l.code})
                </option>
              ))
            ) : (
              <option value="eng">English (eng)</option>
            )}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Loaded dynamically from <code className="font-mono">GET /api/v1/ocr/languages</code>.
          </p>
        </div>
      </div>

      {/* 3. Default Preprocessing Preferences */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Default Preprocessing Pipeline
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              updatePreferences({
                preprocess: false,
                grayscale: false,
                normalize: false,
                sharpen: false,
                contrast: 0,
                rotate: 0,
                threshold: 0,
              });
              toast.success('Preprocessing defaults reset');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Reset Preprocessing
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          These settings will pre-populate when opening Image to Text, Document Reader, and Table Extractor.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.preprocess}
              onChange={(e) => updatePreferences({ preprocess: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Auto-Preprocess
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.grayscale}
              onChange={(e) => updatePreferences({ grayscale: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Grayscale
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.normalize}
              onChange={(e) => updatePreferences({ normalize: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Normalize
            </span>
          </label>

          <label className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.sharpen}
              onChange={(e) => updatePreferences({ sharpen: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Sharpen
            </span>
          </label>
        </div>
      </div>

      {/* 4. Theme Preference */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Sun className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Appearance & Theme
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
              theme === 'light'
                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Theme (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
              theme === 'dark'
                ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-semibold'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Theme</span>
          </button>
        </div>
      </div>

      {/* 5. Local Storage & History Management */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <HardDrive className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Local Storage & History
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {history.length}
              </span>{' '}
              OCR records stored locally in browser
            </div>
            <div>
              Estimated storage footprint:{' '}
              <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 font-medium">
                {estimateStorageSize()}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Only text metadata and recognition tokens are preserved; image binaries are never stored.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all local OCR history?')) {
                clearAllHistory();
                toast.success('History cleared');
              }
            }}
            disabled={history.length === 0}
            className="px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All History</span>
          </button>
        </div>
      </div>
    </div>
  );
};
