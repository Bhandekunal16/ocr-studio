import apiClient, { ApiResponse } from './api';

export interface PreprocessingOptions {
  preprocess?: boolean;
  grayscale?: boolean;
  normalize?: boolean;
  sharpen?: boolean;
  contrast?: number;
  rotate?: number;
  threshold?: number;
}

export interface LanguageOption {
  code: string;
  name: string;
}

export interface LanguagesData {
  languages: LanguageOption[] | string[];
  defaultLanguage: string;
}

export interface BackendHealthData {
  status?: string;
  ocrEngine?: string;
  workerCount?: number;
  uptime?: number;
  timestamp?: string | number;
  version?: string;
  [key: string]: any;
}

export interface OcrTextResultData {
  text: string;
  confidence: number;
  processingTime?: number;
  duration?: number;
  language?: string;
  filename?: string;
  [key: string]: any;
}

export interface DocumentLine {
  text: string;
  confidence?: number;
  bbox?: {
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    width?: number;
    height?: number;
  };
}

export interface DocumentParagraph {
  text: string;
  confidence?: number;
  lines?: DocumentLine[] | string[];
}

export interface DocumentResultData {
  text: string;
  confidence: number;
  processingTime?: number;
  duration?: number;
  language?: string;
  structure?: {
    paragraphs?: DocumentParagraph[];
    lines?: DocumentLine[];
  };
  [key: string]: any;
}

export interface ReceiptLineItem {
  description?: string;
  item?: string;
  name?: string;
  quantity?: number | string;
  price?: number | string;
  total?: number | string;
  amount?: number | string;
  [key: string]: any;
}

export interface ReceiptResultData {
  merchantName?: string | null;
  invoiceNumber?: string | null;
  date?: string | null;
  totalAmount?: number | string | null;
  taxAmount?: number | string | null;
  currency?: string | null;
  lineItems?: ReceiptLineItem[] | null;
  rawText?: string | null;
  text?: string | null;
  confidence?: number;
  processingTime?: number;
  duration?: number;
  [key: string]: any;
}

export interface TableCell {
  row: number;
  col: number;
  text: string;
  confidence?: number;
  bbox?: {
    x0?: number;
    y0?: number;
    x1?: number;
    y1?: number;
    width?: number;
    height?: number;
  };
}

export interface TableResultData {
  headers?: string[];
  rows?: (string | number)[][];
  cells?: TableCell[];
  rawText?: string;
  confidence?: number;
  processingTime?: number;
  duration?: number;
  [key: string]: any;
}

export interface BatchItemResult {
  filename: string;
  success: boolean;
  text?: string | null;
  confidence?: number | null;
  processingTime?: number | null;
  duration?: number | null;
  error?: string | null;
  [key: string]: any;
}

export interface BatchResultData {
  results: BatchItemResult[];
  total?: number;
  successful?: number;
  failed?: number;
  [key: string]: any;
}

// Convert PreprocessingOptions to query params
function buildQueryParams(options?: PreprocessingOptions) {
  if (!options) return {};
  const params: Record<string, string | number | boolean> = {};

  if (options.preprocess !== undefined) params.preprocess = options.preprocess;
  if (options.grayscale !== undefined) params.grayscale = options.grayscale;
  if (options.normalize !== undefined) params.normalize = options.normalize;
  if (options.sharpen !== undefined) params.sharpen = options.sharpen;
  if (options.contrast !== undefined && options.contrast !== 0) params.contrast = options.contrast;
  if (options.rotate !== undefined && options.rotate !== 0) params.rotate = options.rotate;
  if (options.threshold !== undefined && options.threshold !== 0) params.threshold = options.threshold;

  return params;
}

export const ocrService = {
  /**
   * Health check endpoint: GET /api/v1/health
   */
  async checkHealth(): Promise<ApiResponse<BackendHealthData>> {
    const res = await apiClient.get<ApiResponse<BackendHealthData>>('/api/v1/health');
    return res.data;
  },

  /**
   * API Metadata endpoint: GET /
   */
  async getMetadata(): Promise<ApiResponse<any>> {
    const res = await apiClient.get<ApiResponse<any>>('/');
    return res.data;
  },

  /**
   * Supported languages: GET /api/v1/ocr/languages
   */
  async getLanguages(): Promise<ApiResponse<LanguagesData>> {
    const res = await apiClient.get<ApiResponse<LanguagesData>>('/api/v1/ocr/languages');
    return res.data;
  },

  /**
   * Image to Text: POST /api/v1/ocr/read
   * Multipart field: 'image'
   */
  async readImage(
    file: File,
    options?: PreprocessingOptions & { language?: string }
  ): Promise<ApiResponse<OcrTextResultData>> {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.language) {
      formData.append('language', options.language);
    }

    const params = buildQueryParams(options);
    const res = await apiClient.post<ApiResponse<OcrTextResultData>>('/api/v1/ocr/read', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Document Reader: POST /api/v1/ocr/document
   * Multipart field: 'image'
   */
  async readDocument(
    file: File,
    options?: PreprocessingOptions & { language?: string }
  ): Promise<ApiResponse<DocumentResultData>> {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.language) {
      formData.append('language', options.language);
    }

    const params = buildQueryParams(options);
    const res = await apiClient.post<ApiResponse<DocumentResultData>>('/api/v1/ocr/document', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Receipt & Invoice Reader: POST /api/v1/ocr/receipt
   * Multipart field: 'image'
   */
  async readReceipt(
    file: File,
    options?: PreprocessingOptions & { language?: string }
  ): Promise<ApiResponse<ReceiptResultData>> {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.language) {
      formData.append('language', options.language);
    }

    const params = buildQueryParams(options);
    const res = await apiClient.post<ApiResponse<ReceiptResultData>>('/api/v1/ocr/receipt', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Table Extractor: POST /api/v1/ocr/table
   * Multipart field: 'image'
   */
  async readTable(
    file: File,
    options?: PreprocessingOptions & { language?: string }
  ): Promise<ApiResponse<TableResultData>> {
    const formData = new FormData();
    formData.append('image', file);
    if (options?.language) {
      formData.append('language', options.language);
    }

    const params = buildQueryParams(options);
    const res = await apiClient.post<ApiResponse<TableResultData>>('/api/v1/ocr/table', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  /**
   * Batch Processing: POST /api/v1/ocr/batch
   * Multipart field: repeated 'images'
   */
  async readBatch(
    files: File[],
    options?: PreprocessingOptions & { language?: string }
  ): Promise<ApiResponse<BatchResultData>> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }
    if (options?.language) {
      formData.append('language', options.language);
    }

    const params = buildQueryParams(options);
    const res = await apiClient.post<ApiResponse<BatchResultData>>('/api/v1/ocr/batch', formData, {
      params,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
};
