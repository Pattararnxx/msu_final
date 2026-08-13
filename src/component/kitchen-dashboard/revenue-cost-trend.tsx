"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@mantine/charts";
import { SegmentedControl } from "@mantine/core";
import { formatCurrency } from "@/lib/expense/group-by-week";
import {
  bucketOrdersByTime,
  type TrendGranularity,
} from "@/lib/kitchen-dashboard/engine";
import {
  CHART_CATEGORICAL,
  FORECAST_CATEGORICAL,
} from "@/lib/kitchen-dashboard/chart-colors";
import type { ComputedOrder } from "@/lib/kitchen-dashboard/types";
import styles from "./revenue-cost-trend.module.css";

interface RevenueCostTrendProps {
  orders: ComputedOrder[];
  forecast?: boolean;
}

const GRANULARITY_OPTIONS: { label: string; value: TrendGranularity }[] = [
  { label: "นาที", value: "minute" },
  { label: "ชั่วโมง", value: "hour" },
  { label: "วัน", value: "day" },
];

function formatBucketLabel(t: number, granularity: TrendGranularity): string {
  const date = new Date(t);
  if (granularity === "day") {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return granularity === "hour" ? `${hours}:00` : `${hours}:${minutes}`;
}

export default function RevenueCostTrend({
  orders,
  forecast = false,
}: RevenueCostTrendProps) {
  const [granularity, setGranularity] = useState<TrendGranularity>(
    forecast ? "day" : "minute",
  );
  const colors = forecast ? FORECAST_CATEGORICAL : CHART_CATEGORICAL;

  const chartData = useMemo(() => {
    const buckets = bucketOrdersByTime(orders, forecast ? "day" : granularity);
    return buckets.map((bucket) => ({
      label: formatBucketLabel(bucket.t, forecast ? "day" : granularity),
      รายได้: Math.round(bucket.revenue),
      ต้นทุนวัตถุดิบ: Math.round(bucket.cost),
    }));
  }, [orders, granularity, forecast]);

  const totals = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          acc.revenue += order.revenue;
          acc.cost += order.cost;
          return acc;
        },
        { revenue: 0, cost: 0 },
      ),
    [orders],
  );
  const profit = totals.revenue - totals.cost;
  const marginPct = totals.revenue > 0 ? Math.round((profit / totals.revenue) * 100) : 0;

  return (
    <div className={`${styles.card} ${forecast ? styles.forecastCard : ""}`}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h3 className={styles.title}>รายได้เทียบต้นทุนวัตถุดิบ</h3>
          <span className={styles.subtitle}>
            กำไรขั้นต้นสะสม ฿{formatCurrency(profit)} ({marginPct}%)
          </span>
        </div>
        {forecast ? (
          <span className={styles.forecastRange}>คาดการณ์ 7 วัน</span>
        ) : (
          <SegmentedControl
            size="xs"
            value={granularity}
            onChange={(value) => setGranularity(value as TrendGranularity)}
            data={GRANULARITY_OPTIONS}
          />
        )}
      </div>

      {chartData.length > 0 ? (
        <LineChart
          h={220}
          data={chartData}
          dataKey="label"
          series={[
            { name: "ต้นทุนวัตถุดิบ", color: colors[0] },
            { name: "รายได้", color: colors[1] },
          ]}
          curveType="monotone"
          strokeWidth={2}
          withDots={forecast || chartData.length <= 20}
          withLegend
          legendProps={{ verticalAlign: "top", height: 32 }}
          gridAxis="y"
          valueFormatter={(value) => `฿${formatCurrency(value)}`}
        />
      ) : (
        <p className={styles.empty}>กำลังรอข้อมูล order...</p>
      )}
    </div>
  );
}
