import archiver from "archiver";
import { prisma } from "@/src/app/lib/prisma";

export const SELECTIVE_MODULES = ["pages", "posts", "media", "galleries", "categories", "tags", "menus", "popups", "accordions", "settings"];
export const PACKAGE_VERSION = 1;

const MODEL_MAP = {
  pages: "page", posts: "post", media: "media", galleries: "gallery", categories: "category", tags: "tag", menus: "menu", popups: "popup", accordions: "accordion",
};

function stripDatabaseFields(value) {
  if (Array.isArray(value)) return value.map(stripDatabaseFields);
  if (!value || typeof value !== "object" || value instanceof Date) return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !["id", "tenantId", "createdAt", "updatedAt"].includes(key)).map(([key, item]) => [key, stripDatabaseFields(item)]));
}

function whereFor(model, tenantId) {
  return ["menu", "page", "post", "media", "Gallery", "category", "tag", "Popup", "Accordion"].includes(model) ? { tenantId } : { tenantId };
}

export async function buildSelectivePackage(tenantId, requestedModules) {
  const modules = [...new Set(requestedModules)].filter((module) => SELECTIVE_MODULES.includes(module));
  if (!modules.length) throw new Error("Select at least one supported module");
  const files = {};
  const counts = {};
  for (const module of modules) {
    if (module === "settings") {
      const settings = await Promise.all(["sitesettings", "trackingSettings", "footersettings", "navbarConfig", "footerConfig", "analyticsSettings"].map(async (model) => {
        const delegate = prisma[model];
        if (!delegate?.findMany) return [];
        return delegate.findMany({ where: { tenantId } });
      }));
      files.settings = stripDatabaseFields(settings.flat());
    } else {
      const delegate = prisma[MODEL_MAP[module]];
      if (!delegate?.findMany) { files[module] = []; counts[module] = 0; continue; }
      const rows = await delegate.findMany({ where: whereFor(MODEL_MAP[module], tenantId) });
      files[module] = stripDatabaseFields(rows);
    }
    counts[module] = files[module].length;
  }
  return { metadata: { version: PACKAGE_VERSION, format: "cms-selective", exportedAt: new Date().toISOString(), modules, counts, dependencies: { galleries: ["media"], posts: ["categories", "tags"], menus: [], settings: [] } }, files };
}

export async function packageToZip(pkg) {
  const chunks = [];
  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise((resolve, reject) => { archive.on("end", resolve); archive.on("error", reject); });
  archive.append(JSON.stringify(pkg.metadata, null, 2), { name: "metadata.json" });
  for (const [module, data] of Object.entries(pkg.files)) archive.append(JSON.stringify(data, null, 2), { name: `${module}.json` });
  archive.finalize();
  await done;
  return Buffer.concat(chunks);
}

export function validateSelectivePackage(pkg) {
  if (!pkg?.metadata || pkg.metadata.format !== "cms-selective" || pkg.metadata.version !== PACKAGE_VERSION) throw new Error("Unsupported selective package");
  if (!Array.isArray(pkg.metadata.modules) || pkg.metadata.modules.some((module) => !SELECTIVE_MODULES.includes(module))) throw new Error("Package contains unsupported modules");
  for (const module of pkg.metadata.modules) if (!Array.isArray(pkg.files?.[module])) throw new Error(`Missing ${module}.json`);
  return pkg;
}

export async function previewSelectiveMerge(tenantId, pkg) {
  validateSelectivePackage(pkg);
  const conflicts = {};
  for (const module of pkg.metadata.modules) {
    const delegate = prisma[MODEL_MAP[module]];
    if (!delegate?.findMany) { conflicts[module] = []; continue; }
    const existing = await delegate.findMany({ where: whereFor(MODEL_MAP[module], tenantId), select: { id: true, slug: true, name: true, title: true } });
    const keys = new Set(existing.map((row) => row.slug || row.name || row.title).filter(Boolean));
    conflicts[module] = pkg.files[module].map((row) => row.slug || row.name || row.title).filter((key) => key && keys.has(key));
  }
  return { counts: pkg.metadata.counts, conflicts, modules: pkg.metadata.modules };
}

function safeData(row, tenantId, policy, existingKeys) {
  const data = { ...row, tenantId };
  if (policy === "create") {
    const keyName = data.slug ? "slug" : data.name ? "name" : data.title ? "title" : null;
    if (keyName && existingKeys.has(data[keyName])) { let index = 1; const base = data[keyName]; while (existingKeys.has(`${base}-${index}`)) index += 1; data[keyName] = `${base}-${index}`; }
  }
  return data;
}

export async function mergeSelectivePackage(tenantId, pkg, policy = "skip") {
  validateSelectivePackage(pkg);
  if (!["skip", "update", "create"].includes(policy)) throw new Error("Invalid conflict policy");
  const report = {};
  for (const module of pkg.metadata.modules) {
    const delegate = prisma[MODEL_MAP[module]];
    if (!delegate?.findMany || !delegate?.create) { report[module] = { created: 0, updated: 0, skipped: pkg.files[module].length }; continue; }
    const rows = await delegate.findMany({ where: whereFor(MODEL_MAP[module], tenantId), select: { id: true, slug: true, name: true, title: true } });
    const keyName = (row) => row.slug ? "slug" : row.name ? "name" : row.title ? "title" : null;
    const existing = new Map(rows.map((row) => [row.slug || row.name || row.title, row]));
    const keys = new Set(existing.keys()); report[module] = { created: 0, updated: 0, skipped: 0 };
    for (const row of pkg.files[module]) {
      const key = row.slug || row.name || row.title; const found = key && existing.get(key);
      if (found && policy === "skip") { report[module].skipped += 1; continue; }
      if (found && policy === "update" && delegate.update) { const { tenantId: _tenantId, ...updateData } = row; await delegate.update({ where: { id: found.id }, data: updateData }); report[module].updated += 1; continue; }
      await delegate.create({ data: safeData(row, tenantId, policy, keys) }); report[module].created += 1;
    }
  }
  return report;
}
