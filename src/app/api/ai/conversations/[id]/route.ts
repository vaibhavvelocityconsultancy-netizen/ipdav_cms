import { NextResponse } from "next/server";
import { requirePermission } from "@/src/app/lib/withPermission";
import { deleteConversation, getConversation } from "@/src/app/lib/services/ai/ai-conversation.service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { session, userId } = await requirePermission("settings_manage"); const data = await getConversation((await params).id, userId, Number(session.user.tenantId)); return data ? NextResponse.json({ success: true, data }) : NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode || 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const { session, userId } = await requirePermission("settings_manage"); await deleteConversation((await params).id, userId, Number(session.user.tenantId)); return NextResponse.json({ success: true }); }
  catch (error: any) { return NextResponse.json({ success: false, error: error.message }, { status: error.statusCode || 500 }); }
}
