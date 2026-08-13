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
  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {order.items.map((item, index) => {
          const lineTotal = item.qty * item.unitPrice;
          return (
            <li key={`${item.menuName}-${index}`} className={styles.item}>
              <div className={styles.itemHead}>
                <span className={styles.menuName}>{item.menuName}</span>
                <span className={styles.qty}>x{item.qty}</span>
                <span className={styles.lineTotal}>฿{formatCurrency(lineTotal)}</span>
              </div>
              <span className={styles.unitPrice}>
                ฿{formatCurrency(item.unitPrice)} / หน่วย
              </span>

              {item.toppings.length > 0 && (
                <div className={styles.toppings}>
                  {item.toppings.map((topping) => (
                    <Badge
                      key={topping.name}
                      size="sm"
                      variant="light"
                      color="gray"
                      radius="sm"
                    >
                      {topping.name}
                      {topping.qty > 1 ? ` x${topping.qty}` : ""}
                    </Badge>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>จำนวนรายการ</span>
          <span>{order.items.length} เมนู</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
          <span>ยอดรวมค่าใช้จ่าย</span>
          <span>฿{formatCurrency(order.amount)}</span>
        </div>
      </div>
    </div>
  );
}
