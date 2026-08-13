import Icon from "@/component/icon/icon";
import styles from "./team-stats-cards.module.css";

interface StatTrend {
  direction: "up" | "down";
  /** e.g. "+8% จากเดือนที่แล้ว" */
  label: string;
}

export interface StatCardConfig {
  label: string;
  value: number | string;
  trend?: StatTrend;
  /** Draws the value in the accent color — used for "needs attention" counts. */
  alert?: boolean;
}

interface TeamStatsCardsProps {
  cards: StatCardConfig[];
}

// Same tile shape as ExpenseSummaryCards (label + big value, no chrome)
// but without the month selector, plus an up/down trend line under the
// value — same diagonal-arrow-plus-delta pattern as the reference
// dashboard's stat cards. Direction is purely "increased vs. decreased",
// not a good/bad judgment (a rising "pending requests" count is still
// drawn as a plain green "up" arrow) — matches the reference literally
// rather than inventing per-metric color logic.
export default function TeamStatsCards({ cards }: TeamStatsCardsProps) {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.label}>{card.label}</span>
          <div className={styles.valueRow}>
            <span className={card.alert ? styles.valueAlert : styles.value}>{card.value}</span>
            {card.trend && (
              <span
                className={
                  card.trend.direction === "up" ? styles.trendUp : styles.trendDown
                }
              >
                <Icon
                  src={`/icon/regular/arrow-${card.trend.direction}-right.svg`}
                  size={12}
                />
                {card.trend.label}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
