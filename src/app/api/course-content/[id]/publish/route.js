// import { toggleCourseContentPublished } from "@/src/app/lib/services/courseContent.service";
// import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
// import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

import { toggleCourseContentPublished } from "@/src/app/lib/services/course/course.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const PATCH = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await toggleCourseContentPublished(id);
  return Response.json(
    new ApiResponse(200, course, "Course publish status updated"),
  );
});
