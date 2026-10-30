import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Storage key for custom user base URL
export const API_BASE_URL_KEY = 'ocr_api_base_url';

export function getInitialApiBaseUrl(): string {
  const saved = localStorage.getItem(API_BASE_URL_KEY);
  if (saved && saved.trim()) {
    return saved.trim().replace(/\/+$/, '');
  }
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
}

export class OcrApiError extends Error {
  statusCode?: number;
  isBackendUnavailable: boolean;
  rawResponse?: any;

  constructor(message: string, statusCode?: number, isBackendUnavailable = false, rawResponse?: any) {
    super(message);
    this.name = 'OcrApiError';
    this.statusCode = statusCode;
    this.isBackendUnavailable = isBackendUnavailable;
    this.rawResponse = rawResponse;
  }
}

// Create centralized Axios client
const apiClient: AxiosInstance = axios.create({
  baseURL: getInitialApiBaseUrl(),
  timeout: 60000, // OCR processing can take time
  headers: {
    Accept: 'application/json',
  },
});

// Update baseURL dynamically
export function updateApiBaseUrlConfig(newUrl: string): string {
  const cleanUrl = newUrl.trim().replace(/\/+$/, '');
  localStorage.setItem(API_BASE_URL_KEY, cleanUrl);
  apiClient.defaults.baseURL = cleanUrl;
  return cleanUrl;
}

export function resetApiBaseUrlConfig(): string {
  localStorage.removeItem(API_BASE_URL_KEY);
  const defaultUrl = (import.meta as any).env?.VITE_API_BASE_URL?.trim() || 'http://localhost:3000';
  apiClient.defaults.baseURL = defaultUrl;
  return defaultUrl;
}

// Request interceptor: always ensure baseURL is up-to-date
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const currentBase = localStorage.getItem(API_BASE_URL_KEY) || (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000';
  config.baseURL = currentBase.replace(/\/+$/, '');
  return config;
});

// Response interceptor: enforce { success: true } check and format errors
apiClient.interceptors.response.use(
  (response) => {
    const data = response.data;

    // Check if the body contains success: false even if HTTP status is 200
    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      throw new OcrApiError(
        data.message || 'The OCR operation failed.',
        data.statusCode || response.status,
        false,
        data
      );
    }

    return response;
  },
  (error: AxiosError) => {
    if (error instanceof OcrApiError) {
      return Promise.reject(error);
    }

    const currentBase = apiClient.defaults.baseURL || getInitialApiBaseUrl();

    // Network error or backend offline
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return Promise.reject(
          new OcrApiError(
            'Request timed out. OCR processing took too long to complete. Please try a smaller image or adjust preprocessing.',
            408,
            false
          )
        );
      }
      return Promise.reject(
        new OcrApiError(
          `Unable to connect to OCR backend at ${currentBase}. Please ensure your OCR server is running and accessible.`,
          0,
          true
        )
      );
    }

    const status = error.response.status;
    const errorData = error.response.data as ApiResponse | undefined;
    const backendMessage = errorData?.message;

    switch (status) {
      case 400:
        return Promise.reject(
          new OcrApiError(
            backendMessage || 'Invalid upload or validation error. Ensure the image is supported and under 5 MB.',
            400,
            false,
            errorData
          )
        );
      case 404:
        return Promise.reject(
          new OcrApiError(
            backendMessage || 'Requested OCR endpoint was not found on the backend service.',
            404,
            false,
            errorData
          )
        );
      case 408:
        return Promise.reject(
          new OcrApiError(
            backendMessage || 'OCR processing timed out on the server. Please try a clearer or smaller image.',
            408,
            false,
            errorData
          )
        );
      case 429:
        return Promise.reject(
          new OcrApiError(
            backendMessage || 'Rate limit exceeded. Please wait a moment before sending more OCR requests.',
            429,
            false,
            errorData
          )
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return Promise.reject(
          new OcrApiError(
            backendMessage || `Backend internal error (${status}). The OCR engine encountered an issue processing the file.`,
            status,
            status >= 502,
            errorData
          )
        );
      default:
        return Promise.reject(
          new OcrApiError(
            backendMessage || error.message || 'An unexpected error occurred during OCR processing.',
            status,
            false,
            errorData
          )
        );
    }
  }
);

export default apiClient;
