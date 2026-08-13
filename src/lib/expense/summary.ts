import type { ExpenseItem } from "./types";

export interface ExpenseSummary {
  receiptCountThisMonth: number;
  expenseThisMonth: number;
  expenseThisYear: number;
}

// `referenceDate` is "now" for the summary cards — pass the real current
// date once this is wired to a live feed. It's given as an argument (not
// read from `new Date()` internally) so it's easy to point at whatever
// month the mock data should read as "current".
export function computeExpenseSummary(
  items: ExpenseItem[],
  referenceDate: Date,
): ExpenseSummary {
  const month = referenceDate.getMonth();
  const year = referenceDate.getFullYear();

  const monthItems = items.filter((item) => {
    const date = new Date(item.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });
  const yearItems = items.filter(
    (item) => new Date(item.date).getFullYear() === year,
  );

  return {
    receiptCountThisMonth: monthItems.length,
    expenseThisMonth: monthItems.reduce((sum, item) => sum + item.amount, 0),
    expenseThisYear: yearItems.reduce((sum, item) => sum + item.amount, 0),
  };
}
