import React from 'react';
import { Link } from 'react-router-dom';
import {
  ScanText,
  FileText,
  Receipt,
  TableProperties,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Server,
  Zap,
  Cpu,
  History,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ConfidenceIndicator } from '../components/common/ConfidenceIndicator';

const features = [
  {
    path: '/ocr/read',
    title: 'Image to Text',
    description: 'General OCR text recognition with fine-grained preprocessing controls.',
    icon: ScanText,
    accent: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50/50 dark:bg-indigo-950/30',
  },
  {
    path: '/ocr/document',
    title: 'Document Reader',
    description: 'Extract paragraph layout and line segment coordinates from scanned pages.',
    icon: FileText,
    accent: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50/50 dark:bg-blue-950/30',
  },
  {
    path: '/ocr/receipt',
    title: 'Receipt & Invoice',
    description: 'Parse merchant name, invoice numbers, dates, taxes, and itemized line amounts.',
    icon: Receipt,
    accent: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/30',
  },
  {
    path: '/ocr/table',
    title: 'Table Extractor',
    description: 'Detect rows, columns, and bounding boxes with one-click CSV export.',
    icon: TableProperties,
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50/50 dark:bg-amber-950/30',
  },
  {
    path: '/ocr/batch',
    title: 'Batch Processing',
    description: 'Upload up to 10 images concurrently for queue execution and combined downloads.',
    icon: Layers,
    accent: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50/50 dark:bg-purple-950/30',
  },
];

export const Dashboard: React.FC = () => {
  const { stats, history, backendHealth, checkHealth } = useApp();

  const formatUptime = (seconds?: number) => {
    if (!seconds || seconds <= 0) return '—';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const recentItems = history.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Backend Offline Warning Banner if connection is down */}
      {backendHealth.isOnline === false && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-800 dark:text-amber-200">
            <h4 className="font-semibold text-sm mb-0.5">OCR Backend Not Detected</h4>
            <p className="leading-relaxed mb-2">
              The application could not reach the OCR backend service at the configured endpoint.
              If your backend is running on a different port or host, update the Base URL in Settings.
            </p>
            <div className="flex items-center gap-3">
              <Link
                to="/settings"
                className="font-medium underline hover:text-amber-900 dark:hover:text-amber-100"
              >
                Go to Settings
              </Link>
              <span>·</span>
              <button
                type="button"
                onClick={() => checkHealth()}
                className="font-medium underline hover:text-amber-900 dark:hover:text-amber-100"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Processed */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Processed</span>
            <Activity className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {stats.totalProcessed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded OCR runs</p>
        </div>

        {/* Successful Operations */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Successful Runs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {stats.successful}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {stats.totalProcessed > 0
              ? `${Math.round((stats.successful / stats.totalProcessed) * 100)}% completion rate`
              : 'Zero errors logged'}
          </p>
        </div>

        {/* Failed Operations */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Failed Operations</span>
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
            {stats.failed}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Upload/parsing faults</p>
        </div>

        {/* Average OCR Confidence */}
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Average Confidence</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {stats.averageConfidence > 0 ? `${stats.averageConfidence}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on successful passes</p>
        </div>
      </div>

      {/* Backend Health Diagnostics Strip */}
      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Backend Service Diagnostics
            </h3>
          </div>
          <button
            type="button"
            onClick={() => checkHealth()}
            disabled={backendHealth.isChecking}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
          >
            {backendHealth.isChecking ? 'Verifying...' : 'Check Status'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Connection State</span>
            <span
              className={`font-semibold font-mono ${
                backendHealth.isOnline === true
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : backendHealth.isOnline === false
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500'
              }`}
            >
              {backendHealth.isOnline === true
                ? 'Online & Responsive'
                : backendHealth.isOnline === false
                ? 'Service Offline'
                : 'Probing endpoint...'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">OCR Engine</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {backendHealth.ocrEngine || 'Node.js OCR Service'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Worker Count</span>
            <span className="font-semibold font-mono tabular-nums text-slate-800 dark:text-slate-200">
              {backendHealth.workerCount !== undefined ? `${backendHealth.workerCount} Workers` : 'Available'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-0.5">Server Uptime</span>
            <span className="font-semibold font-mono tabular-nums text-slate-800 dark:text-slate-200">
              {formatUptime(backendHealth.uptime)}
            </span>
          </div>
        </div>

        {backendHealth.error && (
          <p className="mt-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50">
            {backendHealth.error}
          </p>
        )}
      </div>

      {/* Quick Access to OCR Features */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            OCR Processing Pipelines
          </h2>
          <span className="text-xs text-slate-400">Select pipeline mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${item.accent}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Recent OCR Operations
            </h3>
          </div>
          <Link
            to="/history"
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Pipeline Type</th>
                  <th className="px-5 py-3">Target File</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50">
                    <td className="px-5 py-3">
                      {item.success ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {item.typeLabel}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate font-mono">
                      {item.filename}
                    </td>
                    <td className="px-5 py-3">
                      <ConfidenceIndicator confidence={item.confidence} size="sm" />
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 font-mono tabular-nums">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No OCR runs recorded yet. Upload an image in any pipeline to begin.
          </div>
        )}
      </div>
    </div>
  );
};
