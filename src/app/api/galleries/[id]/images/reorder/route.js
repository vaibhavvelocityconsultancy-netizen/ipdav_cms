import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { reorderGalleryImages } from "@/src/app/lib/services/galleries/gallery.service";
export const PATCH = asyncHandler(async (request, { params }) => { const { session } = await requirePermission("settings_manage"); const body = await request.json(); return Response.json({ success: true, data: await reorderGalleryImages((await params).id, body.order || [], Number(session.user.tenantId)) }); });
