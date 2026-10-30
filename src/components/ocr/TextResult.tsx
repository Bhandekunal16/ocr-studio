import React, { useState } from 'react';
import { Copy, Check, Download, FileText, Clock, BarChart2 } from 'lucide-react';
import { ConfidenceIndicator } from '../common/ConfidenceIndicator';
import { copyToClipboard, downloadTextAsFile } from '../../utils/download';
import toast from 'react-hot-toast';

interface TextResultProps {
  text: string;
  confidence?: number | null;
  processingTime?: number | null;
  language?: string;
  filename?: string;
}

export const TextResult: React.FC<TextResultProps> = ({
  text,
  confidence,
  processingTime,
  language,
  filename = 'extracted-text',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      toast.success('Text copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    downloadTextAsFile(`${baseName}-ocr.txt`, text);
    toast.success('Downloaded as TXT file');
  };

  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text ? text.length : 0;

  if (!text || text.trim().length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl my-4">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
          No Text Recognized
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          The OCR backend completed analysis but found no legible characters in the provided image.
          Try enhancing contrast or threshold in preprocessing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Confidence:</span>
            <ConfidenceIndicator confidence={confidence} size="sm" showBar />
          </div>

          {processingTime !== null && processingTime !== undefined && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {typeof processingTime === 'number'
                    ? `${processingTime > 50 ? (processingTime / 1000).toFixed(2) : processingTime.toFixed(2)}s`
                    : processingTime}
                </span>
              </div>
            </>
          )}

          {language && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="font-mono uppercase">{language}</span>
            </>
          )}

          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono tabular-nums text-slate-500">
            {wordCount} words · {charCount} chars
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Copy extracted text"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            title="Download text as TXT"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TXT</span>
          </button>
        </div>
      </div>

      {/* Extracted Text Content */}
      <div className="p-4 sm:p-5">
        <textarea
          readOnly
          value={text}
          rows={Math.min(18, Math.max(6, text.split('\n').length + 2))}
          className="w-full font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};
