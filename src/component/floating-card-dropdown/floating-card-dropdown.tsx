"use client";

import Link from "next/link";
import { Box, Center, HoverCard, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./floating-card-dropdown.module.css";

export interface FloatingCardDropdownItem {
  label: string;
  href: string;
}

interface FloatingCardDropdownProps {
  label: string;
  href: string;
  items: FloatingCardDropdownItem[];
  /** Class applied to the trigger link — pass the caller's own link style. */
  triggerClassName?: string;
}

// A floating Card (Mantine HoverCard) held apart from its trigger by a
// visible gap, so it reads as its own detached panel rather than an
// attached menu. Holds a plain list of links — each row fills lavender
// (brand-0) on hover.
export default function FloatingCardDropdown({
  label,
  href,
  items,
  triggerClassName,
}: FloatingCardDropdownProps) {
  return (
    <HoverCard
      width={240}
      position="bottom-start"
      offset={12}
      radius="md"
      shadow="md"
      openDelay={80}
      closeDelay={120}
      withinPortal
    >
      <HoverCard.Target>
        <Link href={href} className={triggerClassName}>
          <Center inline>
            <Box component="span" mr={8}>
              {label}
            </Box>
            <Icon src="/icon/regular/caret-down.svg" size={12} />
          </Center>
        </Link>
      </HoverCard.Target>

      <HoverCard.Dropdown className={styles.dropdown} p={8}>
        {items.map((item) => (
          <UnstyledButton
            component={Link}
            href={item.href}
            key={item.label}
            className={styles.subLink}
          >
            {item.label}
          </UnstyledButton>
        ))}
      </HoverCard.Dropdown>
    </HoverCard>
  );
}
