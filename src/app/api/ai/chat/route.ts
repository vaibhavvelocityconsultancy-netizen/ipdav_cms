import { NextResponse } from "next/server";
import { requirePermission } from "@/src/app/lib/withPermission";
import { runAIChat } from "@/src/lib/ai/ai.service";
import {
  isSupportedAttachment,
  type AIAttachment,
} from "@/src/lib/ai/ai.types";
import {
  addMessage,
  createConversation,
  getConversation,
} from "@/src/app/lib/services/ai/ai-conversation.service";

export async function POST(request: Request) {
  try {
    const { session, userId } = await requirePermission("settings_manage");
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message)
      return NextResponse.json(
        { success: false, error: "Message is required" },
        { status: 400 },
      );
    const attachments: AIAttachment[] = Array.isArray(body.attachments)
      ? body.attachments
      : [];
    if (attachments.some((attachment) => !isSupportedAttachment(attachment)))
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported attachment or file is larger than 10 MB",
        },
        { status: 400 },
      );
    const tenantId = Number(session.user.tenantId);
    let conversationId =
      typeof body.conversationId === "string" ? body.conversationId : null;
    if (!conversationId)
      conversationId = (await createConversation(userId, tenantId, message)).id;
    const conversation = await getConversation(
      conversationId,
      userId,
      tenantId,
    );
    if (!conversation)
      return NextResponse.json(
        { success: false, error: "Conversation not found" },
        { status: 404 },
      );
    await addMessage(conversationId, userId, tenantId, "user", message, {
      context: body.context || {},
      attachments: attachments.map(({ name, type, size, url }) => ({
        name,
        type,
        size,
        url,
      })),
    });
    const response = await runAIChat({
      message,
      history: conversation.messages.map(
        (item: { role: string; content: string }) => ({
          role: item.role as "user" | "assistant" | "system",
          content: item.content,
        }),
      ),
      context: body.context,
      attachments,
    });
    const assistantMessage = await addMessage(
      conversationId,
      userId,
      tenantId,
      "assistant",
      response.content,
      {
        status: response.status,
        pendingAction: response.pendingAction || null,
      },
    );
    return NextResponse.json({
      success: true,
      data: { conversationId, message: assistantMessage, response },
    });
  } catch (error: any) {
    console.error("🔥 AI CHAT ERROR:", error);
    const status = error?.statusCode || 500;

    return NextResponse.json(
      {
        success: false,
        error:
          status === 500
            ? "Unable to process the assistant request"
            : error.message,
      },
      { status },
    );
  }
}
