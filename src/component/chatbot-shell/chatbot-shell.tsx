"use client";

import Chatbot from "@/component/chatbot/chatbot";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import styles from "./chatbot-shell.module.css";

// Lays the page out as a flex row so the chatbot panel is a real sibling of
// the main content (navbar included) — inserted/removed from the layout
// (not a modal, not position:absolute) and pushing/shrinking the content
// over from the right rather than covering it.
export default function ChatbotShell({ children }: { children: React.ReactNode }) {
  const { opened } = useChatbot();

  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      {opened && <Chatbot />}
    </div>
  );
}
