import type { ExpenseItem } from "./types";

export interface ExpenseWeekGroup {
  /** ISO date of the week's Monday — stable React key and sort key */
  key: string;
  /** e.g. "20 - 26 เม.ย. 2026" */
  rangeLabel: string;
  items: ExpenseItem[];
  total: number;
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

/** Monday of the week containing `date`, time zeroed. */
function startOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay(); // 0 = Sunday .. 6 = Saturday
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  return start;
}

function shortDate(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]}`;
}

// Groups a flat expense list into Monday-start weeks, newest week first and
// newest item first within each week — same rhythm as the reference design's
// month grouping, one level finer.
export function groupExpensesByWeek(items: ExpenseItem[]): ExpenseWeekGroup[] {
  const buckets = new Map<string, ExpenseItem[]>();

  for (const item of items) {
    const key = startOfWeek(new Date(item.date)).toISOString().slice(0, 10);
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([key, groupItems]) => {
      const weekStart = new Date(key);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const endLabel =
        weekStart.getMonth() === weekEnd.getMonth()
          ? `${weekEnd.getDate()} ${THAI_MONTHS_SHORT[weekEnd.getMonth()]}`
          : shortDate(weekEnd);

      const sortedItems = [...groupItems].sort((a, b) =>
        a.date < b.date ? 1 : -1,
      );

      return {
        key,
        rangeLabel: `${shortDate(weekStart)} - ${endLabel} ${weekEnd.getFullYear()}`,
        items: sortedItems,
        total: sortedItems.reduce((sum, item) => sum + item.amount, 0),
      };
    });
}

export function formatThaiDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
