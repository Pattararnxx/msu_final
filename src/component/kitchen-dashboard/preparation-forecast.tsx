"use client";

import { useState } from "react";
import type { IngredientPreparationForecast } from "@/lib/kitchen-dashboard/engine";
import styles from "./preparation-forecast.module.css";

interface PreparationForecastProps {
  forecast: IngredientPreparationForecast;
}

const DEFAULT_VISIBLE_ROW_COUNT = 10;

function formatQuantity(value: number): string {
  return value.toLocaleString("th-TH", { maximumFractionDigits: 1 });
}

export default function PreparationForecast({ forecast }: PreparationForecastProps) {
  const [showAll, setShowAll] = useState(false);
  const sourceOrderCount = forecast.sourceOrderIds.length;
  const visibleItems = showAll
    ? forecast.items
    : forecast.items.slice(0, DEFAULT_VISIBLE_ROW_COUNT);
  const hasMoreItems = forecast.items.length > DEFAULT_VISIBLE_ROW_COUNT;

  return (
    <section className={styles.card} aria-labelledby="preparation-forecast-title">
      <div className={styles.head}>
        <div className={styles.headText}>
          <h2 id="preparation-forecast-title" className={styles.title}>
            แผนเตรียมวัตถุดิบ
          </h2>
          <p className={styles.subtitle}>
            คำนวณจากสูตรมาตรฐานของร้านและออร์เดอร์ที่ยืนยันแล้ว
          </p>
        </div>
        <div className={styles.summary} aria-label={`ออร์เดอร์ต้นทาง ${sourceOrderCount} รายการ`}>
          <span>{sourceOrderCount.toLocaleString("th-TH")} ออร์เดอร์</span>
          <span>{forecast.sourceServingQty.toLocaleString("th-TH")} ที่</span>
          <strong>เผื่อ {formatQuantity(forecast.safetyStockPercent)}%</strong>
        </div>
      </div>

      <details className={styles.sources}>
        <summary>ดู Order ID ต้นทาง ({sourceOrderCount.toLocaleString("th-TH")})</summary>
        <p>{forecast.sourceOrderIds.join(", ") || "ยังไม่มีออร์เดอร์ต้นทาง"}</p>
      </details>

      {forecast.items.length > 0 ? (
        <>
          <p className={styles.scrollHint}>เลื่อนตารางแนวนอนเพื่อดูยอดทั้งหมด</p>
          <div className={styles.tableWrap} tabIndex={0} aria-label="ตารางแผนเตรียมวัตถุดิบ เลื่อนได้ในแนวนอน">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>วัตถุดิบ</th>
                  <th>หน่วย</th>
                  <th className={styles.numCol}>ยอดตามออร์เดอร์</th>
                  <th className={styles.numCol}>Safety stock</th>
                  <th className={styles.numCol}>แนะนำให้เตรียม</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => (
                  <tr key={item.ingredientId}>
                    <td>
                      <span className={styles.ingredientName}>{item.ingredientName}</span>
                      <span className={styles.category}>{item.category}</span>
                    </td>
                    <td>{item.unit}</td>
                    <td className={styles.numCol}>{formatQuantity(item.sourceQty)}</td>
                    <td className={`${styles.numCol} ${styles.safetyQty}`}>
                      +{formatQuantity(item.safetyStockQty)}
                    </td>
                    <td className={`${styles.numCol} ${styles.recommendedQty}`}>
                      {formatQuantity(item.recommendedQty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {hasMoreItems && (
            <button
              type="button"
              className={styles.expandButton}
              aria-expanded={showAll}
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll
                ? `ย่อเหลือ ${DEFAULT_VISIBLE_ROW_COUNT} รายการ`
                : `แสดงวัตถุดิบทั้งหมด ${forecast.items.length.toLocaleString("th-TH")} รายการ`}
            </button>
          )}
        </>
      ) : (
        <p className={styles.empty}>ยังไม่มีออร์เดอร์ยืนยันสำหรับคำนวณวัตถุดิบ</p>
      )}
    </section>
  );
}
