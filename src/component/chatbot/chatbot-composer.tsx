import { Box, Textarea, UnstyledButton } from "@mantine/core";
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
      <Box className={styles.inputShell}>
        <Textarea
          id="chatbot-input"
          value={draft}
          onChange={(event) => onDraftChange(event.currentTarget.value)}
          placeholder="เช่น บ้านใกล้รถไฟฟ้าราคาเท่าไหร่"
          autosize
          minRows={1}
          maxRows={4}
          disabled={pending}
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
