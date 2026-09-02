import cmskitConfig from "../../../cmskit.config.json";

type CmskitConfig = {
  installedModules?: unknown;
};

function getInstalledModules(config: CmskitConfig): string[] {
  return Array.isArray(config.installedModules)
    ? config.installedModules.filter(
        (moduleName): moduleName is string => typeof moduleName === "string",
      )
    : [];
}

function readInstalledModulesServer(): string[] {
  try {
    const fs = process.getBuiltinModule?.("fs") as
      typeof import("node:fs") | undefined;
    const path = process.getBuiltinModule?.("path") as
      typeof import("node:path") | undefined;
    if (!fs || !path) return [];

    const configPath = path.join(process.cwd(), "cmskit.config.json");
    const config = JSON.parse(
      fs.readFileSync(configPath, "utf8"),
    ) as CmskitConfig;

    return getInstalledModules(config);
  } catch {
    return [];
  }
}

export function isModuleInstalled(moduleName: string): boolean {
  return getInstalledModules(cmskitConfig).includes(moduleName);
}

export function isModuleInstalledServer(moduleName: string): boolean {
  return readInstalledModulesServer().includes(moduleName);
}
