import {
  updateCourseContentInfo,
  updateCourseModules,
} from "@/src/app/lib/services/course/course.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const PATCH = asyncHandler(async (req, { params }) => {
  const { id } = await params;

  const body = await req.json();
  const modules = Array.isArray(body.modules) ? body.modules : [];
  const course = await updateCourseModules(id, modules);
  return Response.json(
    new ApiResponse(200, course, "Course content updated successfully"),
  );
});
