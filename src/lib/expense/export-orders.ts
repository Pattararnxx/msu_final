import type { ExpenseItem, OrderItem } from "./types";

const CSV_HEADERS = [
  "เลขที่ออร์เดอร์",
  "วันที่และเวลา",
  "ลูกค้า",
  "ประเภทออร์เดอร์",
  "รายการเมนู",
  "จำนวน",
  "ท็อปปิง/หมายเหตุ",
  "ยอดรวม (บาท)",
  "ผู้อัปโหลด",
] as const;

const SUMMARY_CSV_HEADERS = [
  "รหัสเมนู",
  "เมนู",
  "จำนวนรวม",
  "หน่วย",
  "ยอดขายรวม (บาท)",
  "จำนวนออร์เดอร์",
  "เลขออร์เดอร์อ้างอิง",
] as const;

interface MenuSummaryRow {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  units: Set<string>;
  revenue: number;
  sourceOrders: Map<string, string>;
}

const ORDER_TYPE_LABELS: Record<ExpenseItem["orderType"], string> = {
  dine_in: "ทานที่ร้าน",
  takeaway: "รับกลับ",
  delivery: "เดลิเวอรี่",
  unknown: "ไม่ระบุ",
};

function sanitizeSpreadsheetCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function encodeCsvCell(value: unknown): string {
  const safeText = sanitizeSpreadsheetCell(value);
  return `"${safeText.replaceAll('"', '""')}"`;
}

function formatOrderedAt(order: ExpenseItem): string {
  const source = order.orderedAt || `${order.date}T${order.uploadedAt}`;
  return source.replace("T", " ").slice(0, 16);
}

function formatMenuLines(items: OrderItem[]): string {
  return items.map((item) => item.menuItemName).join(" | ");
}

function formatQuantities(items: OrderItem[]): string {
  return items
    .map((item) => `${item.quantity}${item.unit ? ` ${item.unit}` : ""}`)
    .join(" | ");
}

function formatItemDetails(item: OrderItem): string {
  const details = item.toppings.map((topping) => {
    const quantity = topping.quantity > 0
      ? ` x${topping.quantity}${topping.unit ? ` ${topping.unit}` : ""}`
      : "";
    return `${topping.name}${quantity}`;
  });

  if (item.notes.trim()) details.push(item.notes.trim());
  return details.length > 0 ? `${item.menuItemName}: ${details.join(", ")}` : "";
}

function formatToppingsAndNotes(order: ExpenseItem): string {
  const details = order.items.map(formatItemDetails).filter(Boolean);
  if (order.notes.trim()) details.push(`หมายเหตุออร์เดอร์: ${order.notes.trim()}`);
  return details.join(" | ");
}

function orderToCsvRow(order: ExpenseItem): unknown[] {
  return [
    order.orderNumber,
    formatOrderedAt(order),
    order.customerName?.trim() || "ไม่ระบุ",
    ORDER_TYPE_LABELS[order.orderType],
    formatMenuLines(order.items),
    formatQuantities(order.items),
    formatToppingsAndNotes(order),
    order.amount.toFixed(2),
    order.uploadedBy,
  ];
}

function finiteNumber(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function fallbackToppingTotal(item: OrderItem): number {
  return item.toppings.reduce((sum, topping) => {
    const totalPrice = finiteNumber(topping.totalPrice);
    if (totalPrice !== null) return sum + totalPrice;

    const unitPrice = finiteNumber(topping.unitPrice) ?? 0;
    const quantity = finiteNumber(topping.quantity) ?? 0;
    return sum + unitPrice * quantity;
  }, 0);
}

function itemRevenue(item: OrderItem): number {
  const totalPrice = finiteNumber(item.totalPrice);
  if (totalPrice !== null) return totalPrice;

  const unitPrice = finiteNumber(item.unitPrice) ?? 0;
  const quantity = finiteNumber(item.quantity) ?? 0;
  return unitPrice * quantity + fallbackToppingTotal(item);
}

function summarizeOrdersByMenu(orders: ExpenseItem[]): MenuSummaryRow[] {
  const summaries = new Map<string, MenuSummaryRow>();

  for (const order of orders) {
    if (order.humanReviewed === false) continue;

    for (const item of order.items) {
      if (item.humanReviewed === false) continue;

      const menuItemId = item.menuItemId ?? "";
      const key = `${menuItemId}\u0000${item.menuItemName}`;
      const summary = summaries.get(key) ?? {
        menuItemId,
        menuItemName: item.menuItemName,
        quantity: 0,
        units: new Set<string>(),
        revenue: 0,
        sourceOrders: new Map<string, string>(),
      };

      summary.quantity += finiteNumber(item.quantity) ?? 0;
      if (item.unit.trim()) summary.units.add(item.unit.trim());
      summary.revenue += itemRevenue(item);
      summary.sourceOrders.set(order.id, order.orderNumber);
      summaries.set(key, summary);
    }
  }

  return Array.from(summaries.values());
}

function summaryToCsvRow(summary: MenuSummaryRow): unknown[] {
  return [
    summary.menuItemId || "ไม่ระบุ",
    summary.menuItemName,
    summary.quantity,
    Array.from(summary.units).join(" / ") || "ไม่ระบุ",
    summary.revenue.toFixed(2),
    summary.sourceOrders.size,
    Array.from(summary.sourceOrders.values()).join(" | "),
  ];
}

/** UTF-8 BOM keeps Thai text intact when the file is opened directly in Excel. */
export function serializeOrdersCsv(orders: ExpenseItem[]): string {
  const rows = [CSV_HEADERS, ...orders.map(orderToCsvRow)];
  return `\uFEFF${rows.map((row) => row.map(encodeCsvCell).join(",")).join("\r\n")}`;
}

export function serializeOrdersSummaryCsv(orders: ExpenseItem[]): string {
  const rows = [
    SUMMARY_CSV_HEADERS,
    ...summarizeOrdersByMenu(orders).map(summaryToCsvRow),
  ];
  return `\uFEFF${rows.map((row) => row.map(encodeCsvCell).join(",")).join("\r\n")}`;
}

export function createOrderExportFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `orders-${year}-${month}-${day}.csv`;
}

export function createOrderSummaryExportFilename(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `orders-summary-${year}-${month}-${day}.csv`;
}

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadOrdersCsv(orders: ExpenseItem[], date = new Date()): void {
  downloadCsv(serializeOrdersCsv(orders), createOrderExportFilename(date));
}

export function downloadOrdersSummaryCsv(
  orders: ExpenseItem[],
  date = new Date(),
): void {
  downloadCsv(
    serializeOrdersSummaryCsv(orders),
    createOrderSummaryExportFilename(date),
  );
}
