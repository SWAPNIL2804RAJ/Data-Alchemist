'use client';

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import React from 'react';
import clsx from 'clsx';

type EditableTableProps<T> = {
  data: T[];
  columns: ColumnDef<T, any>[];
  errors?: Record<number, string[]>;
};

export default function EditableTable<T>({ data, columns, errors = {} }: EditableTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-auto border border-gray-400 rounded shadow-sm bg-white">
      <table className="min-w-full text-sm text-gray-900">
        <thead className="bg-gray-200 text-gray-800 font-semibold">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-2 border border-gray-400 text-left">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className={clsx('even:bg-gray-100', errors[row.index] && 'bg-red-50')}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-2 border border-gray-300">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Error summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-2 bg-red-100 border border-red-300 text-red-800 text-sm rounded">
          <h4 className="font-semibold mb-1">Validation Errors:</h4>
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(errors).map(([rowIndex, errs]) => (
              <li key={rowIndex}>
                Row {Number(rowIndex) + 1}: {errs.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
