"use client";

import type { ReactNode } from "react";
import AnnouncementBar from "@/component/announcement-bar/announcement-bar";
import DashboardSidebar from "@/component/dashboard-sidebar/dashboard-sidebar";
import styles from "./dashboard-shell.module.css";

interface DashboardShellProps {
  children: ReactNode;
  /**
   * Extra flex sibling(s) inside .shell, after <main> — for a page-specific
   * slide-in panel like ExpenseUploadPanel, which needs to be a real flex
   * item next to .content (not nested inside it) for its width transition
   * to push .content over. Pages without one just omit this.
   */
  asideSlot?: ReactNode;
}

// The persistent app chrome (announcement banner + left nav + content
// column) shared by every /home/* page, pulled out of home/page.tsx once a
// second page needed it too — every position: fixed/sticky offset in here
// took several rounds to get right (see dashboard-sidebar.module.css and
// expense-upload-panel.module.css), so it's one shared place instead of
// copies that could drift apart.
export default function DashboardShell({
  children,
  asideSlot,
}: DashboardShellProps) {
  return (
    <div className={styles.page}>
      <AnnouncementBar message="ตัวเลขในหน้านี้คำนวณสดทุกครั้งที่มี order ใหม่ ไม่ต้องกดรีเฟรช" />

      <div className={styles.shell}>
        <DashboardSidebar />
        <main className={styles.content}>{children}</main>
        {asideSlot}
      </div>
    </div>
  );
}
