"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

interface ChatbotContextValue {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Opens the panel and queues `question` to be sent as soon as the panel
   * (and its chat session) mounts — e.g. from the home search bar's "ถาม AI"
   * mode. */
  askQuestion: (question: string) => void;
  /** Chatbot calls this once on mount to read-and-clear any queued question
   * from askQuestion, so it's only ever sent a single time. */
  consumePendingQuestion: () => string | null;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

// Holds the open/closed state shared between the navbar's trigger button and
// the ChatbotShell that inserts the panel into the page layout.
export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);
  const pendingQuestion = useRef<string | null>(null);

  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((value) => !value), []);

  const askQuestion = useCallback((question: string) => {
    pendingQuestion.current = question;
    setOpened(true);
  }, []);

  const consumePendingQuestion = useCallback(() => {
    const question = pendingQuestion.current;
    pendingQuestion.current = null;
    return question;
  }, []);

  const value = useMemo(
    () => ({ opened, open, close, toggle, askQuestion, consumePendingQuestion }),
    [opened, open, close, toggle, askQuestion, consumePendingQuestion],
  );

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
