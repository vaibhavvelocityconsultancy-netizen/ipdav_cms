import { prisma } from "../../prisma.js";
import { requireAuth, requirePermission } from "../../withPermission.js";

const pageType = "PAGE";

function slugify(value) {
  return String(value || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export async function getTemplates({ activeOnly = false } = {}) {
  const session = await requireAuth();
  return prisma.template.findMany({
    where: { tenantId: session.user.tenantId, type: pageType, ...(activeOnly ? { status: "ACTIVE" } : {}) },
    orderBy: { name: "asc" },
    include: { _count: { select: { pages: true } } },
  });
}

export async function getTemplate(id) {
  const session = await requireAuth();
  return prisma.template.findFirst({ where: { id: Number(id), tenantId: session.user.tenantId }, include: { _count: { select: { pages: true } } } });
}

export async function createTemplate(input) {
  await requirePermission("pages_edit_any");
  const session = await requireAuth();
  const name = String(input.name || "").trim();
  if (!name) throw new Error("Template name is required");
  const slug = slugify(input.slug || name);
  return prisma.template.create({ data: { name, slug, type: pageType, description: input.description || null, header: input.header || null, content: input.content || null, sidebar: input.sidebar || null, footer: input.footer || null, customCss: input.customCss || null, status: input.status === "INACTIVE" ? "INACTIVE" : "ACTIVE", tenantId: session.user.tenantId } });
}

export async function updateTemplate(id, input) {
  await requirePermission("pages_edit_any");
  const session = await requireAuth();
  const existing = await prisma.template.findFirst({ where: { id: Number(id), tenantId: session.user.tenantId } });
  if (!existing) throw new Error("Template not found");
  const data = { ...input };
  delete data.id; delete data.tenantId; delete data.createdAt; delete data.updatedAt; delete data.type;
  if (data.name !== undefined) data.name = String(data.name).trim();
  if (data.slug !== undefined) data.slug = slugify(data.slug || data.name || existing.name);
  if (data.status !== "ACTIVE") data.status = "INACTIVE";
  return prisma.template.update({ where: { id: Number(id) }, data });
}

export async function deleteTemplate(id) {
  await requirePermission("pages_edit_any");
  const session = await requireAuth();
  const existing = await prisma.template.findFirst({ where: { id: Number(id), tenantId: session.user.tenantId }, include: { _count: { select: { pages: true } } } });
  if (!existing) throw new Error("Template not found");
  if (existing._count.pages > 0) throw new Error(`Template is assigned to ${existing._count.pages} page(s). Reassign them before deleting.`);
  return prisma.template.delete({ where: { id: Number(id) } });
}

export async function getPublicTemplate(templateId, tenantId) {
  if (!templateId) return null;
  return prisma.template.findFirst({ where: { id: Number(templateId), tenantId, type: pageType, status: "ACTIVE" } });
}

export const DEFAULT_TEMPLATE = { name: "Default Template", slug: "default", type: pageType, status: "ACTIVE" };

export async function ensureDefaultTemplate(tenantId) {
  return prisma.template.upsert({ where: { tenantId_slug: { tenantId, slug: "default" } }, update: {}, create: { ...DEFAULT_TEMPLATE, tenantId } });
}

export { slugify };
