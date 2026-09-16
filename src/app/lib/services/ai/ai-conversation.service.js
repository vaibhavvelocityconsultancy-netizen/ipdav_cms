import { prisma } from "@/src/app/lib/prisma";

export async function listConversations(userId, tenantId) {
  return prisma.aIConversation.findMany({
    where: { userId, tenantId },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getConversation(id, userId, tenantId) {
  return prisma.aIConversation.findFirst({
    where: { id, userId, tenantId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
}

export async function createConversation(
  userId,
  tenantId,
  title = "New conversation",
) {
  return prisma.aIConversation.create({
    data: { userId, tenantId, title: title.slice(0, 120) },
  });
}

export async function addMessage(
  conversationId,
  userId,
  tenantId,
  role,
  content,
  metadata,
) {
  const conversation = await prisma.aIConversation.findFirst({
    where: { id: conversationId, userId, tenantId },
  });
  if (!conversation) return null;
  const message = await prisma.aIMessage.create({
    data: { conversationId, role, content, metadata },
  });
  await prisma.aIConversation.update({
    where: { id: conversationId },
    data: {
      updatedAt: new Date(),
      ...(role === "user" && conversation.title === "New conversation"
        ? { title: content.slice(0, 80) }
        : {}),
    },
  });
  return message;
}

export async function deleteConversation(id, userId, tenantId) {
  return prisma.aIConversation.deleteMany({ where: { id, userId, tenantId } });
}
