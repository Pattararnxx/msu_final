"use client";

import Link from "next/link";
import {
  Box,
  Burger,
  Button,
  Collapse,
  Drawer,
  Group,
  ScrollArea,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import FloatingCardDropdown from "@/component/floating-card-dropdown/floating-card-dropdown";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import styles from "./navbar.module.css";

interface NavSubLink {
  label: string;
  href: string;
}

interface NavLink {
  label: string;
  href: string;
  items?: NavSubLink[];
  /** Highlights this item in the mobile drawer, like the reference design's current-page link */
  active?: boolean;
}

// Wording is a placeholder — swap for real copy when it's ready.
const NAV_LINKS: NavLink[] = [
  {
    label: "ไฮไลท์",
    href: "#",
    active: true,
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
  const linkClassName = link.active
    ? `${styles.mobileLink} ${styles.mobileLinkActive}`
    : styles.mobileLink;

  if (!link.items) {
    return (
      <Link href={link.href} className={linkClassName}>
        {link.label}
      </Link>
    );
  }

  return (
    <>
      <UnstyledButton
        className={linkClassName}
        onClick={toggle}
        aria-expanded={opened}
      >
        {link.label}
        <span className={styles.mobileLinkCaret}>
          <Icon src="/icon/regular/caret-down.svg" size={14} />
        </span>
      </UnstyledButton>
      <Collapse expanded={opened}>
        <div className={styles.mobileSubList}>
          {link.items.map((item) => (
            <Link href={item.href} key={item.label} className={styles.mobileSubLink}>
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
      <Group justify="space-between" h="100%" wrap="nowrap" className={styles.inner}>
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
          <Button
            radius={128}
            visibleFrom="lg"
            onClick={toggleChatbot}
            aria-expanded={chatbotOpened}
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

      {/* Slides straight down from the top edge instead of in from the side,
          and sizes to its content (not the full viewport) so the page
          underneath stays visible below it — matches the reference design. */}
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="top"
        size="auto"
        title={
          <Link href="/" className={styles.drawerBrand} onClick={closeDrawer}>
            Better
          </Link>
        }
        hiddenFrom="lg"
        zIndex={1000}
        classNames={{
          content: styles.drawerContent,
          header: styles.drawerHeader,
          title: styles.drawerTitle,
          close: styles.drawerClose,
          body: styles.drawerBody,
        }}
      >
        <ScrollArea.Autosize mah="calc(100dvh - 80px)">
          {NAV_LINKS.map((link) => (
            <MobileLink key={link.label} link={link} />
          ))}
          <Group justify="center" grow mt="xl">
            <Button
              radius={128}
              aria-expanded={chatbotOpened}
              onClick={() => {
                closeDrawer();
                toggleChatbot();
              }}
            >
              ดาวน์โหลด
            </Button>
          </Group>
        </ScrollArea.Autosize>
      </Drawer>
    </Box>
  );
}
