import React from 'react';
import { Download, Upload } from 'lucide-react';
import { RatingFactor } from '../types/ratingFactor';
import Papa from 'papaparse';

interface ImportExportProps {
  onImport: (data: RatingFactor[]) => Promise<void>;
  data: RatingFactor[];
}

export function ImportExport({ onImport, data }: ImportExportProps) {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: (results) => {
        const parsedData = results.data.slice(1).map((row: any) => ({
          name: row[0],
          type: row[1],
          value: parseFloat(row[2]),
          effective_date: row[3],
          status: row[4],
        }));
        onImport(parsedData);
      },
      header: true,
    });
  };

  const handleExport = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rating_factors_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex space-x-4">
      <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
        <Upload className="w-4 h-4 mr-2" />
        <span>Import CSV</span>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
      <button
        onClick={handleExport}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Download className="w-4 h-4 mr-2" />
        <span>Export CSV</span>
      </button>
    </div>
  );
}