import { prisma } from "../../prisma";
import { ApiError } from "../../utils/ApiError";
import { requirePermission } from "../../withPermission";

// ── Get all materials for a module ───────────────────────────
export async function getModuleMaterials(moduleId) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  // Verify module belongs to this tenant
  const module = await prisma.courseModule.findFirst({
    where: {
      id: Number(moduleId),
      courseContent: { tenantId },
    },
  });
  console.log("module", module.id);

  if (!module) throw new ApiError(404, "Module not found");

  return prisma.courseMaterial.findMany({
    where: { courseModuleId: Number(moduleId) },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Add a material to a module ───────────────────────────────
export async function addCourseMaterial(moduleId, input) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const module = await prisma.courseModule.findFirst({
    where: {
      id: Number(moduleId),
      courseContent: { tenantId },
    },
  });
  if (!module) throw new ApiError(404, "Module not found");

  if (!input.title?.trim()) throw new ApiError(400, "Title is required");
  if (!input.url?.trim()) throw new ApiError(400, "URL is required");

  // Get highest sortOrder
  const last = await prisma.courseMaterial.findFirst({
    where: { courseModuleId: Number(moduleId) },
    orderBy: { sortOrder: "desc" },
  });

  return prisma.courseMaterial.create({
    data: {
      title: input.title.trim(),
      type: input.type ?? "PDF",
      url: input.url.trim(),
      size: input.size ?? null,
      sortOrder: input.sortOrder ?? (last ? last.sortOrder + 1 : 0),
      courseModuleId: Number(moduleId),
    },
  });
}

// ── Update a material ────────────────────────────────────────
export async function updateCourseMaterial(materialId, input) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const existing = await prisma.courseMaterial.findFirst({
    where: {
      id: Number(materialId),
      module: { courseContent: { tenantId } },
    },
  });
  if (!existing) throw new ApiError(404, "Material not found");

  return prisma.courseMaterial.update({
    where: { id: Number(materialId) },
    data: {
      title: input.title?.trim() ?? existing.title,
      type: input.type ?? existing.type,
      url: input.url?.trim() ?? existing.url,
      size: input.size ?? existing.size,
      sortOrder: input.sortOrder ?? existing.sortOrder,
    },
  });
}

// ── Delete a material ────────────────────────────────────────
export async function deleteCourseMaterial(materialId) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const existing = await prisma.courseMaterial.findFirst({
    where: {
      id: Number(materialId),
      module: { courseContent: { tenantId } },
    },
  });
  if (!existing) throw new ApiError(404, "Material not found");

  return prisma.courseMaterial.delete({
    where: { id: Number(materialId) },
  });
}

// ── Reorder materials ────────────────────────────────────────
// Pass array of { id, sortOrder }
export async function reorderCourseMaterials(moduleId, items) {
  const { session } = await requirePermission("course_content_manage");
  const tenantId = session.user.tenantId;

  const module = await prisma.courseModule.findFirst({
    where: {
      id: Number(moduleId),
      courseContent: { tenantId },
    },
  });
  if (!module) throw new ApiError(404, "Module not found");

  await prisma.$transaction(
    items.map(({ id, sortOrder }) =>
      prisma.courseMaterial.update({
        where: { id: Number(id) },
        data: { sortOrder },
      }),
    ),
  );

  return prisma.courseMaterial.findMany({
    where: { courseModuleId: Number(moduleId) },
    orderBy: { sortOrder: "asc" },
  });
}

// ── Public: get materials for enrolled users ─────────────────
export async function getPublicModuleMaterials(moduleId) {
  return prisma.courseMaterial.findMany({
    where: { courseModuleId: Number(moduleId) },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      title: true,
      type: true,
      url: true,
      size: true,
      sortOrder: true,
    },
  });
}
