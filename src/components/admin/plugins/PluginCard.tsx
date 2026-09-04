"use client";

import { getCategoryIcon } from "../../plugins/PluginsData";

// import { Plugin } from '@/types/plugins';
import { PluginStatusBadge } from "./PluginStatusBadge";
// import { getCategoryIcon } from './PluginData';
import { Plugin } from "@/src/types/plugins";

interface PluginCardProps {
  plugin: Plugin;
  onInstall?: (plugin: Plugin) => void;
  onViewDetails?: (plugin: Plugin) => void;
  disabled?: boolean;
}

export function PluginCard({
  plugin,
  onInstall,
  onViewDetails,
  disabled,
}: PluginCardProps) {
  const isInstalled = plugin.status === "installed" || plugin.installed;

  const handleInstall = () => {
    if (onInstall) {
      onInstall(plugin);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(plugin);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center text-2xl">
            {plugin.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{plugin.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">v{plugin.version}</span>
              {isInstalled && <PluginStatusBadge status="installed" />}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
          {getCategoryIcon(plugin.category)}{" "}
          {plugin.category.charAt(0).toUpperCase() + plugin.category.slice(1)}
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
        {plugin.description}
      </p>

      <div className="flex items-center justify-between gap-3">
        {isInstalled ? (
          <button
            onClick={handleViewDetails}
            disabled={disabled}
            className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Details
          </button>
        ) : (
          <button
            onClick={handleInstall}
            disabled={disabled}
            className="flex-1 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}
