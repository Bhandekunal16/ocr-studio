import React from 'react';
import { Globe, RefreshCw, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { languages, isLoadingLanguages, languagesError, fetchLanguages, defaultLanguage } =
    useApp();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>Recognition Language</span>
        </label>
        {languagesError && (
          <button
            type="button"
            onClick={() => fetchLanguages()}
            className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        )}
      </div>

      <div className="relative">
        <select
          value={value || defaultLanguage || ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isLoadingLanguages}
          className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed font-medium"
        >
          {languages.length > 0 ? (
            languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name} ({lang.code})
              </option>
            ))
          ) : (
            <option value="eng">English (eng)</option>
          )}
        </select>
      </div>

      {languagesError && (
        <span className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Using default language fallback ({languagesError})
        </span>
      )}
    </div>
  );
};
