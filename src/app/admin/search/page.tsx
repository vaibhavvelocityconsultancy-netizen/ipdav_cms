"use client";

import { useEffect, useMemo, useState } from "react";

const initial = { name: "", slug: "", placeholder: "Search...", buttonText: "Search", searchPages: true, searchPosts: true, resultsPerPage: 10, noResultsMessage: "No results found.", customClass: "", isActive: true };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function SearchAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const load = async () => { const response = await fetch("/api/search-configurations"); const json = await response.json(); if (json.success) setItems(json.data); };
  useEffect(() => { load(); }, []);
  const shortcode = useMemo(() => `[search slug="${form.slug || "your-search"}"]`, [form.slug]);
  const update = (key: string, value: unknown) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => { event.preventDefault(); const response = await fetch(editing ? `/api/search-configurations/${editing}` : "/api/search-configurations", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const json = await response.json(); if (!response.ok) return setMessage(json.error || "Unable to save search"); setMessage("Search configuration saved"); setForm(initial); setEditing(null); load(); };
  const remove = async (id: string) => { if (!window.confirm("Delete this search configuration?")) return; await fetch(`/api/search-configurations/${id}`, { method: "DELETE" }); load(); };
  const edit = (item: any) => { setEditing(item.id); setForm({ ...initial, ...item }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  return <section className="mx-auto flex max-w-6xl flex-col gap-6 p-6">
    <header><p className="text-sm font-medium text-muted-foreground">Content tools</p><h1 className="text-3xl font-semibold tracking-tight">Search configurations</h1><p className="mt-2 text-muted-foreground">Create reusable search fields for pages and posts.</p></header>
    <form onSubmit={submit} className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm md:grid-cols-2">
      <label className="flex flex-col gap-2">Name<input className="rounded-md border bg-background px-3 py-2" required value={form.name} onChange={(e) => { update("name", e.target.value); if (!editing) update("slug", slugify(e.target.value)); }} placeholder="Main Website Search" /></label>
      <label className="flex flex-col gap-2">Slug<input className="rounded-md border bg-background px-3 py-2" required value={form.slug} onChange={(e) => update("slug", slugify(e.target.value))} /></label>
      <label className="flex flex-col gap-2">Placeholder<input className="rounded-md border bg-background px-3 py-2" value={form.placeholder} onChange={(e) => update("placeholder", e.target.value)} /></label>
      <label className="flex flex-col gap-2">Button text<input className="rounded-md border bg-background px-3 py-2" value={form.buttonText} onChange={(e) => update("buttonText", e.target.value)} /></label>
      <label className="flex flex-col gap-2">Results per page<input type="number" min="1" max="100" className="rounded-md border bg-background px-3 py-2" value={form.resultsPerPage} onChange={(e) => update("resultsPerPage", Number(e.target.value))} /></label>
      <label className="flex flex-col gap-2">Custom class<input className="rounded-md border bg-background px-3 py-2" value={form.customClass} onChange={(e) => update("customClass", e.target.value)} placeholder="header-search" /></label>
      <label className="flex flex-col gap-2 md:col-span-2">No-results message<input className="rounded-md border bg-background px-3 py-2" value={form.noResultsMessage} onChange={(e) => update("noResultsMessage", e.target.value)} /></label>
      <div className="flex flex-wrap gap-5 md:col-span-2"><label className="flex items-center gap-2"><input type="checkbox" checked={form.searchPages} onChange={(e) => update("searchPages", e.target.checked)} /> Search pages</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.searchPosts} onChange={(e) => update("searchPosts", e.target.checked)} /> Search posts</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => update("isActive", e.target.checked)} /> Active</label></div>
      <div className="flex items-center justify-between rounded-md bg-muted p-3 md:col-span-2"><code>{shortcode}</code><button type="button" className="text-sm underline" onClick={() => navigator.clipboard.writeText(shortcode)}>Copy shortcode</button></div>
      <div className="flex gap-3 md:col-span-2"><button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" type="submit">{editing ? "Update search" : "Create search"}</button>{editing && <button type="button" className="rounded-md border px-4 py-2" onClick={() => { setEditing(null); setForm(initial); }}>Cancel</button>} {message && <p className="self-center text-sm text-muted-foreground">{message}</p>}</div>
    </form>
    <div className="overflow-hidden rounded-xl border bg-card"><div className="border-b p-4 font-medium">Saved searches</div>{items.length === 0 ? <p className="p-6 text-muted-foreground">No search configurations yet.</p> : <div className="divide-y">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium">{item.name}</p><p className="text-sm text-muted-foreground">[search slug=&quot;{item.slug}&quot;] · {item.isActive ? "Active" : "Inactive"}</p></div><div className="flex gap-2"><button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => edit(item)}>Edit</button><button className="rounded-md border px-3 py-1.5 text-sm text-destructive" onClick={() => remove(item.id)}>Delete</button></div></div>)}</div>}</div>
  </section>;
}
