"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import FileCard from "@/src/components/subscription/file-sharing/FileCard";
import UploadModal from "@/src/components/subscription/file-sharing/UploadModal";
import ShareModal from "@/src/components/subscription/file-sharing/ShareModal";
import { TrialExpiryPopup } from "@/src/components/subscription/TrialExpiryPopup";
import { useSubscription } from "@/src/hooks/use-subscription";

/**
 * ═════════════════════════════════════════════════════════════════════
 * FILE SHARING PAGE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Displays user's shared files.
 * Uses useSubscription hook to get access data (single source of truth).
 * No local fetching of subscription data.
 *
 * Selection mode: user toggles "Select" on, taps file cards to select
 * multiple, then shares them all in one FileShare via ShareModal.
 */

export default function FilesPage() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // ── Get subscription from hook (cached, single source of truth) ──
  const { access, isLoading: subscriptionLoading } = useSubscription();

  // ── Derive access state from subscription ──
  const hasAccess = useMemo(() => {
    if (!access) return false;
    const now = new Date();
    const trialValid =
      access.status === "TRIALING" &&
      access.trialEndsAt &&
      new Date(access.trialEndsAt) > now;
    return access.status === "ACTIVE" || trialValid;
  }, [access]);

  // ── Fetch files only if user has access ──
  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ["shared-files"],
    enabled: !subscriptionLoading && !!hasAccess,
    queryFn: async () => {
      const res = await fetch("/api/files");
      const json = await res.json();
      return json.data as any[];
    },
  });

  const isLoading = subscriptionLoading || filesLoading;

  // ── Selection helpers ──
  function toggleSelect(fileId: string) {
    setSelectedIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds([]);
  }

  // ── Show expiry popup if no access ──
  if (!subscriptionLoading && !hasAccess) {
    return <TrialExpiryPopup show={true} onDismiss={() => {}} />;
  }

  return (
    <div className="p-6 pb-24">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Shared Files
          </h1>
          <p className="text-sm text-slate-500">
            Upload and manage files shared with your workspace.
          </p>
        </div>

        <div className="flex gap-2">
          {selectMode ? (
            <button
              onClick={exitSelectMode}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Select
            </button>
          )}

          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Upload File
          </button>
        </div>
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
            <FileCard
              key={file.id}
              file={file}
              selectable={selectMode}
              selected={selectedIds.includes(file.id)}
              onToggleSelect={() => toggleSelect(file.id)}
            />
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

      {shareOpen && (
        <ShareModal
          fileIds={selectedIds}
          onClose={() => setShareOpen(false)}
          onSuccess={() => {
            setShareOpen(false);
            exitSelectMode();
          }}
        />
      )}

      {/* ── Floating action bar — appears once files are selected ── */}
      {selectMode && selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg">
            <span className="text-sm font-medium">
              {selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <button
              onClick={() => setShareOpen(true)}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}