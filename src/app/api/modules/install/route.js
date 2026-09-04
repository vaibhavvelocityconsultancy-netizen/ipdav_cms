import { installModule } from "@/src/app/lib/services/modules/module_install.service";
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
        { status: 400 }
      );
    }

    const jobId = crypto.randomUUID();

    // Fire and forget — this is a long-running Node process (cPanel/Passenger),
    // not a serverless function, so the install keeps running after we respond.
    installModule(moduleName, jobId).catch((err) => {
      console.error(`Install job ${jobId} failed unexpectedly:`, err);
    });

    return NextResponse.json({ jobId, status: "started" });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to start install" },
      { status: err.statusCode || 500 }
    );
  }
}