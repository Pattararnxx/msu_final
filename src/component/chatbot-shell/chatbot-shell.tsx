"use client";

import { useEffect, useState } from "react";
import Chatbot from "@/component/chatbot/chatbot";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import styles from "./chatbot-shell.module.css";

// Keeps the page content in normal document flow while the chatbot stays
// attached to the viewport's right edge. Desktop content reserves the panel's
// width so the fixed panel does not cover it; mobile uses the full viewport.
export default function ChatbotShell({ children }: { children: React.ReactNode }) {
  const { opened } = useChatbot();
  const [rendered, setRendered] = useState(opened);
  const [entered, setEntered] = useState(opened);

  useEffect(() => {
    if (opened) {
      let enterFrame: number | undefined;
      const mountFrame = requestAnimationFrame(() => {
        setRendered(true);
        enterFrame = requestAnimationFrame(() => setEntered(true));
      });

      return () => {
        cancelAnimationFrame(mountFrame);
        if (enterFrame !== undefined) cancelAnimationFrame(enterFrame);
      };
    }

    const closeFrame = requestAnimationFrame(() => setEntered(false));
    const timeout = window.setTimeout(() => setRendered(false), 240);

    return () => {
      cancelAnimationFrame(closeFrame);
      window.clearTimeout(timeout);
    };
  }, [opened]);

  return (
    <div className={`${styles.shell} ${opened ? styles.opened : ""}`}>
      <div className={styles.content}>{children}</div>
      {rendered && <Chatbot visible={entered} />}
    </div>
  );
}
