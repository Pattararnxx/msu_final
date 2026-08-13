"use client";

import { DonutChart } from "@mantine/charts";
import { formatCurrency } from "@/lib/expense/group-by-week";
import {
  DONUT_CATEGORICAL,
  FORECAST_CATEGORICAL,
} from "@/lib/kitchen-dashboard/chart-colors";
import styles from "./cost-revenue-donuts.module.css";

export interface CategoryDatum {
  category: string;
  value: number;
}

interface DonutCardProps {
  title: string;
  subtitle: string;
  data: CategoryDatum[];
  forecast?: boolean;
}

// 4–5 categories from real order/usage data (not a task-status count), so
// the categorical palette applies as-is. Series-count ladder for 4+ slots
// requires direct labels — the legend row below shows both the value and
// the share, not just a swatch, to satisfy that.
function DonutCard({ title, subtitle, data, forecast = false }: DonutCardProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = forecast
    ? [
        ...FORECAST_CATEGORICAL,
      ]
    : DONUT_CATEGORICAL;
  const chartData = data.map((d, i) => ({
    name: d.category,
    value: Math.round(d.value * 100) / 100,
    color: colors[i % colors.length],
  }));

  return (
    <div className={`${styles.card} ${forecast ? styles.forecastCard : ""}`}>
      <div className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        <span className={styles.subtitle}>{subtitle}</span>
      </div>

      {total > 0 ? (
        <div className={styles.body}>
          <DonutChart
            data={chartData}
            withTooltip
            tooltipDataSource="segment"
            valueFormatter={(value) => `฿${formatCurrency(value)}`}
            size={140}
            thickness={22}
            paddingAngle={2}
            chartLabel={`฿${formatCurrency(total)}`}
          />
          <ul className={styles.legend}>
            {chartData.map((d) => (
              <li key={d.name} className={styles.legendRow}>
                <span
                  className={styles.swatch}
                  style={{ background: d.color }}
                  aria-hidden="true"
                />
                <span className={styles.legendName}>{d.name}</span>
                <span className={styles.legendValue}>
                  ฿{formatCurrency(d.value)}
                  <span className={styles.legendPct}>
                    {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className={styles.empty}>ยังไม่มีข้อมูลสำหรับวันนี้</p>
      )}
    </div>
  );
}

interface CostRevenueDonutsProps {
  costByCategory: CategoryDatum[];
  revenueByCategory: CategoryDatum[];
  forecast?: boolean;
}

export default function CostRevenueDonuts({
  costByCategory,
  revenueByCategory,
  forecast = false,
}: CostRevenueDonutsProps) {
  return (
    <div className={styles.grid}>
      <DonutCard
        title="สัดส่วนต้นทุนวัตถุดิบ"
        subtitle="แยกตามประเภทวัตถุดิบ"
        data={costByCategory}
        forecast={forecast}
      />
      <DonutCard
        title="สัดส่วนรายได้"
        subtitle="แยกตามหมวดเมนู"
        data={revenueByCategory}
        forecast={forecast}
      />
    </div>
  );
}
