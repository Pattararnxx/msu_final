"use client";

import { useState } from "react";
import { Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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

const Home = () => {
  const weekGroups = groupExpensesByWeek(MOCK_EXPENSES);
  const summary = computeExpenseSummary(MOCK_EXPENSES, REFERENCE_DATE);
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

  return (
    <DashboardShell
      asideSlot={<ExpenseUploadPanel opened={uploadOpened} onClose={closeUpload} />}
    >
      <ExpenseHeader
        businessName="โจ๊กป้าแดง"
        phone=" 58 สามแยกกาฬสินธุ์ ถ.ถีนานนท์ ต.ตลาด อ.เมือง จ.มหาสารคาม"
        onUploadClick={openUpload}
      />

      <ExpenseSummaryCards
        monthLabel="พฤษภาคม 2026"
        yearLabel="2026"
        receiptCountThisMonth={summary.receiptCountThisMonth}
        expenseThisMonth={summary.expenseThisMonth}
        expenseThisYear={summary.expenseThisYear}
      />

      <Tabs defaultValue="expenses" className={styles.tabs}>
        <Tabs.List>
          <Tabs.Tab value="expenses" leftSection={<Icon src="/icon/regular/list.svg" size={16} />}>
            รายการค่าใช้จ่าย
          </Tabs.Tab>
          <Tabs.Tab
            value="vouchers"
            leftSection={<Icon src="/icon/regular/receipt.svg" size={16} />}
          >
            ใบสำคัญจ่าย
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="expenses" className={styles.tabPanel}>
          <ExpenseFilterBar />
          <ExpenseWeekList groups={weekGroups} />
        </Tabs.Panel>

        <Tabs.Panel value="vouchers" className={styles.tabPanel}>
          <div className={styles.emptyState}>ยังไม่มีใบสำคัญจ่ายในระบบ</div>
        </Tabs.Panel>
      </Tabs>
    </DashboardShell>
  );
};

export default Home;
