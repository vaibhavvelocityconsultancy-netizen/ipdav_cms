import { listModulesWithStatus } from "@/src/app/lib/services/modules/module_install.service";
import { requireAuth, requirePermission } from "@/src/app/lib/withPermission";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    await requirePermission("modules_install");

    const modules = await listModulesWithStatus();

    return NextResponse.json({ modules });
  } catch (err) {
    console.error("========== MODULES API ERROR ==========");
    console.error(err);
    console.error("=======================================");

    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
      { status: err?.statusCode || 500 },
    );
  }
}