"use client";

import { useEffect, useRef } from "react";
import { UnstyledButton } from "@mantine/core";
import Icon from "@/component/icon/icon";
import OrderImagePanel from "@/component/order-detail/order-image-panel";
import OrderInfoPanel from "@/component/order-detail/order-info-panel";
import OrderItemsPanel from "@/component/order-detail/order-items-panel";
import type { ExpenseItem } from "@/lib/expense/types";
import styles from "./order-detail-panel.module.css";

interface OrderDetailPanelProps {
  order: ExpenseItem | null;
  onClose: () => void;
}

// Right-side sliding panel (same sticky/flex-sibling mechanism as
// ExpenseUploadPanel — see that file's own comment for why) instead of a
// separate page: order slip photo up top, then order-level facts, then the
// item breakdown with toppings and the running total, in one continuous
// scroll — no tabs. Opening this closes ExpenseUploadPanel (see
// home/page.tsx's mutual-exclusion handlers) since both panels squeeze
// <main> the same way and stacking their widths over-compresses it; the
// AI chat panel is a separate fixed overlay or its own layer, so it's
// deliberately left alone.
export default function OrderDetailPanel({ order, onClose }: OrderDetailPanelProps) {
  const opened = order !== null;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!opened) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      previousFocusRef.current?.focus();
    };
  }, [opened, onClose]);

  return (
    <>
      <div className={opened ? `${styles.slot} ${styles.slotOpen}` : styles.slot} />
      <button
        type="button"
        className={opened ? `${styles.scrim} ${styles.scrimOpen}` : styles.scrim}
        aria-label="ปิดรายละเอียดออเดอร์"
        tabIndex={opened ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={opened ? `${styles.panel} ${styles.panelOpen}` : styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={order ? `order-detail-title-${order.id}` : undefined}
        aria-hidden={!opened}
        inert={!opened}
      >
        <div className={styles.inner}>
          {order && (
            <>
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <Icon src="/icon/regular/receipt.svg" size={18} />
                  <div>
                    <span className={styles.headerLabel}>รายละเอียดออเดอร์</span>
                    <span className={styles.kicker}>{order.orderNumber}</span>
                  </div>
                </div>
                <UnstyledButton
                  ref={closeButtonRef}
                  onClick={onClose}
                  aria-label="ปิดรายละเอียดออเดอร์"
                  className={styles.closeButton}
                >
                  <Icon src="/icon/regular/x.svg" size={18} />
                </UnstyledButton>
              </div>

              <div className={styles.body}>
                <h2 id={`order-detail-title-${order.id}`} className={styles.orderTitle}>
                  {order.description || `ออเดอร์ ${order.orderNumber}`}
                </h2>

                <OrderImagePanel
                  orderNumber={order.orderNumber}
                  imageUrl={order.imageUrl}
                />

                <section className={styles.section} aria-labelledby="order-info-heading">
                  <h3 id="order-info-heading" className={styles.sectionLabel}>ข้อมูลออเดอร์</h3>
                  <OrderInfoPanel order={order} />
                </section>

                <section className={styles.section} aria-labelledby="order-items-heading">
                  <h3 id="order-items-heading" className={styles.sectionLabel}>
                    รายการอาหารและสรุปยอด
                  </h3>
                  <OrderItemsPanel order={order} />
                </section>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
