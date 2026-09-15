"use client";
import { useEffect, useState } from "react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { MediaPickerModal } from "@/src/components/media-manager/MediaPicker";
import { GripVertical, Trash2 } from "lucide-react";

export default function GalleriesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [picker, setPicker] = useState(false);
  const [draggedImage, setDraggedImage] = useState<number | null>(null);

  const load = () =>
    fetch("/api/galleries")
      .then((r) => r.json())
      .then((j) => setItems(j.data?.items || []));

  useEffect(() => {
    load();
  }, []);

  const blank = () =>
    setEditing({
      title: "",
      slug: "",
      columns: 3,
      images: [],
    });

  const save = async () => {
    const isNew = !editing.id;
    const payload = {
      title: editing.title,
      slug: editing.slug,
      columns: editing.columns,
      images: editing.images.map((img: any) => ({
        mediaId: img.mediaId || img.id,
        caption: img.caption || "",
      })),
    };

    const res = await fetch(
      isNew ? "/api/galleries" : `/api/galleries/${editing.id}`,
      {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    setEditing(null);
    load();
  };

  const editGallery = async (item: any) => {
    const response = await fetch(`/api/galleries/${item.id}`);
    const result = await response.json();
    const gallery = result.data || item;
    setEditing({
      ...gallery,
      images: (gallery.images || []).map((image: any) => ({
        ...image,
        mediaId: image.mediaId,
        url: image.media?.url || image.url,
        originalName: image.media?.originalName || image.originalName,
        altText: image.media?.altText || "",
      })),
    });
  };

  const addImage = (media: any) => {
    if (editing.images.some((image: any) => Number(image.mediaId || image.id) === Number(media.id))) return;
    setEditing({
      ...editing,
      images: [...editing.images, { mediaId: media.id, url: media.url, originalName: media.originalName, altText: media.altText || "", caption: "" }],
    });
    setPicker(false);
  };

  const removeImage = (index: number) => {
    setEditing({
      ...editing,
      images: editing.images.filter((_: any, i: number) => i !== index),
    });
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = [...editing.images];
    updated[index] = { ...updated[index], caption };
    setEditing({ ...editing, images: updated });
  };

  const handleDragStart = (index: number) => {
    setDraggedImage(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedImage === null || draggedImage === dropIndex) return;
    const updated = [...editing.images];
    const [removed] = updated.splice(draggedImage, 1);
    updated.splice(dropIndex, 0, removed);
    setEditing({ ...editing, images: updated });
    setDraggedImage(null);
  };

  const responsiveClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  }[Math.max(1, Math.min(6, Number(editing?.columns) || 3)) as 1 | 2 | 3 | 4 | 5 | 6];

  if (editing) {
    return (
      <main className="p-6 max-w-6xl">
        <div className="flex justify-between mb-6">
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
            <Button onClick={save}>Save gallery</Button>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4">
            <Input
              placeholder="Title"
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />
            <Input
              placeholder="Slug"
              value={editing.slug}
              onChange={(e) =>
                setEditing({ ...editing, slug: e.target.value })
              }
            />
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Columns</label>
                <Input
                  type="number"
                  min={1}
                  max={6}
                  value={editing.columns}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      columns: Math.max(1, Math.min(6, Number(e.target.value))),
                    })
                  }
                />
              </div>
              <div className="text-xs text-muted-foreground pt-6">
                Up to {editing.columns} per row on desktop; cards reduce on smaller screens
              </div>
            </div>
          </div>

          <section className="rounded-lg border p-4">
            <div className="flex justify-between mb-4">
              <h2 className="font-medium">
                Images ({editing.images.length})
              </h2>
              <Button variant="outline" onClick={() => setPicker(true)}>
                Add images
              </Button>
            </div>

            {editing.images.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No images selected. Click "Add images" to get started.
              </div>
            ) : (
              <div className={`grid gap-4 ${responsiveClass}`}>
                {editing.images.map((image: any, index: number) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`border rounded-lg overflow-hidden bg-card transition-all ${
                      draggedImage === index ? "opacity-50 border-primary" : ""
                    }`}
                  >
                    <div className="relative group">
                      <img
                        src={image.url}
                        alt={image.originalName}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <GripVertical className="w-5 h-5 text-white" />
                      </div>
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">
                        #{index + 1}
                      </div>
                      <Input
                        placeholder="Caption (optional)"
                        value={image.caption}
                        onChange={(e) => updateCaption(index, e.target.value)}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground truncate">
                        {image.originalName}
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
    <main className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Galleries</h1>
          <p className="text-muted-foreground">
            Manage image galleries with lightbox support.
          </p>
        </div>
        <Button onClick={blank}>Create gallery</Button>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Columns
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Images
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No galleries yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                items.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{item.slug}</td>
                    <td className="px-4 py-3 text-sm">{item.columns}</td>
                    <td className="px-4 py-3 text-sm">{item._count?.images || 0}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editGallery(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={async () => {
                          if (
                            confirm(
                              `Delete gallery "${item.title}"? This cannot be undone.`
                            )
                          ) {
                            await fetch(`/api/galleries/${item.id}`, {
                              method: "DELETE",
                            });
                            load();
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
