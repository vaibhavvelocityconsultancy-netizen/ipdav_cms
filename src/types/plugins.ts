export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  category: string;
  status: "active" | "inactive" | "installed" | "available";
  installed: boolean;
  active?: boolean;
  files?: string[];
  lastUpdated?: string;
  author?: string;
  requires?: string[];
  actions?: {
    settings?: boolean;
    deactivate?: boolean;
    activate?: boolean;
    uninstall?: boolean;
    viewDetails?: boolean;
    checkUpdates?: boolean;
  };
}

export interface PluginStats {
  total: number;
  active: number;
  inactive: number;
  updatesAvailable: number;
}

export type PluginViewMode = "grid" | "table";
export type PluginCategory =
  | "all"
  | "content"
  | "marketing"
  | "ecommerce"
  | "users"
  | "utilities"
  | "integrations";
