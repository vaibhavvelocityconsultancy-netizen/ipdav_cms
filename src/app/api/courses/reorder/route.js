// import { updatePlanOrder } from "@/src/app/lib/services/plan.service";
import { updateCourseOrder } from "@/src/app/lib/services/course/courseplan.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const PUT = asyncHandler(async (req) => {
  const plans = await req.json();

  await updateCourseOrder(plans);

  return Response.json(
    new ApiResponse(200, null, "Course order updated successfully"),
  );
});
