"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Page } from "../Cms";

interface Props { page: Page; pages: Page[]; onChange: (page: Page) => void; }

export function PageAttributesPanel({ page, pages, onChange }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const parentOptions = pages.filter((p) => p.id !== page.id);
  return <div className="bg-card border border-border rounded shadow-sm overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 bg-muted border-b border-border"><h2 className="text-sm font-semibold text-foreground">Page Attributes</h2><button type="button" aria-label="Toggle page attributes" onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground">{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button></div>
    {!collapsed && <div className="px-3 py-3 space-y-4">
      <div><label className="block text-sm font-medium text-foreground mb-1">Parent</label><select value={(page as any).parentId ?? ""} onChange={(e) => onChange({ ...page, parentId: e.target.value ? Number(e.target.value) : null } as any)} className="w-full text-sm border border-border bg-background px-2 py-1.5 rounded text-foreground"><option value="">(no parent)</option>{parentOptions.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
      <div><label className="block text-sm font-medium text-foreground mb-1">Template</label><select value={(page as any).template ?? "default"} onChange={(e) => onChange({ ...page, template: e.target.value } as any)} className="w-full text-sm border border-border bg-background px-2 py-1.5 rounded text-foreground"><option value="default">Default Template</option><option value="full-width">Full Width</option><option value="no-header">No Header</option><option value="no-footer">No Footer</option><option value="blank">Blank Page</option></select><p className="text-xs text-muted-foreground mt-1">Built-in templates control the surrounding page layout.</p></div>
      <div><label className="block text-sm font-medium text-foreground mb-1">Order</label><input type="number" value={(page as any).order ?? 0} onChange={(e) => onChange({ ...page, order: Number(e.target.value) } as any)} className="w-20 text-sm border border-border bg-background px-2 py-1.5 rounded text-foreground" /></div>
    </div>}
  </div>;
}
