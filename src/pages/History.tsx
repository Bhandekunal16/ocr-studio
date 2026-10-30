import React, { useState, useMemo } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  X,
  Copy,
} from 'lucide-react';
import { useApp, HistoryItem, OcrType } from '../context/AppContext';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';
import { OcrResult } from '../components/ocr/OcrResult';
import { downloadJson, copyToClipboard } from '../../src/utils/download';
import toast from 'react-hot-toast';

export const HistoryPage: React.FC = () => {
  const { history, deleteHistoryRecord, clearAllHistory } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewingItem, setViewingItem] = useState<HistoryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter history
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch =
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.typeLabel.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [history, searchQuery, selectedType]);

  const handleExportHistory = () => {
    if (history.length === 0) {
      toast.error('No history records to export');
      return;
    }
    downloadJson('ocr-history-export.json', history);
    toast.success('Exported history as JSON');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryRecord(id);
    toast.success('Record deleted');
  };

  const handleConfirmClear = () => {
    clearAllHistory();
    setShowClearConfirm(false);
    toast.success('All history cleared');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>OCR Operation History</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browser-persisted log of OCR extractions, confidence scores, and raw transcripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportHistory}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-lg transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={history.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by filename or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Segmented Buttons (clean style) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-850 rounded-lg overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'read', label: 'Image to Text' },
            { id: 'document', label: 'Document' },
            { id: 'receipt', label: 'Receipt' },
            { id: 'table', label: 'Table' },
            { id: 'batch', label: 'Batch' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                selectedType === tab.id
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Pipeline</th>
                  <th className="px-4 py-3">File Reference</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setViewingItem(item)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-850/60 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      {item.success ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Err
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {item.typeLabel}
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono truncate max-w-xs">
                      {item.filename}
                    </td>

                    <td className="px-4 py-3">
                      <ConfidenceIndicator confidence={item.confidence} size="sm" />
                    </td>

                    <td className="px-4 py-3 font-mono tabular-nums text-slate-500">
                      {item.processingDuration !== null && item.processingDuration !== undefined
                        ? `${item.processingDuration}s`
                        : '—'}
                    </td>

                    <td className="px-4 py-3 text-slate-400 font-mono tabular-nums">
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setViewingItem(item)}
                          className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors"
                          title="View Result"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            {history.length === 0
              ? 'No OCR history recorded yet.'
              : 'No history records match the current filter criteria.'}
          </div>
        )}
      </div>

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Clear All OCR History?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              This action permanently deletes all {history.length} OCR execution records from your browser
              storage. Extracted transcripts will no longer be accessible in this history list.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Confirm Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {viewingItem.typeLabel} Result
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-mono text-slate-500 truncate max-w-xs">
                  {viewingItem.filename}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1">
              {viewingItem.success && viewingItem.resultData ? (
                <OcrResult
                  type={viewingItem.type}
                  data={viewingItem.resultData}
                  filename={viewingItem.filename}
                />
              ) : (
                <div className="p-6 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300">
                  <h4 className="font-semibold mb-1">Execution Failed</h4>
                  <p>{viewingItem.errorMessage || 'No error details recorded for this run.'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
