"use client";

import { useQuery } from "@tanstack/react-query";

export type CurrentUser = {
  id?: string;
  email?: string;
  name?: string;
  role?: string;
  tenantId?: string;
  createdAt?: string;
};

export function useCurrentUser() {
  const query = useQuery<CurrentUser | null>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.user ?? null;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  return {
    user: query.data,
    loading: query.isLoading,
    // error: query.error,
    refresh: query.refetch,

    // Optional: expose original query if needed
    ...query,
  };
}