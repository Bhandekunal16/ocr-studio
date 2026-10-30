import React, { useState } from 'react';
import { FileText, Sparkles, RefreshCw } from 'lucide-react';
import { FileUploader } from '../components/common/FileUploader';
import { ImagePreview } from '../components/common/ImagePreview';
import { PreprocessingControls } from '../components/common/PreprocessingControls';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { DocumentResult } from '../components/ocr/DocumentResult';
import { useOcr } from '../hooks/useOcr';
import { useApp } from '../context/AppContext';
import { ocrService, PreprocessingOptions, DocumentResultData } from '../services/ocr.service';

export const DocumentReader: React.FC = () => {
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

    await execute<DocumentResultData>(
      'document',
      'Document Reader',
      selectedFile.name,
      () =>
        ocrService.readDocument(selectedFile, {
          ...preprocessing,
          language,
        }),
      { language }
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Structured Document Reader</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Scan multi-line documents to analyze reading order, paragraph blocks, and coordinate bounding boxes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Options Column */}
        <div className="lg:col-span-5 space-y-4">
          {!selectedFile ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              label="Select or drop scanned document"
              helperText="Upload document scan (PDF converted to image, JPG, PNG, WebP, TIFF)"
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
                <span>Parsing Document Structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Read Document Structure</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing && (
            <LoadingState
              message="Analyzing document hierarchy..."
              subMessage="Detecting line breaks, clustering paragraphs, and verifying reading order."
            />
          )}

          {error && (
            <ErrorState
              title="Document OCR Failed"
              message={error}
              onRetry={handleExtract}
            />
          )}

          {result && !isProcessing && (
            <DocumentResult
              data={result}
              filename={selectedFile?.name || 'document-ocr'}
            />
          )}

          {!selectedFile && !isProcessing && !result && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Awaiting Document Image
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a scanned contract, report, or book page to inspect paragraphs, line tokens, and bounding box geometry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
