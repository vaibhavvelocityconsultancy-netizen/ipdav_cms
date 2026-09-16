import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { deleteCookie, saveCookie } from "../../../../lib/services/settings/cookie-consent.service";
export const PUT = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await saveCookie(await req.json(), (await params).id), "Cookie definition updated")));
export const DELETE = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await deleteCookie((await params).id), "Cookie definition deleted")));
