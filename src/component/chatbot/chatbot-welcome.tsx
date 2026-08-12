import { Box, Stack, Text, UnstyledButton } from "@mantine/core";
import styles from "./chatbot.module.css";

export const CHATBOT_SUGGESTIONS = [
  "คอนโดแถวอโศก ราคาเท่าไหร่",
  "ป่าตอง อีก 12 เดือนราคาจะเป็นยังไง",
  "เทียบ อโศก กับ มีนบุรี",
];

interface ChatbotWelcomeProps {
  onSelect: (suggestion: string) => void;
}

export default function ChatbotWelcome({ onSelect }: ChatbotWelcomeProps) {
  return (
    <Box className={styles.welcome}>
      <Box className={styles.welcomeIntro}>
        <Text component="h1" className={styles.welcomeTitle}>
          แชทบอท
        </Text>
        <Text component="p" className={styles.welcomeDescription}>
          ฉันสามารถช่วยตอบคำถามเกี่ยวกับราคา แนวโน้ม และทำเลได้
        </Text>
      </Box>

      <Box component="section" aria-labelledby="chatbot-suggestions-title">
        <Text id="chatbot-suggestions-title" className={styles.suggestionLabel}>
          ลองถาม
        </Text>
        <Stack gap={8} mt={8}>
          {CHATBOT_SUGGESTIONS.map((suggestion) => (
            <UnstyledButton
              key={suggestion}
              className={styles.suggestion}
              onClick={() => onSelect(suggestion)}
            >
              <Text component="span" className={styles.suggestionText}>
                {suggestion}
              </Text>
            </UnstyledButton>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
