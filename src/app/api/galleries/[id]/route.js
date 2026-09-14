import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { getGalleryById, updateGallery, deleteGallery } from "@/src/app/lib/services/galleries/gallery.service";
export const GET = asyncHandler(async (_request, { params }) => { const { session } = await requirePermission("settings_manage"); const data = await getGalleryById((await params).id, Number(session.user.tenantId)); return data ? Response.json({ success: true, data }) : Response.json({ success: false, error: "Gallery not found" }, { status: 404 }); });
export const PATCH = asyncHandler(async (request, { params }) => { const { session } = await requirePermission("settings_manage"); return Response.json({ success: true, data: await updateGallery((await params).id, await request.json(), Number(session.user.tenantId)) }); });
export const DELETE = asyncHandler(async (_request, { params }) => { const { session } = await requirePermission("settings_manage"); await deleteGallery((await params).id, Number(session.user.tenantId)); return Response.json({ success: true }); });
