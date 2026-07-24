import "server-only";

export type StructuredCallResult<T> = { ok: true; data: T } | { ok: false; error: string };

/**
 * Calls the Anthropic Messages API and forces a structured JSON result via
 * tool-choice (a forced tool call), rather than hoping the model returns
 * clean JSON in free text. §58: the model may reason internally, but the
 * app must never show raw JSON/Markdown to the lawyer — this is the
 * boundary where structure is captured before the frontend renders it as a
 * report.
 */
export async function callAnthropicStructured<T>(params: {
  apiKey: string;
  model: string;
  maxTokens: number;
  timeoutSeconds: number;
  systemPrompt: string;
  userPrompt: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
}): Promise<StructuredCallResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), params.timeoutSeconds * 1000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": params.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: params.model,
        max_tokens: params.maxTokens,
        system: params.systemPrompt,
        messages: [{ role: "user", content: params.userPrompt }],
        tools: [
          {
            name: params.toolName,
            description: params.toolDescription,
            input_schema: params.inputSchema,
          },
        ],
        tool_choice: { type: "tool", name: params.toolName },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
      return { ok: false, error: body?.error?.message ?? `O provedor de IA retornou status ${response.status}.` };
    }

    const json = (await response.json()) as {
      content?: { type: string; input?: unknown }[];
    };

    const toolUse = json.content?.find((block) => block.type === "tool_use");
    if (!toolUse || typeof toolUse.input !== "object" || toolUse.input === null) {
      return { ok: false, error: "O modelo não retornou um resultado estruturado válido." };
    }

    return { ok: true, data: toolUse.input as T };
  } catch {
    if (controller.signal.aborted) {
      return { ok: false, error: "Tempo limite excedido ao consultar o provedor de IA." };
    }
    return { ok: false, error: "Não foi possível conectar ao provedor de IA." };
  } finally {
    clearTimeout(timeout);
  }
}
