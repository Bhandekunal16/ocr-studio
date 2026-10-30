import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Upload, AlertCircle, FileUp } from 'lucide-react';
import {
  ALLOWED_EXTENSIONS,
  validateOcrFile,
  validateBatchFiles,
  MAX_FILE_SIZE_BYTES,
  MAX_BATCH_SIZE,
} from '../../utils/fileValidation';

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  currentCount?: number;
  label?: string;
  helperText?: string;
  accept?: string;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesSelected,
  multiple = false,
  disabled = false,
  currentCount = 0,
  label,
  helperText,
  accept = ALLOWED_EXTENSIONS.join(','),
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const processFileList = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setValidationError(null);

    const rawFiles = Array.from(fileList);

    if (multiple) {
      const { validFiles, errors } = validateBatchFiles(rawFiles, currentCount);
      if (errors.length > 0) {
        setValidationError(errors[0]);
      }
      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    } else {
      const singleFile = rawFiles[0];
      const validation = validateOcrFile(singleFile);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid file format or size exceeds 5 MB.');
      } else {
        onFilesSelected([singleFile]);
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    processFileList(e.dataTransfer.files);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    processFileList(e.target.files);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-150 ${
          disabled
            ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleFileChange}
          className="hidden"
          aria-label={label || 'Upload file'}
        />

        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
              isDragOver
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Upload className="w-6 h-6" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
            {label || (multiple ? 'Drop images here or browse' : 'Drop an image here or browse')}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-3 leading-relaxed">
            {helperText ||
              (multiple
                ? `Upload up to ${MAX_BATCH_SIZE} images (JPEG, PNG, WebP, TIFF). Max 5 MB per file.`
                : 'Supports JPEG, PNG, WebP, and TIFF up to 5 MB per file.')}
          </p>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <FileUp className="w-3.5 h-3.5 text-slate-500" />
            Browse Files
          </span>
        </div>
      </div>

      {validationError && (
        <div className="mt-2.5 flex items-start gap-2 p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
