"use client";

import { Box, Group, ScrollArea, Text, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { useChatbot } from "./chatbot-context";
import styles from "./chatbot.module.scss";

// The panel itself — only ever mounted (never just hidden) while `opened`
// is true, so it's a real insertion into the page's layout flow, not an
// overlay: it sits as a flex sibling on the right of the main content in
// ChatbotShell and is separated from it by a plain 1px border, matching
// the navbar's existing divider convention.
export default function Chatbot() {
  const { close } = useChatbot();

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

      <ScrollArea className={styles.body}>
        <Text size="sm" c="dimmed">
          สวัสดี! มีอะไรให้เราช่วยเหลือไหม
        </Text>
      </ScrollArea>
    </Box>
  );
}
