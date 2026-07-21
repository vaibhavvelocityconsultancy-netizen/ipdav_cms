import { createCourseOrder } from "@/src/app/lib/services/course/coursepayment.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  const { courseId } = await req.json();

  if (!courseId) throw new ApiError(400, "Course ID is required");

  const order = await createCourseOrder(user.id, courseId);

  return Response.json(
    new ApiResponse(200, order, "Order created successfully"),
  );
});
