import { prisma } from "@/src/app/lib/prisma";

const cleanClass = (value) => (value || "").split(/\s+/).filter((name) => /^[A-Za-z_][A-Za-z0-9_-]*$/.test(name)).join(" ");

export async function getAllSearches(tenantId) {
  return prisma.searchConfiguration.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
}
export async function getSearchById(id, tenantId) {
  return prisma.searchConfiguration.findFirst({ where: { id, tenantId } });
}
export async function getSearchBySlug(slug, tenantId) {
  return prisma.searchConfiguration.findFirst({ where: { slug, tenantId, isActive: true } });
}
export async function isSearchSlugAvailable(slug, tenantId, excludeId) {
  const row = await prisma.searchConfiguration.findFirst({ where: { slug, tenantId, ...(excludeId ? { NOT: { id: excludeId } } : {}) }, select: { id: true } });
  return !row;
}
export async function createSearch(input, tenantId) {
  return prisma.searchConfiguration.create({ data: { ...input, customClass: cleanClass(input.customClass), tenantId } });
}
export async function updateSearch(id, input, tenantId) {
  return prisma.searchConfiguration.updateMany({ where: { id, tenantId }, data: { ...input, customClass: cleanClass(input.customClass) } });
}
export async function deleteSearch(id, tenantId) {
  return prisma.searchConfiguration.deleteMany({ where: { id, tenantId } });
}
export { cleanClass };
