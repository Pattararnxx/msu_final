import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import { getMenuItem } from "./mock-data";

export type SalesGranularity = "week" | "month" | "year";

export interface SalesPoint {
  /** Sort/bucket key, e.g. "2026-W17", "2026-05", "2026" */
  key: string;
  /** Short Thai label for the chart axis, e.g. "20 พ.ค.", "พ.ค. 2026", "2026" */
  label: string;
  quantitySold: number;
  revenue: number;
}

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const WINDOW_SIZE: Record<SalesGranularity, number> = {
  week: 12,
  month: 12,
  year: 5,
};

function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function bucketFor(date: Date, granularity: SalesGranularity): { key: string; label: string } {
  if (granularity === "year") {
    const year = String(date.getFullYear());
    return { key: year, label: year };
  }
  if (granularity === "month") {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: `${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}` };
  }
  const weekStart = startOfWeek(date);
  const key = weekStart.toISOString().slice(0, 10);
  return { key, label: `${weekStart.getDate()} ${THAI_MONTHS_SHORT[weekStart.getMonth()]}` };
}

/**
 * Per-menu-item sales, aggregated from every order's `lineItems` across the
 * full mock history (see src/lib/expense/mock-data.ts) and bucketed by
 * week/month/year. Revenue is recomputed from the menu item's current price
 * rather than stored per-order, so editing a price also updates history —
 * an intentional simplification since there's no real order ledger yet.
 */
export function getSalesHistory(menuItemId: string, granularity: SalesGranularity): SalesPoint[] {
  const buckets = new Map<string, SalesPoint>();
  const price = getMenuItem(menuItemId)?.price ?? 0;

  for (const order of MOCK_EXPENSES) {
    if (!order.lineItems) continue;
    for (const line of order.lineItems) {
      if (line.menuItemId !== menuItemId) continue;
      const { key, label } = bucketFor(new Date(order.date), granularity);
      const existing = buckets.get(key);
      if (existing) {
        existing.quantitySold += line.quantity;
        existing.revenue += line.quantity * price;
      } else {
        buckets.set(key, { key, label, quantitySold: line.quantity, revenue: line.quantity * price });
      }
    }
  }

  return Array.from(buckets.values())
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .slice(-WINDOW_SIZE[granularity]);
}

/** Menu item ids ranked by total quantity sold across the full mock history, most first. */
export function getTopSellerIds(topN: number): string[] {
  const totals = new Map<string, number>();

  for (const order of MOCK_EXPENSES) {
    if (!order.lineItems) continue;
    for (const line of order.lineItems) {
      totals.set(line.menuItemId, (totals.get(line.menuItemId) ?? 0) + line.quantity);
    }
  }

  return Array.from(totals.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN)
    .map(([id]) => id);
}
