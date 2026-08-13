"use client";

import { useMemo } from "react";
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
import { formatCurrency } from "@/lib/expense/group-by-week";
import { useLiveKitchenDashboard } from "@/lib/kitchen-dashboard/use-live-dashboard";
import {
  bucketOrdersByTime,
  computeCostByCategory,
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
  const grossProfit = totals.revenue - totals.cost;
  const remainingStockValue = useMemo(
    () => computeRemainingStockValue(stockRemaining, unitCosts),
    [stockRemaining, unitCosts],
  );

  const costByCategory = useMemo(() => computeCostByCategory(orders), [orders]);
  const revenueByCategory = useMemo(
    () => computeRevenueByMenuCategory(orders),
    [orders],
  );
  const marginRanking = useMemo(() => computeMarginRanking(orders), [orders]);
  const stockAlerts = useMemo(
    () => computeStockAlerts(stockRemaining),
    [stockRemaining],
  );

  // Last 12 minute-buckets feed the stat-tile sparklines — a short trend
  // strip standing in for a delta-vs-prior-period (there's no fixed prior
  // period in a same-session demo feed).
  const minuteBuckets = useMemo(
    () => bucketOrdersByTime(orders, "minute").slice(-12),
    [orders],
  );

  const stats: StatTileData[] = [
    {
      key: "orders",
      icon: "/icon/regular/receipt.svg",
      label: "จำนวน order วันนี้",
      value: orders.length.toLocaleString("th-TH"),
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
    <div className={styles.page}>
      <AnnouncementBar message="ตัวเลขในหน้านี้คำนวณสดทุกครั้งที่มี order ใหม่ ไม่ต้องกดรีเฟรช" />

      <div className={styles.shell}>
        <DashboardSidebar />

        <main className={styles.content}>
          <div className={styles.pageHead}>
            <div className={styles.pageHeadText}>
              <h1 className={styles.pageTitle}>ภาพรวมร้านแบบเรียลไทม์</h1>
              <p className={styles.pageSubtitle}>
                ทุกแถวคือ order ที่คำนวณยอดขาย ต้นทุน
                และหักสต็อกเสร็จสมบูรณ์ทันทีที่บันทึกเข้าระบบ
              </p>
            </div>
            {/* Same button, same chatbot hook, same position (top-right of
                the page header) as ExpenseHeader on /home. */}
            <Button
              variant="default"
              radius="md"
              leftSection={<Icon src="/icon/regular/chat-circle-dots.svg" size={16} />}
              onClick={toggleChatbot}
              aria-expanded={chatbotOpened}
            >
              ผู้ช่วยการตลาด
            </Button>
          </div>

          <StatRow stats={stats} />
          <CostRevenueDonuts
            costByCategory={costByCategory}
            revenueByCategory={revenueByCategory}
          />
          <RevenueCostTrend orders={orders} />

          <div className={styles.trendRow}>
            <StockLevelTrend history={stockValueHistory} />
            <UnitPriceTrend unitPriceHistory={unitPriceHistory} />
          </div>

          <div className={styles.insightRow}>
            <MarginRanking stats={marginRanking} />
            <StockAlerts alerts={stockAlerts} />
          </div>

          <OrderTable orders={orders} />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
