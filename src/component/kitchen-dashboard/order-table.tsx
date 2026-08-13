"use client";

import { formatCurrency } from "@/lib/expense/group-by-week";
import type { ComputedOrder } from "@/lib/kitchen-dashboard/types";
import styles from "./order-table.module.css";

interface OrderTableProps {
  orders: ComputedOrder[];
  limit?: number;
  forecast?: boolean;
}

function formatTime(t: number): string {
  return new Date(t).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatUsage(order: ComputedOrder): string {
  return order.ingredientUsage
    .map((u) => `${u.ingredientName} ${u.qty.toLocaleString("th-TH", { maximumFractionDigits: 1 })}${u.unit}`)
    .join(", ");
}

// No status column — every row here is an order the engine already
// finished computing the moment it was recorded (see the scope note in
// lib/kitchen-dashboard/types.ts), so there is no "pending/done" state to
// show. Newest first.
export default function OrderTable({ orders, limit = 25, forecast = false }: OrderTableProps) {
  const rows = [...orders].reverse().slice(0, limit);

  return (
    <div className={`${styles.card} ${forecast ? styles.forecastReference : ""}`}>
      <div className={styles.head}>
        <h3 className={styles.title}>รายการ order ที่ประมวลผลแล้ว</h3>
        <span className={styles.subtitle}>ล่าสุด {rows.length} รายการ</span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>เมนู</th>
              <th>วัตถุดิบที่หักจาก stock</th>
              <th className={styles.numCol}>ราคาขาย</th>
              <th className={styles.numCol}>ต้นทุน</th>
              <th className={styles.numCol}>กำไร</th>
              <th className={styles.numCol}>เวลาประมวลผล</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id}>
                <td className={styles.orderId}>{order.id}</td>
                <td className={styles.menuCell}>{order.menuLabel}</td>
                <td className={styles.usageCell} title={formatUsage(order)}>
                  {formatUsage(order)}
                </td>
                <td className={styles.numCol}>฿{formatCurrency(order.revenue)}</td>
                <td className={styles.numCol}>฿{formatCurrency(order.cost)}</td>
                <td
                  className={`${styles.numCol} ${
                    order.profit > 0
                      ? styles.profitPositive
                      : order.profit < 0
                        ? styles.profitNegative
                        : ""
                  }`}
                >
                  ฿{formatCurrency(order.profit)}
                </td>
                <td className={styles.numCol}>{formatTime(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className={styles.empty}>ยังไม่มี order ที่ประมวลผล</p>}
      </div>
    </div>
  );
}
