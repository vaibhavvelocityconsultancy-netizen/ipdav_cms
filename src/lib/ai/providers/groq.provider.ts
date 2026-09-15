import type { AIChatParams, AIProvider, AIResponse } from "../ai.types";

/** Provider seam for Groq. Intentionally does not call a model until tool calling is wired. */
export class GroqProvider implements AIProvider {
  async chat(_params: AIChatParams): Promise<AIResponse> {
    if (!process.env.GROQ_API_KEY) {
      return { status: "not_configured", content: "AI provider is not configured. Add GROQ_API_KEY to enable the assistant." };
    }
    return { status: "not_configured", content: "The Groq provider is connected to the CMS architecture, but model calls are not enabled yet." };
  }
}
