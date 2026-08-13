import { formatThaiDate } from "@/lib/expense/group-by-week";
import { ORDER_TYPE_LABELS, type ExpenseItem } from "@/lib/expense/types";
import styles from "./order-info-panel.module.css";

interface OrderInfoPanelProps {
  order: ExpenseItem;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.row}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowValue}>{value}</span>
    </div>
  );
}

// เลขที่ order/ใบเสร็จ, วันที่-เวลา, ชื่อคนสั่ง, ประเภทออเดอร์ — everything about
// *this* order that isn't a line item lives here; the item breakdown and
// totals are OrderItemsPanel's job. Plain label/value rows, no per-row
// icon — the label text already identifies the field on its own.
export default function OrderInfoPanel({ order }: OrderInfoPanelProps) {
  const orderedTime = order.orderedAt?.slice(11, 16) || order.uploadedAt || "ไม่ระบุเวลา";

  return (
    <div className={styles.grid}>
      <InfoRow label="เลขที่ order / ใบเสร็จ" value={order.orderNumber} />
      <InfoRow
        label="วันที่-เวลา"
        value={`${formatThaiDate(order.date)} · ${orderedTime}`}
      />
      <InfoRow label="ชื่อคนสั่ง" value={order.customerName ?? "ไม่ทราบชื่อ"} />
      <InfoRow label="ประเภทออเดอร์" value={ORDER_TYPE_LABELS[order.orderType]} />
      <InfoRow label="พนักงานที่อัปโหลด" value={order.uploadedBy} />
      <InfoRow label="รายละเอียดจากใบสั่ง" value={order.description} />
    </div>
  );
}
