"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FileCard from "@/src/components/subscription/file-sharing/FileCard";
import UploadModal from "@/src/components/subscription/file-sharing/UploadModal";

export default function FilesPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ["shared-files"],
    queryFn: async () => {
      const res = await fetch("/api/files");
      const json = await res.json();
      return json.data;
    },
  });

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Shared Files
          </h1>
          <p className="text-sm text-slate-500">
            Upload and manage files shared with your workspace.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Upload File
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : files?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
          No files uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files?.map((file: any) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}

      {uploadOpen && (
        <UploadModal
          onClose={() => setUploadOpen(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["shared-files"] });
            setUploadOpen(false);
          }}
        />
      )}
    </div>
  );
}
