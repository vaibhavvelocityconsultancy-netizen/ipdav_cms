import { requirePermission } from "@/src/app/lib/withPermission";
import { buildSelectivePackage, packageToZip } from "@/src/app/lib/services/settings/selective-import-export.service";

export async function POST(request) {
  const { session } = await requirePermission("settings_manage");
  const body = await request.json();
  const pkg = await buildSelectivePackage(Number(session.user.tenantId), body.modules || []);
  const zip = await packageToZip(pkg);
  return new Response(zip, { headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename=cms-selective-${new Date().toISOString().slice(0, 10)}.zip` } });
}
