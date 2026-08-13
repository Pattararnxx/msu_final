"use client";

import { useMemo, useState } from "react";
import { LineChart } from "@mantine/charts";
import { Select } from "@mantine/core";
import { INGREDIENTS } from "@/lib/kitchen-dashboard/catalog";
import { CHART_CATEGORICAL } from "@/lib/kitchen-dashboard/chart-colors";
import type { UnitPricePoint } from "@/lib/kitchen-dashboard/types";
import styles from "./unit-price-trend.module.css";

interface UnitPriceTrendProps {
  unitPriceHistory: Map<string, UnitPricePoint[]>;
}

const INGREDIENT_OPTIONS = INGREDIENTS.map((i) => ({ value: i.id, label: i.name }));

function formatTime(t: number): string {
  const d = new Date(t);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// One line per ingredient, picked with the selector rather than shown all
// at once — a dozen-plus overlapping price lines would be unreadable, and
// only one ingredient's cost moves at a time when a supplier update lands.
export default function UnitPriceTrend({ unitPriceHistory }: UnitPriceTrendProps) {
  const [ingredientId, setIngredientId] = useState(INGREDIENTS[0].id);

  // Memoized so the `?? []` fallback doesn't hand useMemo below a fresh
  // array identity on every render (Map.get's own hit is already stable).
  const history = useMemo(
    () => unitPriceHistory.get(ingredientId) ?? [],
    [unitPriceHistory, ingredientId],
  );
  const ingredient = INGREDIENTS.find((i) => i.id === ingredientId);

  const chartData = useMemo(
    () =>
      history.map((p) => ({
        label: formatTime(p.t),
        [`ราคาต่อ${ingredient?.unit ?? "หน่วย"}`]: p.price,
      })),
    [history, ingredient],
  );

  const seriesName = `ราคาต่อ${ingredient?.unit ?? "หน่วย"}`;
  const currentPrice = history.at(-1)?.price ?? ingredient?.initialUnitCost ?? 0;
  const startPrice = history.at(0)?.price ?? currentPrice;
  const delta = currentPrice - startPrice;

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <h3 className={styles.title}>ราคาต่อหน่วยวัตถุดิบ</h3>
          <span className={styles.subtitle}>
            ปัจจุบัน ฿{currentPrice.toFixed(3)} / {ingredient?.unit}
            {delta !== 0 && (
              <span className={delta > 0 ? styles.deltaUp : styles.deltaDown}>
                {delta > 0 ? " ▲" : " ▼"} {Math.abs(delta).toFixed(3)}
              </span>
            )}
          </span>
        </div>
        <Select
          size="xs"
          w={200}
          data={INGREDIENT_OPTIONS}
          value={ingredientId}
          onChange={(v) => v && setIngredientId(v)}
          checkIconPosition="right"
          aria-label="เลือกวัตถุดิบ"
        />
      </div>

      {chartData.length > 1 ? (
        <LineChart
          h={200}
          data={chartData}
          dataKey="label"
          series={[{ name: seriesName, color: CHART_CATEGORICAL[1] }]}
          curveType="step"
          strokeWidth={2}
          withDots={chartData.length <= 20}
          gridAxis="y"
          valueFormatter={(v) => `฿${v.toFixed(3)}`}
        />
      ) : (
        <p className={styles.empty}>ยังไม่มีการอัปเดตราคาจากซัพพลายเออร์</p>
      )}
    </div>
  );
}
