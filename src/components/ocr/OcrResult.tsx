import React from 'react';
import { TextResult } from './TextResult';
import { DocumentResult } from './DocumentResult';
import { ReceiptResult } from './ReceiptResult';
import { TableResult } from './TableResult';
import { BatchResult } from './BatchResult';
import { OcrType } from '../../context/AppContext';

interface OcrResultProps {
  type: OcrType;
  data: any;
  filename?: string;
}

export const OcrResult: React.FC<OcrResultProps> = ({ type, data, filename }) => {
  if (!data) return null;

  switch (type) {
    case 'read':
      return (
        <TextResult
          text={data.text || ''}
          confidence={data.confidence}
          processingTime={data.processingTime || data.duration}
          language={data.language}
          filename={filename}
        />
      );

    case 'document':
      return <DocumentResult data={data} filename={filename} />;

    case 'receipt':
      return <ReceiptResult data={data} filename={filename} />;

    case 'table':
      return <TableResult data={data} filename={filename} />;

    case 'batch':
      return <BatchResult data={data} />;

    default:
      return (
        <TextResult
          text={typeof data === 'string' ? data : data.text || JSON.stringify(data, null, 2)}
          confidence={data.confidence}
          filename={filename}
        />
      );
  }
};
