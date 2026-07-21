// import {
//   deletePlan,
//   getPlanById,
//   // updatePlanOrder,
//   updatePlans,
// } from "@/src/app/lib/services/plan.service";
import {
  deleteCourse,
  getCourseById,
  updateCourse,
} from "@/src/app/lib/services/course/courseplan.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  const course = await getCourseById(id);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return Response.json(
    new ApiResponse(200, course, "Course fetched successfully"),
  );
});

export const PUT = asyncHandler(async (req, { params }) => {
  // console.log("PARAMS:", params);
  // console.log("PARAMS.ID:", params?.id);
  const { id } = await params;
  const body = await req.json();

  const course = await updateCourse(id, body);

  return Response.json(
    new ApiResponse(200, course, "Course updated successfully"),
  );
});

export const DELETE = asyncHandler(async (req, { params }) => {
  const { id } = await params;
  await deleteCourse(id);

  return Response.json(
    new ApiResponse(200, null, "Course deleted successfully"),
  );
});
