import { asyncHandler } from "../../../lib/utils/asyncHandler";
import { ApiResponse } from "../../../lib/utils/ApiResponse";
import { listCategories, saveCookie } from "../../../lib/services/settings/cookie-consent.service";
export const GET = asyncHandler(async () => Response.json(new ApiResponse(200, await listCategories(), "Cookie definitions fetched")));
export const POST = asyncHandler(async (req) => Response.json(new ApiResponse(200, await saveCookie(await req.json()), "Cookie definition created")));
