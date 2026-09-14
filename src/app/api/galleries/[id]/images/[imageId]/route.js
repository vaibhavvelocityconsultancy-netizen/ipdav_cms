import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { removeImageFromGallery, updateImageCaption } from "@/src/app/lib/services/galleries/gallery.service";
export const DELETE = asyncHandler(async (_request, { params }) => { const { session } = await requirePermission("settings_manage"); return Response.json({ success: true, data: await removeImageFromGallery((await params).id, (await params).imageId, Number(session.user.tenantId)) }); });
export const PATCH = asyncHandler(async (request, { params }) => { const { session } = await requirePermission("settings_manage"); const body = await request.json(); return Response.json({ success: true, data: await updateImageCaption((await params).id, (await params).imageId, body.caption, Number(session.user.tenantId)) }); });
