import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { prisma } from "@/src/app/lib/prisma";
export const GET = asyncHandler(async (_request, { params }) => { const gallery = await prisma.gallery.findUnique({ where: { id: Number((await params).id) }, include: { images: { include: { media: true }, orderBy: { order: "asc" } } } }); return gallery ? Response.json({ success: true, data: gallery }) : Response.json({ success: false, error: "Not found" }, { status: 404 }); });
