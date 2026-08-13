export type DocumentType =
  | "สลิปโอนเงิน"
  | "ใบเสร็จรับเงิน"
  | "ใบกำกับภาษี"
  | "อื่นๆ";

export type PaymentStatus = "จ่ายแล้ว" | "รอจ่าย" | "ยกเลิก";

export interface ExpenseItem {
  id: string;
  /** ISO date, e.g. "2026-04-16" */
  date: string;
  documentType: DocumentType;
  vendor: string;
  description: string;
  payer: string;
  status: PaymentStatus;
  amount: number;
}
