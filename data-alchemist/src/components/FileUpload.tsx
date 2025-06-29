'use client';

import React from 'react';
import Papa from 'papaparse';

interface Props {
  onDataParsed: (data: any[]) => void;
  label?: string; // ✅ New optional label prop
}

export default function FileUpload({ onDataParsed, label = 'Upload CSV File' }: Props) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = Papa.parse(event.target?.result as string, {
        header: true,
        skipEmptyLines: true,
      });

      onDataParsed(csvData.data);
    };
    reader.readAsText(file);
  };

  return (
    <div className="mb-6">
      <label className="block text-gray-800 font-medium mb-2">{label}</label> {/* ✅ Dynamic label */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
      />
    </div>
  );
}
