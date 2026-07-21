import {
  createCourseContent,
  getAllCourseContent,
  getPublicCourseContent,
} from "../../lib/services/course/course.service";
import { ApiError } from "../../lib/utils/ApiError";
import { ApiResponse } from "../../lib/utils/ApiResponse";
import { asyncHandler } from "../../lib/utils/asyncHandler";

export const GET = asyncHandler(async (req) => {
  const { searchParams } = new URL(req.url);
  const withoutPricing = searchParams.get("withoutPricing") === "true";

  const courses = await getAllCourseContent({ withoutPricing });
  if (!courses) {
    throw new ApiError(404, "No courses found");
  }
  return Response.json(
    new ApiResponse(200, courses, "Courses fetched successfully"),
  );
});

export const POST = asyncHandler(async (req) => {
  const body = await req.json();
  const course = await createCourseContent(body);
  if (!course) {
    throw new ApiError(400, "Failed to create course content");
  }
  return Response.json(
    new ApiResponse(200, course, "Course content created successfully"),
  );
});

// export const GET = asyncHandler(async () => {
//   const courses = await getPublicCourseContent();
//   if (!courses) {
//     throw new ApiError(404, "No courses found");
//   }
//   return Response.json(
//     new ApiResponse(200, courses, "Public courses fetched successfully"),
//   );
// });
