import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  ocrService,
  BackendHealthData,
  LanguageOption,
  PreprocessingOptions,
} from "../services/ocr.service";
import {
  getInitialApiBaseUrl,
  updateApiBaseUrlConfig,
  API_BASE_URL_KEY,
} from "../services/api";

export type OcrType = "read" | "document" | "receipt" | "table" | "batch";

export interface HistoryItem {
  id: string;
  type: OcrType;
  typeLabel: string;
  filename: string;
  timestamp: number;
  confidence: number | null;
  processingDuration?: number | null;
  success: boolean;
  errorMessage?: string;
  language?: string;
  resultData?: any;
}

export interface BackendStatusState {
  isOnline: boolean | null;
  statusText: string;
  ocrEngine?: string;
  workerCount?: number;
  uptime?: number;
  lastChecked: number | null;
  error?: string | null;
  isChecking: boolean;
  apiMetadata?: any;
}

export interface AppPreferences {
  defaultLanguage: string;
  preprocess: boolean;
  grayscale: boolean;
  normalize: boolean;
  sharpen: boolean;
  contrast: number;
  rotate: number;
  threshold: number;
}

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;

  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => Promise<boolean>;

  backendHealth: BackendStatusState;
  checkHealth: () => Promise<void>;

  languages: LanguageOption[];
  defaultLanguage: string;
  isLoadingLanguages: boolean;
  languagesError: string | null;
  fetchLanguages: () => Promise<void>;

  history: HistoryItem[];
  addHistoryRecord: (record: Omit<HistoryItem, "id" | "timestamp">) => void;
  deleteHistoryRecord: (id: string) => void;
  clearAllHistory: () => void;

  preferences: AppPreferences;
  updatePreferences: (partial: Partial<AppPreferences>) => void;

  stats: {
    totalProcessed: number;
    successful: number;
    failed: number;
    averageConfidence: number;
  };
}

const HISTORY_STORAGE_KEY = "ocr_history_records_v1";
const PREFERENCES_STORAGE_KEY = "ocr_user_preferences_v1";
const THEME_STORAGE_KEY = "ocr_app_theme";

const defaultPrefs: AppPreferences = {
  defaultLanguage: "eng",
  preprocess: true,
  grayscale: true,
  normalize: true,
  sharpen: true,
  contrast: 0,
  rotate: 0,
  threshold: 0,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Theme state
  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return "light"; // Light theme by default as per guidelines
  });

  // Base API URL state
  const [apiBaseUrl, setApiBaseUrlState] =
    useState<string>(getInitialApiBaseUrl);

  // Backend Health
  const [backendHealth, setBackendHealth] = useState<BackendStatusState>({
    isOnline: null,
    statusText: "Connecting...",
    lastChecked: null,
    isChecking: false,
  });

  // Languages
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [defaultLanguage, setDefaultLanguage] = useState<string>("eng");
  const [isLoadingLanguages, setIsLoadingLanguages] = useState<boolean>(false);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to parse OCR history from localStorage", e);
    }
    return [];
  });

  // Preferences
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (saved) {
        return { ...defaultPrefs, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error("Failed to load user preferences", e);
    }
    return defaultPrefs;
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
  };

  // Save preferences
  const updatePreferences = (partial: Partial<AppPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Check backend health
  const checkHealth = useCallback(async () => {
    setBackendHealth((prev) => ({ ...prev, isChecking: true }));
    try {
      const res = await ocrService.checkHealth();
      let meta: any = null;
      try {
        const metaRes = await ocrService.getMetadata();
        meta = metaRes.data || metaRes;
      } catch (e) {
        // Metadata endpoint optional
      }

      const healthData = res.data || (res as any);
      setBackendHealth({
        isOnline: true,
        statusText: healthData?.status || "Online",
        ocrEngine: healthData?.ocrEngine || healthData?.engine || "Active",
        workerCount: healthData?.workerCount ?? healthData?.workers,
        uptime: healthData?.uptime,
        lastChecked: Date.now(),
        error: null,
        isChecking: false,
        apiMetadata: meta,
      });
    } catch (err: any) {
      setBackendHealth({
        isOnline: false,
        statusText: "Offline",
        lastChecked: Date.now(),
        error: err?.message || "Failed to connect to backend",
        isChecking: false,
      });
    }
  }, []);

  // Set API base URL with verification
  const setApiBaseUrl = useCallback(
    async (newUrl: string): Promise<boolean> => {
      const cleaned = updateApiBaseUrlConfig(newUrl);
      setApiBaseUrlState(cleaned);
      // Verify health on update
      try {
        const res = await ocrService.checkHealth();
        setBackendHealth({
          isOnline: true,
          statusText: res.data?.status || "Online",
          ocrEngine: res.data?.ocrEngine,
          workerCount: res.data?.workerCount,
          uptime: res.data?.uptime,
          lastChecked: Date.now(),
          error: null,
          isChecking: false,
        });
        return true;
      } catch (err: any) {
        setBackendHealth({
          isOnline: false,
          statusText: "Unreachable",
          lastChecked: Date.now(),
          error: err?.message || "Connection test failed",
          isChecking: false,
        });
        return false;
      }
    },
    [],
  );

  // Fetch languages
  const fetchLanguages = useCallback(async () => {
    setIsLoadingLanguages(true);
    setLanguagesError(null);
    try {
      const res = await ocrService.getLanguages();
      const data = res.data;
      if (data && data.languages) {
        // Format normalized languages list
        const rawLangs = data.languages;
        const normalized: LanguageOption[] = rawLangs.map((item) => {
          if (typeof item === "string") {
            return { code: item, name: item.toUpperCase() };
          }
          return {
            code: item.code || (item as any).id || (item as any).lang,
            name: item.name || (item as any).label || (item as any).code,
          };
        });

        setLanguages(normalized);
        if (data.defaultLanguage) {
          setDefaultLanguage(data.defaultLanguage);
        } else if (normalized.length > 0) {
          setDefaultLanguage(normalized[0].code);
        }
      }
    } catch (err: any) {
      setLanguagesError(err?.message || "Failed to load supported languages");
    } finally {
      setIsLoadingLanguages(false);
    }
  }, []);

  // History management
  const addHistoryRecord = useCallback(
    (record: Omit<HistoryItem, "id" | "timestamp">) => {
      setHistory((prev) => {
        const newItem: HistoryItem = {
          ...record,
          id: `ocr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Date.now(),
        };

        // Keep maximum 80 items to prevent local storage bloat
        const updated = [newItem, ...prev].slice(0, 80);
        try {
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
          console.warn(
            "LocalStorage quota warning, trimming history further",
            e,
          );
          const trimmed = updated.slice(0, 30);
          localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
        }
        return updated;
      });
    },
    [],
  );

  const deleteHistoryRecord = useCallback((id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAllHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  }, []);

  // Compute stats for dashboard
  const stats = useMemo(() => {
    const totalProcessed = history.length;
    let successful = 0;
    let failed = 0;
    let totalConf = 0;
    let confCount = 0;

    for (const item of history) {
      if (item.success) {
        successful++;
        if (
          typeof item.confidence === "number" &&
          !isNaN(item.confidence) &&
          item.confidence > 0
        ) {
          totalConf +=
            item.confidence <= 1 ? item.confidence * 100 : item.confidence;
          confCount++;
        }
      } else {
        failed++;
      }
    }

    const averageConfidence =
      confCount > 0 ? parseFloat((totalConf / confCount).toFixed(1)) : 0;

    return {
      totalProcessed,
      successful,
      failed,
      averageConfidence,
    };
  }, [history]);

  // Initial mount: check health and fetch languages
  useEffect(() => {
    checkHealth();
    fetchLanguages();
  }, [checkHealth, fetchLanguages]);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        apiBaseUrl,
        setApiBaseUrl,
        backendHealth,
        checkHealth,
        languages,
        defaultLanguage,
        isLoadingLanguages,
        languagesError,
        fetchLanguages,
        history,
        addHistoryRecord,
        deleteHistoryRecord,
        clearAllHistory,
        preferences,
        updatePreferences,
        stats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
