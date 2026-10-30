import React, { useState } from 'react';
import { Sliders, RotateCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { PreprocessingOptions } from '../../services/ocr.service';

interface PreprocessingControlsProps {
  options: PreprocessingOptions;
  onChange: (options: PreprocessingOptions) => void;
  disabled?: boolean;
}

export const PreprocessingControls: React.FC<PreprocessingControlsProps> = ({
  options,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (key: keyof PreprocessingOptions) => {
    if (disabled) return;
    onChange({
      ...options,
      [key]: !options[key],
    });
  };

  const handleChange = (key: keyof PreprocessingOptions, value: number) => {
    if (disabled) return;
    onChange({
      ...options,
      [key]: value,
    });
  };

  const hasActiveModifiers =
    options.preprocess ||
    options.grayscale ||
    options.normalize ||
    options.sharpen ||
    (options.contrast !== undefined && options.contrast !== 0) ||
    (options.rotate !== undefined && options.rotate !== 0) ||
    (options.threshold !== undefined && options.threshold !== 0);

  const resetAll = () => {
    onChange({
      preprocess: false,
      grayscale: false,
      normalize: false,
      sharpen: false,
      contrast: 0,
      rotate: 0,
      threshold: 0,
    });
  };

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl overflow-hidden transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Image Preprocessing Options
          </span>
          {hasActiveModifiers && (
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-medium">
              · Configured
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <span className="text-xs">{isOpen ? 'Hide' : 'Configure'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Enhance image quality before OCR analysis</span>
            {hasActiveModifiers && (
              <button
                type="button"
                onClick={resetAll}
                disabled={disabled}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>

          {/* Boolean toggles grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={!!options.preprocess}
                onChange={() => handleToggle('preprocess')}
                disabled={disabled}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Auto-Preprocess
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={!!options.grayscale}
                onChange={() => handleToggle('grayscale')}
                disabled={disabled}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Grayscale
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={!!options.normalize}
                onChange={() => handleToggle('normalize')}
                disabled={disabled}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Normalize
              </span>
            </label>

            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <input
                type="checkbox"
                checked={!!options.sharpen}
                onChange={() => handleToggle('sharpen')}
                disabled={disabled}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Sharpen
              </span>
            </label>
          </div>

          {/* Sliders and rotation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Rotation */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Orientation / Rotate
              </label>
              <select
                value={options.rotate || 0}
                onChange={(e) => handleChange('rotate', Number(e.target.value))}
                disabled={disabled}
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={0}>0° (Standard)</option>
                <option value={90}>90° Clockwise</option>
                <option value={180}>180° Inverted</option>
                <option value={270}>270° Counter-Clockwise</option>
              </select>
            </div>

            {/* Contrast */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Contrast
                </label>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {options.contrast || 0}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                step={5}
                value={options.contrast || 0}
                onChange={(e) => handleChange('contrast', Number(e.target.value))}
                disabled={disabled}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Threshold */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Threshold
                </label>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {options.threshold || 0}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={255}
                step={5}
                value={options.threshold || 0}
                onChange={(e) => handleChange('threshold', Number(e.target.value))}
                disabled={disabled}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
