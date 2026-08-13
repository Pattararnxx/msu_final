"use client";

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

  return (
    <aside
      className={opened ? `${styles.panel} ${styles.panelOpen}` : styles.panel}
      aria-label="รายละเอียดออเดอร์"
      aria-hidden={!opened}
      inert={!opened}
    >
      <div className={styles.inner}>
        {order && (
          <>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <Icon src="/icon/regular/check-square.svg" size={18} />
                <span className={styles.kicker}>{order.orderNumber}</span>
              </div>
              <div className={styles.headerActions}>
                <span className={styles.headerIconButton} aria-hidden="true">
                  <Icon src="/icon/regular/arrow-square-out.svg" size={16} />
                </span>
                <UnstyledButton
                  onClick={onClose}
                  aria-label="ปิด"
                  className={`${styles.headerIconButton} ${styles.closeButton}`}
                >
                  <Icon src="/icon/regular/x.svg" size={16} />
                </UnstyledButton>
              </div>
            </div>

            <div className={styles.body}>
              <h2 className={styles.orderTitle}>{order.description}</h2>

              <OrderImagePanel orderNumber={order.orderNumber} />

              <div className={styles.section}>
                <span className={styles.sectionLabel}>ข้อมูลออเดอร์</span>
                <OrderInfoPanel order={order} />
              </div>

              <div className={styles.section}>
                <span className={styles.sectionLabel}>รายการอาหารและสรุปยอด</span>
                <OrderItemsPanel order={order} />
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
