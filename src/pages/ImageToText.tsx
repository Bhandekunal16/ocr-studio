import React, { useState } from 'react';
import { ScanText, Sparkles, RefreshCw } from 'lucide-react';
import { FileUploader } from '../components/common/FileUploader';
import { ImagePreview } from '../components/common/ImagePreview';
import { PreprocessingControls } from '../components/common/PreprocessingControls';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { TextResult } from '../components/ocr/TextResult';
import { useOcr } from '../hooks/useOcr';
import { useApp } from '../context/AppContext';
import { ocrService, PreprocessingOptions, OcrTextResultData } from '../services/ocr.service';

export const ImageToText: React.FC = () => {
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

    await execute<OcrTextResultData>(
      'read',
      'Image to Text',
      selectedFile.name,
      () =>
        ocrService.readImage(selectedFile, {
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
          <ScanText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Image to Text Recognition</span>
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Extract raw textual streams from images using advanced optical character recognition.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upload & Options Column (Left / Top) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Uploader or Preview */}
          {!selectedFile ? (
            <FileUploader
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
              label="Select or drop image"
              helperText="JPEG, PNG, WebP, or TIFF up to 5 MB"
            />
          ) : (
            <ImagePreview file={selectedFile} onRemove={handleRemove} />
          )}

          {/* Configuration controls */}
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

          {/* Action button */}
          <button
            type="button"
            onClick={handleExtract}
            disabled={!selectedFile || isProcessing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Extracting Text...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Extract Text</span>
              </>
            )}
          </button>
        </div>

        {/* Results Column (Right / Bottom) */}
        <div className="lg:col-span-7 space-y-4">
          {isProcessing && (
            <LoadingState
              message="Processing image with OCR backend..."
              subMessage="Applying preprocessing filters, segmenting word boundaries, and recognizing characters."
            />
          )}

          {error && (
            <ErrorState
              title="Recognition Failed"
              message={error}
              onRetry={handleExtract}
            />
          )}

          {result && !isProcessing && (
            <TextResult
              text={result.text || ''}
              confidence={result.confidence}
              processingTime={result.processingTime || result.duration}
              language={result.language || language}
              filename={selectedFile?.name || 'extracted-text'}
            />
          )}

          {!selectedFile && !isProcessing && !result && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <ScanText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Awaiting Image Upload
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload an image on the left to extract text, inspect confidence levels, and export to TXT.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
