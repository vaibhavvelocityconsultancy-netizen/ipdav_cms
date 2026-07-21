import { getPublicCourses } from "@/src/app/lib/services/course/courseplan.service";
// import { getPublicPlans } from "@/src/app/lib/services/plan.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async () => {
  const plans = await getPublicCourses();

  if (!plans) {
    throw new ApiError(404, "No plans found");
  }

  return Response.json(
    new ApiResponse(200, plans, "Public plans fetched successfully"),
  );
});
