"use client";

import { Search } from 'lucide-react';

interface PluginSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PluginSearch({ value, onChange, placeholder = 'Search plugins...' }: PluginSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
      />
    </div>
  );
}