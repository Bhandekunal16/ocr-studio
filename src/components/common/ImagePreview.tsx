import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Eye } from 'lucide-react';
import { formatFileSize } from '../../utils/fileValidation';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
  showDetails?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  file,
  onRemove,
  showDetails = true,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Compute dimensions
    const img = new Image();
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <>
      <div className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 transition-all hover:border-slate-300 dark:hover:border-slate-700">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/60 dark:border-slate-700/60">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={file.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowFullModal(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150"
              title="Expand preview"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pr-6">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate" title={file.name}>
              {file.name}
            </h4>

            {showDetails && (
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                <span>{formatFileSize(file.size)}</span>
                {dimensions && (
                  <>
                    <span>·</span>
                    <span>{dimensions.width} × {dimensions.height} px</span>
                  </>
                )}
                <span>·</span>
                <span className="uppercase">{file.name.split('.').pop() || 'IMG'}</span>
              </div>
            )}
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Remove image"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Modal */}
      {showFullModal && previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
              <span className="text-xs font-medium truncate max-w-md">{file.name}</span>
              <button
                type="button"
                onClick={() => setShowFullModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={previewUrl}
                alt={file.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
