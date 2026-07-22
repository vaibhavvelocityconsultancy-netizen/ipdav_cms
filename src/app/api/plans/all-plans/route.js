import { getPublicPlans } from "@/src/app/lib/services/common_urls/public.service";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";

export const GET = asyncHandler(async () => {
  const data = await getPublicPlans();

  return Response.json(
    new ApiResponse(200, data, "Plans fetched successfully")
  );
});