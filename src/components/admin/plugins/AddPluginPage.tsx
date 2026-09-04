"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Download,
  Hammer,
  Package,
  Plus,
  Rocket,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { PluginCategoryFilter } from "./PluginCategoryFilter";
import { PluginGrid } from "./PluginGrid";
import { PluginSearch } from "./PluginSearch";
import type { Plugin } from "@/src/types/plugins";

const installSteps = [
  { id: "installing", label: "Installing", icon: Download },
  { id: "building", label: "Building", icon: Hammer },
  { id: "activating", label: "Activating", icon: Zap },
  { id: "complete", label: "Complete", icon: Check },
] as const;

type InstallStage = (typeof installSteps)[number]["id"];

function normalizeModule(module: Partial<Plugin> & { name: string }): Plugin {
  return {
    ...module,
    id: module.id || module.name,
    name: module.name,
    description: module.description || "",
    version: module.version || "1.0.0",
    icon: module.icon || "🧩",
    category: module.category || "utilities",
    status: module.installed ? "installed" : "available",
    installed: Boolean(module.installed),
  } as Plugin;
}

export default function AddPluginPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [installingPlugin, setInstallingPlugin] = useState<Plugin | null>(null);
  const [installStage, setInstallStage] = useState<InstallStage | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPlugins() {
      try {
        const response = await fetch("/api/modules", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok)
          throw new Error(payload.error || "Failed to load plugins");
        if (!cancelled)
          setPlugins((payload.modules || []).map(normalizeModule));
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load plugins",
          );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPlugins();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPlugins = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return plugins.filter((plugin) => {
      const matchesCategory =
        selectedCategory === "all" || plugin.category === selectedCategory;
      const matchesSearch =
        !normalizedQuery ||
        plugin.name.toLowerCase().includes(normalizedQuery) ||
        plugin.description.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [plugins, searchQuery, selectedCategory]);

  const handleInstall = async (plugin: Plugin) => {
    setInstallingPlugin(plugin);
    setInstallStage("installing");
    setIsInstalling(true);
    setError("");

    try {
      const response = await fetch("/api/modules/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleName: plugin.id }),
      });
      const payload = await response.json();
      if (!response.ok)
        throw new Error(payload.error || "Failed to install plugin");

      let status = "started";
      while (status === "started" || status === "running") {
        await new Promise((resolve) => setTimeout(resolve, 700));
        const statusResponse = await fetch(
          `/api/modules/install-status?jobId=${encodeURIComponent(payload.jobId)}`,
          { cache: "no-store" },
        );
        const statusPayload = await statusResponse.json();
        if (!statusResponse.ok)
          throw new Error(
            statusPayload.error || "Unable to read install status",
          );
        status = statusPayload.status;
        if (
          statusPayload.logs?.some((log: string) => log.includes("Building"))
        ) {
          setInstallStage("building");
        }
        if (status === "failed")
          throw new Error(statusPayload.error || "Install failed");
      }

      setPlugins((current) =>
        current.map((item) =>
          item.id === plugin.id
            ? { ...item, installed: true, status: "installed" }
            : item,
        ),
      );
      setInstallStage("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to install plugin");
      setInstallingPlugin(null);
      setInstallStage(null);
    } finally {
      setIsInstalling(false);
    }
  };

  const closeInstallDialog = () => {
    setInstallingPlugin(null);
    setInstallStage(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/plugin/installed"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to installed plugins
          </Link>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <span>Plugins</span>
            <span>/</span>
            <span className="font-medium text-gray-900">Add Plugin</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Add a Plugin
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Extend your site with plugins from the available catalog.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 shadow-sm">
          <Package className="h-4 w-4 text-purple-600" />
          <span>{plugins.length} plugins available</span>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Plus className="h-4 w-4 text-purple-600" />
          Browse plugin catalog
        </div>
        <PluginSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search available plugins..."
        />
        <PluginCategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </section>

      <PluginGrid
        plugins={filteredPlugins}
        onInstall={handleInstall}
        disabled={isInstalling}
      />

      {plugins.some((plugin) => plugin.installed) && (
        <div className="flex items-center gap-2 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {plugins.filter((plugin) => plugin.installed).length} plugin
          {plugins.filter((plugin) => plugin.installed).length === 1
            ? ""
            : "s"}{" "}
          installed.
        </div>
      )}

      {installingPlugin && installStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="plugin-install-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-2xl">
                  {installingPlugin.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-purple-600">
                    Plugin setup
                  </p>
                  <h2
                    id="plugin-install-title"
                    className="text-lg font-bold text-gray-900"
                  >
                    {installingPlugin.name}
                  </h2>
                </div>
              </div>
              {installStage === "complete" && (
                <button
                  type="button"
                  onClick={closeInstallDialog}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  aria-label="Close install dialog"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-8 grid grid-cols-4 gap-2">
              {installSteps.map((step, index) => {
                const activeIndex = installSteps.findIndex(
                  (currentStep) => currentStep.id === installStage,
                );
                const isComplete = index < activeIndex;
                const isActive = index === activeIndex;
                const StepIcon = step.icon;

                return (
                  <div key={step.id} className="text-center">
                    <div
                      className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        isComplete
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : isActive
                            ? "border-purple-600 bg-purple-50 text-purple-600"
                            : "border-gray-200 bg-gray-50 text-gray-400"
                      }`}
                    >
                      {isActive && installStage !== "complete" ? (
                        <StepIcon className="h-4 w-4 animate-pulse" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={`mt-2 block text-xs font-medium ${
                        isActive ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-purple-600 transition-all duration-700"
                style={{
                  width: `${(installSteps.findIndex((step) => step.id === installStage) + 1) * 25}%`,
                }}
              />
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              {installStage === "complete" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Rocket className="h-5 w-5 animate-bounce text-purple-600" />
              )}
              <div>
                <p className="font-semibold text-gray-900">
                  {installStage === "complete"
                    ? "Plugin is ready to use"
                    : `${installSteps.find((step) => step.id === installStage)?.label} ${installingPlugin.name}...`}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {installStage === "complete"
                    ? "The plugin has been activated successfully."
                    : "Please keep this window open while setup finishes."}
                </p>
              </div>
            </div>

            {installStage === "complete" && (
              <button
                type="button"
                onClick={closeInstallDialog}
                className="mt-5 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700"
              >
                Done
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
