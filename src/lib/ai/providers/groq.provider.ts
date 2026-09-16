import Groq from "groq-sdk";
import type { AIChatParams, AIProvider, AIResponse } from "../ai.types";
import { executeAITool } from "../ai.tool-executor";

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
            description: "The page title or slug to search for.",
          },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_page",
      description:
        "Get the complete details and content of a specific CMS page by its numeric ID.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            description: "The numeric ID of the page.",
          },
        },
        required: ["id"],
      },
    },
  },
];

const systemPrompt = `You are an AI assistant inside a CMS.

You have access to CMS tools.

When the user asks about CMS data, use the appropriate CMS tool instead of saying that you do not have access to the CMS.

Use search_pages to find or list pages.

Use get_page when the user asks for the details, content, HTML, CSS, JavaScript, SEO data, or other complete information about a specific page.

Do not invent CMS data.
Only report information returned by the CMS tools.`;

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
        { role: "system", content: systemPrompt },
        ...params.history.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        { role: "user", content: params.message },
      ];

      let content = "I couldn't generate a response.";

      for (let round = 0; round < 8; round += 1) {
        const completion = await groq.chat.completions.create({
          model: process.env.AI_MODEL || "llama-3.3-70b-versatile",
          messages,
          tools: groqTools,
          tool_choice: "auto",
        });
        const message = completion.choices[0]?.message;

        if (!message?.tool_calls?.length) {
          content = message?.content || content;
          break;
        }

        messages.push(message);

        const toolResults = await Promise.all(
          message.tool_calls.map(async (toolCall) => {
            let result;

            try {
              const arguments_ = JSON.parse(
                toolCall.function.arguments || "{}",
              );
              result = await executeAITool(toolCall.function.name, arguments_);
              if (!result.success) {
                console.error(
                  `Groq tool failed (${toolCall.function.name}):`,
                  result.error,
                );
              }
            } catch (error) {
              console.error(
                `Groq tool error (${toolCall.function.name}):`,
                error,
              );
              result = {
                success: false,
                tool: toolCall.function.name,
                error:
                  error instanceof Error
                    ? error.message
                    : "The tool request could not be processed.",
              };
            }

            return {
              role: "tool",
              tool_call_id: toolCall.id,
              content: JSON.stringify(result),
            };
          }),
        );

        messages.push(...toolResults);
      }

      return {
        status: "ready",
        content,
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
