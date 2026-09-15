import type { AIChatParams, AIResponse } from "./ai.types";
import { GroqProvider } from "./providers/groq.provider";

export function getAIProvider() {
  switch ((process.env.AI_PROVIDER || "groq").toLowerCase()) {
    case "groq":
    default:
      return new GroqProvider();
  }
}

export async function runAIChat(params: AIChatParams): Promise<AIResponse> {
  return getAIProvider().chat(params);
}
