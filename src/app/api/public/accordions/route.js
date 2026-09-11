import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { getActiveAccordions } from "@/src/app/lib/services/accordions/accordion.service";
import { prisma } from "@/src/app/lib/prisma";

export const GET = asyncHandler(async (request) => { const { searchParams } = new URL(request.url); const identifier = searchParams.get("identifier"); const tenant = await prisma.tenant.findFirst({ orderBy: { id: "asc" } }); if (!tenant) return Response.json({ success: true, data: [] }); const data = await getActiveAccordions(tenant.id); return Response.json({ success: true, data: identifier ? data.filter((item) => item.identifier === identifier) : data }); });
