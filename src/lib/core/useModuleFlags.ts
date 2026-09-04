"use client";

import { useEffect, useState } from "react";
import { getBaseUrl } from "@/src/lib/config";

export function useModuleFlags(): Record<string, boolean> {
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/modules/active`)
      .then((res) => res.json())
      .then((data) => setFlags(data.activeModules || {}))
      .catch(() => setFlags({}));
  }, []);

  return flags;
}
