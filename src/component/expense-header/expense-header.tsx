"use client";

import { Button, Group, Stack } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import styles from "./expense-header.module.css";

interface ExpenseHeaderProps {
  businessName: string;
  phone: string;
  onUploadClick: () => void;
}

// Business identity (left) + primary actions (right, two rows): upload/chat
// on top, export destinations below — matches the reference's action
// grouping. Export actions are still non-functional placeholders; upload is
// owned by the page (ExpenseUploadPanel lives beside <main>, not
// nested in here, since it needs to be a flex sibling of the whole content
// column to push it over). The chat button toggles the shared AI chat panel.
export default function ExpenseHeader({ businessName, phone, onUploadClick }: ExpenseHeaderProps) {
  const { opened: chatbotOpened, toggle: toggleChatbot } = useChatbot();
  return (
    <div className={styles.header}>
      <Stack gap={2} className={styles.identity}>
        <h1 className={styles.name}>{businessName}</h1>
        <Group gap={6} className={styles.phone}>
          {phone}
        </Group>
      </Stack>

      <Stack gap={10} align="flex-end" className={styles.actions}>
        <Group gap={8} wrap="nowrap">
          <Button
            variant="filled"
            color="dark"
            radius="md"
            leftSection={<Icon src="/icon/regular/tray-arrow-up.svg" size={16} />}
            onClick={onUploadClick}
          >
            อัปโหลดบิล
          </Button>
          <Button
            variant="default"
            radius="md"
            leftSection={<Icon src="/icon/regular/chat-circle-dots.svg" size={16} />}
            onClick={toggleChatbot}
            aria-expanded={chatbotOpened}
          >
            แชท AI
          </Button>
        </Group>

        <Group gap={8} wrap="wrap" justify="flex-end">
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/google-drive-logo.svg" size={14} />}
          >
            Google Drive
          </Button>
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/table.svg" size={14} />}
          >
            Google Sheets
          </Button>
          <Button
            variant="default"
            radius="md"
            size="xs"
            leftSection={<Icon src="/icon/regular/file-xls.svg" size={14} />}
          >
            ดาวน์โหลดเป็นไฟล์ Excel
          </Button>
        </Group>
      </Stack>
    </div>
  );
}
