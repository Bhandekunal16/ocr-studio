import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing image with OCR backend...',
  subMessage = 'Extracting character streams, recognizing word patterns, and detecting geometry.',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl my-4">
      <div className="relative flex items-center justify-center mb-4">
        <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {message}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
        {subMessage}
      </p>

      {/* Indeterminate linear pulse indicator */}
      <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-5 overflow-hidden">
        <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full w-1/3 animate-[indeterminate_1.5s_infinite_ease-in-out]" />
      </div>
    </div>
  );
};
