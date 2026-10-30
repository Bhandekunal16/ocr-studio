import React, { useState } from 'react';
import { Copy, Check, Download, Layers, AlignLeft, List, BarChart2, Clock } from 'lucide-react';
import { ConfidenceIndicator } from '../common/ConfidenceIndicator';
import { copyToClipboard, downloadTextAsFile } from '../../utils/download';
import { DocumentResultData, DocumentParagraph, DocumentLine } from '../../services/ocr.service';
import toast from 'react-hot-toast';

interface DocumentResultProps {
  data: DocumentResultData;
  filename?: string;
}

export const DocumentResult: React.FC<DocumentResultProps> = ({
  data,
  filename = 'document-ocr',
}) => {
  const [activeTab, setActiveTab] = useState<'paragraphs' | 'lines' | 'raw'>('paragraphs');
  const [copied, setCopied] = useState(false);

  const fullText = data.text || '';
  const paragraphs: DocumentParagraph[] = data.structure?.paragraphs || [];
  const lines: DocumentLine[] = data.structure?.lines || [];

  const handleCopy = async () => {
    const success = await copyToClipboard(fullText);
    if (success) {
      setCopied(true);
      toast.success('Document text copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    downloadTextAsFile(`${baseName}-document.txt`, fullText);
    toast.success('Downloaded document text');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <BarChart2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Confidence:</span>
            <ConfidenceIndicator confidence={data.confidence} size="sm" showBar />
          </div>

          {(data.processingTime || data.duration) && (
            <>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <div className="flex items-center gap-1 font-mono tabular-nums">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {(data.processingTime || data.duration)! > 50
                    ? `${((data.processingTime || data.duration)! / 1000).toFixed(2)}s`
                    : `${(data.processingTime || data.duration)!.toFixed(2)}s`}
                </span>
              </div>
            </>
          )}

          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="font-mono tabular-nums text-slate-500">
            {paragraphs.length} paragraphs · {lines.length} lines
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy All</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TXT</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs (clean segmented style per guidelines) */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => setActiveTab('paragraphs')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'paragraphs'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Paragraph Structure ({paragraphs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('lines')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'lines'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Line Segmentation ({lines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            activeTab === 'raw'
              ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <AlignLeft className="w-3.5 h-3.5" />
          <span>Raw Text</span>
        </button>
      </div>

      {/* Content views */}
      <div className="p-4 sm:p-5">
        {/* Paragraphs view */}
        {activeTab === 'paragraphs' && (
          <div className="space-y-4">
            {paragraphs.length > 0 ? (
              paragraphs.map((para, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-slate-50/70 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700"
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-800/80 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Paragraph {idx + 1}
                    </span>
                    {para.confidence !== undefined && (
                      <span className="font-mono text-slate-500 tabular-nums">
                        Confidence: <ConfidenceIndicator confidence={para.confidence} size="sm" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {para.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No distinct paragraph structure detected in response. You can view the raw text below.
                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-left font-mono">
                  {fullText}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lines view */}
        {activeTab === 'lines' && (
          <div className="space-y-2">
            {lines.length > 0 ? (
              lines.map((line, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50/50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs text-slate-400 select-none w-7 shrink-0 text-right pt-0.5">
                      {idx + 1}.
                    </span>
                    <span className="text-sm text-slate-800 dark:text-slate-200 leading-snug">
                      {line.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-400 tabular-nums">
                    {line.bbox && (
                      <span className="hidden sm:inline text-[11px] text-slate-400">
                        [{line.bbox.x0 ?? 0}, {line.bbox.y0 ?? 0}]
                      </span>
                    )}
                    {line.confidence !== undefined && (
                      <ConfidenceIndicator confidence={line.confidence} size="sm" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">
                No separate line tokens returned by document model.
              </div>
            )}
          </div>
        )}

        {/* Raw text view */}
        {activeTab === 'raw' && (
          <textarea
            readOnly
            value={fullText}
            rows={12}
            className="w-full font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/40 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed resize-y focus:outline-none"
          />
        )}
      </div>
    </div>
  );
};
