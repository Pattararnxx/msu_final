"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Badge,
  Box,
  Burger,
  Collapse,
  Drawer,
  Group,
  Image,
  ScrollArea,
  Stack,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import styles from "./dashboard-sidebar.module.css";

interface NavChild {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  children?: NavChild[];
}

interface TodoItem {
  label: string;
  count: number;
  icon: string;
}

interface UsageStat {
  icon: string;
  label: string;
  value: string;
}

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

// Gregorian year (not Buddhist era) to match the "2026" used elsewhere in
// this dashboard (e.g. the yearly expense total) — Intl's th-TH locale
// would otherwise silently switch to พ.ศ. and read inconsistently.
function formatThaiDate(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// Wording is placeholder — swap for the real business name, plan, and route
// hrefs once account switching and routing exist. Structure (usage summary →
// to-dos → primary nav → business-management nav) mirrors the reference
// layout; icons are Phosphor, not baked-in art.
const TODOS: TodoItem[] = [
  { label: "งานที่ต้องทำ", count: 0, icon: "/icon/regular/pencil-simple.svg" },
  {
    label: "งานที่ต้องตรวจสอบ/จัดการ",
    count: 19,
    icon: "/icon/regular/list-checks.svg",
  },
];

const USAGE_STATS: UsageStat[] = [
  {
    icon: "/icon/regular/receipt.svg",
    label: "ใบเสร็จที่ใช้ไป",
    value: "10/100",
  },
  { icon: "/icon/regular/users.svg", label: "ผู้ใช้งาน", value: "3" },
  {
    icon: "/icon/regular/files.svg",
    label: "พื้นที่จัดเก็บ",
    value: "1/1,000",
  },
];

const PRIMARY_NAV: NavItem[] = [
  {
    label: "รายจ่าย",
    href: "/home",
    icon: "/icon/regular/receipt.svg",
  },
  {
    label: "รายรับ",
    href: "#",
    icon: "/icon/regular/coin.svg",
    badge: "เวอร์ชันทดลอง",
    children: [
      { label: "เอกสารรายงานเงิน", href: "#" },
      { label: "เมนูอาหารของฉัน", href: "#" },
      { label: "ลูกค้าของฉัน", href: "#" },
    ],
  },
];

const BUSINESS_NAV: NavItem[] = [
  {
    label: "ผู้ใช้ในธุรกิจของฉัน",
    href: "/home/team",
    icon: "/icon/regular/user.svg",
  },
  {
    label: "ผู้อนุญาตเบิกจ่าย",
    href: "#",
    icon: "/icon/regular/user-check.svg",
  },
  { label: "หมวดหมู่", href: "#", icon: "/icon/regular/tag.svg" },
  { label: "กระเป๋าของฉัน", href: "#", icon: "/icon/regular/wallet.svg" },
];

function NavRow({
  item,
  active,
  afterNavigate,
}: {
  item: NavItem;
  /** Computed from the current pathname by SidebarContent, not stored on
      the nav data itself — one source of truth (the URL) instead of data
      that could drift out of sync with which page is actually open. */
  active: boolean;
  /** Only wired to actual navigation links, not the expand toggle — see
      the mobile Drawer's onClick note on SidebarContent below. */
  afterNavigate?: () => void;
}) {
  const [opened, setOpened] = useState(Boolean(active && item.children));

  const rowClassName = active
    ? `${styles.navRow} ${styles.navRowActive}`
    : styles.navRow;

  if (!item.children) {
    return (
      <Link href={item.href} className={rowClassName} onClick={afterNavigate}>
        <Icon src={item.icon} size={18} />
        <span className={styles.navLabel}>{item.label}</span>
      </Link>
    );
  }

  return (
    <Box>
      <UnstyledButton
        className={rowClassName}
        onClick={() => setOpened((v) => !v)}
        aria-expanded={opened}
      >
        <Icon src={item.icon} size={18} />
        <span className={styles.navLabel}>{item.label}</span>
        {item.badge && (
          <Badge
            size="xs"
            variant="light"
            color="brand"
            className={styles.trialBadge}
          >
            {item.badge}
          </Badge>
        )}
        <span className={opened ? styles.caretOpen : styles.caret}>
          <Icon src="/icon/regular/caret-down.svg" size={14} />
        </span>
      </UnstyledButton>
      <Collapse expanded={opened}>
        <Stack gap={2} className={styles.navChildren}>
          {item.children.map((child) => (
            <Link
              key={child.label}
              href={child.href}
              className={styles.navChildLink}
              onClick={afterNavigate}
            >
              {child.label}
            </Link>
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}

// Shared guts, rendered both inside the persistent desktop rail and inside
// the mobile Drawer — one source of truth for the nav data and markup.
function SidebarContent({ afterNavigate }: { afterNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <UnstyledButton className={styles.businessCard}>
        <Image
          src="/logo/init_logo.svg"
          alt="โจ๊กป้าแดง"
          h={36}
          w="auto"
          fit="contain"
          mb={2}
          className={styles.businessLogo}
        />
        <span className={styles.businessDate}>
          {formatThaiDate(new Date())}
        </span>
      </UnstyledButton>

      <Group gap={8} className={styles.usageRow}>
        <Badge size="sm" variant="filled" color="dark" radius="sm">
          Pro
        </Badge>
        {USAGE_STATS.map((stat) => (
          <Group
            key={stat.label}
            gap={4}
            className={styles.usageStat}
            title={stat.label}
          >
            <Icon src={stat.icon} size={13} />
            <span>{stat.value}</span>
          </Group>
        ))}
      </Group>

      <Box className={styles.scrollArea}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>To-do ของฉัน</span>
          <Stack gap={2}>
            {TODOS.map((todo) => (
              <UnstyledButton key={todo.label} className={styles.todoRow}>
                <Icon src={todo.icon} size={16} />
                <span className={styles.navLabel}>{todo.label}</span>
                <Badge
                  size="sm"
                  variant="light"
                  color={todo.count > 0 ? "red" : "gray"}
                  circle
                >
                  {todo.count}
                </Badge>
              </UnstyledButton>
            ))}
          </Stack>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>เมนูลัด</span>
          <Stack gap={2}>
            {PRIMARY_NAV.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                active={pathname === item.href}
                afterNavigate={afterNavigate}
              />
            ))}
          </Stack>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionLabel}>จัดการธุรกิจ</span>
          <Stack gap={2}>
            {BUSINESS_NAV.map((item) => (
              <NavRow
                key={item.label}
                item={item}
                active={pathname === item.href}
                afterNavigate={afterNavigate}
              />
            ))}
          </Stack>
        </div>
      </Box>
    </>
  );
}

// Wraps SidebarContent for two contexts: a sticky full-height rail from
// 960px up, and a burger-triggered Drawer below it — same nav, same data,
// so mobile never loses access to it (only the desktop rail is display:none
// below the breakpoint, never the nav itself).
export default function DashboardSidebar(): ReactNode {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure(false);

  return (
    <>
      <Box component="nav" className={styles.sidebar} aria-label="เมนูหลัก">
        <SidebarContent />
      </Box>

      <Box component="header" className={styles.mobileBar}>
        <span className={styles.mobileBrand}>โจ๊กป้าแดง</span>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          aria-label={mobileOpened ? "ปิดเมนู" : "เปิดเมนู"}
        />
      </Box>

      {/* Slides straight down from the top edge instead of in from the
          side, and sizes to its content (not the full viewport) so the
          page underneath stays visible below it — same pattern as the
          marketing navbar's mobile drawer, see navbar.tsx. No logo mark
          here — text-only brand, per request. */}
      <Drawer
        opened={mobileOpened}
        onClose={closeMobile}
        position="top"
        size="auto"
        title={<span className={styles.mobileDrawerBrandName}>โจ๊กป้าแดง</span>}
        zIndex={1000}
        classNames={{
          content: styles.mobileDrawerContent,
          header: styles.mobileDrawerHeader,
          close: styles.mobileDrawerClose,
          body: styles.mobileDrawerBody,
        }}
      >
        <ScrollArea.Autosize mah="calc(100dvh - 72px)">
          <SidebarContent afterNavigate={closeMobile} />
        </ScrollArea.Autosize>
      </Drawer>
    </>
  );
}
