import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ScanText,
  Receipt,
  TableProperties,
  Layers,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Eye,
  Scan,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/ocr/read', label: 'Image to Text', icon: ScanText },
  { path: '/ocr/document', label: 'Document Reader', icon: FileText },
  { path: '/ocr/receipt', label: 'Receipt & Invoice', icon: Receipt },
  { path: '/ocr/table', label: 'Table Extractor', icon: TableProperties },
  { path: '/ocr/batch', label: 'Batch Processing', icon: Layers },
  { path: '/history', label: 'OCR History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { backendHealth } = useApp();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-200 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Zone */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
          <NavLink
            to="/"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Scan className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  OCR Reader
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Vision Intelligence</span>
              </div>
            )}
          </NavLink>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center px-2' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer: Service status info */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          {!collapsed ? (
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  OCR Engine
                </span>
                <span
                  className={`text-[11px] font-medium font-mono ${
                    backendHealth.isOnline === true
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : backendHealth.isOnline === false
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                >
                  {backendHealth.isOnline === true
                    ? 'Connected'
                    : backendHealth.isOnline === false
                    ? 'Offline'
                    : 'Checking...'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                {backendHealth.ocrEngine || 'Standalone Service'}
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title={`Backend: ${backendHealth.statusText}`}>
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  backendHealth.isOnline === true
                    ? 'bg-emerald-500'
                    : backendHealth.isOnline === false
                    ? 'bg-rose-500'
                    : 'bg-slate-400'
                }`}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
