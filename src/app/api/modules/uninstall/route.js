import { uninstallModule } from "@/src/app/lib/services/modules/module_install.service";
import { requireAuth, requirePermission } from "@/src/app/lib/withPermission";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await requireAuth();
    await requirePermission("modules_install");

    const { moduleName, deleteData = false } = await req.json();

    if (!moduleName || typeof moduleName !== "string") {
      return NextResponse.json(
        { error: "moduleName is required" },
        { status: 400 },
      );
    }

    if (typeof deleteData !== "boolean") {
      return NextResponse.json(
        { error: "deleteData must be a boolean" },
        { status: 400 },
      );
    }

    const jobId = crypto.randomUUID();
    uninstallModule(moduleName, jobId, { deleteData }).catch((err) => {
      console.error(`Uninstall job ${jobId} failed unexpectedly:`, err);
    });

    return NextResponse.json({ jobId, status: "started" });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to start uninstall" },
      { status: err.statusCode || 500 },
    );
  }
}
