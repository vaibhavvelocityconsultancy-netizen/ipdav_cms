// import { getPublicCourseDetail } from "@/src/app/lib/services/coursePrice.service";
// import { ApiError } from "@/src/app/lib/utils/ApiError";
// import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
// import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

import { getPublicCourseDetail } from "@/src/app/lib/services/course/courseplan.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await getPublicCourseDetail(id);
  if (!course) {
    throw new ApiError(404, "Course not found");
  }
  return Response.json(
    new ApiResponse(200, course, "Course detail fetched successfully"),
  );
});
