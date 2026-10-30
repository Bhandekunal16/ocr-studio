import React, { useState } from 'react';
import {
  Table as TableIcon,
  Download,
  Copy,
  Check,
  Info,
  Maximize2,
  Box,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { TableResultData, TableCell } from '../../services/ocr.service';
import { ConfidenceIndicator } from '../common/ConfidenceIndicator';
import { copyToClipboard, downloadCsv } from '../../utils/download';
import toast from 'react-hot-toast';

interface TableResultProps {
  data: TableResultData;
  filename?: string;
}

export const TableResult: React.FC<TableResultProps> = ({
  data,
  filename = 'extracted-table',
}) => {
  const [copied, setCopied] = useState(false);
  const [showCellConfidence, setShowCellConfidence] = useState(false);
  const [showBBoxes, setShowBBoxes] = useState(false);

  // Normalize headers and rows
  const headers: string[] = Array.isArray(data.headers) ? data.headers : [];
  const rows: (string | number)[][] = Array.isArray(data.rows) ? data.rows : [];
  const cells: TableCell[] = Array.isArray(data.cells) ? data.cells : [];

  // Map cell coordinates to cell info if cells array is provided
  const cellMap = new Map<string, TableCell>();
  cells.forEach((c) => {
    cellMap.set(`${c.row}_${c.col}`, c);
  });

  const handleCopy = async () => {
    // Generate TSV for easy pasting into Excel / Sheets
    const lines: string[] = [];
    if (headers.length > 0) {
      lines.push(headers.join('\t'));
    }
    rows.forEach((row) => {
      lines.push(row.join('\t'));
    });

    const success = await copyToClipboard(lines.join('\n'));
    if (success) {
      setCopied(true);
      toast.success('Table copied (ready to paste into Excel/Sheets)');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy table');
    }
  };

  const handleExportCsv = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    downloadCsv(`${baseName}.csv`, headers, rows);
    toast.success('Exported table to CSV');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Recognized Table Structure
          </span>
          {data.confidence !== undefined && (
            <ConfidenceIndicator confidence={data.confidence} size="sm" showBar />
          )}
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <span className="text-xs text-slate-500 font-mono tabular-nums">
            {rows.length} rows · {headers.length || (rows[0] ? rows[0].length : 0)} cols
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Data</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Mandatory Accuracy Notice from prompt Section 5.D */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50/70 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Notice: Table structure is inferred from OCR word bounding boxes and spatial clustering;
          complex borders or merged cells may require manual verification.
        </span>
      </div>

      {/* Toolbar for Cell Confidence and Bounding Box toggles */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 text-xs">
        <div className="flex items-center gap-3">
          {cells.length > 0 && (
            <>
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showCellConfidence}
                  onChange={(e) => setShowCellConfidence(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Show Cell Confidence</span>
              </label>

              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showBBoxes}
                  onChange={(e) => setShowBBoxes(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Show Bounding Boxes</span>
              </label>
            </>
          )}
        </div>
      </div>

      {/* Table Data */}
      <div className="p-4 overflow-x-auto">
        {rows.length > 0 || headers.length > 0 ? (
          <table className="w-full border-collapse border border-slate-200 dark:border-slate-700 text-xs">
            {headers.length > 0 && (
              <thead className="bg-slate-100/80 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-200 dark:border-slate-700 px-3 py-2 w-10 text-center text-slate-400 font-mono select-none">
                    #
                  </th>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      className="border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-left font-semibold text-slate-800 dark:text-slate-200"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors"
                >
                  <td className="border border-slate-200 dark:border-slate-700 px-2 py-2 text-center text-slate-400 font-mono tabular-nums select-none bg-slate-50/50 dark:bg-slate-900">
                    {rIdx + 1}
                  </td>
                  {row.map((cellValue, cIdx) => {
                    const cellDetail = cellMap.get(`${rIdx}_${cIdx}`);
                    return (
                      <td
                        key={cIdx}
                        className="border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-slate-800 dark:text-slate-200 align-top"
                      >
                        <div className="flex flex-col gap-1">
                          <span>{cellValue}</span>
                          {showCellConfidence && cellDetail?.confidence !== undefined && (
                            <div className="text-[10px]">
                              <ConfidenceIndicator confidence={cellDetail.confidence} size="sm" />
                            </div>
                          )}
                          {showBBoxes && cellDetail?.bbox && (
                            <span className="text-[10px] font-mono text-slate-400">
                              [{cellDetail.bbox.x0}, {cellDetail.bbox.y0}, {cellDetail.bbox.x1}, {cellDetail.bbox.y1}]
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No table rows or column cells could be discerned from this image.
          </div>
        )}
      </div>
    </div>
  );
};
