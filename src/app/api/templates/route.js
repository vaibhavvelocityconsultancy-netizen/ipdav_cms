import { asyncHandler } from "../../lib/utils/asyncHandler.js";
import { ApiResponse } from "../../lib/utils/ApiResponse.js";
import { createTemplate, getTemplates } from "../../lib/services/templates/template.service.js";

export const GET = asyncHandler(async (req) => {
  const activeOnly = new URL(req.url).searchParams.get("activeOnly") === "true";
  return Response.json(new ApiResponse(200, await getTemplates({ activeOnly }), "Templates fetched successfully"));
});

export const POST = asyncHandler(async (req) => Response.json(new ApiResponse(201, await createTemplate(await req.json()), "Template created successfully"), { status: 201 }));
