"use client";

import { useState } from "react";

const CATEGORIES = ["Contract", "Invoice", "Report", "Design", "Other"];

export default function UploadModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError("Please select a file");

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);

      const res = await fetch("/api/files", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Upload File
        </h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mb-3 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-slate-400"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-slate-400"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 w-full rounded-lg border border-slate-200 p-2.5 text-sm outline-none focus:border-slate-400"
          rows={3}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="mb-3 w-full text-sm"
        />

        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
}
