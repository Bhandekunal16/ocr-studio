import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { ImageToText } from './pages/ImageToText';
import { DocumentReader } from './pages/DocumentReader';
import { ReceiptReader } from './pages/ReceiptReader';
import { TableExtractor } from './pages/TableExtractor';
import { BatchProcessing } from './pages/BatchProcessing';
import { HistoryPage } from './pages/History';
import { SettingsPage } from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '13px',
              borderRadius: '10px',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Navigate to="/" replace />} />
            <Route path="ocr/read" element={<ImageToText />} />
            <Route path="ocr/document" element={<DocumentReader />} />
            <Route path="ocr/receipt" element={<ReceiptReader />} />
            <Route path="ocr/table" element={<TableExtractor />} />
            <Route path="ocr/batch" element={<BatchProcessing />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
