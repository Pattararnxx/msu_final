"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Group, Loader, ScrollArea, Stack, Text, Textarea, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { useChatbot } from "./chatbot-context";
import { useChatSession } from "./use-chat-session";
import styles from "./chatbot.module.css";

// The system prompt asks for plain text, but the model still reaches for
// Markdown, so normalise it here instead of trusting the instruction: heading
// markers and list bullets are dropped, **bold** becomes real emphasis.
function renderRichText(text: string) {
  return text.split("\n").map((line, lineIndex) => {
    const cleaned = line.replace(/^#{1,6}\s*/, "");
    const segments = cleaned.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

    return (
      <span key={lineIndex} className={styles.turnLine}>
        {segments.map((segment, segmentIndex) =>
          segment.startsWith("**") && segment.endsWith("**") ? (
            <strong key={segmentIndex}>{segment.slice(2, -2)}</strong>
          ) : (
            <span key={segmentIndex}>{segment}</span>
          ),
        )}
      </span>
    );
  });
}

const SUGGESTIONS = [
  "คอนโดแถวอโศกราคาเท่าไหร่",
  "ป่าตอง อีก 12 เดือนราคาจะเป็นยังไง",
  "เทียบ อโศก กับ มีนบุรี",
];

// The panel itself — only ever mounted (never just hidden) while `opened`
// is true, so it's a real insertion into the page's layout flow, not an
// overlay: it sits as a flex sibling on the right of the main content in
// ChatbotShell and is separated from it by a plain 1px border, matching
// the navbar's existing divider convention.
export default function Chatbot() {
  const { close } = useChatbot();
  const { turns, pending, error, send } = useChatSession();
  const [draft, setDraft] = useState("");
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
    void send(text);
    setDraft("");
  };

  return (
    <Box component="aside" className={styles.chatbot} aria-label="แชทบอท">
      <Group justify="space-between" wrap="nowrap" className={styles.header}>
        <Group gap={8} wrap="nowrap">
          <Icon src="/icon/regular/chat-centered-text.svg" size={18} />
          <Text fw={700} size="sm">
            แชทกับเรา
          </Text>
        </Group>
        <UnstyledButton onClick={close} aria-label="ปิดแชท" className={styles.closeButton}>
          <Icon src="/icon/regular/x.svg" size={16} />
        </UnstyledButton>
      </Group>

      <ScrollArea className={styles.body} viewportRef={viewportRef}>
        <Stack gap={12}>
          {turns.length === 0 && (
            <>
              <Text size="sm" c="dimmed">
                สวัสดี! ถามเรื่องราคาอสังหา แนวโน้ม หรือให้ช่วยหาทรัพย์ได้เลย
              </Text>
              <Stack gap={6}>
                {SUGGESTIONS.map((suggestion) => (
                  <UnstyledButton
                    key={suggestion}
                    className={styles.suggestion}
                    onClick={() => submit(suggestion)}
                  >
                    <Text size="xs">{suggestion}</Text>
                  </UnstyledButton>
                ))}
              </Stack>
            </>
          )}

          {turns.map((turn) => (
            <Box
              key={turn.id}
              className={turn.role === "user" ? styles.userTurn : styles.assistantTurn}
            >
              {turn.toolCalls.length > 0 && (
                <Group gap={4} className={styles.toolCalls}>
                  {turn.toolCalls.map((call, index) => (
                    <Text key={`${turn.id}-${index}`} size="xs" className={styles.toolChip}>
                      {call.toolName}
                    </Text>
                  ))}
                </Group>
              )}
              <Text size="sm" className={styles.turnText}>
                {turn.role === "assistant" ? renderRichText(turn.text) : turn.text}
              </Text>
              {turn.mode === "offline" && (
                <Text size="xs" c="dimmed" mt={4}>
                  โหมดออฟไลน์ ไม่ได้เรียกโมเดลภาษา
                </Text>
              )}
            </Box>
          ))}

          {pending && (
            <Group gap={8} className={styles.pending}>
              <Loader size="xs" />
              <Text size="xs" c="dimmed">
                กำลังดึงข้อมูล…
              </Text>
            </Group>
          )}

          {error && (
            <Text size="xs" className={styles.error} role="alert">
              {error}
            </Text>
          )}
        </Stack>
      </ScrollArea>

      <Box className={styles.composer}>
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(draft);
            }
          }}
          placeholder="พิมพ์คำถาม แล้วกด Enter"
          autosize
          minRows={1}
          maxRows={4}
          disabled={pending}
          aria-label="ข้อความถึงแชทบอท"
        />
        <Group justify="space-between" mt={8} wrap="nowrap">
          <Text size="xs" c="dimmed">
            ข้อมูลจำลอง ไม่ใช่คำแนะนำการลงทุน
          </Text>
          <UnstyledButton
            onClick={() => submit(draft)}
            disabled={pending || draft.trim().length === 0}
            aria-label="ส่งข้อความ"
            className={styles.sendButton}
          >
            <Icon src="/icon/regular/paper-plane-right.svg" size={16} />
          </UnstyledButton>
        </Group>
      </Box>
    </Box>
  );
}
