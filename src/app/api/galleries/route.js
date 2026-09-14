import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { createGallery, getGalleries } from "@/src/app/lib/services/galleries/gallery.service";
export const GET = asyncHandler(async (request) => { const { session } = await requirePermission("settings_manage"); const { searchParams } = new URL(request.url); return Response.json({ success: true, data: await getGalleries(Number(session.user.tenantId), { search: searchParams.get("search") || "", page: Number(searchParams.get("page") || 1), limit: Number(searchParams.get("limit") || 20) }) }); });
export const POST = asyncHandler(async (request) => { const { session } = await requirePermission("settings_manage"); return Response.json({ success: true, data: await createGallery(await request.json(), Number(session.user.tenantId)) }, { status: 201 }); });
