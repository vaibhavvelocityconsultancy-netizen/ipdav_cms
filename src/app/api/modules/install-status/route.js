import { readJobStatus } from "@/src/app/lib/services/modules/module_install.service";
import { requireAuth, requirePermission } from "@/src/app/lib/withPermission";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await requireAuth();
    await requirePermission("modules_install");

    const jobId = req.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const status = await readJobStatus(jobId);
    return NextResponse.json(status);
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Job not found" },
      { status: err.message === "Job not found" ? 404 : 500 },
    );
  }
}
