import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./chatbot.module.css";

interface ChatbotErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function ChatbotError({ message, onRetry }: ChatbotErrorProps) {
  return (
    <Box className={styles.error} role="alert">
      <Group gap={10} align="flex-start" wrap="nowrap">
        <Box className={styles.errorIcon} aria-hidden="true">
          <Icon src="/icon/regular/warning.svg" size={17} />
        </Box>
        <Box className={styles.errorContent}>
          <Text className={styles.errorTitle}>ยังตอบไม่ได้ในตอนนี้</Text>
          <Text className={styles.errorMessage}>{message}</Text>
          {onRetry && (
            <UnstyledButton onClick={onRetry} className={styles.retryButton}>
              <Icon src="/icon/regular/arrow-clockwise.svg" size={15} />
              <Text component="span">ลองอีกครั้ง</Text>
            </UnstyledButton>
          )}
        </Box>
      </Group>
    </Box>
  );
}
