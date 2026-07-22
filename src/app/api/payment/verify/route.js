import { verifyCoursePayment } from "@/src/app/lib/services/course/coursepayment.service";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const POST = asyncHandler(async (req) => {
  const { user } = await requireAuth();

  const { paypalOrderId, courseId } = await req.json();

  if (!paypalOrderId) {
    throw new ApiError(400, "Missing PayPal order ID");
  }

  if (!courseId) throw new ApiError(400, "Course ID is required");

  const enrollment = await verifyCoursePayment(
    user.id,
    { paypalOrderId },
    courseId,
  );

  return Response.json(
    new ApiResponse(
      200,
      enrollment,
      "Payment verified, enrollment activated, and confirmation email sent successfully.",
    ),
  );
});
