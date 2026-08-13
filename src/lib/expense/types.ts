// "อาหาร" values instead of a generic document kind — reused by
// ExpenseUploadPanel's own draft form too, so the order list and the
// upload flow agree on what a food type is.
export type FoodType = "ข้าวต้ม" | "โจ๊ก" | "ก๋วยจั๊บ" | "อื่นๆ";

// Still used by ExpenseUploadPanel's own draft form — the order list
// itself no longer shows a payment-status column or filter.
export type PaymentStatus = "จ่ายแล้ว" | "รอจ่าย" | "ยกเลิก";

export type OrderType = "ทานที่ร้าน" | "เดลิเวอรี่" | "กลับบ้าน";

/** A modifier attached to one order line, e.g. "ไข่ลวก" x1 on a bowl of ข้าวต้ม. */
export interface OrderTopping {
  name: string;
  qty: number;
}

/** One dish within an order — what the order-detail page's item table reads from. */
export interface OrderLineItem {
  menuName: string;
  qty: number;
  /** บาทต่อหน่วย, from the shop's own price list — never invented by AI. */
  unitPrice: number;
  toppings: OrderTopping[];
}

export interface ExpenseItem {
  id: string;
  /** ISO date, e.g. "2026-04-16" */
  date: string;
  /**
   * The customer's name, when the order photo actually shows one.
   * Absent for table numbers / delivery-platform orders — the UI falls
   * back to "ไม่ทราบชื่อ" rather than leaving the cell blank.
   */
  customerName?: string;
  description: string;
  /** Time the order photo was uploaded, e.g. "07:42" */
  uploadedAt: string;
  /** Staff member who uploaded the order photo, e.g. "แม่ครัวใหญ่ สมศรี" */
  uploadedBy: string;
  /** Order/receipt number as it would appear on the slip, e.g. "OR-014". */
  orderNumber: string;
  orderType: OrderType;
  /** Line items backing `amount` — `amount` is always Σ qty × unitPrice, never a separately hand-set number. */
  items: OrderLineItem[];
  amount: number;
}
