import React, { useState } from 'react';
import { TableProperties, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { FileUploader } from '../components/common/FileUploader';
import { ImagePreview } from '../components/common/ImagePreview';
import { PreprocessingControls } from '../components/common/PreprocessingControls';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { TableResult } from '../components/ocr/TableResult';
import { useOcr } from '../hooks/useOcr';
import { useApp } from '../context/AppContext';
import { ocrService, PreprocessingOptions, TableResultData } from '../services/ocr.service';

export const TableExtractor: React.FC = () => {
  const { preferences, defaultLanguage } = useApp();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>(preferences.defaultLanguage || defaultLanguage || 'eng');
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

    await execute<TableResultData>(
      'table',
      'Table Extractor',
      selectedFile.name,
      () =>
        ocrService.readTable(selectedFile, {
          ...preprocessing,
          language,
        }),
      { language }
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <TableProperties className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Table Data Extractor</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detect rows, headers, and column boundaries from tables and charts, exportable directly to CSV.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Options */}
        <div className="lg:col-span-5 space-y-4">
          {!selectedFile ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              label="Select or drop table image"
              helperText="Upload image of a spreadsheet, ledger, or tabular diagram (JPEG, PNG, WebP, TIFF)"
            />
          ) : (
            <ImagePreview file={selectedFile} onRemove={handleRemove} />
          )}

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
            <LanguageSelector
              value={language}
              onChange={setLanguage}
              disabled={isProcessing}
            />

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
                <span>Extracting Table Structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Table</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Table Results */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing && (
            <LoadingState
              message="Analyzing table grid and cell alignment..."
              subMessage="Clustering coordinates, identifying header rows, and structuring cell matrices."
            />
          )}

          {error && (
            <ErrorState
              title="Table Extraction Failed"
              message={error}
              onRetry={handleExtract}
            />
          )}

          {result && !isProcessing && (
            <TableResult
              data={result}
              filename={selectedFile?.name || 'extracted-table'}
            />
          )}

          {!selectedFile && !isProcessing && !result && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <TableProperties className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Awaiting Table Image
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a table screenshot or scanned report to preview interactive rows, inspect bounding box data, and export as CSV.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
