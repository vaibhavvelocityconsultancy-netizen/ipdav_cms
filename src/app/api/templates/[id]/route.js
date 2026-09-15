import { asyncHandler } from "../../../lib/utils/asyncHandler.js";
import { ApiResponse } from "../../../lib/utils/ApiResponse.js";
import { deleteTemplate, getTemplate, updateTemplate } from "../../../lib/services/templates/template.service.js";

export const GET = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await getTemplate((await params).id), "Template fetched successfully")));
export const PATCH = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await updateTemplate((await params).id, await req.json()), "Template updated successfully")));
export const DELETE = asyncHandler(async (req, { params }) => Response.json(new ApiResponse(200, await deleteTemplate((await params).id), "Template deleted successfully")));
