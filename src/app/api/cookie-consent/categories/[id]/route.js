import { asyncHandler } from "../../../../lib/utils/asyncHandler";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { deleteCategory, saveCategory } from "../../../../lib/services/settings/cookie-consent.service";
export const PUT = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await saveCategory(await req.json(), (await params).id), "Category updated")));
export const DELETE = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await deleteCategory((await params).id), "Category deleted")));
