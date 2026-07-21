// import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
// import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
// import { submitForm } from "@/lib/services/form.service";

import { submitForm } from "../../../../lib/services/forms/form.service";
import { ApiResponse } from "../../../../lib/utils/ApiResponse";
import { asyncHandler } from "../../../../lib/utils/asyncHandler";

export const POST = asyncHandler(async (req, context) => {
  const body = await req.json();

  const ipAddress =
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || null;
  const { slug } = await context.params;

  const result = await submitForm(slug, body, ipAddress);

  return Response.json(
    new ApiResponse(200, result, "Form submitted successfully"),
    { status: 200 },
  );
});
