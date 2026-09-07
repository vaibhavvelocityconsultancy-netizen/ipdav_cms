"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  LayoutGrid,
  List,
  Package,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
// import { PluginTable } from '@/components/plugins/PluginTable';
// import { PluginStatsCard } from '@/components/plugins/PluginStatsCard';
// import { PluginSearch } from '@/components/plugins/PluginSearch';
// import { installedPlugins, pluginStats } from '@/components/plugins/PluginData';
// import type { Plugin, PluginViewMode } from '@/types/plugins';
import Link from "next/link";
import { PluginViewMode } from "@/src/types/plugins";
import { PluginStatsCard } from "@/src/components/admin/plugins/PluginStatsCard";
import { PluginSearch } from "@/src/components/admin/plugins/PluginSearch";
import { PluginTable } from "@/src/components/admin/plugins/PluginTable";
import type { Plugin } from "@/src/types/plugins";

interface UninstallTarget {
  plugin: Plugin;
  files: string[];
}

interface BuildJobStatus {
  jobId: string;
  module: string;
  status: "running" | "success" | "failed";
  logs: string[];
  error?: string;
  buildRequired?: boolean;
  active?: boolean;
}

export default function InstalledPluginsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<PluginViewMode>("table");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [uninstallTarget, setUninstallTarget] =
    useState<UninstallTarget | null>(null);
  const [deleteData, setDeleteData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildJobStatus, setBuildJobStatus] = useState<BuildJobStatus | null>(
    null,
  );

  const loadPlugins = async () => {
    setError("");
    try {
      const response = await fetch("/api/modules", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Failed to load plugins");

      setPlugins(
        (payload.modules || [])
          .filter(
            (module: Plugin & { installed?: boolean }) => module.installed,
          )
          .map((module: Plugin & { active?: boolean }) => ({
            ...module,
            id: module.id || module.name,
            version: module.version || "1.0.0",
            icon: module.icon || "🧩",
            category: module.category || "utilities",
            status: module.active ? "active" : "inactive",
            installed: true,
            actions: {
              activate: !module.active,
              deactivate: module.active,
              uninstall: !module.active,
            },
          })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load plugins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlugins();
  }, []);

  const pluginStats = useMemo(
    () => ({
      total: plugins.length,
      active: plugins.filter((plugin) => plugin.status === "active").length,
      inactive: plugins.filter((plugin) => plugin.status === "inactive").length,
      updatesAvailable: 0,
    }),
    [plugins],
  );

  const filteredPlugins = useMemo(() => {
    if (!searchQuery.trim()) return plugins;
    return plugins.filter(
      (plugin) =>
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plugin.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [plugins, searchQuery]);

  const handlePluginAction = async (plugin: Plugin, action: string) => {
    if (action === "uninstall") {
      setDeleteData(false);
      setUninstallTarget({
        plugin,
        files: plugin.files || [`Module files for ${plugin.name}`],
      });
      return;
    }

    if (action === "activate-build") {
      // Start the activate & build job
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/modules/activate-and-build", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleName: plugin.id }),
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Unable to start build");

        // Set initial job status
        setBuildJobStatus({
          jobId: payload.jobId,
          module: plugin.id,
          status: "running",
          logs: [],
        });

        // Poll for job status
        let status = "running";
        while (status === "running") {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const statusResponse = await fetch(
            `/api/modules/install-status?jobId=${encodeURIComponent(payload.jobId)}`,
            { cache: "no-store" },
          );
          const statusPayload = await statusResponse.json();
          if (!statusResponse.ok)
            throw new Error(
              statusPayload.error || "Unable to read build status",
            );

          setBuildJobStatus(statusPayload);
          status = statusPayload.status;

          if (status === "success") {
            // Update plugin to active
            setPlugins((current) =>
              current.map((item) =>
                item.id === plugin.id ? { ...item, status: "active" } : item,
              ),
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to build and activate",
        );
        setBuildJobStatus((current) =>
          current
            ? {
                ...current,
                status: "failed",
                error:
                  err instanceof Error
                    ? err.message
                    : "Build and activation failed",
              }
            : null,
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (action === "deactivate") {
      // Standard deactivate
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/modules/${action}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleName: plugin.id }),
        });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Unable to update plugin status");
        setPlugins((current) =>
          current.map((item) =>
            item.id === plugin.id ? { ...item, status: "inactive" } : item,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update plugin status",
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
  };

  const confirmUninstall = async () => {
    if (!uninstallTarget) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/modules/uninstall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleName: uninstallTarget.plugin.id,
          deleteData,
        }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Unable to uninstall plugin");

      let status = "started";
      while (status === "started" || status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const statusResponse = await fetch(
          `/api/modules/install-status?jobId=${encodeURIComponent(payload.jobId)}`,
          { cache: "no-store" },
        );
        const statusPayload = await statusResponse.json();
        if (!statusResponse.ok)
          throw new Error(
            statusPayload.error || "Unable to read uninstall status",
          );
        status = statusPayload.status;
        if (status === "failed")
          throw new Error(statusPayload.error || "Uninstall failed");
      }

      setPlugins((current) =>
        current.filter((item) => item.id !== uninstallTarget.plugin.id),
      );
      setUninstallTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to uninstall plugin",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Plugins</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Installed Plugins</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Installed Plugins
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all installed plugins on your system.
          </p>
        </div>
        <Link
          href="/admin/plugin/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Add New Plugin
        </Link>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <PluginStatsCard
          title="Total Plugins"
          value={pluginStats.total}
          icon={<Package className="w-5 h-5" />}
        />
        <PluginStatsCard
          title="Active"
          value={pluginStats.active}
          icon={<CheckCircle className="w-5 h-5" />}
          color="text-emerald-600"
        />
        <PluginStatsCard
          title="Inactive"
          value={pluginStats.inactive}
          icon={<Circle className="w-5 h-5" />}
          color="text-gray-600"
        />
        <PluginStatsCard
          title="Updates Available"
          value={pluginStats.updatesAvailable}
          icon={<AlertCircle className="w-5 h-5" />}
          color="text-amber-600"
        />
      </div>

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:max-w-md">
          <PluginSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search installed plugins..."
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-2 rounded transition-colors ${
              viewMode === "table"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="List view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded transition-colors ${
              viewMode === "grid"
                ? "bg-white shadow-sm text-gray-900"
                : "text-gray-500 hover:text-gray-700"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Plugin List */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-500">
          Loading plugins...
        </div>
      ) : viewMode === "table" ? (
        <PluginTable
          plugins={filteredPlugins}
          onAction={handlePluginAction}
          disabled={isSubmitting}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-sm">
                  {plugin.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{plugin.name}</h3>
                  <p className="text-xs text-gray-500">v{plugin.version}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{plugin.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {plugin.lastUpdated}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  {plugin.status === "active" ? (
                    <button
                      className="text-gray-600 hover:text-gray-900 font-medium"
                      onClick={() => handlePluginAction(plugin, "deactivate")}
                      disabled={isSubmitting}
                    >
                      Deactivate
                    </button>
                  ) : (
                    <>
                      <button
                        className="text-purple-600 hover:text-purple-700 font-medium"
                        onClick={() =>
                          handlePluginAction(plugin, "activate-build")
                        }
                        disabled={isSubmitting}
                      >
                        Activate & Build
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        className="text-red-600 hover:text-red-700 font-medium"
                        onClick={() => handlePluginAction(plugin, "uninstall")}
                        disabled={isSubmitting}
                      >
                        Uninstall
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {uninstallTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Uninstall {uninstallTarget.plugin.name}?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete these files?
            </p>
            <ul className="mt-3 max-h-32 list-disc overflow-y-auto pl-5 text-sm text-gray-600">
              {uninstallTarget.files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
            <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={deleteData}
                onChange={(event) => setDeleteData(event.target.checked)}
              />
              Also delete this module's data
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setUninstallTarget(null)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                onClick={confirmUninstall}
                disabled={isSubmitting}
              >
                Yes, Uninstall files
              </button>
            </div>
          </div>
        </div>
      )}

      {buildJobStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">
                {buildJobStatus.status === "running"
                  ? `Building ${buildJobStatus.module}...`
                  : buildJobStatus.status === "success"
                    ? `✓ ${buildJobStatus.module} Activated`
                    : `✗ Build Failed`}
              </h2>
            </div>

            <div className="p-6">
              {/* Build Progress */}
              {buildJobStatus.status === "running" && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 animate-pulse w-1/2"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Building project...
                  </p>
                </div>
              )}

              {/* Status Icon */}
              {buildJobStatus.status !== "running" && (
                <div className="text-center mb-4">
                  {buildJobStatus.status === "success" ? (
                    <div className="text-5xl text-emerald-600">✓</div>
                  ) : (
                    <div className="text-5xl text-red-600">✕</div>
                  )}
                </div>
              )}

              {/* Build Logs */}
              <div className="bg-gray-50 rounded border border-gray-200 p-4 max-h-64 overflow-y-auto font-mono text-xs">
                {buildJobStatus.logs && buildJobStatus.logs.length > 0 ? (
                  <div className="space-y-1">
                    {buildJobStatus.logs.map((log, idx) => (
                      <div key={idx} className="text-gray-700">
                        {log}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No logs yet...</p>
                )}
              </div>

              {/* Error Message */}
              {buildJobStatus.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-700">{buildJobStatus.error}</p>
                </div>
              )}

              {/* Status Summary */}
              {buildJobStatus.status === "success" && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded">
                  <p className="text-sm text-emerald-700">
                    Module activated successfully. Application restarting...
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {buildJobStatus.status !== "running" && (
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  className="px-4 py-2 rounded bg-purple-600 text-white text-sm font-medium hover:bg-purple-700"
                  onClick={() => {
                    setBuildJobStatus(null);
                    loadPlugins(); // Refresh plugin list
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
