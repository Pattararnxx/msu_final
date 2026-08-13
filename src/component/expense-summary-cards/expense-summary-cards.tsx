import { formatCurrency } from "@/lib/expense/group-by-week";
import styles from "./expense-summary-cards.module.css";

interface ExpenseSummaryCardsProps {
  monthLabel: string;
  yearLabel: string;
  receiptCountThisMonth: number;
  expenseThisMonth: number;
  expenseThisYear: number;
}

// Three stat tiles backed by the prototype's single mock-data period.
export default function ExpenseSummaryCards({
  monthLabel,
  yearLabel,
  receiptCountThisMonth,
  expenseThisMonth,
  expenseThisYear,
}: ExpenseSummaryCardsProps) {
  return (
    <div className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.label}>จำนวนใบออร์เดอร์เดือนนี้</span>
          <span className={styles.periodTag}>{monthLabel}</span>
        </div>
        <span className={styles.value}>{receiptCountThisMonth}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.label}>รายได้เดือนนี้</span>
          <span className={styles.periodTag}>{monthLabel}</span>
        </div>
        <span className={styles.value}>฿{formatCurrency(expenseThisMonth)}</span>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <span className={styles.label}>รายได้รวมปีนี้</span>
          <span className={styles.yearTag}>{yearLabel}</span>
        </div>
        <span className={styles.value}>฿{formatCurrency(expenseThisYear)}</span>
      </div>
    </div>
  );
}
