export type AIContext = {
  currentModule?: string;
  currentEntityId?: string | number;
  currentUrl?: string;
};
export type AIToolCall = {
  name: string;
  arguments: Record<string, any>;
};
export type AIAttachment = {
  name: string;
  type: string;
  size: number;
  url?: string;
};

export type AIChatParams = {
  message: string;
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  context?: AIContext;
  attachments?: AIAttachment[];
};

export type AIResponse = {
  content: string;
  status: "ready" | "not_configured" | "error";
  pendingAction?: {
    tool: string;
    summary: string;
    risk: "READ" | "LOW" | "MEDIUM" | "HIGH";
  };
};

export interface AIProvider {
  chat(params: AIChatParams): Promise<AIResponse>;
}

export type AIToolRisk = "READ" | "LOW" | "MEDIUM" | "HIGH";
export type AIToolDefinition = {
  name: string;
  description: string;
  permission: string;
  risk: AIToolRisk;
};

export const supportedAttachmentTypes = [
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export function isSupportedAttachment(attachment: AIAttachment) {
  return supportedAttachmentTypes.includes(attachment.type) && attachment.size <= 10 * 1024 * 1024;
}
