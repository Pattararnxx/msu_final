"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ChatbotContextValue {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const ChatbotContext = createContext<ChatbotContextValue | null>(null);

// Holds the open/closed state shared between the navbar's trigger button and
// the ChatbotShell that inserts the panel into the page layout.
export function ChatbotProvider({ children }: { children: React.ReactNode }) {
  const [opened, setOpened] = useState(false);

  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);
  const toggle = useCallback(() => setOpened((value) => !value), []);

  const value = useMemo(() => ({ opened, open, close, toggle }), [opened, open, close, toggle]);

  return <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>;
}

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
}
