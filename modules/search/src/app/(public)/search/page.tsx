import Link from "next/link";
import { searchPublishedContent } from "@/src/app/lib/services/common_urls/search.service";
import { getPublicSettings } from "@/src/app/lib/services/common_urls/public.service";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q?.trim() || "";
  const settings = await getPublicSettings();
  const results =
    query && settings?.tenantId
      ? await searchPublishedContent(query, settings.tenantId)
      : [];

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
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={
              result.type === "post"
                ? `/posts/${result.slug}`
                : `/${result.slug}`
            }
            className="block p-4 border border-black/10 rounded-lg hover:bg-gray-50 transition"
          >
            <span className="text-xs uppercase tracking-wide text-gray-400">
              {result.type}
            </span>
            <div className="font-medium text-[#152539]">{result.title}</div>
            <div className="text-sm text-gray-500 mt-1">{result.excerpt}</div>
          </Link>
        ))}
        {query && results.length === 0 && (
          <p className="text-gray-500">No results found.</p>
        )}
      </div>
    </div>
  );
}
