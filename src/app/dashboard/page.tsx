"use client";

import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import AnnouncementBar from "@/component/announcement-bar/announcement-bar";
import DashboardSidebar from "@/component/dashboard-sidebar/dashboard-sidebar";
import Icon from "@/component/icon/icon";
import { useChatbot } from "@/component/chatbot/chatbot-context";
import StatRow, {
  type StatTileData,
} from "@/component/kitchen-dashboard/stat-row";
import CostRevenueDonuts from "@/component/kitchen-dashboard/cost-revenue-donuts";
import RevenueCostTrend from "@/component/kitchen-dashboard/revenue-cost-trend";
import StockLevelTrend from "@/component/kitchen-dashboard/stock-level-trend";
import UnitPriceTrend from "@/component/kitchen-dashboard/unit-price-trend";
import MarginRanking from "@/component/kitchen-dashboard/margin-ranking";
import StockAlerts from "@/component/kitchen-dashboard/stock-alerts";
import OrderTable from "@/component/kitchen-dashboard/order-table";
import PreparationForecast from "@/component/kitchen-dashboard/preparation-forecast";
import { formatCurrency } from "@/lib/expense/group-by-week";
import { useLiveKitchenDashboard } from "@/lib/kitchen-dashboard/use-live-dashboard";
import { buildForecast, FORECAST_DAYS } from "@/lib/kitchen-dashboard/forecast";
import {
  bucketOrdersByTime,
  computeCostByCategory,
  computeIngredientPreparationForecast,
  computeMarginRanking,
  computeRemainingStockValue,
  computeRevenueByMenuCategory,
  computeStockAlerts,
} from "@/lib/kitchen-dashboard/engine";
import styles from "./page.module.scss";

const DashboardPage = () => {
  const {
    orders,
    unitCosts,
    unitPriceHistory,
    stockRemaining,
    stockValueHistory,
  } = useLiveKitchenDashboard();
  const { opened: chatbotOpened, toggle: toggleChatbot } = useChatbot();
  const [forecastMode, setForecastMode] = useState(false);
  const [forecast, setForecast] = useState<ReturnType<typeof buildForecast> | null>(null);
  const [forecastAnchor] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.getTime();
  });

  const visibleOrders = forecastMode && forecast ? forecast.orders : orders;
  const visibleStockHistory = forecastMode && forecast ? forecast.stockHistory : stockValueHistory;
  const visibleStockRemaining = forecastMode && forecast ? forecast.stockRemaining : stockRemaining;
  const visibleUnitPriceHistory = forecastMode && forecast
    ? forecast.unitPriceHistory
    : unitPriceHistory;
  const visibleUnitCosts = forecastMode && forecast ? forecast.unitCosts : unitCosts;

  const toggleForecast = () => {
    if (forecastMode) {
      setForecastMode(false);
      return;
    }

    setForecast(
      buildForecast({
        orders,
        stockRemaining,
        unitCosts,
        unitPriceHistory,
        anchor: forecastAnchor,
      }),
    );
    setForecastMode(true);
  };

  const totals = useMemo(
    () =>
      visibleOrders.reduce(
        (acc, o) => {
          acc.revenue += o.revenue;
          acc.cost += o.cost;
          return acc;
        },
        { revenue: 0, cost: 0 },
      ),
    [visibleOrders],
  );
  const grossProfit = totals.revenue - totals.cost;
  const remainingStockValue = useMemo(
    () => computeRemainingStockValue(visibleStockRemaining, visibleUnitCosts),
    [visibleStockRemaining, visibleUnitCosts],
  );

  const costByCategory = useMemo(() => computeCostByCategory(visibleOrders), [visibleOrders]);
  const revenueByCategory = useMemo(
    () => computeRevenueByMenuCategory(visibleOrders),
    [visibleOrders],
  );
  const marginRanking = useMemo(() => computeMarginRanking(visibleOrders), [visibleOrders]);
  const stockAlerts = useMemo(
    () => computeStockAlerts(visibleStockRemaining),
    [visibleStockRemaining],
  );
  const preparationForecast = useMemo(
    () => computeIngredientPreparationForecast(orders, 10),
    [orders],
  );

  // Last 12 minute-buckets feed the stat-tile sparklines — a short trend
  // strip standing in for a delta-vs-prior-period (there's no fixed prior
  // period in a same-session demo feed).
  const minuteBuckets = useMemo(
    () => bucketOrdersByTime(visibleOrders, forecastMode ? "day" : "minute").slice(-12),
    [visibleOrders, forecastMode],
  );

  const stats: StatTileData[] = [
    {
      key: "orders",
      icon: "/icon/regular/receipt.svg",
      label: "จำนวน order วันนี้",
      value: visibleOrders.length.toLocaleString("th-TH"),
    },
    {
      key: "revenue",
      icon: "/icon/regular/coin.svg",
      label: "ยอดขายรวม",
      value: `฿${formatCurrency(totals.revenue)}`,
      sparkline: minuteBuckets.map((b) => b.revenue),
    },
    {
      key: "cost",
      icon: "/icon/regular/carrot.svg",
      label: "ต้นทุนวัตถุดิบที่หักแล้ว",
      value: `฿${formatCurrency(totals.cost)}`,
      sparkline: minuteBuckets.map((b) => b.cost),
    },
    {
      key: "profit",
      icon: "/icon/regular/chart-line-up.svg",
      label: "กำไรขั้นต้น (real-time)",
      value: `฿${formatCurrency(grossProfit)}`,
      sparkline: minuteBuckets.map((b) => b.profit),
    },
    {
      key: "stock-value",
      icon: "/icon/regular/package.svg",
      label: "มูลค่าวัตถุดิบคงเหลือ",
      value: `฿${formatCurrency(remainingStockValue)}`,
    },
  ];

  return (
    <div className={`${styles.page} ${forecastMode ? styles.forecastMode : ""}`}>
      <AnnouncementBar
        message={
          forecastMode
            ? "โหมดคาดการณ์เป็น snapshot จากข้อมูล ณ ตอนกดปุ่ม จะไม่เปลี่ยนตาม order ใหม่"
            : "ตัวเลขในหน้านี้คำนวณสดทุกครั้งที่มี order ใหม่ ไม่ต้องกดรีเฟรช"
        }
      />

      <div className={styles.shell}>
        <DashboardSidebar />

        <main className={styles.content}>
          <div className={styles.pageHead}>
            <div className={styles.pageHeadText}>
              <h1 className={styles.pageTitle}>
                {forecastMode ? "ภาพรวมร้านแบบคาดการณ์" : "ภาพรวมร้านแบบเรียลไทม์"}
              </h1>
              <p className={styles.pageSubtitle}>
                {forecastMode
                  ? `ประมาณการรายได้ ต้นทุน และสต็อกล่วงหน้า ${FORECAST_DAYS} วันจาก order ที่ยืนยันแล้ว`
                  : "ทุกแถวคือ order ที่คำนวณยอดขาย ต้นทุน และหักสต็อกเสร็จสมบูรณ์ทันทีที่บันทึกเข้าระบบ"}
              </p>
            </div>
            {/* Same button, same chatbot hook, same position (top-right of
                the page header) as ExpenseHeader on /home. */}
              
            <div className={styles.headActions}>
              <Button
              variant="default"
              radius="md"
              leftSection={<Icon src="/icon/regular/chat-circle-dots.svg" size={16} />}
              onClick={toggleChatbot}
              aria-expanded={chatbotOpened}
            >
              แชท AI
              </Button>
              <Button
              variant={forecastMode ? "filled" : "default"}
              color={forecastMode ? "blue" : undefined}
              radius="md"
              leftSection={<Icon src="/icon/regular/presentation-chart.svg" size={16} />}
              onClick={toggleForecast}
              aria-pressed={forecastMode}
              className={forecastMode ? styles.forecastButton : undefined}
            >
              คาดการณ์
              </Button>
            </div>
            {forecastMode && (
              <span className={styles.forecastContext} role="status">
                คาดการณ์ {FORECAST_DAYS} วันถัดไปจาก order ที่ยืนยันแล้ว
              </span>
            )}
          </div>

          <StatRow stats={stats} />
          <CostRevenueDonuts
            costByCategory={costByCategory}
            revenueByCategory={revenueByCategory}
            forecast={forecastMode}
          />
          <RevenueCostTrend
            key={forecastMode ? "forecast" : "live"}
            orders={visibleOrders}
            forecast={forecastMode}
          />

          <div className={styles.trendRow}>
            <StockLevelTrend history={visibleStockHistory} forecast={forecastMode} />
            <UnitPriceTrend unitPriceHistory={visibleUnitPriceHistory} forecast={forecastMode} />
          </div>

          <div className={styles.insightRow}>
            <MarginRanking stats={marginRanking} forecast={forecastMode} />
            <StockAlerts alerts={stockAlerts} forecast={forecastMode} />
          </div>

          <PreparationForecast forecast={preparationForecast} />
          <div id="today-orders">
            <OrderTable orders={visibleOrders} forecast={forecastMode} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
