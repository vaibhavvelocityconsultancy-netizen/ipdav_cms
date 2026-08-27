"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/src/ui/button";
import { Card } from "@/src/ui/card";
import { Switch } from "@/src/ui/switch";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { Skeleton } from "@/src/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/src/ui/alert";
import {
  Copy,
  Eye,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  FileText,
  Link2,
  Globe,
  FileArchive,
  Layers,
  ExternalLink,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/src/lib/utils";
import { toast } from "@/src/ui/use-toast";
import { getApiBaseUrl } from "@/src/lib/axios";
import { appUrl } from "@/src/lib/base-path";

// Types
interface SitemapSettings {
  sitemapEnabled: boolean;
  sitemapCacheMinutes: number;
  pingSearchEngines: boolean;
  includePages: boolean;
  includePosts: boolean;
  includeCategories: boolean;
  includeTags: boolean;
  includeCourses: boolean;
  sitemapLastGeneratedAt: string | null;
  sitemapCustomUrl: string | null;
}

interface SitemapStats {
  totalUrls: number;
  pages: number;
  posts: number;
  categories: number;
  tags: number;
  courses: number;
  lastGenerated: string | null;
}

interface SitemapPreviewEntry {
  url: string;
  priority: number;
  changeFreq: string;
  lastModified: string;
}

interface SitemapPreview {
  entries: SitemapPreviewEntry[];
  total: number;
}

type MenuItemType =
  "general" | "pages" | "posts" | "categories" | "tags" | "courses";

const apiPath = (path: string) => `${getApiBaseUrl()}${path}`;

const absoluteUrl = (path: string) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return new URL(path, siteUrl).toString();
};

// Menu configuration
interface MenuItem {
  id: MenuItemType;
  label: string;
  icon: React.ElementType;
  description: string;
  key: keyof SitemapSettings;
  statKey: keyof SitemapStats;
}

const MENU_ITEMS: MenuItem[] = [
  {
    id: "pages",
    label: "Pages",
    icon: FileText,
    description: "Change Sitemap settings of single pages.",
    key: "includePages",
    statKey: "pages",
  },
  {
    id: "posts",
    label: "Posts",
    icon: FileArchive,
    description: "Change Sitemap settings of single posts.",
    key: "includePosts",
    statKey: "posts",
  },
  {
    id: "categories",
    label: "Categories",
    icon: Layers,
    description: "Change Sitemap settings of single categories.",
    key: "includeCategories",
    statKey: "categories",
  },
  {
    id: "tags",
    label: "Tags",
    icon: Globe,
    description: "Change Sitemap settings of single tags.",
    key: "includeTags",
    statKey: "tags",
  },
  {
    id: "courses",
    label: "Courses",
    icon: FileText,
    description: "Change Sitemap settings of single courses.",
    key: "includeCourses",
    statKey: "courses",
  },
];

// API Functions
const fetchSitemapSettings = async () => {
  const response = await fetch(apiPath("/api/seo/sitemap"));
  const json = await response.json();
  if (!response.ok) throw new Error(json.message);
  return json.data;
};

const fetchSitemapStats = async (): Promise<SitemapStats> => {
  const response = await fetch(apiPath("/api/seo/sitemap/stats"));
  const json = await response.json();
  if (!response.ok) throw new Error(json.message);
  return json.data;
};

const fetchSitemapPreview = async (
  module?: MenuItemType,
): Promise<SitemapPreview> => {
  const response = await fetch(
    `${apiPath("/api/seo/sitemap/preview")}?type=${module}`,
  );
  const json = await response.json();
  if (!response.ok) throw new Error(json.message);

  const entries = json.data as SitemapPreviewEntry[];

  return {
    entries,
    total: entries.length,
  };
};

const updateSitemapSettings = async (data: Partial<SitemapSettings>) => {
  const response = await fetch(apiPath("/api/seo/sitemap"), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update sitemap settings");
  return response.json();
};

const regenerateSitemap = async () => {
  const response = await fetch(apiPath("/api/seo/sitemap/regenerate"), {
    method: "POST",
  });
  if (!response.ok) throw new Error("Failed to regenerate sitemap");
  return response.json();
};

export default function SitemapSettingsPage() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<Partial<SitemapSettings>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuItemType>("pages");

  // Queries
  const {
    data: settingsData,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ["sitemap-settings"],
    queryFn: fetchSitemapSettings,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["sitemap-stats"],
    queryFn: fetchSitemapStats,
    refetchInterval: 30000,
  });

  const { data: previewData, isLoading: previewLoading } = useQuery({
    queryKey: ["sitemap-preview", activeMenu],
    queryFn: () => fetchSitemapPreview(activeMenu),
    refetchInterval: 30000,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: updateSitemapSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitemap-settings"] });
      queryClient.invalidateQueries({ queryKey: ["sitemap-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sitemap-preview"] });
      setHasChanges(false);
      toast({
        title: "Sitemap settings updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const regenerateMutation = useMutation({
    mutationFn: regenerateSitemap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sitemap-settings"] });
      queryClient.invalidateQueries({ queryKey: ["sitemap-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sitemap-preview"] });
      toast({
        title: "Sitemap regenerated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to regenerate sitemap",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Initialize settings
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData);
    }
  }, [settingsData]);

  // Handle setting changes
  const handleSettingChange = <K extends keyof SitemapSettings>(
    key: K,
    value: SitemapSettings[K],
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(true);
      return newSettings;
    });
  };

  const handleSave = () => {
    updateMutation.mutate(settings);
  };

  const getSitemapUrl = (module: MenuItemType = "general") => {
    if (module === "pages") return absoluteUrl(appUrl("/page-sitemap.xml"));
    if (module === "posts") return absoluteUrl(appUrl("/post-sitemap.xml"));
    if (module === "categories")
      return absoluteUrl(appUrl("/sitemap-category.xml"));
    if (module === "tags") return absoluteUrl(appUrl("/post_tag-sitemap.xml"));
    if (module === "courses")
      return absoluteUrl(appUrl("/sitemap-courses.xml"));

    return absoluteUrl(
      settingsData?.sitemapCustomUrl || appUrl("/sitemap_index.xml"),
    );
  };

  const activeItem = MENU_ITEMS.find((item) => item.id === activeMenu);

  if (settingsLoading) {
    return <SitemapSettingsSkeleton />;
  }

  if (settingsError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Settings</AlertTitle>
          <AlertDescription>
            Failed to load sitemap settings. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <h1 className="text-lg font-semibold text-gray-900">Sitemap</h1>
        </div>

        <nav className="p-0">
          {/* General Section */}
          <div className="border-b border-gray-300">
            <button
              onClick={() => setActiveMenu("general" as MenuItemType)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-4",
                activeMenu === "general"
                  ? "bg-white border-l-blue-500 text-blue-600 font-medium"
                  : "border-l-transparent text-gray-700 hover:bg-gray-200",
              )}
            >
              <Settings className="h-4 w-4" />
              General
            </button>
          </div>

          {/* Post Types Section */}
          <div className="border-b border-gray-300">
            <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase bg-gray-200">
              Post Types:
            </div>
            <div>
              {MENU_ITEMS.slice(0, 2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-4",
                      activeMenu === item.id
                        ? "bg-white border-l-blue-500 text-blue-600 font-medium"
                        : "border-l-transparent text-gray-700 hover:bg-gray-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Taxonomies Section */}
          <div>
            <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase bg-gray-200">
              Taxonomies:
            </div>
            <div>
              {MENU_ITEMS.slice(2).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveMenu(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors border-l-4",
                      activeMenu === item.id
                        ? "bg-white border-l-blue-500 text-blue-600 font-medium"
                        : "border-l-transparent text-gray-700 hover:bg-gray-200",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-white">
        {activeMenu === "general" ? (
          <GeneralSettingsPanel
            settings={settings}
            settingsData={settingsData}
            onSettingChange={handleSettingChange}
            onSave={handleSave}
            onRegenerate={() => regenerateMutation.mutate()}
            onCopyUrl={() => {
              navigator.clipboard.writeText(getSitemapUrl());
              toast({ title: "Sitemap URL copied" });
            }}
            getSitemapUrl={getSitemapUrl}
            hasChanges={hasChanges}
            isSaving={updateMutation.isPending}
            isRegenerating={regenerateMutation.isPending}
            statsData={statsData}
            statsLoading={statsLoading}
          />
        ) : (
          <ContentTypePanel
            item={activeItem!}
            settings={settings}
            onSettingChange={handleSettingChange}
            onSave={handleSave}
            hasChanges={hasChanges}
            isSaving={updateMutation.isPending}
            getSitemapUrl={() => getSitemapUrl(activeMenu)}
            previewData={previewData}
            previewLoading={previewLoading}
            statsData={statsData}
          />
        )}
      </main>
    </div>
  );
}

// General Settings Panel
function GeneralSettingsPanel({
  settings,
  settingsData,
  onSettingChange,
  onSave,
  onRegenerate,
  onCopyUrl,
  getSitemapUrl,
  hasChanges,
  isSaving,
  isRegenerating,
  statsData,
  statsLoading,
}: {
  settings: Partial<any>;
  settingsData: any;
  onSettingChange: (key: any, value: any) => void;
  onSave: () => void;
  onRegenerate: () => void;
  onCopyUrl: () => void;
  getSitemapUrl: () => string;
  hasChanges: boolean;
  isSaving: boolean;
  isRegenerating: boolean;
  statsData: any;
  statsLoading: boolean;
}) {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">General</h1>
        <p className="text-gray-600">
          Manage your XML sitemap and control search engine visibility.{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Learn more.
          </a>
        </p>
      </div>

      <div className="border-t border-gray-300 pt-6 space-y-6">
        {/* Sitemap URL */}
        <div className="border-l-4 border-l-blue-500 bg-blue-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-900">Sitemap URL:</p>
          <div className="mt-2 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-600" />
            <a
              href={getSitemapUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono text-sm break-all"
            >
              {getSitemapUrl()}
            </a>
          </div>
        </div>

        {/* Enable Sitemap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="enable-sitemap"
              className="text-base font-medium cursor-pointer"
            >
              Enable Sitemap
            </Label>
            <Switch
              id="enable-sitemap"
              checked={settings.sitemapEnabled}
              onCheckedChange={(checked) =>
                onSettingChange("sitemapEnabled", checked)
              }
            />
          </div>
          <p className="text-gray-600 text-sm">
            Enable XML sitemap generation for your website
          </p>
        </div>

        {/* Cache Duration */}
        <div className="space-y-2">
          <Label htmlFor="cache-duration" className="text-base font-medium">
            Cache Duration (Minutes)
          </Label>
          <Input
            id="cache-duration"
            type="number"
            min={1}
            max={1440}
            value={settings.sitemapCacheMinutes || 60}
            onChange={(e) =>
              onSettingChange(
                "sitemapCacheMinutes",
                parseInt(e.target.value) || 60,
              )
            }
            className="max-w-xs"
          />
          <p className="text-gray-600 text-sm">
            How long to cache the sitemap (1-1440 minutes)
          </p>
        </div>

        {/* Notify Search Engines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="ping-search"
              className="text-base font-medium cursor-pointer"
            >
              Notify Search Engines
            </Label>
            <Switch
              id="ping-search"
              checked={settings.pingSearchEngines}
              onCheckedChange={(checked) =>
                onSettingChange("pingSearchEngines", checked)
              }
            />
          </div>
          <p className="text-gray-600 text-sm">
            Automatically notify search engines when sitemap changes
          </p>
        </div>

        {/* Statistics */}
        {!statsLoading && statsData && (
          <div className="border-t border-gray-300 pt-6">
            <p className="text-base font-medium text-gray-900 mb-4">
              Sitemap Statistics
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatBox label="Total URLs" value={statsData.totalUrls || 0} />
              <StatBox label="Pages" value={statsData.pages || 0} />
              <StatBox label="Posts" value={statsData.posts || 0} />
              <StatBox label="Categories" value={statsData.categories || 0} />
              <StatBox label="Tags" value={statsData.tags || 0} />
              <StatBox label="Courses" value={statsData.courses || 0} />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-300 pt-6 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(getSitemapUrl(), "_blank")}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Sitemap
          </Button>
          <Button variant="outline" onClick={onCopyUrl}>
            <Copy className="mr-2 h-4 w-4" />
            Copy URL
          </Button>
          <Button
            variant="outline"
            onClick={onRegenerate}
            disabled={isRegenerating}
          >
            <RefreshCw
              className={cn("mr-2 h-4 w-4", isRegenerating && "animate-spin")}
            />
            Regenerate
          </Button>
        </div>

        <Button onClick={onSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Content Type Panel
function ContentTypePanel({
  item,
  settings,
  onSettingChange,
  onSave,
  hasChanges,
  isSaving,
  getSitemapUrl,
  previewData,
  previewLoading,
  statsData,
}: {
  item: MenuItem;
  settings: Partial<any>;
  onSettingChange: (key: any, value: any) => void;
  onSave: () => void;
  hasChanges: boolean;
  isSaving: boolean;
  getSitemapUrl: () => string;
  previewData: SitemapPreview | undefined;
  previewLoading: boolean;
  statsData: any;
}) {
  const Icon = item.icon;
  const count = statsData ? statsData[item.statKey] || 0 : 0;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{item.label}</h1>
        <p className="text-gray-600">
          {item.description}{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Learn more.
          </a>
        </p>
      </div>

      <div className="border-t border-gray-300 pt-6 space-y-6">
        {/* Sitemap URL */}
        <div className="border-l-4 border-l-blue-500 bg-blue-50 p-4 rounded">
          <p className="text-sm font-medium text-gray-900">
            Sitemap URL:{" "}
            <a href={getSitemapUrl()} className="text-blue-600 hover:underline">
              {getSitemapUrl()}
            </a>
          </p>
        </div>

        {/* Include Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor={`include-${item.id}`}
              className="text-base font-medium cursor-pointer"
            >
              Include in Sitemap
            </Label>
            <Switch
              id={`include-${item.id}`}
              checked={settings[item.key] as boolean}
              onCheckedChange={(checked) => onSettingChange(item.key, checked)}
            />
          </div>
          <p className="text-gray-600 text-sm">
            Include this {item.label.toLowerCase()} in the XML sitemap.
          </p>
        </div>

        {/* Preview */}
        <div className="border-t border-gray-300 pt-6">
          <p className="text-base font-medium text-gray-900 mb-4">
            Preview ({count} URLs)
          </p>

          {previewLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : !previewData?.entries || previewData.entries.length === 0 ? (
            <p className="text-gray-600">
              No URLs available for this content type
            </p>
          ) : (
            <div className="bg-gray-50 rounded border border-gray-300 overflow-hidden">
              <div className="bg-gray-100 grid grid-cols-3 gap-4 p-3 text-sm font-medium text-gray-700 border-b border-gray-300">
                <div>URL</div>
                <div>Change Frequency</div>
                <div>Priority</div>
              </div>
              {previewData.entries.slice(0, 10).map((entry, index) => (
                <div
                  key={index}
                  className={cn(
                    "grid grid-cols-3 gap-4 p-3 text-sm border-b border-gray-200",
                    index % 2 === 0 ? "bg-white" : "bg-gray-50",
                  )}
                >
                  <div className="truncate">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {entry.url}
                    </a>
                  </div>
                  <div className="capitalize">{entry.changeFreq}</div>
                  <div>{entry.priority}</div>
                </div>
              ))}
              {previewData.total > 10 && (
                <div className="p-3 bg-gray-100 text-sm text-gray-600 border-t border-gray-300">
                  +{previewData.total - 10} more URLs...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-gray-300 pt-6 flex items-center justify-end">
        <Button onClick={onSave} disabled={!hasChanges || isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Stat Box Component
function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-gray-300 rounded p-4 bg-white">
      <p className="text-xs font-semibold text-gray-600 uppercase">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

// Loading Skeleton
function SitemapSettingsSkeleton() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-100 border-r border-gray-300 p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </aside>

      <main className="flex-1 bg-white p-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-6 w-96 mb-6" />
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </main>
    </div>
  );
}
