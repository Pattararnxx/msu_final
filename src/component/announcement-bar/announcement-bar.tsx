"use client";

import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./announcement-bar.module.css";

interface AnnouncementBarProps {
  message: string;
}

// Fixed full-bleed strip pinned above the sidebar + content shell — same
// slot as the reference design's top banner, re-themed to the brand yellow
// instead of its green so it stays inside this project's single-accent
// palette. Dismissing it also zeroes --announcement-bar-height globally
// (see globals.scss) so DashboardSidebar, its mobile bar, and the upload
// panel — all positioned assuming this bar's height — collapse their own
// offset in the same click instead of leaving a gap where it used to be.
export default function AnnouncementBar({ message }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    document.body.classList.add("announcement-dismissed");
  };

  if (dismissed) return null;

  return (
    <div className={styles.bar}>
      <span className={styles.message}>{message}</span>
      <UnstyledButton
        onClick={handleDismiss}
        aria-label="ปิดข้อความแจ้งเตือน"
        className={styles.close}
      >
        <Icon src="/icon/regular/x-circle.svg" size={16} />
      </UnstyledButton>
    </div>
  );
}
