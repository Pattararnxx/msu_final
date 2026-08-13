"use client";

import { Badge, UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import { CATEGORY_META, type MenuItem } from "@/lib/menu/types";
import { formatCurrency } from "@/lib/expense/group-by-week";
import styles from "./menu-card.module.css";

interface MenuCardProps {
  item: MenuItem;
  isSelected?: boolean;
  isTopSeller?: boolean;
  onClick: () => void;
}

// Keep the image intentionally compact so the board stays scannable like a
// Jira card. MenuItem.image is still the restaurant's future upload slot;
// until then it points at a matching Phosphor icon.
export default function MenuCard({ item, isSelected = false, isTopSeller = false, onClick }: MenuCardProps) {
  const category = CATEGORY_META[item.category];
  const cardClassName = isSelected ? `${styles.card} ${styles.cardSelected}` : styles.card;

  return (
    <UnstyledButton className={cardClassName} onClick={onClick} aria-label={`เปิดรายละเอียด ${item.name}`}>
      <div className={styles.cardMain}>
        <div className={styles.thumbnail} data-color={category.color} aria-hidden="true">
          <Icon src={item.image} size={22} />
        </div>
        <div className={styles.copy}>
          <span className={styles.name}>{item.name}</span>
          <span className={styles.price}>฿{formatCurrency(item.price)}</span>
        </div>
      </div>

      <div className={styles.meta}>
        <span>{item.id}</span>
        <span className={styles.metaSpacer} />
        {isTopSeller && (
          <Badge size="xs" variant="light" color="yellow" className={styles.topSellerBadge}>
            ขายดี
          </Badge>
        )}
        <span>{item.optionGroups.length > 0 ? `${item.optionGroups.length} ตัวเลือก` : "ไม่มีตัวเลือก"}</span>
      </div>
    </UnstyledButton>
  );
}
