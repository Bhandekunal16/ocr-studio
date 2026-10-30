import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useApp, OcrType } from '../context/AppContext';

export interface UseOcrOptions {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}

export function useOcr(options?: UseOcrOptions) {
  const { addHistoryRecord } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const clear = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  const execute = useCallback(
    async <T,>(
      ocrType: OcrType,
      typeLabel: string,
      filename: string,
      apiCall: () => Promise<{ success: boolean; data?: T; message?: string }>,
      extraMeta?: { language?: string }
    ): Promise<T | null> => {
      if (isProcessing) return null;

      setIsProcessing(true);
      setError(null);
      setResult(null);

      const startTime = performance.now();

      try {
        const response = await apiCall();

        // Enforce success check
        if (!response || response.success === false) {
          throw new Error(response?.message || 'OCR operation was unsuccessful.');
        }

        const data: any = response.data || response;
        const endTime = performance.now();
        const durationSec = Math.max(0.1, parseFloat(((endTime - startTime) / 1000).toFixed(2)));

        // Normalize confidence
        let confidence: number | null = null;
        if (typeof data.confidence === 'number') {
          confidence = data.confidence <= 1 ? Math.round(data.confidence * 100) : Math.round(data.confidence);
        } else if (typeof data.ocrConfidence === 'number') {
          confidence = data.ocrConfidence <= 1 ? Math.round(data.ocrConfidence * 100) : Math.round(data.ocrConfidence);
        }

        setResult(data);
        toast.success(response.message || `${typeLabel} completed successfully!`);

        // Record to history
        addHistoryRecord({
          type: ocrType,
          typeLabel,
          filename,
          confidence,
          processingDuration: data.processingTime || data.duration || durationSec,
          success: true,
          language: extraMeta?.language || data.language,
          resultData: data,
        });

        options?.onSuccess?.(data);
        return data as T;
      } catch (err: any) {
        const errorMsg =
          err?.message || 'An error occurred while communicating with the OCR backend.';
        setError(errorMsg);
        toast.error(errorMsg, { duration: 5000 });

        // Record failed attempt to history
        addHistoryRecord({
          type: ocrType,
          typeLabel,
          filename,
          confidence: null,
          processingDuration: null,
          success: false,
          errorMessage: errorMsg,
          language: extraMeta?.language,
          resultData: null,
        });

        options?.onError?.(err);
        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, addHistoryRecord, options]
  );

  return {
    isProcessing,
    error,
    result,
    setResult,
    execute,
    clear,
  };
}
