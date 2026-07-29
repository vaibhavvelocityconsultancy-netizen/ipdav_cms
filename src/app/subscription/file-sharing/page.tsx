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
      access.status === "TRIAL" &&
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
  const allSelected =
    !!files && files.length > 0 && selectedIds.length === files.length;

  // ── Selection helpers ──
  function toggleSelect(fileId: string) {
    setSelectedIds((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  }

  function toggleSelectAll() {
    if (!files) return;
    setSelectedIds(allSelected ? [] : files.map((f: any) => f.id));
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
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
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
            <>
              <button
                onClick={toggleSelectAll}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </button>
              <button
                onClick={exitSelectMode}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setSelectMode(true)}
              disabled={!files || files.length === 0}
              className="inline-flex items-center gap-1.5 justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckSquareIcon />
              Select to Share
            </button>
          )}

          <button
            onClick={() => setUploadOpen(true)}
            className="inline-flex items-center gap-1.5 justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <PlusIcon />
            Upload File
          </button>
        </div>
      </div>

      {/* ── Hint banner: tells users the multi-select-to-share feature exists ── */}
      {!selectMode && !isLoading && files && files.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm text-blue-700">
          <InfoIcon />
          <span>
            <strong>Tip:</strong> Tap <strong>Select</strong> to choose multiple
            files and share them all at once.
          </span>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : files?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileIcon />
          </div>
          <p className="text-sm font-medium text-slate-700">
            No files uploaded yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Upload a file to start sharing it with your workspace.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            <PlusIcon />
            Upload your first file
          </button>
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

      {/* ── Floating action bar — shows during select mode ── */}
      {selectMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="flex items-center gap-4 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-lg">
            <span className="text-sm font-medium">
              {selectedIds.length === 0
                ? "Tap files to select"
                : `${selectedIds.length} file${
                    selectedIds.length > 1 ? "s" : ""
                  } selected`}
            </span>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setSelectedIds([])}
                className="text-sm font-medium text-slate-300 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShareOpen(true)}
              disabled={selectedIds.length === 0}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small inline icons (no extra dependency needed) ──
function CheckSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}