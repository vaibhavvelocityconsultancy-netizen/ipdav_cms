"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Textarea } from "@/src/ui/textarea";
import { DataTable, type Column } from "@/src/ui/data-table";

const defaults = {
  allowMultiple: false,
  defaultState: "CLOSED",
  animation: "SMOOTH",
};

type Accordion = {
  id: number;
  name: string;
  identifier: string;
  status: string;
  items: Array<{ question: string; answer: string; customClass?: string }>;
  settings: typeof defaults;
  icons: Record<string, unknown>;
  css: string;
};

function getEmbedCode(identifier: string) {
  return `<div class="${identifier}"></div>`;
}

export default function AccordionsPage() {
  const [items, setItems] = useState<Accordion[]>([]);
  const [editing, setEditing] = useState<Accordion | null>(null);
  const [copiedIdentifier, setCopiedIdentifier] = useState<string | null>(null);

  const load = () =>
    fetch("/api/accordions")
      .then((response) => response.json())
      .then((json) => setItems(json.data || []));

  useEffect(() => {
    load();
  }, []);

  const blank = () =>
    setEditing({
      id: 0,
      name: "",
      identifier: "",
      status: "DRAFT",
      items: [{ question: "", answer: "", customClass: "" }],
      settings: defaults,
      icons: {
        show: true,
        type: "PLUS_MINUS",
        open: "-",
        closed: "+",
        position: "RIGHT",
        size: 18,
        spacing: 8,
      },
      css: "",
    });

  const save = async () => {
    if (!editing) return;
    const isNew = !editing.id;
    await fetch(isNew ? "/api/accordions" : `/api/accordions/${editing.id}`, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setEditing(null);
    load();
  };

  const copyShortcode = async (identifier: string) => {
    await navigator.clipboard.writeText(getEmbedCode(identifier));
    setCopiedIdentifier(identifier);
    window.setTimeout(() => setCopiedIdentifier(null), 1500);
  };

  const columns: Column<Accordion>[] = [
    {
      key: "name",
      header: "Name",
      cell: (item) => <span className="font-medium">{item.name}</span>,
      filterable: true,
      filterValue: (item) => item.name,
    },
    {
      key: "status",
      header: "Status",
      cell: (item) => item.status,
      filterable: true,
      filterValue: (item) => item.status,
    },
    {
      key: "questions",
      header: "Questions",
      cell: (item) => item.items.length,
    },
    {
      key: "shortcode",
      header: "Shortcode",
      cell: (item) => {
        const shortcode = getEmbedCode(item.identifier);
        const copied = copiedIdentifier === item.identifier;
        return (
          <div className="flex min-w-72 items-center gap-2">
            <code className="truncate text-xs text-muted-foreground">
              {shortcode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title={copied ? "Copied" : "Copy shortcode"}
              aria-label={copied ? "Copied" : "Copy shortcode"}
              onClick={() => copyShortcode(item.identifier)}
            >
              {copied ? <Check /> : <Copy />}
            </Button>
          </div>
        );
      },
      hideable: false,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex gap-2">
          {item.status !== "ACTIVE" && (
            <Button
              variant="outline"
              onClick={async () => {
                await fetch(`/api/accordions/${item.id}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: "ACTIVE" }),
                });
                load();
              }}
            >
              Publish
            </Button>
          )}
          <Button variant="outline" onClick={() => setEditing(item)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              fetch(`/api/accordions/${item.id}`, { method: "DELETE" }).then(
                load,
              )
            }
          >
            Delete
          </Button>
        </div>
      ),
      hideable: false,
    },
  ];

  if (editing) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {editing.id ? "Edit accordion" : "New accordion"}
            </h1>
            <p className="text-muted-foreground">
              Build FAQ content without writing HTML.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save}>Save accordion</Button>
          </div>
        </div>

        <div className="grid gap-5">
          <Input
            placeholder="Accordion name"
            value={editing.name}
            onChange={(event) =>
              setEditing({ ...editing, name: event.target.value })
            }
          />
          <label className="grid gap-2 text-sm font-medium">
            Status
            <select
              className="rounded-md border bg-background p-2 font-normal"
              value={editing.status}
              onChange={(event) =>
                setEditing({ ...editing, status: event.target.value })
              }
            >
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Published</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">FAQ items</h2>
            {editing.items.map((item, index) => (
              <div className="grid gap-2 border-b py-4 last:border-0" key={index}>
                <div className="flex gap-2">
                  <Input
                    placeholder="Question"
                    value={item.question}
                    onChange={(event) => {
                      const next = [...editing.items];
                      next[index] = { ...item, question: event.target.value };
                      setEditing({ ...editing, items: next });
                    }}
                  />
                  <Button
                    variant="ghost"
                    onClick={() =>
                      setEditing({
                        ...editing,
                        items: editing.items.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
                <Textarea
                  placeholder="Answer content (HTML formatting is supported)"
                  value={item.answer}
                  onChange={(event) => {
                    const next = [...editing.items];
                    next[index] = { ...item, answer: event.target.value };
                    setEditing({ ...editing, items: next });
                  }}
                />
                <Input
                  placeholder="Custom item class"
                  value={item.customClass || ""}
                  onChange={(event) => {
                    const next = [...editing.items];
                    next[index] = {
                      ...item,
                      customClass: event.target.value,
                    };
                    setEditing({ ...editing, items: next });
                  }}
                />
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() =>
                setEditing({
                  ...editing,
                  items: [
                    ...editing.items,
                    { question: "", answer: "", customClass: "" },
                  ],
                })
              }
            >
              Add question
            </Button>
          </section>
          <section className="grid gap-3 rounded-lg border p-4">
            <h2 className="font-medium">Behavior and icons</h2>
            <label className="flex gap-2">
              <input
                type="checkbox"
                checked={editing.settings.allowMultiple}
                onChange={(event) =>
                  setEditing({
                    ...editing,
                    settings: {
                      ...editing.settings,
                      allowMultiple: event.target.checked,
                    },
                  })
                }
              />
              Allow multiple open
            </label>
            <select
              className="rounded-md border bg-background p-2"
              value={editing.settings.defaultState}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  settings: {
                    ...editing.settings,
                    defaultState: event.target.value,
                  },
                })
              }
            >
              <option value="CLOSED">All closed</option>
              <option value="FIRST_OPEN">First item open</option>
              <option value="ALL_OPEN">All open</option>
            </select>
            <Input
              placeholder="Closed icon"
              value={String(editing.icons.closed || "")}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  icons: { ...editing.icons, closed: event.target.value },
                })
              }
            />
            <Input
              placeholder="Open icon"
              value={String(editing.icons.open || "")}
              onChange={(event) =>
                setEditing({
                  ...editing,
                  icons: { ...editing.icons, open: event.target.value },
                })
              }
            />
          </section>
          <section className="rounded-lg border p-4">
            <h2 className="mb-3 font-medium">CSS</h2>
            <Textarea
              className="min-h-64 font-mono"
              value={editing.css}
              placeholder="Default accordion CSS is applied when blank."
              onChange={(event) =>
                setEditing({ ...editing, css: event.target.value })
              }
            />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Accordion / FAQ</h1>
          <p className="text-muted-foreground">
            Manage reusable, accessible accordions for your pages.
          </p>
        </div>
        <Button onClick={blank}>Create accordion</Button>
      </div>
      <DataTable
        data={items}
        columns={columns}
        getRowId={(item) => item.id}
        searchKeys={["name", "identifier", "status"]}
        searchPlaceholder="Search accordions..."
        emptyMessage="No accordions yet."
        enableColumnVisibility
        persistKey="admin-accordions"
      />
    </main>
  );
}
