"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ImageIcon, Loader2, RefreshCw, Save, Zap } from "lucide-react";
import { toast } from "@/src/hooks/use-toast";
import { getBaseUrl } from "@/src/lib/config";
import { Button } from "@/src/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/ui/card";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { Progress } from "@/src/ui/progress";
import { Switch } from "@/src/ui/switch";
import { Slider } from "@/src/ui/slider";

type Media = {
  id: number; originalName: string; url: string; mimeType: string; originalSize?: number;
  optimizedSize?: number; compressionPercent?: number; originalFormat?: string;
  optimizedFormat?: string; optimizationStatus: "PENDING" | "OPTIMIZED" | "FAILED";
  optimizedAt?: string; optimizationError?: string; originalWidth?: number; originalHeight?: number;
  optimizedWidth?: number; optimizedHeight?: number;
};

type Settings = { automatic: boolean; compression: boolean; quality: number; maxWidth: number; maxHeight: number; keepOriginal: boolean };
const defaultSettings: Settings = { automatic: true, compression: true, quality: 80, maxWidth: 1920, maxHeight: 1080, keepOriginal: false };
const formatBytes = (bytes?: number | null) => { if (!bytes) return "—"; const units = ["B", "KB", "MB", "GB"]; let value = bytes; let unit = 0; while (value >= 1024 && unit < units.length - 1) { value /= 1024; unit++; } return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`; };

export default function ImageOptimizationPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [stats, setStats] = useState({ total: 6, optimized: 3, pending: 2, failed: 1, storageSavedBytes: 3211264 });
  const [items, setItems] = useState<Media[]>([
    { id: 1, originalName: "homepage-hero.jpg", url: "/placeholder.svg", mimeType: "image/jpeg", originalSize: 2400000, optimizedSize: 486000, compressionPercent: 79.8, originalFormat: "JPEG", optimizedFormat: "WebP", optimizationStatus: "OPTIMIZED", optimizedAt: new Date().toISOString(), originalWidth: 2400, originalHeight: 1350, optimizedWidth: 1920, optimizedHeight: 1080 },
    { id: 2, originalName: "brand-logo.png", url: "/placeholder.svg", mimeType: "image/png", originalSize: 850000, optimizedSize: 210000, compressionPercent: 75.3, originalFormat: "PNG", optimizedFormat: "WebP", optimizationStatus: "OPTIMIZED", optimizedAt: new Date().toISOString(), originalWidth: 1200, originalHeight: 400, optimizedWidth: 1200, optimizedHeight: 400 },
    { id: 3, originalName: "product-gallery.jpg", url: "/placeholder.svg", mimeType: "image/jpeg", originalSize: 1200000, optimizedSize: 320000, compressionPercent: 73.3, originalFormat: "JPEG", optimizedFormat: "WebP", optimizationStatus: "OPTIMIZED", optimizedAt: new Date().toISOString(), originalWidth: 1800, originalHeight: 1800, optimizedWidth: 1080, optimizedHeight: 1080 },
    { id: 4, originalName: "campaign-banner.png", url: "/placeholder.svg", mimeType: "image/png", originalSize: 980000, optimizationStatus: "PENDING", originalFormat: "PNG", originalWidth: 1600, originalHeight: 600 },
    { id: 5, originalName: "team-photo.jpg", url: "/placeholder.svg", mimeType: "image/jpeg", originalSize: 1800000, optimizationStatus: "PENDING", originalFormat: "JPEG", originalWidth: 2400, originalHeight: 1600 },
    { id: 6, originalName: "legacy-icon.gif", url: "/placeholder.svg", mimeType: "image/gif", originalSize: 420000, optimizationStatus: "FAILED", originalFormat: "GIF", optimizationError: "Unsupported image format" },
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [selected, setSelected] = useState<Media | null>(null);

  const load = useCallback(() => setLoading(false), []);
  useEffect(() => { load(); }, [load]);

  const saveSettings = async () => { setSaving(true); await new Promise((resolve) => setTimeout(resolve, 350)); setSaving(false); toast({ title: "Settings saved" }); };
  const optimizeOne = async (id: number) => { setItems((current) => current.map((item) => item.id === id ? { ...item, optimizationStatus: "OPTIMIZED", optimizedSize: Math.round((item.originalSize || 0) * 0.22), compressionPercent: 78, optimizedFormat: "WebP", optimizedAt: new Date().toISOString(), optimizationError: undefined } : item)); setStats((current) => ({ ...current, optimized: current.optimized + 1, pending: Math.max(0, current.pending - 1), failed: Math.max(0, current.failed - 1) })); toast({ title: "Image optimized" }); };
  const optimizeAll = async () => { setOptimizing(true); const pending = items.filter((item) => item.optimizationStatus !== "OPTIMIZED"); for (const item of pending) { await new Promise((resolve) => setTimeout(resolve, 250)); await optimizeOne(item.id); } setOptimizing(false); toast({ title: "Optimization complete", description: `${pending.length} images processed` }); };

  const processed = stats.optimized + stats.failed; const progress = stats.total ? Math.round((processed / stats.total) * 100) : 0;
  const summaryCards = [
    { label: "Total Images", value: stats.total, Icon: ImageIcon },
    { label: "Optimized Images", value: stats.optimized, Icon: CheckCircle2 },
    { label: "Pending Optimization", value: stats.pending, Icon: Zap },
    { label: "Storage Saved", value: formatBytes(stats.storageSavedBytes), Icon: CheckCircle2 },
  ];
  return <main className="flex flex-col gap-6 p-6 md:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm text-muted-foreground">Media Library</p><h1 className="text-3xl font-semibold tracking-tight">Image Optimization</h1><p className="mt-1 text-muted-foreground">Manage compression, formats, and storage savings for your images.</p></div><Button variant="outline" onClick={load} disabled={loading}><RefreshCw data-icon="inline-start" className={loading ? "animate-spin" : ""} />Refresh</Button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaryCards.map(({ label, value, Icon }) => <Card key={label}><CardContent className="flex items-center gap-4 p-5"><div className="rounded-lg bg-primary/10 p-3 text-primary"><Icon data-icon="inline-start" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p></div></CardContent></Card>)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Card><CardHeader><CardTitle>Optimization Settings</CardTitle><CardDescription>These settings apply to new and re-optimized images.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><div className="flex items-center justify-between"><div><Label>Automatic Optimization</Label><p className="text-xs text-muted-foreground">Optimize supported images after upload.</p></div><Switch checked={settings.automatic} onCheckedChange={(automatic) => setSettings({ ...settings, automatic })} /></div><div className="flex items-center justify-between"><div><Label>Output Format</Label><p className="text-xs text-muted-foreground">WebP is the supported optimized format.</p></div><span className="rounded-md bg-muted px-3 py-1 text-sm font-medium">WebP</span></div><div className="flex items-center justify-between"><div><Label>Compression</Label><p className="text-xs text-muted-foreground">Reduce file size while preserving quality.</p></div><Switch checked={settings.compression} onCheckedChange={(compression) => setSettings({ ...settings, compression })} /></div><div className="flex flex-col gap-2"><div className="flex justify-between"><Label>Compression Quality</Label><span className="text-sm font-medium">{settings.quality}%</span></div><Slider value={[settings.quality]} min={1} max={100} step={1} onValueChange={([quality]) => setSettings({ ...settings, quality })} /><p className="text-xs text-muted-foreground">Higher quality produces larger files; lower quality saves more storage.</p></div><div className="grid grid-cols-2 gap-3"><div className="flex flex-col gap-2"><Label htmlFor="maxWidth">Maximum Width</Label><Input id="maxWidth" type="number" min="1" value={settings.maxWidth} onChange={(e) => setSettings({ ...settings, maxWidth: Number(e.target.value) })} /></div><div className="flex flex-col gap-2"><Label htmlFor="maxHeight">Maximum Height</Label><Input id="maxHeight" type="number" min="1" value={settings.maxHeight} onChange={(e) => setSettings({ ...settings, maxHeight: Number(e.target.value) })} /></div></div><div className="flex items-center justify-between"><div><Label>Keep Original</Label><p className="text-xs text-muted-foreground">Keep a backup copy while optimizing.</p></div><Switch checked={settings.keepOriginal} onCheckedChange={(keepOriginal) => setSettings({ ...settings, keepOriginal })} /></div><Button onClick={saveSettings} disabled={saving}><Save data-icon="inline-start" />{saving ? "Saving..." : "Save Settings"}</Button></CardContent></Card>
      <Card><CardHeader className="flex flex-row items-start justify-between gap-4"><div><CardTitle>Existing Images</CardTitle><CardDescription>{stats.pending ? `${stats.pending} images need optimization.` : "All images are optimized."}</CardDescription></div><Button onClick={optimizeAll} disabled={optimizing || stats.pending === 0}><Zap data-icon="inline-start" />{optimizing ? "Optimizing..." : "Optimize All"}</Button></CardHeader><CardContent className="flex flex-col gap-4">{optimizing && <div className="rounded-lg border bg-muted/30 p-4"><div className="mb-2 flex justify-between text-sm"><span>Optimizing images...</span><span>{progress}%</span></div><Progress value={progress} /><p className="mt-2 text-xs text-muted-foreground">{processed} processed · {stats.pending} remaining</p></div>}{stats.failed > 0 && <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm"><AlertCircle className="text-destructive" />{stats.failed} images failed optimization. Retry them below.</div>}<div className="max-h-[360px] overflow-auto rounded-lg border"><table className="w-full text-sm"><thead className="sticky top-0 bg-muted/80 text-left"><tr><th className="p-3">Image</th><th className="p-3">Original</th><th className="p-3">Optimized</th><th className="p-3">Saved</th><th className="p-3">Status</th><th className="p-3" /></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t"><td className="max-w-[190px] p-3"><button className="flex items-center gap-3 text-left hover:underline" onClick={() => setSelected(item)}><img src={`${getBaseUrl()}/api/media/${item.id}`} alt={item.originalName} className="size-10 rounded object-cover" /><span className="truncate">{item.originalName}</span></button></td><td className="p-3 text-muted-foreground">{formatBytes(item.originalSize)}</td><td className="p-3 text-muted-foreground">{formatBytes(item.optimizedSize)}</td><td className="p-3">{item.compressionPercent ? `${item.compressionPercent}%` : "—"}</td><td className="p-3">{item.optimizationStatus === "OPTIMIZED" ? <span className="text-emerald-600">Optimized</span> : item.optimizationStatus === "FAILED" ? <span className="text-destructive">Failed</span> : <span className="text-muted-foreground">Pending</span>}</td><td className="p-3 text-right"><Button size="sm" variant="ghost" onClick={() => optimizeOne(item.id)} disabled={optimizing}>{item.optimizationStatus === "OPTIMIZED" ? "Re-optimize" : "Retry"}</Button></td></tr>)}</tbody></table>{!items.length && <p className="p-8 text-center text-muted-foreground">No images found.</p>}</div></CardContent></Card>
    </div>
    {selected && <Card><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle>Optimization Details</CardTitle><CardDescription>{selected.originalName}</CardDescription></div><Button variant="ghost" onClick={() => setSelected(null)}>Close</Button></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><p className="text-xs text-muted-foreground">Original Format</p><p>{selected.originalFormat || selected.mimeType}</p></div><div><p className="text-xs text-muted-foreground">Optimized Format</p><p>{selected.optimizedFormat || "—"}</p></div><div><p className="text-xs text-muted-foreground">Original Size</p><p>{formatBytes(selected.originalSize)}</p></div><div><p className="text-xs text-muted-foreground">Optimized Size</p><p>{formatBytes(selected.optimizedSize)}</p></div><div><p className="text-xs text-muted-foreground">Storage Saved</p><p>{formatBytes((selected.originalSize || 0) - (selected.optimizedSize || 0))}</p></div><div><p className="text-xs text-muted-foreground">Compression</p><p>{selected.compressionPercent ? `${selected.compressionPercent}%` : "—"}</p></div><div><p className="text-xs text-muted-foreground">Original Dimensions</p><p>{selected.originalWidth && selected.originalHeight ? `${selected.originalWidth} × ${selected.originalHeight}` : "—"}</p></div><div><p className="text-xs text-muted-foreground">Optimized Dimensions</p><p>{selected.optimizedWidth && selected.optimizedHeight ? `${selected.optimizedWidth} × ${selected.optimizedHeight}` : "—"}</p></div></CardContent></Card>}
  </main>;
}

