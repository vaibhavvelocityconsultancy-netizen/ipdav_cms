import { retryPaypalSetup } from "@/src/app/lib/services/course/subscription.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";

export const POST = asyncHandler(async (req, context) => {
  const { session } = await requirePermission("plans_update");
  const params = await context.params;

  const { plan, message } = await retryPaypalSetup(params.id, session.user.tenantId);

  return Response.json(new ApiResponse(200, plan, message));
});