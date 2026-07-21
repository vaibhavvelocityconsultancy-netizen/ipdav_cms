// import { createPlan, getAllPlans } from "../../lib/services/plan.service";
import {
  createCourse,
  getAllCourses,
} from "../../lib/services/course/courseplan.service";
import { ApiError } from "../../lib/utils/ApiError";
import { ApiResponse } from "../../lib/utils/ApiResponse";
import { asyncHandler } from "../../lib/utils/asyncHandler";

export const GET = asyncHandler(async (req, res) => {
  const courses = await getAllCourses();
  if (!courses) {
    throw new ApiError(404, "No courses found");
  }
  return Response.json(
    new ApiResponse(200, courses, "Courses fetched successfully"),
  );
});

export const POST = asyncHandler(async (req, res) => {
  const courseData = await req.json();

  if (!courseData.title) throw new ApiError(400, "Title is required");

  const course = await createCourse(courseData);
  return Response.json(
    new ApiResponse(200, course, "Course created successfully"),
    {
      status: 201,
    },
  );
});
