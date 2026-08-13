import { Box, Text, Textarea, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./chatbot.module.css";

interface ChatbotComposerProps {
  draft: string;
  pending: boolean;
  onDraftChange: (value: string) => void;
  onSend: (value: string) => void;
}

export default function ChatbotComposer({
  draft,
  pending,
  onDraftChange,
  onSend,
}: ChatbotComposerProps) {
  return (
    <Box
      component="form"
      className={styles.composer}
      onSubmit={(event) => {
        event.preventDefault();
        onSend(draft);
      }}
    >
      <Box component="label" htmlFor="chatbot-input" className={styles.inputLabel}>
        ถามผู้ช่วยการตลาด
        <Text component="span" className={styles.inputHint}>
          Enter ส่ง · Shift + Enter ขึ้นบรรทัดใหม่
        </Text>
      </Box>
      <Box className={styles.inputShell}>
        <Textarea
          id="chatbot-input"
          value={draft}
          onChange={(event) => onDraftChange(event.currentTarget.value)}
          placeholder="เช่น ควรดันเมนูไหนในช่วงเช้าวันนี้"
          autosize
          minRows={1}
          maxRows={4}
          disabled={pending}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend(draft);
            }
          }}
          classNames={{ input: styles.input }}
        />
        <UnstyledButton
          type="submit"
          disabled={pending || draft.trim().length === 0}
          aria-label="ส่งข้อความ"
          className={styles.sendButton}
        >
          <Icon src="/icon/regular/paper-plane-right.svg" size={17} />
        </UnstyledButton>
      </Box>
    </Box>
  );
}
