"use client";

import type { ReactNode } from "react";
import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  Badge,
  Box,
  Burger,
  Drawer,
  Group,
  Image,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import styles from "./dashboard-sidebar.module.css";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface TodoItem {
  label: string;
  href: string;
  badge?: string;
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

// Every task is a real deep link so the prototype never presents a dead row.
const TODOS: TodoItem[] = [
  {
    label: "ใบออร์เดอร์รอตรวจทาน",
    href: "/home?view=review#order-list",
    badge: "ดู",
    icon: "/icon/regular/list-checks.svg",
  },
  {
    label: "ภาพรวมงานวันนี้",
    href: "/dashboard#today-orders",
    icon: "/icon/regular/pencil-simple.svg",
  },
];

const USAGE_STATS: UsageStat[] = [
  {
    icon: "/icon/regular/receipt.svg",
    label: "ใบออร์เดอร์ที่ประมวลผล",
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
    label: "ภาพรวมสด",
    href: "/dashboard",
    icon: "/icon/regular/gauge.svg",
  },
  {
    label: "ออร์เดอร์ลูกค้า",
    href: "/home",
    icon: "/icon/regular/receipt.svg",
  },
  {
    label: "เมนูและวัตถุดิบ",
    href: "/menu",
    icon: "/icon/regular/fork-knife.svg",
  },
];

const BUSINESS_NAV: NavItem[] = [
  {
    label: "ผู้ใช้ในธุรกิจของฉัน",
    href: "/home/team",
    icon: "/icon/regular/user.svg",
  },
];

function NavigationPending() {
  const { pending } = useLinkStatus();

  if (!pending) return null;

  return (
    <span className={styles.navPending} role="status" aria-live="polite">
      <span className={styles.navPendingSpinner} aria-hidden="true" />
      <span className={styles.navPendingText}>กำลังเปิด</span>
    </span>
  );
}

function NavRow({
  item,
  afterNavigate,
}: {
  item: NavItem;
  /** Closes the mobile drawer only after a real navigation link is used. */
  afterNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === item.href;

  const rowClassName = isActive
    ? `${styles.navRow} ${styles.navRowActive}`
    : styles.navRow;

  return (
    <Link
      href={item.href}
      prefetch
      className={rowClassName}
      onClick={afterNavigate}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon src={item.icon} size={18} />
      <span className={styles.navLabel}>{item.label}</span>
      <NavigationPending />
    </Link>
  );
}

// Shared guts, rendered both inside the persistent desktop rail and inside
// the mobile Drawer — one source of truth for the nav data and markup.
function SidebarContent({ afterNavigate }: { afterNavigate?: () => void }) {
  return (
    <>
      <div className={styles.businessCard}>
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
      </div>

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
              <Link
                key={todo.label}
                href={todo.href}
                prefetch
                className={styles.todoRow}
                onClick={afterNavigate}
              >
                <Icon src={todo.icon} size={16} />
                <span className={styles.navLabel}>{todo.label}</span>
                {todo.badge && (
                  <Badge size="sm" variant="light" color="blue" radius="sm">
                    {todo.badge}
                  </Badge>
                )}
                <NavigationPending />
              </Link>
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
