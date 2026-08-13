// app/search/page.jsx
import Link from "next/link";
import { getBaseUrl } from "@/src/lib/config";

async function getResults(query) {
  const baseUrl = getBaseUrl();
  const res = await fetch(
    `${baseUrl}/api/search?q=${encodeURIComponent(query)}`,
    { cache: "no-store" },
  );

  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? []; // ← FIXED: was json.results
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const results = query ? await getResults(query) : [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-semibold text-[#152539] mb-1">
        Search results
      </h1>

      <p className="text-sm text-gray-500 mb-8">
        {query
          ? `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}"`
          : "Enter a search term to get started."}
      </p>

      <div className="space-y-4">
        {results.map((r) => (
          <Link
            key={`${r.type}-${r.id}`}
            href={r.type === "post" ? `/posts/${r.slug}` : `/${r.slug}`}
            className="block p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-xs uppercase tracking-wide text-gray-400">
              {r.type}
            </span>
            <div className="font-medium text-[#152539]">{r.title}</div>
            <div className="text-sm text-gray-500 mt-1">{r.excerpt}</div>
          </Link>
        ))}

        {query && results.length === 0 && (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}
