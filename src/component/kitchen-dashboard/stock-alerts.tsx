"use client";

import Icon from "@/component/icon/icon";
import { CHART_STATUS } from "@/lib/kitchen-dashboard/chart-colors";
import type { StockAlert } from "@/lib/kitchen-dashboard/engine";
import styles from "./stock-alerts.module.css";

interface StockAlertsProps {
  alerts: StockAlert[];
  forecast?: boolean;
}

const SEVERITY_ICON: Record<StockAlert["severity"], string> = {
  critical: "/icon/regular/warning-octagon.svg",
  warning: "/icon/regular/warning.svg",
};

const SEVERITY_WORD: Record<StockAlert["severity"], string> = {
  critical: "วิกฤต",
  warning: "ใกล้หมด",
};

// Every row here is (stock ตั้งต้น − ผลรวมที่ order ใช้ไปสะสม) < threshold —
// a computed number recalculated on every order, never a hand-set
// "ใกล้หมด/หมดแล้ว" flag.
export default function StockAlerts({ alerts, forecast = false }: StockAlertsProps) {
  return (
    <div className={`${styles.card} ${forecast ? styles.forecastCard : ""}`}>
      <h3 className={styles.title}>วัตถุดิบใกล้หมด</h3>
      <span className={styles.subtitle}>คำนวณจากสต็อกตั้งต้น − ยอดใช้สะสม</span>

      {alerts.length > 0 ? (
        <ul className={styles.list}>
          {alerts.map((alert) => (
            <li key={alert.ingredientId} className={styles.row}>
              <span
                className={styles.icon}
                style={{ color: CHART_STATUS[alert.severity] }}
                aria-hidden="true"
              >
                <Icon src={SEVERITY_ICON[alert.severity]} size={16} />
              </span>
              <span className={styles.name}>{alert.name}</span>
              <span className={styles.severityWord}>{SEVERITY_WORD[alert.severity]}</span>
              <span className={styles.amount}>
                เหลือ {alert.remaining.toLocaleString("th-TH", { maximumFractionDigits: 0 })}{" "}
                {alert.unit}
                <span className={styles.threshold}>
                  {" "}
                  / เกณฑ์ {alert.threshold.toLocaleString("th-TH")} {alert.unit}
                </span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>ไม่มีวัตถุดิบใกล้หมดในตอนนี้</p>
      )}
    </div>
  );
}
