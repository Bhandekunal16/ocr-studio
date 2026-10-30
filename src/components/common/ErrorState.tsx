import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message: string;
  statusCode?: number;
  onRetry?: () => void;
  showSettingsLink?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'OCR Processing Failed',
  message,
  statusCode,
  onRetry,
  showSettingsLink = true,
}) => {
  const isConnectionIssue =
    message.toLowerCase().includes('connect') ||
    message.toLowerCase().includes('offline') ||
    message.toLowerCase().includes('network') ||
    statusCode === 0;

  return (
    <div className="p-5 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl my-4 text-left">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">{title}</h4>
            {statusCode ? (
              <span className="text-xs font-mono text-rose-700 dark:text-rose-400 tabular-nums">
                ({statusCode})
              </span>
            ) : null}
          </div>
          <p className="text-xs text-rose-800/90 dark:text-rose-300/90 leading-relaxed mb-3">
            {message}
          </p>

          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry Request
              </button>
            )}

            {isConnectionIssue && showSettingsLink && (
              <Link
                to="/settings"
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg transition-colors"
              >
                Configure API URL in Settings
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
