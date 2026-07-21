"use client";

import { useState } from "react";
import ShareModal from "./ShareModal";
import SharesDrawer from "./SharesDrawer";

export default function FileCard({ file }: { file: any }) {
  const [shareOpen, setShareOpen] = useState(false);
  const [sharesOpen, setSharesOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-600">
          {file.category}
        </span>
        <span className="text-xs text-slate-400">
          {(file.size / 1024).toFixed(0)} KB
        </span>
      </div>

      <h3 className="truncate font-medium text-slate-900">{file.title}</h3>
      {file.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
          {file.description}
        </p>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => setSharesOpen(true)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          View shares
        </button>

        <div className="flex items-center gap-2">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Open
          </a>
          <button
            onClick={() => setShareOpen(true)}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Share
          </button>
        </div>
      </div>

      {shareOpen && (
        <ShareModal fileId={file.id} onClose={() => setShareOpen(false)} />
      )}
      {sharesOpen && (
        <SharesDrawer fileId={file.id} onClose={() => setSharesOpen(false)} />
      )}
    </div>
  );
}
