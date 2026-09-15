import { prisma } from "@/src/app/lib/prisma";

const include = { images: { include: { media: true }, orderBy: { order: "asc" } } };

export async function getGalleries(tenantId, { search = "", page = 1, limit = 20 } = {}) {
  const where = { tenantId, ...(search ? { OR: [{ title: { contains: search } }, { slug: { contains: search } }] } : {}) };
  const [items, total] = await Promise.all([
    prisma.gallery.findMany({ where, include: { _count: { select: { images: true } } }, orderBy: { updatedAt: "desc" }, skip: (page - 1) * limit, take: limit }),
    prisma.gallery.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}
export const getGalleryById = (id, tenantId) => prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include });
export async function createGallery(input, tenantId) {
  const title = String(input.title || "Untitled gallery").trim();
  const slug = String(input.slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const requestedImages = Array.isArray(input.images) ? input.images : (input.mediaIds || []).map((mediaId) => ({ mediaId }));
  const ids = [...new Set(requestedImages.map((image) => Number(image.mediaId)).filter(Number.isInteger))];
  const media = await prisma.media.findMany({ where: { id: { in: ids }, tenantId }, select: { id: true } });
  const valid = new Set(media.map((item) => item.id));
  const imageRows = requestedImages.filter((image) => valid.has(Number(image.mediaId))).map((image, index) => ({ mediaId: Number(image.mediaId), order: index, caption: String(image.caption || "") }));
  return prisma.gallery.create({ data: { tenantId, title, slug, columns: Math.min(6, Math.max(1, Number(input.columns) || 3)), categoriesEnabled: Boolean(input.categoriesEnabled), images: { create: imageRows } }, include });
}
async function imageRows(mediaIds, tenantId) {
  const ids = [...new Set(mediaIds.map(Number).filter(Number.isInteger))];
  const media = await prisma.media.findMany({ where: { id: { in: ids }, tenantId }, select: { id: true } });
  return media.map((item, index) => ({ mediaId: item.id, order: index }));
}
export async function updateGallery(id, input, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include: { images: true } }); if (!gallery) return null;
  const columns = input.columns === undefined ? gallery.columns : Math.min(6, Math.max(1, Number(input.columns) || 3));
  const data = { ...(input.title !== undefined ? { title: String(input.title).trim() } : {}), ...(input.slug !== undefined ? { slug: String(input.slug).trim() } : {}), ...(input.categoriesEnabled !== undefined ? { categoriesEnabled: Boolean(input.categoriesEnabled) } : {}), columns };
  if (!Array.isArray(input.images)) return prisma.gallery.update({ where: { id: gallery.id }, data, include });
  const requested = [...new Map(input.images.map((image, index) => [Number(image.mediaId), { mediaId: Number(image.mediaId), order: index, caption: String(image.caption || ""), category: String(image.category || "").trim() || null }])).values()].filter((image) => Number.isInteger(image.mediaId));
  const validMedia = await prisma.media.findMany({ where: { id: { in: requested.map((image) => image.mediaId) }, tenantId }, select: { id: true } });
  const valid = new Set(validMedia.map((media) => media.id));
  const rows = requested.filter((image) => valid.has(image.mediaId));
  await prisma.$transaction(async (tx) => {
    await tx.gallery.update({ where: { id: gallery.id }, data });
    await tx.galleryImage.deleteMany({ where: { galleryId: gallery.id } });
    if (rows.length) await tx.galleryImage.createMany({ data: rows.map((image) => ({ galleryId: gallery.id, mediaId: image.mediaId, order: image.order, caption: image.caption, category: image.category })) });
  });
  return getGalleryById(id, tenantId);
}
export async function deleteGallery(id, tenantId) { return prisma.gallery.deleteMany({ where: { id: Number(id), tenantId } }); }
export async function addImagesToGallery(id, mediaIds, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include: { images: true } }); if (!gallery) return null;
  const existing = new Set(gallery.images.map((image) => image.mediaId)); const rows = await imageRows(mediaIds.filter((mediaId) => !existing.has(Number(mediaId))), tenantId);
  if (rows.length) await prisma.galleryImage.createMany({ data: rows.map((row, index) => ({ ...row, galleryId: gallery.id, order: gallery.images.length + index })) });
  return getGalleryById(id, tenantId);
}
export async function removeImageFromGallery(id, imageId, tenantId) { const result = await prisma.galleryImage.deleteMany({ where: { id: Number(imageId), galleryId: Number(id), gallery: { tenantId } } }); return result.count ? getGalleryById(id, tenantId) : null; }
export async function reorderGalleryImages(id, orderedIds, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include: { images: true } }); if (!gallery) return null;
  const allowed = new Set(gallery.images.map((image) => image.id));
  await prisma.$transaction(orderedIds.map((imageId, order) => allowed.has(Number(imageId)) ? prisma.galleryImage.update({ where: { id: Number(imageId) }, data: { order } }) : null).filter(Boolean));
  return getGalleryById(id, tenantId);
} 
export async function updateImageCaption(id, imageId, caption, tenantId) { return prisma.galleryImage.updateMany({ where: { id: Number(imageId), galleryId: Number(id), gallery: { tenantId } }, data: { caption: String(caption || "") } }); }
