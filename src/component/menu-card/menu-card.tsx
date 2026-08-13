"use client";

import { UnstyledButton } from "@mantine/core";
import { formatCurrency } from "@/lib/expense/group-by-week";
import type { MenuItem } from "@/lib/menu/types";
import styles from "./menu-card.module.css";

interface MenuCardProps {
  item: MenuItem;
  isSelected?: boolean;
  isTopSeller?: boolean;
  onClick: () => void;
}

// A compact Kanban-style menu card. The card keeps the information hierarchy
// visible without a thumbnail so the board remains scannable at narrow widths.
export default function MenuCard({
  item,
  isSelected = false,
  isTopSeller = false,
  onClick,
}: MenuCardProps) {
  const status = isTopSeller ? "ขายดี" : "พร้อมขาย";
  const ingredientPreview = item.ingredients.slice(0, 2).join(" · ");
  const optionSummary = item.optionGroups.length > 0
    ? `${item.optionGroups.length} กลุ่มตัวเลือก`
    : "ไม่มีตัวเลือก";
  const cardClassName = isSelected
    ? `${styles.card} ${styles.cardSelected}`
    : styles.card;

  return (
    <UnstyledButton
      className={cardClassName}
      onClick={onClick}
      aria-label={`เปิดรายละเอียดเมนู ${item.name}`}
      aria-pressed={isSelected}
    >
      <div className={styles.cardTop}>
        <span
          className={`${styles.statusBadge} ${isTopSeller ? styles.statusFeatured : ""}`}
        >
          {status}
        </span>
        <span className={styles.menuCode}>{item.id}</span>
      </div>

      <span className={styles.name}>{item.name}</span>
      <span className={styles.description}>
        {ingredientPreview || "ยังไม่มีรายละเอียดวัตถุดิบ"}
      </span>

      <div className={styles.detailRow}>
        <span className={styles.detailLabel}>ราคาขาย</span>
        <span className={styles.price}>฿{formatCurrency(item.price)}</span>
      </div>

      <div className={styles.meta}>
        <span>วัตถุดิบ {item.ingredients.length} รายการ</span>
        <span>{optionSummary}</span>
      </div>
    </UnstyledButton>
  );
}
