import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { requirePermission } from "@/src/app/lib/withPermission";
import {
  getPopupById,
  updatePopup,
  deletePopup,
  duplicatePopup,
} from "@/src/app/lib/services/popups/popup.service";

export const GET = asyncHandler(async (_request, { params }) => {
  const { session } = await requirePermission("settings_manage");
  const data = await getPopupById((await params).id, Number(session.user.tenantId));
  if (!data) return Response.json({ success: false, error: "Popup not found" }, { status: 404 });
  return Response.json({ success: true, data });
});

export const PATCH = asyncHandler(async (request, { params }) => {
  const { session } = await requirePermission("settings_manage");
  const data = await updatePopup((await params).id, await request.json(), Number(session.user.tenantId));
  return Response.json({ success: true, data });
});

export const DELETE = asyncHandler(async (_request, { params }) => {
  const { session } = await requirePermission("settings_manage");
  await deletePopup((await params).id, Number(session.user.tenantId));
  return Response.json({ success: true });
});

export const POST = asyncHandler(async (request, { params }) => {
  const { session } = await requirePermission("settings_manage");
  const body = await request.json();
  if (body.action !== "duplicate") return Response.json({ success: false, error: "Unknown action" }, { status: 400 });
  const data = await duplicatePopup((await params).id, Number(session.user.tenantId));
  return Response.json({ success: true, data }, { status: 201 });
});
