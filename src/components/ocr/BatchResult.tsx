import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  FileArchive,
} from 'lucide-react';
import { BatchResultData, BatchItemResult } from '../../services/ocr.service';
import { ConfidenceIndicator } from '../common/ConfidenceIndicator';
import { downloadTextAsFile, copyToClipboard } from '../../utils/download';
import toast from 'react-hot-toast';

interface BatchResultProps {
  data: BatchResultData;
}

export const BatchResult: React.FC<BatchResultProps> = ({ data }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const results: BatchItemResult[] = Array.isArray(data.results) ? data.results : [];
  const total = data.total ?? results.length;
  const successful = data.successful ?? results.filter((r) => r.success).length;
  const failed = data.failed ?? results.filter((r) => !r.success).length;

  const handleDownloadSingle = (item: BatchItemResult) => {
    if (!item.text) {
      toast.error('No text to download for this item');
      return;
    }
    const cleanName = item.filename.replace(/\.[^/.]+$/, '');
    downloadTextAsFile(`${cleanName}-ocr.txt`, item.text);
    toast.success(`Downloaded ${cleanName}-ocr.txt`);
  };

  const handleDownloadAll = () => {
    const combinedContent = results
      .map((item, idx) => {
        return [
          `=========================================`,
          `FILE #${idx + 1}: ${item.filename}`,
          `STATUS: ${item.success ? 'SUCCESS' : 'FAILED'}`,
          `CONFIDENCE: ${item.confidence !== null && item.confidence !== undefined ? item.confidence + '%' : 'N/A'}`,
          `DURATION: ${item.processingTime || item.duration || 'N/A'}s`,
          item.error ? `ERROR: ${item.error}` : '',
          `-----------------------------------------`,
          item.text || '(No text extracted)',
          `=========================================`,
          '',
        ].join('\n');
      })
      .join('\n\n');

    downloadTextAsFile('batch-ocr-combined-results.txt', combinedContent);
    toast.success('Downloaded all batch results as combined text');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-4">
      {/* Top Bar Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex items-center gap-3 text-xs">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            Batch OCR Completed:
          </span>
          <span className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
            {total} Total
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
            {successful} Succeeded
          </span>
          {failed > 0 && (
            <>
              <span>·</span>
              <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                {failed} Failed
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleDownloadAll}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <FileArchive className="w-3.5 h-3.5" />
          <span>Download All Combined</span>
        </button>
      </div>

      {/* List of files */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {results.map((item, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div key={idx} className="transition-colors">
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block">
                      {item.filename}
                    </span>
                    {item.error && (
                      <span className="text-[11px] text-rose-600 dark:text-rose-400 truncate block">
                        {item.error}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {item.success && (
                    <div className="hidden sm:flex items-center gap-2">
                      <ConfidenceIndicator confidence={item.confidence} size="sm" showBar />
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    {item.success && item.text && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadSingle(item);
                        }}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Download file text"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/80">
                  {item.success ? (
                    item.text ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span>Extracted text preview:</span>
                          <button
                            type="button"
                            onClick={async () => {
                              await copyToClipboard(item.text || '');
                              toast.success('Text copied');
                            }}
                            className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={item.text}
                          rows={6}
                          className="w-full font-mono text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 resize-y focus:outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No text recognized in this file.</p>
                    )
                  ) : (
                    <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300">
                      <strong>Processing Error:</strong> {item.error || 'Failed to process this image'}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
