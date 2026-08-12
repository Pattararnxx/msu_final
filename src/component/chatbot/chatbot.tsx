"use client";

import { useEffect, useRef, useState } from "react";
import { Box, ScrollArea, Stack } from "@mantine/core";
import { useChatSession } from "./use-chat-session";
import ChatbotComposer from "./chatbot-composer";
import ChatbotError from "./chatbot-error";
import ChatbotLoading from "./chatbot-loading";
import ChatbotMessage from "./chatbot-message";
import ChatbotWelcome from "./chatbot-welcome";
import styles from "./chatbot.module.css";

// The panel itself — only ever mounted (never just hidden) while `opened`
// is true, so it's a real insertion into the page's layout flow, not an
// overlay: it sits as a flex sibling on the right of the main content in
// ChatbotShell and is separated from it by a plain 1px border, matching
// the navbar's existing divider convention.
export default function Chatbot() {
  const { turns, pending, error, send } = useChatSession();
  const [draft, setDraft] = useState("");
  const [lastSubmitted, setLastSubmitted] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  // Keep the newest turn in view. Tool-call chips make assistant turns tall,
  // so this runs on `pending` too, not only on turn count.
  useEffect(() => {
    // Deferred a frame: scrollHeight is still the pre-paint value right after
    // a turn is appended, so scrolling immediately stops short of the bottom.
    const frame = requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (viewport) viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [turns, pending]);

  const submit = (text: string) => {
    const normalized = text.trim();
    if (!normalized || pending) return;

    setLastSubmitted(normalized);
    void send(normalized);
    setDraft("");
  };

  return (
    <Box component="aside" className={styles.chatbot} aria-label="ผู้ช่วยค้นหาข้อมูลอสังหาริมทรัพย์">
      <ScrollArea className={styles.body} viewportRef={viewportRef}>
        <Stack gap={16} className={styles.bodyContent}>
          {turns.length === 0 && (
            <ChatbotWelcome onSelect={submit} />
          )}

          {turns.map((turn) => <ChatbotMessage key={turn.id} turn={turn} />)}

          {pending && <ChatbotLoading />}

          {error && (
            <ChatbotError
              message={error}
              onRetry={lastSubmitted ? () => submit(lastSubmitted) : undefined}
            />
          )}
        </Stack>
      </ScrollArea>

      <ChatbotComposer
        draft={draft}
        pending={pending}
        onDraftChange={setDraft}
        onSend={submit}
      />
    </Box>
  );
}
