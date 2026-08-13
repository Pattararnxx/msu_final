"use client";

import { useMemo } from "react";
import { AreaChart } from "@mantine/charts";
import { formatCurrency } from "@/lib/expense/group-by-week";
import type { StockValuePoint } from "@/lib/kitchen-dashboard/use-live-dashboard";
import styles from "./stock-level-trend.module.css";

interface StockLevelTrendProps {
  history: StockValuePoint[];
  forecast?: boolean;
}

const MAX_POINTS = 60;

function formatTime(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// One point per order — a running total of (remaining stock × current unit
// cost), so the line only moves when an order actually deducts something.
// Thinned to the most recent MAX_POINTS so the line stays legible over a
// long session instead of turning into a bar-per-order chart.
export default function StockLevelTrend({ history, forecast = false }: StockLevelTrendProps) {
  const chartData = useMemo(() => {
    const points =
      history.length > MAX_POINTS
        ? history.filter(
            (_, i) => i % Math.ceil(history.length / MAX_POINTS) === 0,
          )
        : history;
    return points.map((p) => ({
      label: formatTime(p.t),
      มูลค่าวัตถุดิบคงเหลือ: Math.round(p.value),
    }));
  }, [history]);

  const current = history.at(-1)?.value ?? 0;
  const initial = history.at(0)?.value ?? current;
  const usedPct =
    initial > 0 ? Math.round(((initial - current) / initial) * 100) : 0;

  return (
    <div className={`${styles.card} ${forecast ? styles.forecastCard : ""}`}>
      <div className={styles.headText}>
        <h3 className={styles.title}>มูลค่าวัตถุดิบคงเหลือใน stock</h3>
        <span className={styles.subtitle}>
          ใช้ไปแล้ว {usedPct}% จากยอดตั้งต้นของวันนี้
        </span>
      </div>

      {chartData.length > 0 ? (
        <AreaChart
          h={200}
          data={chartData}
          dataKey="label"
          series={[
            { name: "มูลค่าวัตถุดิบคงเหลือ", color: "var(--primary-900)" },
          ]}
          curveType="linear"
          strokeWidth={2}
          withDots={chartData.length <= 20}
          withGradient
          fillOpacity={0.14}
          gridAxis="y"
          valueFormatter={(v) => `฿${formatCurrency(v)}`}
          areaChartProps={{
            margin: { top: 20, right: 40, left: 40, bottom: 20 },
          }}
        />
      ) : (
        <p className={styles.empty}>กำลังรอข้อมูลออร์เดอร์…</p>
      )}
    </div>
  );
}
