"use client";

import Icon from "@/component/icon/icon";
import { formatCurrency } from "@/lib/expense/group-by-week";
import { CHART_STATUS } from "@/lib/kitchen-dashboard/chart-colors";
import type { MenuMarginStat } from "@/lib/kitchen-dashboard/engine";
import styles from "./margin-ranking.module.css";

interface MarginRankingProps {
  stats: MenuMarginStat[];
  forecast?: boolean;
}

// Margin is a good/bad judgment (not "series 4"), so status color applies
// here per the collision rule — but only on the icon, never on the number
// or the word next to it. warning/serious sit under 3:1 on a light
// surface by design (see palette.md), so the icon shape + text word is
// what actually carries the meaning, color is a bonus for full-color
// readers.
function marginTone(pct: number): { icon: string; color: string; word?: string } {
  if (pct < 0) {
    return { icon: "/icon/regular/warning-octagon.svg", color: CHART_STATUS.critical, word: "ขาดทุน" };
  }
  if (pct < 0.15) {
    return { icon: "/icon/regular/warning.svg", color: CHART_STATUS.warning, word: "กำไรต่ำ" };
  }
  if (pct >= 0.35) {
    return { icon: "/icon/regular/trend-up.svg", color: CHART_STATUS.good, word: undefined };
  }
  return { icon: "", color: "", word: undefined };
}

function RankList({ title, items }: { title: string; items: MenuMarginStat[] }) {
  return (
    <div className={styles.column}>
      <h4 className={styles.columnTitle}>{title}</h4>
      {items.length > 0 ? (
        <ol className={styles.list}>
          {items.map((item, i) => {
            const tone = marginTone(item.marginPct);
            return (
              <li key={item.menuItemId} className={styles.row}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.name}>{item.name}</span>
                <span className={styles.qty}>ขาย {item.qtySold} จาน</span>
                {tone.icon && (
                  <span className={styles.tone} style={{ color: tone.color }} aria-hidden="true">
                    <Icon src={tone.icon} size={14} />
                  </span>
                )}
                {tone.word && <span className={styles.toneWord}>{tone.word}</span>}
                <span className={styles.margin}>
                  ฿{formatCurrency(item.marginPerServing)}/จาน
                  <span className={styles.marginPct}>{Math.round(item.marginPct * 100)}%</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className={styles.empty}>ยังไม่มีรายการขาย</p>
      )}
    </div>
  );
}

// Ranked from live per-dish margin (profit ÷ จำนวนที่ขาย จาก order จริง) —
// not a count of completed tasks. Splits the sold menu into a top and
// bottom half so no dish appears in both lists.
export default function MarginRanking({ stats, forecast = false }: MarginRankingProps) {
  const half = Math.min(5, Math.max(1, Math.floor(stats.length / 2)));
  const top = stats.slice(0, half);
  const bottom = stats.slice(-half).reverse();

  return (
    <div className={`${styles.card} ${forecast ? styles.forecastCard : ""}`}>
      <h3 className={styles.title}>เมนูทำกำไรสูงสุด / ต่ำสุด</h3>
      <span className={styles.subtitle}>จัดอันดับจาก margin ต่อจานแบบสด</span>
      <div className={styles.grid}>
        <RankList title="ทำกำไรสูงสุด" items={top} />
        <RankList title="ทำกำไรต่ำสุด" items={bottom} />
      </div>
    </div>
  );
}
