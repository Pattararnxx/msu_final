"use client";

import type { ReactNode } from "react";
import Sidebar from "./sidebar";
import styles from "./sidebar-shell.module.css";

interface SidebarShellProps {
  /** Main page content */
  children: ReactNode;
  /** What to render inside the sidebar panel when it's open */
  sidebarContent: ReactNode;
  sidebarTitle?: string;
}

// Lays the page out as a flex row so the sidebar panel is a real sibling of
// the main content — inserted/removed from the layout (not a modal, not
// position:absolute/fixed) and pushing the content over from the right
// rather than covering it. Mirrors ChatbotShell + Chatbot, generalized so
// any content component can be dropped in via `sidebarContent`.
export default function SidebarShell({
  children,
  sidebarContent,
  sidebarTitle,
}: SidebarShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
      <Sidebar title={sidebarTitle}>{sidebarContent}</Sidebar>
    </div>
  );
}
