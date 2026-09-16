import { asyncHandler } from "../../../lib/utils/asyncHandler";
import { ApiResponse } from "../../../lib/utils/ApiResponse";
import { listCategories, saveCategory } from "../../../lib/services/settings/cookie-consent.service";
export const GET = asyncHandler(async () => Response.json(new ApiResponse(200, await listCategories(), "Categories fetched")));
export const POST = asyncHandler(async (req) => Response.json(new ApiResponse(200, await saveCategory(await req.json()), "Category created")));
