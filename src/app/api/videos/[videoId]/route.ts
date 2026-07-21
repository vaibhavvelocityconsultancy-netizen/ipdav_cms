/**
 * ═════════════════════════════════════════════════════════════════════
 * VIDEO PROTECTION API ROUTE
 * ═════════════════════════════════════════════════════════════════════
 *
 * Protects premium video endpoints.
 * Returns 403 if user:
 *   - Has no subscription
 *   - Has EXPIRED or CANCELED subscription
 *   - Plan doesn't include video access
 *
 * Usage:
 *   GET /api/videos/:videoId → Protected by this logic
 */

import { canAccessVideoContent } from "@/src/lib/subscription/access-control";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requireAuth } from "@/src/app/lib/withPermission";

export const GET = asyncHandler(async (req, { params }) => {
  const { user } = await requireAuth();
  const { videoId } = params;

  // Check if user can access videos
  const accessCheck = await canAccessVideoContent(user.id);

  if (!accessCheck.allowed) {
    throw new ApiError(403, accessCheck.reason || "Access denied");
  }

  // If we reach here, user is authorized
  // TODO: Load video from DB/CDN based on videoId
  // const video = await getVideo(videoId)

  return Response.json(
    new ApiResponse(
      200,
      null,
      "User has access to video content"
    )
  );
});
