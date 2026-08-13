import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  generateText,
  isStepCount,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import {
  MAX_TOOL_STEPS,
  MODEL_ID,
  SYSTEM_PROMPT,
  buildMockAnswer,
  getModel,
  hasApiKey,
} from "@/lib/marketing/agent";
import { marketingTools } from "@/lib/marketing/tools";

export const maxDuration = 60;

interface ChatRequestBody {
  messages?: UIMessage[];
  /** Set false to get one JSON blob instead of a stream — used by scripts/chat.ts and curl. */
  stream?: boolean;
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (message.role !== "user") continue;
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { text: string }).text)
      .join(" ");
  }
  return "";
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages[] is required" }, { status: 400 });
  }

  const wantsStream = body.stream !== false;

  if (!hasApiKey()) {
    const text = buildMockAnswer(lastUserText(messages));
    if (!wantsStream) {
      return Response.json({ mode: "offline", model: null, text, toolCalls: [], steps: 0 });
    }
    return new Response(text, {
      headers: { "content-type": "text/plain; charset=utf-8", "x-chat-mode": "offline" },
    });
  }

  const modelMessages = await convertToModelMessages(messages);

  if (!wantsStream) {
    try {
      const result = await generateText({
        model: getModel(),
        system: SYSTEM_PROMPT,
        messages: modelMessages,
        tools: marketingTools,
        stopWhen: isStepCount(MAX_TOOL_STEPS),
      });

      const toolCalls = result.steps.flatMap((step) =>
        step.toolCalls.map((call) => ({ toolName: call.toolName, input: call.input })),
      );

      return Response.json({
        mode: "live",
        model: MODEL_ID,
        text: result.text,
        toolCalls,
        steps: result.steps.length,
        usage: result.usage,
      });
    } catch (error) {
      return Response.json(
        {
          mode: "offline",
          model: null,
          text: buildMockAnswer(lastUserText(messages)),
          toolCalls: [],
          steps: 0,
          providerError: error instanceof Error ? error.message : String(error),
        },
        { status: 200 },
      );
    }
  }

  const result = streamText({
    model: getModel(),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools: marketingTools,
    stopWhen: isStepCount(MAX_TOOL_STEPS),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
