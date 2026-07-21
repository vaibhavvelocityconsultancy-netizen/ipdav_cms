// src/lib/ecom/useModuleFlags.ts
"use client";

import useSWR from "swr";

/**
 * Reads sitesettings module toggles from /api/setting.
 * Used by the sidebar (and any future feature gating) to hide/show
 * modules based on admin preferences. Failures are silent — if the
 * settings endpoint is unavailable we treat all modules as OFF so
 * we don't accidentally leak unfinished modules.
 */
export interface ModuleFlags {
  coursesEnabled: boolean;
  seoEnabled: boolean;
  ecommerceEnabled: boolean;
}

const fallback: ModuleFlags = {
  coursesEnabled: false,
  seoEnabled: false,
  ecommerceEnabled: false,
};

export function useModuleFlags(): ModuleFlags {
  const { data } = useSWR(
    "module-flags",
    async () => {
      const res = await fetch("/api/setting", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      return json?.data as Partial<ModuleFlags> | null;
    },
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );

  return {
    coursesEnabled: Boolean(data?.coursesEnabled),
    seoEnabled: Boolean(data?.seoEnabled),
    ecommerceEnabled: Boolean(data?.ecommerceEnabled),
    ...fallback, // sensible defaults if data missing
    ...(data ?? {}),
  } as ModuleFlags;
}
