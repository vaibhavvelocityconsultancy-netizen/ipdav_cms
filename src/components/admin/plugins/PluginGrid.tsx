"use client";

import { Plugin } from "@/src/types/plugins";
// import { Plugin } from '@/types/plugins';
import { PluginCard } from "./PluginCard";

interface PluginGridProps {
  plugins: Plugin[];
  onInstall?: (plugin: Plugin) => void;
  onViewDetails?: (plugin: Plugin) => void;
  disabled?: boolean;
}

export function PluginGrid({
  plugins,
  onInstall,
  onViewDetails,
  disabled,
}: PluginGridProps) {
  if (plugins.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No plugins found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plugins.map((plugin) => (
        <PluginCard
          key={plugin.id}
          plugin={plugin}
          onInstall={onInstall}
          onViewDetails={onViewDetails}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
