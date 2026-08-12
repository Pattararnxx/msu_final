import { Box, Group, Text } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./chatbot.module.css";

export default function ChatbotLoading() {
  return (
    <Box className={styles.loading} role="status" aria-live="polite">
      <Group gap={10} wrap="nowrap">
        <Box className={styles.loadingAvatar} aria-hidden="true">
          <Icon src="/icon/regular/sparkle.svg" size={14} />
        </Box>
        <Box>
          <Text className={styles.loadingTitle}>กำลังค้นหาข้อมูล</Text>
          <Text className={styles.loadingDescription}>กำลังวิเคราะห์คำถามของคุณ</Text>
        </Box>
        <span className={styles.loadingDots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </Group>
    </Box>
  );
}
