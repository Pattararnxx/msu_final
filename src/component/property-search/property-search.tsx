"use client";

import { useState, type CSSProperties } from "react";
import { TextInput, ActionIcon, UnstyledButton } from "@mantine/core";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import Icon from "@/component/icon/icon";
import styles from "./property-search.module.css";

// Right-hand half of the hero toolbar; PropertyFilter is the left-hand half.
//
// The "ถาม AI" button toggles AI mode — typing stays exactly the same
// (same field, same Enter key), but submitting while AI mode is on opens
// the chatbot panel and asks it the typed text instead of doing a normal
// search.
export default function PropertySearch() {
  const [value, setValue] = useState("");
  const [aiMode, setAiMode] = useState(false);
  const { askQuestion } = useChatbot();

  const submit = () => {
    const text = value.trim();
    if (!text) return;

    if (aiMode) {
      askQuestion(text);
      setAiMode(false);
    }

    setValue("");
  };

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <TextInput
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        placeholder={
          aiMode ? "ถามคำถามเกี่ยวกับอสังหาริมทรัพย์…" : "ค้นหาทำเล โครงการ หรือรหัสทรัพย์"
        }
        aria-label={aiMode ? "ถาม AI เกี่ยวกับอสังหาริมทรัพย์" : "ค้นหาอสังหาริมทรัพย์"}
        radius={128}
        leftSection={<Icon src="/icon/regular/magnifying-glass.svg" size={16} />}
        rightSectionWidth={72}
        rightSectionPointerEvents="auto"
        rightSection={
          <UnstyledButton
            type="button"
            onClick={() => setAiMode((current) => !current)}
            aria-pressed={aiMode}
            className={aiMode ? styles.aiToggleActive : styles.aiToggle}
          >
            <Icon src="/icon/regular/sparkle.svg" size={13} />
            ถาม AI
          </UnstyledButton>
        }
        classNames={{ root: styles.field, input: styles.input }}
      />
      <ActionIcon
        type="submit"
        radius={128}
        size={40}
        aria-label={aiMode ? "ถาม AI" : "ค้นหา"}
        style={{ "--ai-bg": "var(--yellow)", "--ai-color": "var(--black)", "--ai-hover": "var(--primary-600)" } as CSSProperties}
      >
        <Icon src={aiMode ? "/icon/regular/sparkle.svg" : "/icon/regular/magnifying-glass.svg"} size={16} />
      </ActionIcon>
    </form>
  );
}
