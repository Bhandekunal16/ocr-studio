import React, { useState } from 'react';
import { Layers, Sparkles, RefreshCw, X, Trash2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { FileUploader } from '../components/common/FileUploader';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { BatchResult } from '../components/ocr/BatchResult';
import { useOcr } from '../hooks/useOcr';
import { useApp } from '../context/AppContext';
import { ocrService, BatchResultData } from '../services/ocr.service';
import { formatFileSize, MAX_BATCH_SIZE } from '../utils/fileValidation';
import toast from 'react-hot-toast';

export const BatchProcessing: React.FC = () => {
  const { preferences, defaultLanguage } = useApp();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [language, setLanguage] = useState<string>(preferences.defaultLanguage || defaultLanguage || 'eng');

  const { isProcessing, error, result, execute, clear } = useOcr();

  const handleFilesSelected = (newFiles: File[]) => {
    setSelectedFiles((prev) => {
      const combined = [...prev, ...newFiles];
      if (combined.length > MAX_BATCH_SIZE) {
        toast.error(`Maximum batch limit is ${MAX_BATCH_SIZE} files. Only first ${MAX_BATCH_SIZE} kept.`);
        return combined.slice(0, MAX_BATCH_SIZE);
      }
      return combined;
    });
    clear();
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    clear();
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    clear();
  };

  const handleBatchProcess = async () => {
    if (selectedFiles.length === 0 || isProcessing) return;

    await execute<BatchResultData>(
      'batch',
      'Batch Processing',
      `${selectedFiles.length} images batch`,
      () =>
        ocrService.readBatch(selectedFiles, {
          language,
        }),
      { language }
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Batch Image OCR Processing</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Upload up to {MAX_BATCH_SIZE} images simultaneously for parallel backend recognition and grouped results.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Upload & Queue */}
        <div className="lg:col-span-5 space-y-4">
          <FileUploader
            onFilesSelected={handleFilesSelected}
            multiple={true}
            disabled={isProcessing || selectedFiles.length >= MAX_BATCH_SIZE}
            currentCount={selectedFiles.length}
            label={`Upload up to ${MAX_BATCH_SIZE} images`}
            helperText={`${selectedFiles.length}/${MAX_BATCH_SIZE} files queued. JPEG, PNG, WebP, TIFF up to 5 MB each.`}
          />

          {/* Queue List */}
          {selectedFiles.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Queued Files ({selectedFiles.length}/{MAX_BATCH_SIZE})
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}_${idx}`}
                    className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-50/70 dark:hover:bg-slate-850/50 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="font-mono text-slate-400 w-4 text-right">{idx + 1}.</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {file.name}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      disabled={isProcessing}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Language selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isProcessing}
            />
          </div>

          <button
            type="button"
            onClick={handleBatchProcess}
            disabled={selectedFiles.length === 0 || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing Batch of {selectedFiles.length}...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Process All {selectedFiles.length} Images</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Batch Results */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing && (
            <LoadingState
              message={`Running OCR across ${selectedFiles.length} images...`}
              subMessage="Transmitting multipart image payload to backend worker pool and synthesizing item responses."
            />
          )}

          {error && (
            <ErrorState
              title="Batch Execution Failed"
              message={error}
              onRetry={handleBatchProcess}
            />
          )}

          {result && !isProcessing && <BatchResult data={result} />}

          {selectedFiles.length === 0 && !isProcessing && !result && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Layers className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Batch Queue Empty
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Add multiple image files (up to 10) to execute parallel recognition and download merged transcripts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
