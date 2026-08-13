"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@mantine/charts";
import { SegmentedControl, Stack, Text } from "@mantine/core";
import { getSalesHistory, type SalesGranularity } from "@/lib/menu/sales";
import { formatCurrency } from "@/lib/expense/group-by-week";
import styles from "./menu-sales-chart.module.css";

interface MenuSalesChartProps {
  menuItemId: string;
}

type Metric = "quantitySold" | "revenue";

const GRANULARITY_OPTIONS: { label: string; value: SalesGranularity }[] = [
  { label: "รายสัปดาห์", value: "week" },
  { label: "รายเดือน", value: "month" },
  { label: "รายปี", value: "year" },
];

const METRIC_OPTIONS: { label: string; value: Metric }[] = [
  { label: "จำนวนขาย", value: "quantitySold" },
  { label: "รายได้", value: "revenue" },
];

export default function MenuSalesChart({ menuItemId }: MenuSalesChartProps) {
  const [granularity, setGranularity] = useState<SalesGranularity>("week");
  const [metric, setMetric] = useState<Metric>("quantitySold");

  const data = useMemo(
    () => getSalesHistory(menuItemId, granularity),
    [menuItemId, granularity],
  );

  const total = data.reduce((sum, point) => sum + point[metric], 0);

  return (
    <Stack gap={12}>
      <Stack gap={4}>
        <Text size="sm" fw={700} c="var(--b-900)">
          ยอดขาย
        </Text>
        <Text size="xs" c="dimmed">
          รวม {metric === "revenue" ? `฿${formatCurrency(total)}` : `${total} ที่`} ในช่วงที่แสดง
        </Text>
      </Stack>

      <div className={styles.controls}>
        <SegmentedControl
          size="xs"
          value={granularity}
          onChange={(value) => setGranularity(value as SalesGranularity)}
          data={GRANULARITY_OPTIONS}
        />
        <SegmentedControl
          size="xs"
          value={metric}
          onChange={(value) => setMetric(value as Metric)}
          data={METRIC_OPTIONS}
        />
      </div>

      {data.length === 0 ? (
        <div className={styles.empty}>ยังไม่มีข้อมูลยอดขายของเมนูนี้</div>
      ) : (
        <LineChart
          h={220}
          data={data}
          dataKey="label"
          series={[{ name: metric, label: metric === "revenue" ? "รายได้ (฿)" : "จำนวนขาย (ที่)", color: "brand.6" }]}
          curveType="monotone"
          withDots
          withLegend={false}
          gridAxis="y"
        />
      )}
    </Stack>
  );
}
