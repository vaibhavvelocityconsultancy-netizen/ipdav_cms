import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { createAccordion, getAccordions } from "@/src/app/lib/services/accordions/accordion.service";

export const GET = asyncHandler(async () => { const { session } = await requirePermission("settings_manage"); return Response.json({ success: true, data: await getAccordions(Number(session.user.tenantId)) }); });
export const POST = asyncHandler(async (request) => { const { session } = await requirePermission("settings_manage"); return Response.json({ success: true, data: await createAccordion(await request.json(), Number(session.user.tenantId)) }, { status: 201 }); });
