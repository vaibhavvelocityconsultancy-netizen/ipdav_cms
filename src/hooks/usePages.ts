import { useQuery } from "@tanstack/react-query";

export type Page = {
  id: number;
  title: string;
  slug: string;
};

async function fetchPages(): Promise<Page[]> {
  const res = await fetch("/api/pages");
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch pages");
  }

  return data.data ?? [];
}

export function usePages() {
  return useQuery<Page[], Error>({
    queryKey: ["pages"],
    queryFn: fetchPages,
    staleTime: 1000 * 60 * 10,
  });
}