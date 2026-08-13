"use client";

import { Sparkline } from "@mantine/charts";
import Icon from "@/component/icon/icon";
import styles from "./stat-row.module.css";

export interface StatTileData {
  key: string;
  icon: string;
  label: string;
  value: string;
  /** Short trend strip — last few points, oldest first. Omit for pure counts. */
  sparkline?: number[];
}

interface StatRowProps {
  stats: StatTileData[];
  forecast?: boolean;
}

// Five live-computed headline numbers — see use-live-dashboard.ts. Every
// value here recomputes on each order tick (no refresh, no manual status),
// so this row is the dashboard's stat-tile contract: label, value, and an
// optional trend sparkline in place of a delta (no fixed prior period to
// diff against in a same-session demo feed).
export default function StatRow({ stats, forecast = false }: StatRowProps) {
  return (
    <div className={styles.grid}>
      {stats.map((stat) => (
        <div key={stat.key} className={styles.card}>
          <div className={styles.head}>
            <span className={`${styles.iconWrap} ${forecast ? styles.forecastIcon : ""}`}>
              <Icon src={stat.icon} size={16} />
            </span>
            <span className={styles.label}>{stat.label}</span>
          </div>
          <span className={styles.value}>{stat.value}</span>
          {stat.sparkline && stat.sparkline.length > 1 && (
            <Sparkline
              w="100%"
              h={28}
              data={stat.sparkline}
              curveType="linear"
              color={forecast ? "blue" : "var(--chart-cat-1)"}
              fillOpacity={0.12}
              strokeWidth={2}
              className={styles.sparkline}
            />
          )}
        </div>
      ))}
    </div>
  );
}
