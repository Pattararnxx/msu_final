/**
 * Terminal REPL for /api/chat. Drives the real endpoint over HTTP, so it tests
 * the same path a UI would take and needs no bundler aliases.
 *
 * Start the dev server first, then:  node scripts/chat.ts
 * One-shot:                          node scripts/chat.ts "คอนโดแถวอโศกราคาเท่าไหร่"
 */

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const BASE_URL = process.env.CHAT_BASE_URL ?? "http://localhost:3000";
const ENDPOINT = `${BASE_URL}/api/chat`;

interface UIMessageLike {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
}

interface ChatResponse {
  mode: string;
  model: string | null;
  text: string;
  toolCalls: { toolName: string; input: unknown }[];
  steps: number;
  providerError?: string;
  usage?: Record<string, unknown>;
}

const messages: UIMessageLike[] = [];
let messageCounter = 0;

function shorten(value: unknown, max = 160): string {
  const text = JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

async function ask(question: string): Promise<void> {
  messages.push({
    id: `m${++messageCounter}`,
    role: "user",
    parts: [{ type: "text", text: question }],
  });

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ messages, stream: false }),
  });

  if (!response.ok) {
    console.error(`\n[${response.status}] ${await response.text()}\n`);
    messages.pop();
    return;
  }

  const data = (await response.json()) as ChatResponse;

  if (data.toolCalls.length > 0) {
    console.log("");
    for (const call of data.toolCalls) {
      console.log(`  · ${call.toolName}(${shorten(call.input)})`);
    }
  } else {
    console.log("\n  · (ไม่มีการเรียก tool)");
  }

  if (data.providerError) console.log(`  ! provider error: ${data.providerError}`);

  console.log(`\n${data.text}\n`);
  console.log(`  [${data.mode}${data.model ? ` ${data.model}` : ""} · ${data.steps} step]`);
  console.log("─".repeat(60));

  messages.push({
    id: `m${++messageCounter}`,
    role: "assistant",
    parts: [{ type: "text", text: data.text }],
  });
}

async function main() {
  const oneShot = process.argv.slice(2).join(" ").trim();
  if (oneShot) {
    await ask(oneShot);
    return;
  }

  console.log(`คุยกับบอทอสังหา — ${ENDPOINT}`);
  console.log("พิมพ์คำถามแล้ว Enter · /reset ล้างบทสนทนา · /exit ออก");
  console.log("─".repeat(60));

  const rl = createInterface({ input: stdin, output: stdout });
  try {
    for (;;) {
      const line = (await rl.question("> ")).trim();
      if (!line) continue;
      if (line === "/exit" || line === "/quit") break;
      if (line === "/reset") {
        messages.length = 0;
        console.log("ล้างบทสนทนาแล้ว");
        continue;
      }
      await ask(line);
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
