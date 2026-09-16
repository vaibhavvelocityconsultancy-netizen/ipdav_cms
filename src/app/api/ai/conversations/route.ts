import { NextResponse } from "next/server";
import { requirePermission } from "@/src/app/lib/withPermission";
import { createConversation, listConversations } from "@/src/app/lib/services/ai/ai-conversation.service";

export async function GET() {
  try { const { session, userId } = await requirePermission("settings_manage"); return NextResponse.json({ success: true, data: await listConversations(userId, Number(session.user.tenantId)) }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode || 500 }); }
}

export async function POST(request: Request) {
  try { const { session, userId } = await requirePermission("settings_manage"); const body = await request.json().catch(() => ({})); return NextResponse.json({ success: true, data: await createConversation(userId, Number(session.user.tenantId), body.title) }, { status: 201 }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode || 500 }); }
}
