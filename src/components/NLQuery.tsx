'use client';

import React, { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

export default function NLQuery({ onSearch }: Props) {
  const [query, setQuery] = useState('');

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-800">Search Tasks (in plain English)</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="border px-3 py-2 w-full rounded-md"
          placeholder="e.g., tasks longer than 1 phase and prefer phase 2"
        />
        <button
          onClick={() => onSearch(query)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </div>
  );
}
