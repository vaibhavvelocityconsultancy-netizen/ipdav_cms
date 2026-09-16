import { asyncHandler } from "../../lib/utils/asyncHandler";
import { ApiResponse } from "../../lib/utils/ApiResponse";
import { getCookieConsentAdmin, updateCookieSettings } from "../../lib/services/settings/cookie-consent.service";
export const GET = asyncHandler(async () => Response.json(new ApiResponse(200, await getCookieConsentAdmin(), "Cookie consent settings fetched")));
export const PUT = asyncHandler(async (req) => Response.json(new ApiResponse(200, await updateCookieSettings(await req.json()), "Cookie consent settings updated")));
