"use client";

import { type ReactNode } from "react";
import { Box, Group, Text } from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { ChatTurn } from "./use-chat-session";
import MarketingUiBlocks from "./marketing-ui-blocks";
import styles from "./chatbot.module.css";

function renderInlineText(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((segment, index) =>
    segment.startsWith("**") && segment.endsWith("**") ? (
      <strong key={index}>{segment.slice(2, -2)}</strong>
    ) : (
      <span key={index}>{segment}</span>
    ),
  );
}

function renderAssistantText(text: string) {
  return text.split("\n").map((line, index) => {
    const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
    const unorderedMatch = line.match(/^[-•]\s+(.*)$/);
    const orderedMatch = line.match(/^(\d+)[.)]\s+(.*)$/);

    if (!line.trim()) {
      return <span key={index} className={styles.paragraphBreak} aria-hidden="true" />;
    }

    if (headingMatch) {
      return (
        <span key={index} className={styles.messageHeading}>
          {renderInlineText(headingMatch[1])}
        </span>
      );
    }

    if (unorderedMatch || orderedMatch) {
      const marker = orderedMatch ? `${orderedMatch[1]}.` : "•";
      const content = orderedMatch ? orderedMatch[2] : unorderedMatch![1];

      return (
        <span key={index} className={styles.messageListItem}>
          <span className={styles.listMarker} aria-hidden="true">
            {marker}
          </span>
          <span>{renderInlineText(content)}</span>
        </span>
      );
    }

    return (
      <span key={index} className={styles.messageLine}>
        {renderInlineText(line)}
      </span>
    );
  });
}

interface ChatbotMessageProps {
  turn: ChatTurn;
  onAsk?: (question: string) => void;
}

export default function ChatbotMessage({ turn, onAsk }: ChatbotMessageProps) {
  const isUser = turn.role === "user";
  const toolLabels: Record<string, string> = {
    getRestaurantMenu: "catalogue เมนู",
    getSalesInsights: "ยอดขายในระบบ",
    calculateBundlePrice: "คำนวณชุดโปร",
  };

  return (
    <Box className={isUser ? styles.userMessage : styles.assistantMessage}>
      {!isUser && (
        <Group gap={6} wrap="nowrap" className={styles.assistantMeta}>
          <Icon src="/icon/regular/megaphone.svg" size={13} />
          <Text component="span">ผู้ช่วยการตลาด</Text>
        </Group>
      )}
      {!isUser && turn.toolCalls.length > 0 && (
        <Box className={styles.sourceBlock}>
          <Group gap={6} wrap="nowrap" className={styles.sourceLabel}>
            <Icon src="/icon/regular/database.svg" size={14} />
            <Text component="span">อ้างอิงจากข้อมูล</Text>
          </Group>
          <Group gap={6} mt={7} wrap="wrap">
            {turn.toolCalls.map((call, index) => (
              <Text key={`${turn.id}-${index}`} component="span" className={styles.toolChip}>
                {toolLabels[call.toolName] ?? call.toolName}
              </Text>
            ))}
          </Group>
        </Box>
      )}

      <Text component="div" className={styles.messageText}>
        {isUser ? turn.text : renderAssistantText(turn.text)}
      </Text>
      {!isUser && <MarketingUiBlocks blocks={turn.ui} onAsk={onAsk} />}
    </Box>
  );
}
