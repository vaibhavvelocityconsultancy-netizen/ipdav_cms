import { getPublicCategoryBySlug } from "@/src/app/lib/services/ecommerce/ecom.public.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { slug } = await params;
  const { searchParams } = new URL(req.url);
  const category = await getPublicCategoryBySlug(slug, searchParams.get("tenantId"));
  if (!category) return Response.json(new ApiResponse(404, null, "Category not found"), { status: 404 });
  return Response.json(new ApiResponse(200, category, "Public category fetched successfully"));
});

export const dynamic = "force-dynamic";
