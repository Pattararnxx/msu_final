"use client";

import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./announcement-bar.module.css";

interface AnnouncementBarProps {
  message: string;
}

// Slim full-bleed strip above the sidebar + content shell — same slot as the
// reference design's top banner, re-themed to the brand yellow instead of
// its green so it stays inside this project's single-accent palette.
export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className={styles.bar}>
      <span className={styles.message}>{message}</span>
      <UnstyledButton
        onClick={() => setDismissed(true)}
        aria-label="ปิดข้อความแจ้งเตือน"
        className={styles.close}
      >
        <Icon src="/icon/regular/x-circle.svg" size={16} />
      </UnstyledButton>
    </div>
  );
}
