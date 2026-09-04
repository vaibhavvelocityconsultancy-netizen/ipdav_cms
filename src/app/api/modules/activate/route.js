import { activateModule } from "@/src/app/lib/services/modules/module_install.service";
import { requireAuth, requirePermission } from "@/src/app/lib/withPermission";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await requireAuth();
    await requirePermission("modules_install");

    const { moduleName } = await req.json();

    if (!moduleName || typeof moduleName !== "string") {
      return NextResponse.json(
        { error: "moduleName is required" },
        { status: 400 },
      );
    }

    const config = await activateModule(moduleName);
    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to activate module" },
      { status: err.statusCode || 500 },
    );
  }
}
