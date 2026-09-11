import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import { getPopups, createPopup } from "@/src/app/lib/services/popups/popup.service";

export const GET = asyncHandler(async (request) => {
  const { session } = await requirePermission("settings_manage");
  const { searchParams } = new URL(request.url);
  const data = await getPopups(Number(session.user.tenantId), {
    status: searchParams.get("status") || undefined,
  });
  return Response.json({ success: true, data });
});

export const POST = asyncHandler(async (request) => {
  const { session } = await requirePermission("settings_manage");
  const body = await request.json();
  const data = await createPopup(body, Number(session.user.tenantId));
  return Response.json({ success: true, data }, { status: 201 });
});

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
