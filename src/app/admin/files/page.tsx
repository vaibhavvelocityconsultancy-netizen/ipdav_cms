"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { DataTable, Column } from "@/src/ui/DataTable"; // adjust path to your actual location
import { Button } from "@/src/ui/button";
import { Badge } from "@/src/ui/badge";
import { DataTable, Column } from "@/src/ui/data-table";

interface SharedFile {
  id: string;
  title: string;
  description: string | null;
  category: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: string;
  uploader: { name: string | null; email: string };
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminFilesPage() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data: files, isLoading } = useQuery<SharedFile[]>({
    queryKey: ["admin-files"],
    queryFn: async () => {
      const res = await fetch("/api/files/admin");
      const json = await res.json();
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/files/admin/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-files"] });
      setConfirmingId(null);
    },
  });

  const columns: Column<SharedFile>[] = [
    {
      key: "title",
      header: "Title",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          {row.description && (
            <div className="text-muted-foreground text-xs truncate max-w-xs">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      cell: (row) => <Badge variant="secondary">{row.category}</Badge>,
    },
    {
      key: "uploader",
      header: "Uploaded By",
      cell: (row) => (
        <div>
          <div>{row.uploader?.name || "—"}</div>
          <div className="text-muted-foreground text-xs">{row.uploader?.email}</div>
        </div>
      ),
      filterValue: (row) => row.uploader?.email || "",
    },
    {
      key: "size",
      header: "Size",
      cell: (row) => <span className="text-muted-foreground">{formatSize(row.size)}</span>,
      filterable: false,
    },
    {
      key: "createdAt",
      header: "Uploaded",
      cell: (row) => (
        <span className="text-muted-foreground">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
      filterable: false,
    },
    {
      key: "actions",
      header: "Actions",
      filterable: false,
      cell: (row) => (
        <div className="flex justify-end gap-2">
          <a href={row.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">Open</Button>
          </a>
          {confirmingId === row.id ? (
            <>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteMutation.mutate(row.id)}
                disabled={deleteMutation.isPending}
              >
                Confirm
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmingId(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setConfirmingId(row.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">All Shared Files</h1>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <DataTable
          data={files ?? []}
          columns={columns}
          searchPlaceholder="Search by title..."
          searchKeys={["title"]}
          emptyMessage="No files uploaded yet."
        />
      )}
    </div>
  );
}