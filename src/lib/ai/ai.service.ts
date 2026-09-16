import Groq from "groq-sdk";
import type { AIChatParams, AIProvider, AIResponse } from "./ai.types";
import { executeAITool } from "./ai.tool-executor";

const groqTools = [
  {
    type: "function" as const,
    function: {
      name: "search_pages",
      description:
        "Search pages in the CMS by title or slug. Use an empty query when the user asks to list all pages.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "The page title or slug to search for. Use an empty string to retrieve all pages.",
          },
        },
        required: ["query"],
      },
    },
  },
];

export class GroqProvider implements AIProvider {
  async chat(params: AIChatParams): Promise<AIResponse> {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return {
        status: "not_configured",
        content:
          "AI provider is not configured. Add GROQ_API_KEY to enable the assistant.",
      };
    }

    try {
      const groq = new Groq({
        apiKey,
      });

      const messages: any[] = [
        {
          role: "system",
          content: `
You are an AI assistant inside a CMS.

You have access to CMS tools.
When the user asks about CMS data, use the appropriate tool instead of pretending that you cannot access the CMS.

For example:
- "Show me all pages" → use search_pages with an empty query.
- "Find the About page" → use search_pages with "About".

Always use CMS tools when the requested information can be retrieved from the CMS.
          `.trim(),
        },

        ...params.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),

        {
          role: "user",
          content: params.message,
        },
      ];

      // First Groq request
      const completion = await groq.chat.completions.create({
        model: process.env.AI_MODEL || "openai/gpt-oss-120b",
        messages,
        tools: groqTools,
        tool_choice: "auto",
      });

      const assistantMessage = completion.choices[0]?.message;

      if (!assistantMessage) {
        return {
          status: "error",
          content: "No response received from AI.",
        };
      }

      // No tool requested → normal response
      if (!assistantMessage.tool_calls?.length) {
        return {
          status: "ready",
          content:
            assistantMessage.content || "I couldn't generate a response.",
        };
      }

      // Add Groq's tool-call message to conversation
      messages.push(assistantMessage);

      // Execute requested tools
      for (const toolCall of assistantMessage.tool_calls) {
        if (toolCall.type !== "function") continue;

        const toolName = toolCall.function.name;

        let arguments_: Record<string, any> = {};

        try {
          arguments_ = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          arguments_ = {};
        }

        console.log("🤖 AI TOOL CALL:", {
          toolName,
          arguments_,
        });

        const result = await executeAITool(toolName, arguments_);

        console.log("🤖 AI TOOL RESULT:", result);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      // Second Groq request.
      // Groq now receives the actual CMS data and writes
      // the final human-readable response.
      const finalCompletion = await groq.chat.completions.create({
        model: process.env.AI_MODEL || "openai/gpt-oss-120b",
        messages,
        tools: groqTools,
        tool_choice: "auto",
      });

      const finalContent =
        finalCompletion.choices[0]?.message?.content ||
        "I couldn't generate a response.";

      return {
        status: "ready",
        content: finalContent,
      };
    } catch (error) {
      console.error("Groq API error:", error);

      return {
        status: "error",
        content:
          error instanceof Error
            ? `Groq API error: ${error.message}`
            : "Failed to communicate with Groq.",
      };
    }
  }
}

export async function runAIChat(params: AIChatParams): Promise<AIResponse> {
  return new GroqProvider().chat(params);
}
