"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { MediaPickerModal } from "@/src/components/media-manager/MediaPicker";
import { DataTable, type Column } from "@/src/ui/data-table";

type Gallery = {
  id: number;
  title: string;
  slug: string;
  columns: number;
  _count?: { images: number };
};

type GalleryEditor = Gallery & {
  images: any[];
};

function getShortcode(id: number) {
  return `[gallery id="${id}"]`;
}

export default function GalleriesPage() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [editing, setEditing] = useState<GalleryEditor | null>(null);
  const [picker, setPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/galleries")
      .then((response) => response.json())
      .then((json) => setItems(json.data?.items || []));

  useEffect(() => {
    load();
  }, []);

  const blank = () =>
    setEditing({ id: 0, title: "", slug: "", columns: 3, images: [] });

  const save = async () => {
    if (!editing || saving) return;

    const isNew = !editing.id;
    const mediaIds = editing.images
      .map((image) => Number(image.mediaId ?? image.id))
      .filter(Number.isInteger);

    setSaving(true);
    try {
      const response = await fetch(
        isNew ? "/api/galleries" : `/api/galleries/${editing.id}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editing.title,
            slug: editing.slug,
            columns: editing.columns,
            mediaIds,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Unable to save the gallery.");
      }

      // New galleries persist their selected media in the create request.  Do
      // not repeat a second attachment request: it can mask a failed create
      // and can race the nested relation insert.
      if (data.data.images.length !== mediaIds.length) {
        throw new Error("Some selected images could not be saved to this gallery.");
      }

      setEditing(null);
      load();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to save the gallery.");
    } finally {
      setSaving(false);
    }
  };

  const copyShortcode = async (id: number) => {
    await navigator.clipboard.writeText(getShortcode(id));
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const columns: Column<Gallery>[] = [
    {
      key: "title",
      header: "Title",
      cell: (item) => <span className="font-medium">{item.title}</span>,
      filterable: true,
      filterValue: (item) => item.title,
    },
    {
      key: "slug",
      header: "Slug",
      cell: (item) => (
        <span className="text-muted-foreground">/{item.slug}</span>
      ),
      filterable: true,
      filterValue: (item) => item.slug,
    },
    {
      key: "images",
      header: "Images",
      cell: (item) => item._count?.images || 0,
    },
    {
      key: "shortcode",
      header: "Shortcode",
      cell: (item) => {
        const shortcode = getShortcode(item.id);
        const copied = copiedId === item.id;

        return (
          <div className="flex min-w-56 items-center gap-2">
            <code className="truncate text-xs text-muted-foreground">
              {shortcode}
            </code>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title={copied ? "Copied" : "Copy shortcode"}
              aria-label={copied ? "Copied" : "Copy shortcode"}
              onClick={() => copyShortcode(item.id)}
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
          <Button
            variant="outline"
            onClick={() =>
              fetch(`/api/galleries/${item.id}`)
                .then((response) => response.json())
                .then((json) => setEditing(json.data))
            }
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              fetch(`/api/galleries/${item.id}`, { method: "DELETE" }).then(
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
      <main className="max-w-5xl p-6">
        <div className="mb-6 flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {editing.id ? "Edit gallery" : "New gallery"}
            </h1>
            <p className="text-muted-foreground">
              Create a responsive lightbox gallery.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save gallery"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <Input
            placeholder="Title"
            value={editing.title}
            onChange={(event) =>
              setEditing({ ...editing, title: event.target.value })
            }
          />
          <Input
            placeholder="Slug"
            value={editing.slug}
            onChange={(event) =>
              setEditing({ ...editing, slug: event.target.value })
            }
          />
          <Input
            type="number"
            min={1}
            max={6}
            placeholder="Columns"
            value={editing.columns}
            onChange={(event) =>
              setEditing({ ...editing, columns: Number(event.target.value) })
            }
          />
          <section className="rounded-lg border p-4">
            <div className="mb-4 flex justify-between">
              <h2 className="font-medium">Images</h2>
              <Button variant="outline" onClick={() => setPicker(true)}>
                Add images
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {editing.images.map((image, index) => (
                <div
                  key={image.id || image.mediaId}
                  draggable
                  onDragStart={(event) =>
                    event.dataTransfer.setData("text/plain", String(index))
                  }
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    const from = Number(
                      event.dataTransfer.getData("text/plain"),
                    );
                    const next = [...editing.images];
                    const [moved] = next.splice(from, 1);
                    next.splice(index, 0, moved);
                    setEditing({ ...editing, images: next });
                  }}
                  className="overflow-hidden rounded-lg border"
                >
                  <img
                    src={image.media?.url || image.url}
                    alt={image.media?.altText || image.originalName || ""}
                    className="aspect-square w-full object-cover"
                  />
                  <Input
                    className="rounded-none border-0"
                    placeholder="Caption"
                    value={image.caption || ""}
                    onChange={(event) => {
                      const next = [...editing.images];
                      next[index] = { ...image, caption: event.target.value };
                      setEditing({ ...editing, images: next });
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
        <MediaPickerModal
          open={picker}
          onClose={() => setPicker(false)}
          onSelect={(item) =>
            setEditing({ ...editing, images: [...editing.images, item] })
          }
        />
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Galleries</h1>
          <p className="text-muted-foreground">
            Manage reusable image galleries.
          </p>
        </div>
        <Button onClick={blank}>New gallery</Button>
      </div>
      <DataTable
        data={items}
        columns={columns}
        getRowId={(item) => item.id}
        searchKeys={["title", "slug"]}
        searchPlaceholder="Search galleries..."
        emptyMessage="No galleries yet."
        enableColumnVisibility
        persistKey="admin-galleries"
      />
    </main>
  );
}
