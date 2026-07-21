import { prisma } from "../../prisma";
import { requirePermission } from "../../withPermission";

const EXPORT_VERSION = "1.0";

// ─── EXPORT ───────────────────────────────────────────────
// We fetch each entity separately and bundle into one JSON object.
// We STRIP id, createdAt, updatedAt because:
//   - id is auto-incremented, will conflict on the target DB
//   - createdAt/updatedAt are DB-managed, should reset on import
// slug is kept because it's our natural unique key for conflict detection

export async function exportAll() {
  const { session } = await requirePermission("settings_manage");
  const tenantId = session.user.tenantId;

  // __meta helps us validate the file on import
  // version lets us handle format changes in future without breaking imports
  const payload = {
    __meta: {
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
    },
  };

  // ── Pages ──
  // We export all fields except id/createdAt/updatedAt
  // html, css, js, jsxCode are just strings so no special handling needed
  const pages = await prisma.page.findMany({
    where: { tenantId },
    orderBy: { createdAt: "asc" },
  });
  payload.pages = pages.map(
    ({ id, createdAt, updatedAt, tenantId: _, ...rest }) => rest,
  );

  // ── Menus ──
  // Menus have nested items, so we include them via Prisma relation
  // BUT we store items as nested children tree (not flat with parentId integers)
  // because parentId integers are meaningless in a different database
  const menus = await prisma.menu.findMany({
    where: { tenantId },
    include: { menuitem: { orderBy: { order: "asc" } } },
  });
  payload.menus = menus.map(({ id, menuitem, tenantId: _, ...menu }) => ({
    ...menu,
    // Convert flat items array into a nested tree before exporting
    // so parent-child relationships survive across databases
    items: buildMenuTree(menuitem),
  }));

  return payload;
}

// ─── Menu Tree Builder ─────────────────────────────────────
// Prisma returns menu items as a FLAT array with parentId references.
// On export we convert this to a nested tree so the structure is
// self-contained and doesn't rely on integer IDs from the source DB.
//
// Example flat input:
//   [{ id:1, label:'Home', parentId:null }, { id:2, label:'Sub', parentId:1 }]
// Nested output:
//   [{ label:'Home', children: [{ label:'Sub', children:[] }] }]

function buildMenuTree(items, parentId = null) {
  return items
    .filter((item) => item.parentId === parentId)
    .map(({ id, menuId, parentId, ...item }) => ({
      // strip id, menuId, parentId — all DB-specific, useless on import
      ...item,
      children: buildMenuTree(items, id), // recursively attach children
    }));
}

// ─── IMPORT ───────────────────────────────────────────────
// strategy controls what happens when a slug already exists in the target DB:
//   'skip'      → leave existing record untouched, move on
//   'overwrite' → update the existing record with imported data
//   'rename'    → append -1, -2 etc. to slug and create as new

export async function importAll(payload, strategy = "skip") {
  const { session } = await requirePermission("settings_manage");
  const tenantId = session.user.tenantId;

  // Always validate before touching the database
  validatePayload(payload);

  // We collect results so the API can return a summary to the user
  // showing what was created, skipped, overwritten, and what errored
  const report = {
    pages: { created: 0, skipped: 0, overwritten: 0, errors: [] },
    menus: { created: 0, skipped: 0, overwritten: 0, errors: [] },
  };

  if (payload.pages?.length) {
    await importPages(payload.pages, strategy, report.pages, tenantId);
  }

  if (payload.menus?.length) {
    await importMenus(payload.menus, strategy, report.menus, tenantId);
  }

  return report;
}

// ─── Payload Validator ─────────────────────────────────────
// Runs before any DB writes.
// Catches obviously wrong files early (wrong format, future version etc.)

function validatePayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid file: expected a JSON object");
  }
  if (!payload.__meta?.version) {
    throw new Error(
      "Invalid file: missing __meta.version — was this exported from this CMS?",
    );
  }
  if (payload.__meta.version !== EXPORT_VERSION) {
    // In future if you change the format to 2.0,
    // you'd add a migration/transform here instead of throwing
    throw new Error(`Unsupported version: ${payload.__meta.version}`);
  }
}

// ─── Page Importer ────────────────────────────────────────
// Loops through each exported page and decides what to do
// based on whether the slug already exists and what strategy is set

async function importPages(pages, strategy, report, tenantId) {
  for (const page of pages) {
    try {
      const existing = await prisma.page.findFirst({
        where: { slug: page.slug, tenantId },
      });

      if (existing) {
        if (strategy === "skip") {
          report.skipped++;
          continue;
        }

        if (strategy === "overwrite") {
          await prisma.page.update({
            where: { id: existing.id },
            data: {
              title: page.title,
              html: page.html,
              css: page.css,
              js: page.js,
              jsxCode: page.jsxCode,
              pageType: page.pageType,
              status: page.status,
              seoData: page.seoData,
            },
          });
          report.overwritten++;
          continue;
        }

        if (strategy === "rename") {
          page.slug = await findFreeSlug(page.slug, "page", tenantId);
        }
      }

      await prisma.page.create({ data: { ...page, tenantId } });
      report.created++;
    } catch (err) {
      report.errors.push({ slug: page.slug, error: err.message });
    }
  }
}

// ─── Menu Importer ────────────────────────────────────────
// Menus don't have slugs in your schema, so we match by name instead.
// Items are stored as a nested tree in the export file,
// so we flatten them back when writing to DB, rebuilding parentId links
// using the newly created IDs from the target DB

async function importMenus(menus, strategy, report, tenantId) {
  for (const menu of menus) {
    try {
      const existing = await prisma.menu.findFirst({
        where: { name: menu.name, tenantId },
      });

      if (existing) {
        if (strategy === "skip") {
          report.skipped++;
          continue;
        }

        if (strategy === "overwrite") {
          await prisma.menuItem.deleteMany({ where: { menuId: existing.id } });
          await insertMenuItems(menu.items, existing.id, null);
          await prisma.menu.update({
            where: { id: existing.id },
            data: { location: menu.location },
          });
          report.overwritten++;
          continue;
        }

        if (strategy === "rename") {
          menu.name = `${menu.name} (imported)`;
        }
      }

      const created = await prisma.menu.create({
        data: { name: menu.name, location: menu.location, tenantId },
      });

      await insertMenuItems(menu.items, created.id, null);
      report.created++;
    } catch (err) {
      report.errors.push({ name: menu.name, error: err.message });
    }
  }
}

// ─── Menu Item Inserter ───────────────────────────────────
// Takes the nested children tree from the export file and
// writes it back to DB as flat rows with correct parentId references.
// We recurse depth-first: create parent first, get its new DB id,
// then create children with that id as their parentId

async function insertMenuItems(items, menuId, parentId) {
  for (const { children, ...itemData } of items) {
    const created = await prisma.menuItem.create({
      data: {
        ...itemData,
        menuId,
        parentId, // null for top-level, parent's new DB id for nested
      },
    });

    // If this item has children, recurse with this item's new id as parentId
    if (children?.length) {
      await insertMenuItems(children, menuId, created.id);
    }
  }
}

// ─── Slug Rename Helper ───────────────────────────────────
// Used when strategy is 'rename'. Tries slug-1, slug-2 etc.
// until it finds one that doesn't exist in the DB

async function findFreeSlug(baseSlug, type, tenantId) {
  let counter = 1;
  let candidate = `${baseSlug}-${counter}`;

  while (true) {
    const exists =
      type === "page"
        ? await prisma.page.findFirst({ where: { slug: candidate, tenantId } })
        : null;

    if (!exists) return candidate;
    counter++;
    candidate = `${baseSlug}-${counter}`;
  }
}
