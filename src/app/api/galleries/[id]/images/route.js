import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { addImagesToGallery } from "@/src/app/lib/services/galleries/gallery.service";
export const POST = asyncHandler(async (request, { params }) => { const { session } = await requirePermission("settings_manage"); const body = await request.json(); return Response.json({ success: true, data: await addImagesToGallery((await params).id, body.mediaIds || [], Number(session.user.tenantId)) }); });
