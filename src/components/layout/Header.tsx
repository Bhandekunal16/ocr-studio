import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Sun, Moon, RefreshCw, Server, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  onOpenMobile: () => void;
}

const pageTitles: Record<string, { title: string; category: string }> = {
  '/': { title: 'Dashboard', category: 'Overview' },
  '/ocr/read': { title: 'Image to Text', category: 'Recognition' },
  '/ocr/document': { title: 'Document Reader', category: 'Recognition' },
  '/ocr/receipt': { title: 'Receipt & Invoice', category: 'Extraction' },
  '/ocr/table': { title: 'Table Extractor', category: 'Structure' },
  '/ocr/batch': { title: 'Batch Processing', category: 'Queue' },
  '/history': { title: 'OCR History', category: 'Records' },
  '/settings': { title: 'Settings', category: 'Preferences' },
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobile }) => {
  const location = useLocation();
  const { theme, toggleTheme, backendHealth, checkHealth } = useApp();

  const currentMeta = pageTitles[location.pathname] || {
    title: 'OCR Reader',
    category: 'System',
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Clean Breadcrumb without badges */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="hidden sm:inline font-medium">{currentMeta.category}</span>
          <span className="hidden sm:inline" aria-hidden="true">
            /
          </span>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Health Telemetry & Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* Backend status display */}
        <button
          type="button"
          onClick={() => checkHealth()}
          disabled={backendHealth.isChecking}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
          title="Click to re-check backend connection"
        >
          {backendHealth.isChecking ? (
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
          ) : backendHealth.isOnline === true ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : backendHealth.isOnline === false ? (
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          ) : (
            <Server className="w-3.5 h-3.5 text-slate-400" />
          )}

          <span className="hidden sm:inline font-mono tabular-nums text-slate-700 dark:text-slate-300">
            {backendHealth.isChecking
              ? 'Checking...'
              : backendHealth.isOnline === true
              ? 'Backend Online'
              : backendHealth.isOnline === false
              ? 'Backend Offline'
              : 'Status Pending'}
          </span>
        </button>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
