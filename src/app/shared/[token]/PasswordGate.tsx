"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

export default function PasswordGate({ token }: { token: string }) {
  const [meta, setMeta] = useState<{ title: string; category: string } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unlocked, setUnlocked] = useState<any>(null);
  const [sheetData, setSheetData] = useState<any[][] | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/shared/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((json) => setMeta(json.data))
      .catch(() => setNotFound(true));
  }, [token]);

  const isSpreadsheet = (mimeType: string) =>
    mimeType === "application/vnd.ms-excel" ||
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch(`/api/shared/${token}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const json = await res.json();
    if (!res.ok) return setError(json.message || "Wrong password");

    setUnlocked(json.data);

    if (isSpreadsheet(json.data.mimeType)) {
      setSheetLoading(true);
      try {
        const fileRes = await fetch(json.data.fileUrl);
        const arrayBuffer = await fileRes.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];
        setSheetData(rows);
      } catch {
        setSheetData(null);
      } finally {
        setSheetLoading(false);
      }
    }
  }

  async function handleDownload() {
    window.location.href = `/api/shared/${token}/download`;
  }

  if (notFound) {
    return <div className="max-w-sm mx-auto mt-20 text-center"><p className="text-gray-500">This link is invalid or has expired.</p></div>;
  }

  if (!meta) {
    return <div className="max-w-sm mx-auto mt-20 text-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (unlocked) {
    const isImage = unlocked.mimeType.startsWith("image/");
    const isPdf = unlocked.mimeType === "application/pdf";
    const isVideo = unlocked.mimeType.startsWith("video/");
    const isAudio = unlocked.mimeType.startsWith("audio/");
    const isSheet = isSpreadsheet(unlocked.mimeType);

    return (
      <div className="max-w-3xl mx-auto mt-10 border rounded-lg p-6">
        <h1 className="text-xl font-semibold">{unlocked.title}</h1>
        <p className="text-sm text-gray-500 mb-4">{meta.category}</p>

        <div className="border rounded-lg overflow-hidden mb-4 bg-gray-50">
          {isImage && <img src={unlocked.fileUrl} alt={unlocked.title} className="w-full h-auto" />}
          {isPdf && <iframe src={unlocked.fileUrl} className="w-full h-[600px]" title={unlocked.title} />}
          {isVideo && <video src={unlocked.fileUrl} controls className="w-full" />}
          {isAudio && <audio src={unlocked.fileUrl} controls className="w-full p-4" />}

          {isSheet && (
            <div className="overflow-auto max-h-[500px] p-2">
              {sheetLoading ? (
                <p className="text-center text-gray-500 py-8">Loading spreadsheet...</p>
              ) : sheetData ? (
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {sheetData.map((row, i) => (
                      <tr key={i} className={i === 0 ? "bg-gray-100 font-medium" : ""}>
                        {row.map((cell, j) => (
                          <td key={j} className="border px-2 py-1 whitespace-nowrap">
                            {cell?.toString() ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center text-gray-500 py-8">Preview not available.</p>
              )}
            </div>
          )}

          {!isImage && !isPdf && !isVideo && !isAudio && !isSheet && (
            <div className="p-8 text-center text-gray-500">
              <p>Preview not available for this file type.</p>
            </div>
          )}
        </div>

        <button onClick={handleDownload} className="px-4 py-2 bg-gray-900 text-white rounded">
          Download
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleUnlock} className="max-w-sm mx-auto mt-20 border rounded-lg p-6">
      <h2 className="font-semibold mb-2">{meta.title}</h2>
      <p className="text-sm text-gray-500 mb-4">This file is password protected</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="border rounded w-full p-2"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button type="submit" className="bg-gray-900 text-white w-full mt-3 py-2 rounded">
        Unlock
      </button>
    </form>
  );
}