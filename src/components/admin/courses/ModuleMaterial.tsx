import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Trash2,
  FileText,
  Link,
  File,
  Video,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/src/ui/button";
import { Input } from "@/src/ui/input";
import { Label } from "@/src/ui/label";
import { MediaPickerModal } from "../../media-manager/MediaPicker";

interface Material {
  id: number;
  title: string;
  type: "PDF" | "DOC" | "LINK" | "VIDEO" | "OTHER";
  url: string;
  size?: number | null;
  sortOrder: number;
}

const MATERIAL_TYPES = ["PDF", "DOC", "LINK", "VIDEO", "OTHER"] as const;

function TypeIcon({ type }: { type: string }) {
  switch (type) {
    case "PDF":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "DOC":
      return <File className="w-4 h-4 text-blue-500" />;
    case "LINK":
      return <Link className="w-4 h-4 text-green-500" />;
    case "VIDEO":
      return <Video className="w-4 h-4 text-purple-500" />;
    default:
      return <File className="w-4 h-4 text-muted-foreground" />;
  }
}

function formatSize(bytes?: number | null) {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── API fetchers ─────────────────────────────────────────────

async function fetchMaterials(moduleId: number): Promise<Material[]> {
  const res = await fetch(`/api/course-material/${moduleId}`);
  const data = await res.json();
  if (!data.success)
    throw new Error(data.message || "Failed to fetch materials");
  return data.data;
}

async function addMaterial(
  moduleId: number,
  input: Omit<Material, "id" | "sortOrder">,
) {
  console.log("moduleId:", moduleId);

  const url = `/api/course-material/${moduleId}`;
  console.log("POST URL:", url);
  const res = await fetch(`/api/course-material/${moduleId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to add material");
  return data.data;
}

async function deleteMaterial(materialId: number) {
  const res = await fetch(`/api/course-material/material/${materialId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.message || "Failed to delete material");
  return data.data;
}

async function updateMaterial(materialId: number, input: Partial<Material>) {
  const res = await fetch(`/api/course-material/material/${materialId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await res.json();
  if (!data.success)
    throw new Error(data.message || "Failed to update material");
  return data.data;
}

// ── Add form ─────────────────────────────────────────────────

function AddMaterialForm({
  moduleId,
  onDone,
}: {
  moduleId: number;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<(typeof MATERIAL_TYPES)[number]>("PDF");
  const [url, setUrl] = useState("");
  const [source, setSource] = useState<"UPLOAD" | "LINK">("UPLOAD");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const { mutate, isPending, error } = useMutation({
    mutationFn: () => addMaterial(moduleId, { title, type, url }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", moduleId] });
      onDone();
    },
  });

  const isValid = title.trim() && url.trim();

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
      <p className="text-sm font-medium">Add Material</p>

      {/* Type selector */}
      <div className="flex gap-1.5 flex-wrap">
        {MATERIAL_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-2.5 py-1 text-xs rounded-md border transition ${
              type === t
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Lecture Notes"
        />
      </div>

      <div className="space-y-3">
        <Label>Source</Label>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={source === "UPLOAD" ? "default" : "outline"}
            onClick={() => setSource("UPLOAD")}
          >
            Upload File
          </Button>

          <Button
            type="button"
            variant={source === "LINK" ? "default" : "outline"}
            onClick={() => setSource("LINK")}
          >
            External Link
          </Button>
        </div>

        {source === "UPLOAD" ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowMediaPicker(true)}
            >
              Select From Media Library
            </Button>

            {url && <p className="text-sm text-green-600">✓ File Selected</p>}

            <MediaPickerModal
              open={showMediaPicker}
              onClose={() => setShowMediaPicker(false)}
              onSelect={(item) => {
                setUrl(item.url);
                setShowMediaPicker(false);
              }}
            />
          </>
        ) : (
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/file.pdf"
          />
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{(error as Error).message}</p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={!isValid || isPending}
          onClick={() => mutate()}
        >
          {isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Check className="w-3 h-3 mr-1" />
          )}
          Add
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onDone}>
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

// ── Material row ─────────────────────────────────────────────

function MaterialRow({
  material,
  moduleId,
}: {
  material: Material;
  moduleId: number;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(material.title);

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => deleteMaterial(material.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", moduleId] });
    },
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: () => updateMaterial(material.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials", moduleId] });
      setEditing(false);
    },
  });

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition group">
      <TypeIcon type={material.type} />

      <div className="flex-1 min-w-0">
        {editing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-7 text-sm"
            autoFocus
          />
        ) : (
          <p
            className="text-sm font-medium truncate cursor-pointer hover:underline"
            onClick={() => setEditing(true)}
          >
            {material.title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {material.type}
          </span>
          {material.size && (
            <span className="text-xs text-muted-foreground">
              {formatSize(material.size)}
            </span>
          )}
          <a
            href={material.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline truncate max-w-[200px]"
          >
            {material.url}
          </a>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
        {editing ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              disabled={updating}
              onClick={() => update()}
            >
              {updating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={() => {
                setTitle(material.title);
                setEditing(false);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            disabled={deleting}
            onClick={() => remove()}
          >
            {deleting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Trash2 className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────

interface ModuleMaterialsProps {
  moduleId: number;
}

export default function ModuleMaterials({ moduleId }: ModuleMaterialsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    data: materials,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["materials", moduleId],
    queryFn: () => fetchMaterials(moduleId),
    staleTime: 2 * 60 * 1000,
    enabled: !!moduleId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading materials...
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive py-2">Failed to load materials</p>
    );
  }

  return (
    <div className="space-y-2 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          Materials{" "}
          {materials && materials.length > 0 && (
            <span className="ml-1 text-xs bg-muted px-1.5 py-0.5 rounded-full">
              {materials.length}
            </span>
          )}
        </p>
        {!showAddForm && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Materials list */}
      {materials && materials.length > 0 ? (
        <div className="space-y-1.5">
          {materials.map((material) => (
            <MaterialRow
              key={material.id}
              material={material}
              moduleId={moduleId}
            />
          ))}
        </div>
      ) : (
        !showAddForm && (
          <p className="text-xs text-muted-foreground py-1">
            No materials yet — add PDFs, docs or links for students.
          </p>
        )
      )}

      {/* Add form */}
      {showAddForm && (
        <AddMaterialForm
          moduleId={moduleId}
          onDone={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}
