"use client";

import { useEffect, useRef, useState } from "react";
import { Box, ScrollArea, Stack } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { useChatbot } from "./chatbot-context";
import { useChatSession } from "./use-chat-session";
import ChatbotComposer from "./chatbot-composer";
import ChatbotError from "./chatbot-error";
import ChatbotLoading from "./chatbot-loading";
import ChatbotMessage from "./chatbot-message";
import ChatbotWelcome from "./chatbot-welcome";
import styles from "./chatbot.module.css";

// The panel is kept mounted for the short close transition, then removed by
// ChatbotShell. Its fixed right-edge placement is controlled by module styles.
export default function Chatbot({ visible }: { visible: boolean }) {
 const { close, consumePendingQuestion } = useChatbot();
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

  // A question asked from outside the panel (e.g. the home page's "ถาม AI"
  // search mode) is queued via askQuestion() and opens this panel; on mount
  // we pick it up and fire it as the first turn.
  useEffect(() => {
    const question = consumePendingQuestion();
    if (question) submit(question);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      component="aside"
      className={`${styles.chatbot} ${visible ? styles.visible : ""}`}
      aria-label="ผู้ช่วยค้นหาข้อมูลอสังหาริมทรัพย์"
      aria-hidden={!visible}
    >
      <div className={styles.header}>
        <span className={styles.headerTitle}>ผู้ช่วยค้นหาอสังหาริมทรัพย์</span>
        <button
          type="button"
          className={styles.closeButton}
          aria-label="ปิดแชทบอท"
          onClick={(event) => {
            event.currentTarget.blur();
            close();
          }}
        >
          <Icon src="/icon/regular/x.svg" size={18} />
        </button>
      </div>

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
