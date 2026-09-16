"use client";

import { useState } from "react";
import { unzipSync, strFromU8 } from "fflate";
import { Button } from "@/src/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/ui/card";
import { Checkbox } from "@/src/ui/checkbox";
import { Label } from "@/src/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/ui/select";
import { toast } from "@/src/hooks/use-toast";

const modules = ["pages", "posts", "media", "galleries", "categories", "tags", "menus", "popups", "accordions", "settings"];

export function SelectiveImportExport() {
  const [selected, setSelected] = useState(modules);
  const [pkg, setPkg] = useState<any>(null);
  const [policy, setPolicy] = useState("skip");
  const [preview, setPreview] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  async function exportSelected() {
    setBusy(true);
    try {
      const response = await fetch("/api/export/selective", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modules: selected }) });
      if (!response.ok) throw new Error("Selective export failed");
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = `cms-selective-${new Date().toISOString().slice(0, 10)}.zip`; link.click(); URL.revokeObjectURL(url);
      toast({ title: "Selective package downloaded" });
    } catch (error: any) { toast({ title: "Operation failed", description: error.message, variant: "destructive" }); } finally { setBusy(false); }
  }

  async function readPackage(file: File) {
    try {
      const entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
      const metadata = JSON.parse(strFromU8(entries["metadata.json"])); const files: Record<string, unknown> = {};
      for (const module of metadata.modules) files[module] = JSON.parse(strFromU8(entries[`${module}.json`]));
      const next = { metadata, files }; setPkg(next);
      const response = await fetch("/api/import/selective", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "preview", package: next }) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Preview failed"); setPreview(result.data); toast({ title: "Package validated" });
    } catch (error: any) { setPkg(null); setPreview(null); toast({ title: "Invalid package", description: error.message || "Invalid package", variant: "destructive" }); }
  }

  async function merge() {
    if (!pkg || !preview || !window.confirm(`Start merge import using ${policy}?`)) return;
    setBusy(true);
    try { const response = await fetch("/api/import/selective", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ package: pkg, policy }) }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Merge failed"); toast({ title: "Merge import completed" }); }
    catch (error: any) { toast({ title: "Operation failed", description: error.message, variant: "destructive" }); } finally { setBusy(false); }
  }

  return <div className="grid gap-6 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>Selective export</CardTitle><CardDescription>Download only the CMS modules you select. Existing full-site export remains unchanged.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><div className="grid grid-cols-2 gap-3">{modules.map((module) => <label key={module} className="flex items-center gap-2 text-sm capitalize"><Checkbox checked={selected.includes(module)} onCheckedChange={(checked) => setSelected((current) => checked ? [...current, module] : current.filter((item) => item !== module))} />{module}</label>)}</div><Button disabled={busy || !selected.length} onClick={exportSelected}>Download selective ZIP</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Merge import</CardTitle><CardDescription>Validate a selective package, review conflicts, then merge it without deleting unrelated content.</CardDescription></CardHeader><CardContent className="flex flex-col gap-4"><Label htmlFor="selective-package">Selective package</Label><input id="selective-package" type="file" accept=".zip" onChange={(event) => event.target.files?.[0] && readPackage(event.target.files[0])} /><Select value={policy} onValueChange={setPolicy}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="skip">Skip conflicts</SelectItem><SelectItem value="update">Update conflicts</SelectItem><SelectItem value="create">Create copies</SelectItem></SelectContent></Select>{preview && <div className="rounded-md border p-3 text-sm"><p className="font-medium">Validated package</p><p className="text-muted-foreground">{preview.modules.join(", ")}</p><p className="text-muted-foreground">Review conflicts before starting the merge.</p></div>}<Button disabled={busy || !preview} onClick={merge}>Start merge import</Button></CardContent></Card>
  </div>;
}
