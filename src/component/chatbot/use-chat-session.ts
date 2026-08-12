"use client";

import { useCallback, useRef, useState } from "react";

// Mirrors the AI SDK UIMessage shape that /api/chat expects, kept minimal so
// this hook stays independent of the SDK's client bundle. The route is
// stateless, so the whole transcript is resent on every turn.
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  parts: { type: "text"; text: string }[];
}

export interface ToolCallRecord {
  toolName: string;
  input: unknown;
}

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  toolCalls: ToolCallRecord[];
  mode?: string;
}

interface ChatApiResponse {
  mode: string;
  model: string | null;
  text: string;
  toolCalls: ToolCallRecord[];
  steps: number;
  providerError?: string;
}

export function useChatSession() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const counter = useRef(0);
  const history = useRef<ChatMessage[]>([]);

  const nextId = () => `m${++counter.current}`;

  const send = useCallback(
    async (input: string) => {
      const text = input.trim();
      if (!text || pending) return;

      const userMessage: ChatMessage = {
        id: nextId(),
        role: "user",
        parts: [{ type: "text", text }],
      };
      history.current = [...history.current, userMessage];

      setTurns((current) => [
        ...current,
        { id: userMessage.id, role: "user", text, toolCalls: [] },
      ]);
      setPending(true);
      setError(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.current, stream: false }),
        });

        if (!response.ok) {
          throw new Error(`เซิร์ฟเวอร์ตอบกลับ ${response.status}`);
        }

        const data = (await response.json()) as ChatApiResponse;
        const assistantMessage: ChatMessage = {
          id: nextId(),
          role: "assistant",
          parts: [{ type: "text", text: data.text }],
        };
        history.current = [...history.current, assistantMessage];

        setTurns((current) => [
          ...current,
          {
            id: assistantMessage.id,
            role: "assistant",
            text: data.text,
            toolCalls: data.toolCalls ?? [],
            mode: data.mode,
          },
        ]);
      } catch (caught) {
        // Drop the user turn from the history sent upstream so a retry does not
        // resend a message the model never actually saw answered.
        history.current = history.current.slice(0, -1);
        setError(caught instanceof Error ? caught.message : "เชื่อมต่อไม่สำเร็จ");
      } finally {
        setPending(false);
      }
    },
    [pending],
  );

  const reset = useCallback(() => {
    history.current = [];
    setTurns([]);
    setError(null);
  }, []);

  return { turns, pending, error, send, reset };
}
