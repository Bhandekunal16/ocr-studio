import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
  showBar = false,
}) => {
  if (confidence === null || confidence === undefined || isNaN(confidence)) {
    return <span className="text-slate-400 text-xs">N/A</span>;
  }

  // Normalize if value is in 0..1 range
  const normalized = confidence <= 1 ? Math.round(confidence * 100) : Math.round(confidence);

  let textColor = 'text-emerald-700 dark:text-emerald-400';
  let barColor = 'bg-emerald-500';
  let qualityText = 'High confidence';

  if (normalized < 70) {
    textColor = 'text-rose-700 dark:text-rose-400';
    barColor = 'bg-rose-500';
    qualityText = 'Low confidence';
  } else if (normalized < 85) {
    textColor = 'text-amber-700 dark:text-amber-400';
    barColor = 'bg-amber-500';
    qualityText = 'Moderate confidence';
  }

  const textSize =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-semibold' : 'text-sm font-medium';

  return (
    <div className="inline-flex items-center gap-2">
      <span className={`${textSize} ${textColor} font-mono tabular-nums tracking-tight`}>
        {normalized}%
      </span>
      {size !== 'sm' && (
        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
          · {qualityText}
        </span>
      )}
      {showBar && (
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(100, Math.max(0, normalized))}%` }}
          />
        </div>
      )}
    </div>
  );
};
