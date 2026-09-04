import { readInstalledModules } from "@/src/app/lib/services/modules/module_install.service";
import { requireAuth } from "@/src/app/lib/withPermission";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();

    const cfg = readInstalledModules();
    const active = cfg.activeModules || cfg.installedModules || [];
    const activeModules = {};

    active.forEach((name) => {
      activeModules[name] = true;
    });

    return NextResponse.json({ activeModules });
  } catch {
    return NextResponse.json({ activeModules: {} }, { status: 200 });
  }
}
