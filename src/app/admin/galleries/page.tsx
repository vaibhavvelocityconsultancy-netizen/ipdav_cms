"use client";

import { useEffect, useState } from "react";
import { Check, Copy, GripVertical, Trash2 } from "lucide-react";
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
type GalleryImage = {
  id?: number;
  mediaId: number;
  url?: string;
  originalName?: string;
  altText?: string;
  caption?: string;
  media?: { url?: string; originalName?: string; altText?: string };
};
type GalleryEditor = Gallery & { images: GalleryImage[] };

const gridClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
};
const getShortcode = (id: number) => `[gallery id="${id}"]`;

export default function GalleriesPage() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [editing, setEditing] = useState<GalleryEditor | null>(null);
  const [picker, setPicker] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);

  const load = () =>
    fetch("/api/galleries")
      .then((response) => response.json())
      .then((json) => setItems(json.data?.items || []));
  useEffect(() => {
    load();
  }, []);
  const blank = () =>
    setEditing({ id: 0, title: "", slug: "", columns: 3, images: [] });

  const editGallery = async (item: Gallery) => {
    const response = await fetch(`/api/galleries/${item.id}`);
    const result = await response.json();
    const gallery = result.data || item;
    setEditing({
      ...gallery,
      images: (gallery.images || []).map((image: GalleryImage) => ({
        ...image,
        mediaId: image.mediaId,
        url: image.media?.url || image.url,
        originalName: image.media?.originalName || image.originalName,
        altText: image.media?.altText || image.altText || "",
      })),
    });
  };

  const save = async () => {
    if (!editing || saving) return;
    const isNew = !editing.id;
    const images = editing.images
      .map((image) => ({
        mediaId: Number(image.mediaId ?? image.id),
        caption: image.caption || "",
      }))
      .filter((image) => Number.isInteger(image.mediaId));
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
            images,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.error || "Unable to save the gallery.");
      if (data.data.images.length !== images.length)
        throw new Error(
          "Some selected images could not be saved to this gallery.",
        );
      setEditing(null);
      load();
    } catch (error) {
      window.alert(
        error instanceof Error ? error.message : "Unable to save the gallery.",
      );
    } finally {
      setSaving(false);
    }
  };

  const addImage = (media: GalleryImage) => {
    if (
      !editing ||
      editing.images.some(
        (image) => Number(image.mediaId ?? image.id) === Number(media.id),
      )
    )
      return;
    setEditing({
      ...editing,
      images: [
        ...editing.images,
        {
          mediaId: Number(media.id),
          url: media.url,
          originalName: media.originalName,
          altText: media.altText || "",
          caption: "",
        },
      ],
    });
    setPicker(false);
  };
  const updateImage = (index: number, changes: Partial<GalleryImage>) =>
    editing &&
    setEditing({
      ...editing,
      images: editing.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...changes } : image,
      ),
    });
  const removeImage = (index: number) =>
    editing &&
    setEditing({
      ...editing,
      images: editing.images.filter((_, imageIndex) => imageIndex !== index),
    });
  const dropImage = (to: number) => {
    if (!editing || draggedImage === null || draggedImage === to) return;
    const images = [...editing.images];
    const [image] = images.splice(draggedImage, 1);
    images.splice(to, 0, image);
    setEditing({ ...editing, images });
    setDraggedImage(null);
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
    { key: "columns", header: "Columns", cell: (item) => item.columns },
    {
      key: "images",
      header: "Images",
      cell: (item) => item._count?.images || 0,
    },
    {
      key: "shortcode",
      header: "Shortcode",
      cell: (item) => (
        <div className="flex min-w-56 items-center gap-2">
          <code className="truncate text-xs text-muted-foreground">
            {getShortcode(item.id)}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            title={copiedId === item.id ? "Copied" : "Copy shortcode"}
            onClick={() => copyShortcode(item.id)}
          >
            {copiedId === item.id ? <Check /> : <Copy />}
          </Button>
        </div>
      ),
      hideable: false,
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => editGallery(item)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm(`Delete gallery “${item.title}”?`))
                fetch(`/api/galleries/${item.id}`, { method: "DELETE" }).then(
                  load,
                );
            }}
          >
            Delete
          </Button>
        </div>
      ),
      hideable: false,
    },
  ];

  if (editing) {
    const columnCount = Math.max(
      1,
      Math.min(6, Number(editing.columns) || 3),
    ) as keyof typeof gridClasses;
    return (
      <main className="max-w-6xl p-6">
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
        <div className="grid gap-6">
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
            <div className="flex items-end gap-4">
              <div className="max-w-40 flex-1">
                <label className="text-sm font-medium">Columns</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={editing.columns}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      columns: Math.max(
                        1,
                        Math.min(6, Number(event.target.value) || 1),
                      ),
                    })
                  }
                />
              </div>
              <p className="pb-2 text-xs text-muted-foreground">
                {columnCount} per row on desktop; responsive on smaller screens.
              </p>
            </div>
          </div>
          <section className="rounded-lg border p-4">
            <div className="mb-4 flex justify-between">
              <h2 className="font-medium">Images ({editing.images.length})</h2>
              <Button variant="outline" onClick={() => setPicker(true)}>
                Add images
              </Button>
            </div>
            {editing.images.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No images selected. Click “Add images” to get started.
              </p>
            ) : (
              <div className={`grid gap-4 ${gridClasses[columnCount]}`}>
                {editing.images.map((image, index) => (
                  <div
                    key={`${image.mediaId}-${index}`}
                    draggable
                    onDragStart={() => setDraggedImage(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => dropImage(index)}
                    className={`overflow-hidden rounded-lg border bg-card ${draggedImage === index ? "border-primary opacity-50" : ""}`}
                  >
                    <div className="relative group">
                      <img
                        src={image.url}
                        alt={image.altText || image.originalName || ""}
                        className="aspect-square w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                        <GripVertical className="text-white" />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="absolute right-2 top-2"
                        onClick={() => removeImage(index)}
                        aria-label={`Remove image ${index + 1}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="space-y-2 p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Position #{index + 1}
                      </p>
                      <Input
                        placeholder="Caption (optional)"
                        value={image.caption || ""}
                        onChange={(event) =>
                          updateImage(index, { caption: event.target.value })
                        }
                      />
                      <p
                        className="truncate text-xs text-muted-foreground"
                        title={image.altText}
                      >
                        {image.altText || image.originalName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        <MediaPickerModal
          open={picker}
          onClose={() => setPicker(false)}
          onSelect={addImage}
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
