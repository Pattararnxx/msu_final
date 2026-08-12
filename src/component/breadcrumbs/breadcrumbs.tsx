"use client";

import Link from "next/link";
import { Breadcrumbs as MantineBreadcrumbs, Anchor } from "@mantine/core";
import styles from "./breadcrumbs.module.css";

export interface BreadcrumbItem {
  label: string;
  /** Omit on the last/current item — it renders as plain text, not a link. */
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <MantineBreadcrumbs separator="/" className={styles.breadcrumbs}>
      {items.map((item) =>
        item.href ? (
          <Anchor
            component={Link}
            href={item.href}
            key={item.label}
            className={styles.link}
          >
            {item.label}
          </Anchor>
        ) : (
          <span key={item.label} className={styles.current} aria-current="page">
            {item.label}
          </span>
        ),
      )}
    </MantineBreadcrumbs>
  );
}
