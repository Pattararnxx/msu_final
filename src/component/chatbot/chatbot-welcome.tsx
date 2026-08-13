import { Box, Group, Stack, Text, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./chatbot.module.css";
import Image from "next/image";

export const CHATBOT_SUGGESTIONS = [
  "ช่วยคิดโปรโมชันจากเมนูขายดีของร้าน",
  "ร่างโพสต์ Facebook ดันโจ๊กหมูให้หน่อย",
  "จัดชุดอาหารเช้าเพิ่มยอดต่อบิลให้หน่อย",
];

const SUGGESTION_ICONS = [
  "/icon/regular/megaphone.svg",
  "/icon/regular/note-pencil.svg",
  "/icon/regular/bowl-food.svg",
];

interface ChatbotWelcomeProps {
  onSelect: (suggestion: string) => void;
}

export default function ChatbotWelcome({ onSelect }: ChatbotWelcomeProps) {
  return (
    <Box className={styles.welcome}>
      <Box className={styles.welcomeIntro}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}> 
          <Image
            src="/logo/ai_logo.svg"
            alt="Chatbot Icon"
            width={64}
            height={64}
          />
          <Text component="h1" className={styles.welcomeTitle}>
            ถามแมวไอรีนแชทบอทของคุณ
          </Text>
        </div>
        <Text component="p" className={styles.welcomeDescription}>
          ฉันช่วยเลือกเมนูที่จะดัน คิดโปรโมชัน และร่างโพสต์ให้เข้ากับร้านได้
        </Text>
      </Box>

      <Box className={styles.dataHint}>
        <Group gap={7} wrap="nowrap">
          <Icon src="/icon/regular/database.svg" size={15} />
          <Text component="span">ข้อมูลอ้างอิง: เมนู ราคา และยอดขายในระบบ</Text>
        </Group>
        <Text component="p">ทุกโปรโมชันเป็นร่าง ต้องอนุมัติก่อนใช้จริง</Text>
      </Box>

      <Box component="section" aria-labelledby="chatbot-suggestions-title">
        <Text id="chatbot-suggestions-title" className={styles.suggestionLabel}>
          ลองถาม
        </Text>
        <Stack gap={8} mt={8}>
          {CHATBOT_SUGGESTIONS.map((suggestion, index) => (
            <UnstyledButton
              key={suggestion}
              className={styles.suggestion}
              onClick={() => onSelect(suggestion)}
            >
              <Icon src={SUGGESTION_ICONS[index]} size={16} />
              <Text component="span" className={styles.suggestionText}>
                {suggestion}
              </Text>
              <Icon src="/icon/regular/arrow-right.svg" size={14} />
            </UnstyledButton>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
