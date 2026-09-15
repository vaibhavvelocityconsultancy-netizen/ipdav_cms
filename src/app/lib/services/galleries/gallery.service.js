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

async function imageRows(input, tenantId) {
  const requested = Array.isArray(input.images) ? input.images : (Array.isArray(input.mediaIds) ? input.mediaIds : []).map((mediaId) => ({ mediaId }));
  const unique = [...new Map(requested.map((image) => [Number(image.mediaId), image])).entries()].filter(([mediaId]) => Number.isInteger(mediaId));
  if (!unique.length) return [];
  const media = await prisma.media.findMany({ where: { id: { in: unique.map(([mediaId]) => mediaId) }, tenantId }, select: { id: true } });
  const available = new Set(media.map((item) => item.id));
  return unique.flatMap(([mediaId, image], order) => available.has(mediaId) ? [{ mediaId, order, caption: String(image.caption || "") }] : []);
}

export async function createGallery(input, tenantId) {
  const title = String(input.title || "Untitled gallery").trim();
  const slug = String(input.slug || title).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const images = await imageRows(input, tenantId);
  return prisma.gallery.create({ data: { tenantId, title, slug, columns: Math.min(6, Math.max(1, Number(input.columns) || 3)), ...(images.length ? { images: { create: images } } : {}) }, include });
}

export async function updateGallery(id, input, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId } });
  if (!gallery) return null;
  const hasImages = Array.isArray(input.images) || Array.isArray(input.mediaIds);
  const images = hasImages ? await imageRows(input, tenantId) : null;
  const data = { ...(input.title !== undefined ? { title: String(input.title).trim() } : {}), ...(input.slug !== undefined ? { slug: String(input.slug).trim() } : {}), ...(input.columns !== undefined ? { columns: Math.min(6, Math.max(1, Number(input.columns) || 3)) } : {}) };
  if (!images) return prisma.gallery.update({ where: { id: gallery.id }, data, include });
  await prisma.$transaction(async (tx) => {
    await tx.gallery.update({ where: { id: gallery.id }, data });
    await tx.galleryImage.deleteMany({ where: { galleryId: gallery.id } });
    if (images.length) await tx.galleryImage.createMany({ data: images.map((image) => ({ ...image, galleryId: gallery.id })) });
  });
  return getGalleryById(gallery.id, tenantId);
}

export const deleteGallery = (id, tenantId) => prisma.gallery.deleteMany({ where: { id: Number(id), tenantId } });

export async function addImagesToGallery(id, mediaIds, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include: { images: true } });
  if (!gallery) return null;
  const existing = new Set(gallery.images.map((image) => image.mediaId));
  const rows = await imageRows({ mediaIds: mediaIds.filter((mediaId) => !existing.has(Number(mediaId))) }, tenantId);
  if (rows.length) await prisma.galleryImage.createMany({ data: rows.map((row, index) => ({ ...row, galleryId: gallery.id, order: gallery.images.length + index })) });
  return getGalleryById(id, tenantId);
}

export async function removeImageFromGallery(id, imageId, tenantId) {
  const result = await prisma.galleryImage.deleteMany({ where: { id: Number(imageId), galleryId: Number(id), gallery: { tenantId } } });
  return result.count ? getGalleryById(id, tenantId) : null;
}

export async function reorderGalleryImages(id, orderedIds, tenantId) {
  const gallery = await prisma.gallery.findFirst({ where: { id: Number(id), tenantId }, include: { images: true } });
  if (!gallery) return null;
  const allowed = new Set(gallery.images.map((image) => image.id));
  await prisma.$transaction(orderedIds.map((imageId, order) => allowed.has(Number(imageId)) ? prisma.galleryImage.update({ where: { id: Number(imageId) }, data: { order } }) : null).filter(Boolean));
  return getGalleryById(id, tenantId);
}

export const updateImageCaption = (id, imageId, caption, tenantId) => prisma.galleryImage.updateMany({ where: { id: Number(imageId), galleryId: Number(id), gallery: { tenantId } }, data: { caption: String(caption || "") } });
