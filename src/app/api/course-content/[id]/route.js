import {
  deleteCourseContent,
  getCourseContentById,
  //   getAllCourseContent,
  getCourseContentBySlug,
  updateCourseContentInfo,
} from "@/src/app/lib/services/course/course.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const isNumeric = /^\d+$/.test(id);

  const course = isNumeric
    ? await getCourseContentById(id)
    : await getCourseContentBySlug(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }
  return Response.json(
    new ApiResponse(200, course, "Course fetched successfully"),
  );
});

export const PATCH = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const course = await updateCourseContentInfo(id, body);
  return Response.json(
    new ApiResponse(200, course, "Course updated successfully"),
  );
});

export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await deleteCourseContent(id);
  return Response.json(
    new ApiResponse(200, course, "Course deleted successfully"),
  );
});
