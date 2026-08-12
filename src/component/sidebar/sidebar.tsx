"use client";

import type { ReactNode } from "react";
import { Box, Group, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { close } from "@/lib/redux/features/sidebar-slice";
import styles from "./sidebar.module.css";

interface SidebarProps {
  title?: string;
  /** The content to render inside the panel — reusable, caller decides what goes in it. */
  children: ReactNode;
}

// Only ever mounted (never just hidden) while Redux's `sidebar.opened` is
// true — a real insertion into the page's layout flow via SidebarShell, not
// an overlay/modal. Same pattern as Chatbot + ChatbotShell, but generic:
// this component doesn't know what it's showing, the caller passes it in.
export default function Sidebar({ title, children }: SidebarProps) {
  const opened = useAppSelector((state) => state.sidebar.opened);
  const dispatch = useAppDispatch();

  if (!opened) return null;

  return (
    <Box component="aside" className={styles.sidebar} aria-label={title}>
      <Group justify="space-between" align="center" className={styles.header}>
        {title && <span className={styles.title}>{title}</span>}
        <UnstyledButton
          onClick={() => dispatch(close())}
          aria-label="ปิด"
          className={styles.closeButton}
        >
          <Icon src="/icon/regular/x.svg" size={16} />
        </UnstyledButton>
      </Group>

      <Box className={styles.body}>{children}</Box>
    </Box>
  );
}
