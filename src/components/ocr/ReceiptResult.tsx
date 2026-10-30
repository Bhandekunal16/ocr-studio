import React, { useState } from 'react';
import {
  Receipt,
  Building2,
  Calendar,
  FileSpreadsheet,
  DollarSign,
  Copy,
  Check,
  Download,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ReceiptResultData, ReceiptLineItem } from '../../services/ocr.service';
import { ConfidenceIndicator } from '../common/ConfidenceIndicator';
import { copyToClipboard, downloadTextAsFile } from '../../utils/download';
import toast from 'react-hot-toast';

interface ReceiptResultProps {
  data: ReceiptResultData;
  filename?: string;
}

export const ReceiptResult: React.FC<ReceiptResultProps> = ({
  data,
  filename = 'receipt-ocr',
}) => {
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawContent = data.rawText || data.text || '';
  const currencySymbol = data.currency || '$';

  // Helper to format currency
  const formatMoney = (val: number | string | null | undefined): string => {
    if (val === null || val === undefined || val === '') return '';
    const num = typeof val === 'number' ? val : parseFloat(val);
    if (isNaN(num)) return String(val);
    return `${currencySymbol}${num.toFixed(2)}`;
  };

  const lineItems: ReceiptLineItem[] = Array.isArray(data.lineItems) ? data.lineItems : [];

  const handleCopySummary = async () => {
    const summaryLines = [
      `Merchant: ${data.merchantName || 'N/A'}`,
      `Invoice #: ${data.invoiceNumber || 'N/A'}`,
      `Date: ${data.date || 'N/A'}`,
      `Total Amount: ${formatMoney(data.totalAmount) || 'N/A'}`,
      `Tax: ${formatMoney(data.taxAmount) || 'N/A'}`,
      `Currency: ${data.currency || 'N/A'}`,
      '',
      '--- Line Items ---',
      ...lineItems.map(
        (item) =>
          `${item.description || item.item || item.name || 'Item'} | Qty: ${item.quantity || 1} | Price: ${formatMoney(item.price || item.total) || 'N/A'}`
      ),
      '',
      '--- Raw OCR Text ---',
      rawContent,
    ].join('\n');

    const success = await copyToClipboard(summaryLines);
    if (success) {
      setCopied(true);
      toast.success('Receipt details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    const summary = [
      `=== RECEIPT / INVOICE OCR DATA ===`,
      `Merchant: ${data.merchantName || 'Not detected'}`,
      `Invoice Number: ${data.invoiceNumber || 'Not detected'}`,
      `Date: ${data.date || 'Not detected'}`,
      `Total: ${formatMoney(data.totalAmount) || 'Not detected'}`,
      `Tax: ${formatMoney(data.taxAmount) || 'Not detected'}`,
      `Currency: ${data.currency || 'USD'}`,
      `Confidence: ${data.confidence ?? 'N/A'}%`,
      '',
      `=== LINE ITEMS ===`,
      ...lineItems.map(
        (li, i) =>
          `[${i + 1}] ${li.description || li.item || li.name || 'Item'} - Qty: ${li.quantity || 1} - Price: ${formatMoney(li.price || li.total)}`
      ),
      '',
      `=== RAW OCR TEXT ===`,
      rawContent,
    ].join('\n');

    downloadTextAsFile(`${baseName}-receipt.txt`, summary);
    toast.success('Receipt details downloaded as TXT');
  };

  // Render a field card that distinguishes extracted vs missing gracefully
  const renderField = (
    label: string,
    value: string | number | null | undefined,
    icon: React.ReactNode,
    isCurrency = false
  ) => {
    const isMissing = value === null || value === undefined || value === '';

    return (
      <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-850 border border-slate-200/70 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
          {icon}
          <span>{label}</span>
        </div>
        <div>
          {isMissing ? (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-slate-400" /> Not detected
            </span>
          ) : (
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono">
              {isCurrency ? formatMoney(value) : String(value)}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs my-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Receipt & Invoice Extraction
          </span>
          {data.confidence !== undefined && (
            <ConfidenceIndicator confidence={data.confidence} size="sm" showBar />
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopySummary}
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
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Main Extracted Metadata Grid */}
      <div className="p-4 sm:p-5 space-y-5">
        <div>
          <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
            Key Financial Fields
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {renderField('Merchant Name', data.merchantName, <Building2 className="w-3.5 h-3.5" />)}
            {renderField('Invoice / Receipt #', data.invoiceNumber, <FileSpreadsheet className="w-3.5 h-3.5" />)}
            {renderField('Date', data.date, <Calendar className="w-3.5 h-3.5" />)}
            {renderField('Total Amount', data.totalAmount, <DollarSign className="w-3.5 h-3.5" />, true)}
            {renderField('Tax Amount', data.taxAmount, <DollarSign className="w-3.5 h-3.5" />, true)}
            {renderField('Currency', data.currency, <DollarSign className="w-3.5 h-3.5" />)}
          </div>
        </div>

        {/* Line Items Table */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Line Items ({lineItems.length})
            </h4>
          </div>

          {lineItems.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <tr>
                    <th className="px-3.5 py-2.5">Item Description</th>
                    <th className="px-3.5 py-2.5 text-right">Quantity</th>
                    <th className="px-3.5 py-2.5 text-right">Unit Price</th>
                    <th className="px-3.5 py-2.5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lineItems.map((item, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="px-3.5 py-2.5 font-medium text-slate-800 dark:text-slate-200">
                        {item.description || item.item || item.name || `Item ${idx + 1}`}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {item.quantity ?? 1}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                        {formatMoney(item.price) || '—'}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                        {formatMoney(item.total || item.amount) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-50/50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800 text-center text-xs text-slate-400">
              No individual itemized lines were isolated by OCR engine.
            </div>
          )}
        </div>

        {/* Collapsible Raw Text */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-850 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Raw Extracted OCR Text
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>{showRawText ? 'Collapse' : 'Expand'}</span>
              {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>
          {showRawText && (
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <textarea
                readOnly
                value={rawContent}
                rows={8}
                className="w-full font-mono text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 resize-y focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
