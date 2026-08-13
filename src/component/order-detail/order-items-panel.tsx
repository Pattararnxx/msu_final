import { Badge } from "@mantine/core";
import { formatCurrency } from "@/lib/expense/group-by-week";
import type { ExpenseItem } from "@/lib/expense/types";
import styles from "./order-items-panel.module.css";

interface OrderItemsPanelProps {
  order: ExpenseItem;
}

// รายการอาหาร, จำนวน, ราคาต่อหน่วย, ราคารวมต่อรายการ, และ topping ของแต่ละรายการ
// พร้อมจำนวน — one card per dish, toppings listed underneath it since a
// topping belongs to the specific line it modifies, not the order as a
// whole. `amount` (the grand total) is never re-typed here — it's read
// straight off `order`, which is itself always Σ qty × unitPrice (see
// mock-data.ts's withAmount), so this summary can never drift from the
// line items above it.
export default function OrderItemsPanel({ order }: OrderItemsPanelProps) {
  const safeNumber = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

  const itemTotal = (item: ExpenseItem["items"][number]) => {
    const configuredTotal = safeNumber(item.totalPrice);
    if (configuredTotal !== null) return configuredTotal;

    const unitPrice = safeNumber(item.unitPrice) ?? 0;
    const quantity = safeNumber(item.quantity) ?? 0;
    return unitPrice * quantity;
  };

  const calculatedTotal = order.items.reduce(
    (sum, item) => sum + itemTotal(item),
    0,
  );
  const grandTotal = safeNumber(order.amount) ?? calculatedTotal;

  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {order.items.map((item, index) => {
          const lineTotal = itemTotal(item);
          const unitPrice = safeNumber(item.unitPrice);
          return (
            <li key={item.lineId || `${item.menuItemName}-${index}`} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.menuName}>{item.menuItemName || "เมนูที่ต้องตรวจ"}</span>
                <span className={styles.qty}>x{safeNumber(item.quantity) ?? 0}</span>
                <span className={styles.lineTotal}>฿{formatCurrency(lineTotal)}</span>
              </div>
              <span className={styles.unitPrice}>
                {unitPrice === null
                  ? "รอระบุราคาจากเมนูร้าน"
                  : `฿${formatCurrency(unitPrice)} / ${item.unit || "หน่วย"}`}
              </span>

              {item.toppings.length > 0 && (
                <div className={styles.toppings}>
                  {item.toppings.map((topping, toppingIndex) => (
                    <Badge
                      key={topping.id || `${topping.name}-${toppingIndex}`}
                      size="sm"
                      variant="light"
                      color="gray"
                      radius="sm"
                    >
                      {topping.name}
                      {topping.quantity > 1 ? ` x${topping.quantity}` : ""}
                    </Badge>
                  ))}
                </div>
              )}
              {item.notes && <span className={styles.notes}>{item.notes}</span>}
            </li>
          );
        })}
      </ul>

      {order.items.length === 0 && (
        <p className={styles.empty}>ยังไม่มีรายการอาหารในออเดอร์นี้</p>
      )}

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>จำนวนรายการ</span>
          <span>{order.items.length} เมนู</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>ยอดรวมค่าใช้จ่าย</span>
          <span>฿{formatCurrency(grandTotal)}</span>
        </div>
      </div>
    </div>
  );
}
