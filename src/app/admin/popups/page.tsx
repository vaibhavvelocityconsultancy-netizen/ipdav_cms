"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

const emptyForm = {
  name: "",
  type: "MODAL",
  target: "GLOBAL",
  pageIds: [] as number[],
  trigger: "PAGE_LOAD",
  delayMs: 0,
  frequency: "EVERY_TIME",
  status: "DRAFT",
  html: "<h2>Welcome</h2><p>Add your popup content.</p>",
  css: "",
};

type Page = { id: number; title: string; slug: string };

export default function PopupsPage() {
  const [popups, setPopups] = useState<any[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const [popupResponse, pageResponse] = await Promise.all([
      fetch("/api/popups"),
      fetch("/api/pages"),
    ]);
    const popupPayload = await popupResponse.json();
    const pagePayload = await pageResponse.json();
    setPopups(popupPayload.data || []);
    setPages(pagePayload.data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const setField =
    (key: keyof typeof emptyForm) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      setForm((current) => ({
        ...current,
        [key]:
          key === "delayMs" ? Number(event.target.value) : event.target.value,
      }));
    };

  function togglePage(id: number) {
    setForm((current) => ({
      ...current,
      pageIds: current.pageIds.includes(id)
        ? current.pageIds.filter((pageId) => pageId !== id)
        : [...current.pageIds, id],
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    await fetch(editing ? `/api/popups/${editing}` : "/api/popups", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(emptyForm);
    setEditing(null);
    setSaving(false);
    await load();
  }

  async function action(id: number, actionName: string) {
    await fetch(`/api/popups/${id}`, {
      method:
        actionName === "delete"
          ? "DELETE"
          : actionName === "duplicate"
            ? "POST"
            : "PATCH",
      headers: { "Content-Type": "application/json" },
      body:
        actionName === "duplicate"
          ? JSON.stringify({ action: "duplicate" })
          : JSON.stringify({ status: actionName }),
    });
    await load();
  }

  return (
    <main className="flex flex-col gap-6 p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-semibold">Popups</h1>
        <p className="text-muted-foreground">
          Create targeted element popups or automatic global popups.
        </p>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_460px]">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Popup library</h2>
          <div className="flex flex-col gap-3">
            {popups.length === 0 && (
              <p className="text-sm text-muted-foreground">No popups yet.</p>
            )}
            {popups.map((popup) => (
              <div
                key={popup.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{popup.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {popup.type === "ELEMENT"
                      ? "Element Popup"
                      : "Global Popup"}{" "}
                    · {popup.trigger}
                    {popup.trigger === "DELAY"
                      ? ` · ${popup.delayMs / 1000}s`
                      : ""}
                  </p>
                  {popup.type === "ELEMENT" && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-medium">Popup Trigger Class</span>
                      <code className="rounded bg-muted px-2 py-1">
                        {popup.elementClass || "Generating..."}
                      </code>
                      <button
                        type="button"
                        className="rounded border px-2 py-1 text-xs"
                        disabled={!popup.elementClass}
                        onClick={() =>
                          navigator.clipboard.writeText(popup.elementClass)
                        }
                      >
                        Copy Class
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-muted px-2 py-1 text-xs">
                    {popup.status}
                  </span>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => {
                      setEditing(popup.id);
                      setForm({
                        ...emptyForm,
                        ...popup,
                        pageIds: Array.isArray(popup.pageIds)
                          ? popup.pageIds.map(Number)
                          : [],
                      });
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() =>
                      action(
                        popup.id,
                        popup.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
                      )
                    }
                  >
                    {popup.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => action(popup.id, "duplicate")}
                  >
                    Duplicate
                  </button>
                  <button
                    className="rounded border px-2 py-1 text-xs"
                    onClick={() => action(popup.id, "delete")}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? "Edit popup" : "Create popup"}
          </h2>
          <form onSubmit={save} className="flex flex-col gap-4">
            <input
              className="h-9 rounded-md border bg-background px-3 text-sm"
              placeholder="Popup name"
              value={form.name}
              onChange={setField("name")}
              required
            />
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Popup Type</legend>
              <label>
                <input
                  type="radio"
                  checked={form.type === "ELEMENT"}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      type: "ELEMENT",
                      target: "SPECIFIC_PAGES",
                      trigger: "ELEMENT_CLICK",
                    }))
                  }
                />{" "}
                Element Popup
              </label>
              <label>
                <input
                  type="radio"
                  checked={form.type !== "ELEMENT"}
                  onChange={() =>
                    setForm((current) => ({
                      ...current,
                      type: "MODAL",
                      target: "GLOBAL",
                      trigger: "PAGE_LOAD",
                    }))
                  }
                />{" "}
                Global Popup
              </label>
            </fieldset>
            <label className="text-sm font-medium">
              Target
              <select
                className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                value={form.target}
                onChange={setField("target")}
              >
                <option value="GLOBAL">Entire Website</option>
                <option value="HOME_PAGE">Home Page</option>
                <option value="SPECIFIC_PAGES">Specific Page(s)</option>
              </select>
            </label>
            {form.target === "SPECIFIC_PAGES" && (
              <fieldset className="flex max-h-36 flex-col gap-2 overflow-auto rounded border p-3">
                <legend className="text-sm font-medium">Target Pages</legend>
                {pages.map((page) => (
                  <label key={page.id} className="text-sm">
                    <input
                      type="checkbox"
                      checked={form.pageIds.includes(page.id)}
                      onChange={() => togglePage(page.id)}
                    />{" "}
                    {page.title}
                  </label>
                ))}
              </fieldset>
            )}
            {form.type !== "ELEMENT" && (
              <>
                <label className="text-sm font-medium">
                  Trigger
                  <select
                    className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.trigger}
                    onChange={setField("trigger")}
                  >
                    <option value="PAGE_LOAD">On Page Load</option>
                    <option value="DELAY">After Delay</option>
                  </select>
                </label>
                {form.trigger === "DELAY" && (
                  <label className="text-sm font-medium">
                    Open after (seconds)
                    <input
                      className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                      type="number"
                      min="0"
                      step="1"
                      value={form.delayMs / 1000}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          delayMs: Number(event.target.value) * 1000,
                        }))
                      }
                    />
                  </label>
                )}
                <label className="text-sm font-medium">
                  Frequency
                  <select
                    className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
                    value={form.frequency}
                    onChange={setField("frequency")}
                  >
                    <option value="EVERY_TIME">Every Time</option>
                    <option value="ONCE_SESSION">Once Per Session</option>
                    <option value="ONCE_DAY">Once Per Day</option>
                    <option value="ONCE_VISITOR">Once Per Visitor</option>
                  </select>
                </label>
              </>
            )}
            <label className="text-sm font-medium">
              HTML
              <textarea
                className="min-h-28 w-full rounded-md border bg-background p-2 font-mono text-xs"
                value={form.html}
                onChange={setField("html")}
                required
              />
            </label>
            <label className="text-sm font-medium">
              CSS
              <textarea
                className="min-h-24 w-full rounded-md border bg-background p-2 font-mono text-xs"
                value={form.css}
                onChange={setField("css")}
              />
            </label>
            {form.type === "ELEMENT" && editing && (
              <div className="rounded-md border bg-muted/40 p-3">
                <p className="text-sm font-medium">Popup Trigger Class</p>
                <code>
                  {popups.find((popup) => popup.id === editing)?.elementClass}
                </code>
                <button
                  type="button"
                  className="ml-3 rounded border px-2 py-1 text-xs"
                  onClick={() =>
                    navigator.clipboard.writeText(
                      popups.find((popup) => popup.id === editing)
                        ?.elementClass || "",
                    )
                  }
                >
                  Copy Class
                </button>
              </div>
            )}
            <button
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Popup"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
