import { requirePermission } from "@/src/app/lib/withPermission";
import { mergeSelectivePackage, previewSelectiveMerge } from "@/src/app/lib/services/settings/selective-import-export.service";

export async function POST(request) {
  const { session } = await requirePermission("settings_manage");
  const body = await request.json();
  const tenantId = Number(session.user.tenantId);
  if (body.mode === "preview") return Response.json({ success: true, data: await previewSelectiveMerge(tenantId, body.package) });
  return Response.json({ success: true, data: await mergeSelectivePackage(tenantId, body.package, body.policy || "skip") });
}
