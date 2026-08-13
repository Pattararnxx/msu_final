"use client";

import { Suspense, useState } from "react";
import { Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSearchParams } from "next/navigation";
import Icon from "@/component/icon/icon";
import DashboardShell from "@/component/dashboard-shell/dashboard-shell";
import ExpenseHeader from "@/component/expense-header/expense-header";
import ExpenseSummaryCards from "@/component/expense-summary-cards/expense-summary-cards";
import ExpenseFilterBar from "@/component/expense-filter-bar/expense-filter-bar";
import ExpenseWeekList from "@/component/expense-week-list/expense-week-list";
import ExpenseUploadPanel from "@/component/expense-upload-panel/expense-upload-panel";
import OrderDetailPanel from "@/component/order-detail/order-detail-panel";
import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import { groupExpensesByWeek } from "@/lib/expense/group-by-week";
import { computeExpenseSummary } from "@/lib/expense/summary";
import type { ExpenseItem } from "@/lib/expense/types";
import styles from "./page.module.scss";

// "Now" for the summary cards — the mock data sits in April 2026, so May
// reads as the empty current month while the yearly total still adds up.
// Swap for `new Date()` once this reads a live feed.
const REFERENCE_DATE = new Date("2026-05-01");

const HomeContent = () => {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<ExpenseItem[]>(MOCK_EXPENSES);
  const reviewMode = searchParams.get("view") === "review";
  const visibleOrders = reviewMode
    ? orders.filter(
        (order) =>
          !order.humanReviewed ||
          (order.confidence ?? 1) < 0.7 ||
          order.items.some((item) => item.needsReview && !item.humanReviewed),
      )
    : orders;
  const weekGroups = groupExpensesByWeek(visibleOrders);
  const summary = computeExpenseSummary(orders, REFERENCE_DATE);
  const [uploadOpened, { open: openUploadPanel, close: closeUpload }] =
    useDisclosure(false);
  const [selectedOrder, setSelectedOrder] = useState<ExpenseItem | null>(null);

  // ExpenseUploadPanel and OrderDetailPanel both squeeze <main> the same
  // way (see their shared sticky-flex-sibling mechanism) — opening either
  // one closes the other so their widths never stack and over-compress
  // the layout. The AI chat panel is a separate overlay layer and is
  // deliberately left untouched by both.
  const openUpload = () => {
    setSelectedOrder(null);
    openUploadPanel();
  };
  const selectOrder = (order: ExpenseItem) => {
    closeUpload();
    setSelectedOrder(order);
  };
  const closeOrderDetail = () => setSelectedOrder(null);
  const saveOrders = (savedOrders: ExpenseItem[]) => {
    setOrders((current) => {
      const savedIds = new Set(savedOrders.map((order) => order.id));
      return [...savedOrders, ...current.filter((order) => !savedIds.has(order.id))];
    });
  };

  return (
    <DashboardShell
      asideSlot={
        <>
          <ExpenseUploadPanel
            opened={uploadOpened}
            onClose={closeUpload}
            onSave={saveOrders}
          />
          <OrderDetailPanel order={selectedOrder} onClose={closeOrderDetail} />
        </>
      }
    >
      <ExpenseHeader
        businessName="โจ๊กป้าแดง"
        phone=" 58 สามแยกกาฬสินธุ์ ถ.ถีนานนท์ ต.ตลาด อ.เมือง จ.มหาสารคาม"
        onUploadClick={openUpload}
        orders={orders}
      />

      <ExpenseSummaryCards
        monthLabel="พฤษภาคม 2026"
        yearLabel="2026"
        receiptCountThisMonth={summary.receiptCountThisMonth}
        expenseThisMonth={summary.expenseThisMonth}
        expenseThisYear={summary.expenseThisYear}
      />

      <Tabs defaultValue="orders" className={styles.tabs} id="order-list">
        <Tabs.List>
          <Tabs.Tab value="orders" leftSection={<Icon src="/icon/regular/list.svg" size={16} />}>
            {reviewMode ? "ใบออร์เดอร์รอตรวจทาน" : "รายการออร์เดอร์"}
          </Tabs.Tab>
          <Tabs.Tab
            value="receipts"
            leftSection={<Icon src="/icon/regular/receipt.svg" size={16} />}
          >
            ใบเสร็จที่ยืนยันแล้ว
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="orders" className={styles.tabPanel}>
          <ExpenseFilterBar />
          <ExpenseWeekList groups={weekGroups} onSelectOrder={selectOrder} />
        </Tabs.Panel>

        <Tabs.Panel value="receipts" className={styles.tabPanel}>
          <div className={styles.emptyState}>ใบเสร็จจะสร้างหลังพนักงานยืนยันออร์เดอร์</div>
        </Tabs.Panel>
      </Tabs>
    </DashboardShell>
  );
};

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
