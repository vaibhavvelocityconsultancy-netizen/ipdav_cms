"use client";

import { categories } from "../../plugins/PluginsData";

// import { categories } from './PluginData';

interface PluginCategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function PluginCategoryFilter({
  selectedCategory,
  onCategoryChange,
}: PluginCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedCategory === category.id
              ? "bg-purple-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
}
