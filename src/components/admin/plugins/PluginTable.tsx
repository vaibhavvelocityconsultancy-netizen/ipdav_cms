"use client";

import type { Plugin } from "@/src/types/plugins";
import { PluginStatusBadge } from "./PluginStatusBadge";

interface PluginTableProps {
  plugins: Plugin[];
  onAction?: (plugin: Plugin, action: string) => void;
  disabled?: boolean;
}

export function PluginTable({ plugins, onAction, disabled }: PluginTableProps) {
  if (plugins.length === 0) {
    return (
      <div className="text-center py-12 border border-gray-200 rounded-lg">
        <p className="text-gray-500">No installed plugins found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plugin
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {plugins.map((plugin) => (
            <tr key={plugin.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-sm">
                    {plugin.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {plugin.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">
                      {plugin.description}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {plugin.version}
              </td>
              <td className="px-6 py-4">
                <PluginStatusBadge status={plugin.status} />
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {plugin.lastUpdated}
              </td>
              <td className="px-6 py-4 text-right">
                {plugin.status === "active" ? (
                  <button
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50"
                    onClick={() => onAction?.(plugin, "deactivate")}
                    disabled={disabled}
                  >
                    Deactivate
                  </button>
                ) : (
                  <div className="flex justify-end items-center gap-2 text-xs">
                    <button
                      className="font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
                      onClick={() => onAction?.(plugin, "activate")}
                      disabled={disabled}
                    >
                      Activate
                    </button>
                    <span className="text-gray-300">|</span>
                    <button
                      className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                      onClick={() => onAction?.(plugin, "uninstall")}
                      disabled={disabled}
                    >
                      Uninstall
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
