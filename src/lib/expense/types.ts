// "อาหาร" values instead of a generic document kind — reused by
// ExpenseUploadPanel's own draft form too, so the order list and the
// upload flow agree on what a food type is.
export type FoodType = "ข้าวต้ม" | "โจ๊ก" | "ก๋วยจั๊บ" | "อื่นๆ";

// Still used by ExpenseUploadPanel's own draft form — the order list
// itself no longer shows a payment-status column or filter.
export type PaymentStatus = "จ่ายแล้ว" | "รอจ่าย" | "ยกเลิก";

export interface ExpenseItem {
  id: string;
  /** ISO date, e.g. "2026-04-16" */
  date: string;
  /** One or more dishes in the order — most are one, some are several */
  foodItems: FoodType[];
  /**
   * The customer's name, when the order photo actually shows one.
   * Absent for table numbers / delivery-platform orders — the UI falls
   * back to "ไม่ทราบชื่อ" rather than leaving the cell blank.
   */
  customerName?: string;
  description: string;
  /** Time the order photo was uploaded, e.g. "07:42" */
  uploadedAt: string;
  amount: number;
}
