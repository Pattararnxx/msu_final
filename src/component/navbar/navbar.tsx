"use client";

import Link from "next/link";
import {
  Box,
  Burger,
  Button,
  Collapse,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import FloatingCardDropdown from "@/component/floating-card-dropdown/floating-card-dropdown";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import styles from "./navbar.module.scss";

interface NavSubLink {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  items?: NavSubLink[];
}

// Wording is a placeholder — swap for real copy when it's ready.
const NAV_LINKS: NavLink[] = [
  {
    label: "ไฮไลท์",
    href: "#",
    items: [
      { label: "หน้าหลัก", href: "#" },
      { label: "สินเชื่อ", href: "#" },
      { label: "เงินฝาก", href: "#" },
    ],
  },
  { label: "ผลิตภัณฑ์", href: "#" },
  { label: "โปรโมชั่น", href: "#" },
  { label: "Better Tips", href: "#" },
  { label: "ช่วยเหลือ", href: "#" },
];

// Desktop dropdown lives in its own component — see FloatingCardDropdown.
function DesktopLink({ link }: { link: NavLink }) {
  if (!link.items) {
    return (
      <Link href={link.href} className={styles.link}>
        {link.label}
      </Link>
    );
  }

  return (
    <FloatingCardDropdown
      label={link.label}
      href={link.href}
      items={link.items}
      triggerClassName={styles.link}
    />
  );
}

// Mobile drawer: same data, rendered as a flat link or a Collapse accordion.
function MobileLink({ link }: { link: NavLink }) {
  const [opened, { toggle }] = useDisclosure(false);

  if (!link.items) {
    return (
      <Link href={link.href} className={styles.mobileLink}>
        {link.label}
      </Link>
    );
  }

  return (
    <>
      <UnstyledButton
        className={styles.mobileLink}
        onClick={toggle}
        aria-expanded={opened}
      >
        {link.label}
        <Icon src="/icon/regular/caret-down.svg" size={14} />
      </UnstyledButton>
      <Collapse expanded={opened}>
        <div className={styles.mobileSubList}>
          {link.items.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className={styles.mobileSubLink}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Collapse>
    </>
  );
}

export default function Navbar() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const { opened: chatbotOpened, toggle: toggleChatbot } = useChatbot();

  return (
    <Box component="header" className={styles.navbar}>
      <Group
        justify="space-between"
        h="100%"
        wrap="nowrap"
        className={styles.inner}
      >
        {/* Logo intentionally left out — placeholder mark until brand assets are ready */}
        <Link href="/" className={styles.brand}>
          Better
        </Link>

        <Group h="100%" gap={4} visibleFrom="lg" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <DesktopLink key={link.label} link={link} />
          ))}
        </Group>

        <Group wrap="nowrap" gap="sm">
          {/* เปลี่ยนสีปุ่มดาวน์โหลดเป็นสีเหลือง (primary-500) แทนสี brand เดิม ดู .downloadButton ใน navbar.module.scss */}
          <Button
            radius={128}
            visibleFrom="lg"
            onClick={toggleChatbot}
            aria-expanded={chatbotOpened}
            className={styles.downloadButton}
          >
            ดาวน์โหลด
          </Button>
          <Burger
            opened={drawerOpened}
            onClick={toggleDrawer}
            hiddenFrom="lg"
            aria-label={drawerOpened ? "ปิดเมนู" : "เปิดเมนู"}
          />
        </Group>
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="เมนู"
        hiddenFrom="lg"
        zIndex={1000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider mb="sm" />
          {NAV_LINKS.map((link) => (
            <MobileLink key={link.label} link={link} />
          ))}
          <Group justify="center" grow py="xl" px="md">
            {/* ปุ่มดาวน์โหลดในเมนูมือถือ — ใช้สีเหลืองเดียวกับปุ่มบน desktop */}
            <Button
              radius={128}
              aria-expanded={chatbotOpened}
              onClick={() => {
                closeDrawer();
                toggleChatbot();
              }}
              className={styles.downloadButton}
            >
              ดาวน์โหลด
            </Button>
          </Group>
        </ScrollArea>
      </Drawer>
    </Box>
  );
}
