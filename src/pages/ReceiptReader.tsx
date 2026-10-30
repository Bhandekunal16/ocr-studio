import React, { useState } from 'react';
import { Receipt, Sparkles, RefreshCw } from 'lucide-react';
import { FileUploader } from '../components/common/FileUploader';
import { ImagePreview } from '../components/common/ImagePreview';
import { PreprocessingControls } from '../components/common/PreprocessingControls';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ReceiptResult } from '../components/ocr/ReceiptResult';
import { useOcr } from '../hooks/useOcr';
import { useApp } from '../context/AppContext';
import { ocrService, PreprocessingOptions, ReceiptResultData } from '../services/ocr.service';

export const ReceiptReader: React.FC = () => {
  const { preferences } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preprocessing, setPreprocessing] = useState<PreprocessingOptions>({
    preprocess: preferences.preprocess,
    grayscale: preferences.grayscale,
    normalize: preferences.normalize,
    sharpen: preferences.sharpen,
    contrast: preferences.contrast,
    rotate: preferences.rotate,
    threshold: preferences.threshold,
  });

  const { isProcessing, error, result, execute, clear } = useOcr();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
      clear();
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    clear();
  };

  const handleExtract = async () => {
    if (!selectedFile || isProcessing) return;

    await execute<ReceiptResultData>(
      'receipt',
      'Receipt & Invoice',
      selectedFile.name,
      () => ocrService.readReceipt(selectedFile, preprocessing)
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Receipt & Invoice Reader</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Extract structured financial metadata, dates, tax amounts, merchant names, and itemized billing lines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-4">
          {!selectedFile ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              label="Select or drop receipt / invoice"
              helperText="Upload bill, invoice receipt, or POS slip (JPEG, PNG, WebP, TIFF up to 5 MB)"
            />
          ) : (
            <ImagePreview file={selectedFile} onRemove={handleRemove} />
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <PreprocessingControls
              options={preprocessing}
              onChange={setPreprocessing}
              disabled={isProcessing}
            />
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={!selectedFile || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Financial Data...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Receipt / Invoice</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Display */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing && (
            <LoadingState
              message="Extracting receipt fields & line items..."
              subMessage="Parsing merchant header, detecting currency tokens, computing totals, and isolating line items."
            />
          )}

          {error && (
            <ErrorState
              title="Receipt Extraction Failed"
              message={error}
              onRetry={handleExtract}
            />
          )}

          {result && !isProcessing && (
            <ReceiptResult
              data={result}
              filename={selectedFile?.name || 'receipt-ocr'}
            />
          )}

          {!selectedFile && !isProcessing && !result && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <Receipt className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Awaiting Receipt Image
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a photographed bill or invoice to extract financial totals, merchant names, dates, and line item rows.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
