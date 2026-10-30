import React from 'react';
import { LucideIcon, FileText } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl my-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-3 text-slate-500 dark:text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
