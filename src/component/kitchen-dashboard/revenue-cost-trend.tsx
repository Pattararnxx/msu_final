"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@mantine/charts";
import { SegmentedControl } from "@mantine/core";
import { formatCurrency } from "@/lib/expense/group-by-week";
import {
  bucketOrdersByTime,
  type TrendGranularity,
} from "@/lib/kitchen-dashboard/engine";
import { CHART_CATEGORICAL } from "@/lib/kitchen-dashboard/chart-colors";
import type { ComputedOrder } from "@/lib/kitchen-dashboard/types";
import styles from "./revenue-cost-trend.module.css";

interface RevenueCostTrendProps {
  orders: ComputedOrder[];
}

const GRANULARITY_OPTIONS: { label: string; value: TrendGranularity }[] = [
  { label: "นาที", value: "minute" },
  { label: "ชั่วโมง", value: "hour" },
  { label: "วัน", value: "day" },
];

function formatBucketLabel(t: number, granularity: TrendGranularity): string {
  const d = new Date(t);
  if (granularity === "day") return `${d.getDate()}/${d.getMonth() + 1}`;
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return granularity === "hour" ? `${hh}:00` : `${hh}:${mm}`;
}

// Revenue vs. ingredient cost, live: every tick that adds a confirmed order
// re-buckets straight from `orders` — profit is the visible gap between
// the two lines, not a separately reconciled number.
export default function RevenueCostTrend({ orders }: RevenueCostTrendProps) {
  const [granularity, setGranularity] = useState<TrendGranularity>("minute");

  const chartData = useMemo(() => {
    const buckets = bucketOrdersByTime(orders, granularity);
    return buckets.map((b) => ({
      label: formatBucketLabel(b.t, granularity),
      ยอดขาย: Math.round(b.revenue),
      ต้นทุนวัตถุดิบ: Math.round(b.cost),
    }));
  }, [orders, granularity]);

  const totals = useMemo(
    () =>
      orders.reduce(
        (acc, o) => {
          acc.revenue += o.revenue;
          acc.cost += o.cost;
          return acc;
        },
        { revenue: 0, cost: 0 },
      ),
    [orders],
  );
  const profit = totals.revenue - totals.cost;
  const marginPct = totals.revenue > 0 ? Math.round((profit / totals.revenue) * 100) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h3 className={styles.title}>รายได้เทียบต้นทุนวัตถุดิบ</h3>
          <span className={styles.subtitle}>
            กำไรขั้นต้นสะสม ฿{formatCurrency(profit)} ({marginPct}%)
          </span>
        </div>
        <SegmentedControl
          size="xs"
          value={granularity}
          onChange={(v) => setGranularity(v as TrendGranularity)}
          data={GRANULARITY_OPTIONS}
        />
      </div>

      {/* >0, not >1 — "วัน" granularity legitimately collapses to a single
          bucket for the length of this session (every order so far is
          "today"), and that single real point should still render instead
          of falling back to a placeholder. Dots turn on for sparse data
          so a lone point isn't an invisible zero-length line. */}
      {chartData.length > 0 ? (
        <LineChart
          h={220}
          data={chartData}
          dataKey="label"
          series={[
            { name: "ยอดขาย", color: CHART_CATEGORICAL[0] },
            { name: "ต้นทุนวัตถุดิบ", color: CHART_CATEGORICAL[1] },
          ]}
          curveType="monotone"
          strokeWidth={2}
          withDots={chartData.length <= 20}
          withLegend
          legendProps={{ verticalAlign: "top", height: 32 }}
          gridAxis="y"
          valueFormatter={(v) => `฿${formatCurrency(v)}`}
        />
      ) : (
        <p className={styles.empty}>กำลังรอข้อมูลออร์เดอร์…</p>
      )}
    </div>
  );
}
