"use client";

import { Tabs } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Icon from "@/component/icon/icon";
import AnnouncementBar from "@/component/announcement-bar/announcement-bar";
import DashboardSidebar from "@/component/dashboard-sidebar/dashboard-sidebar";
import ExpenseHeader from "@/component/expense-header/expense-header";
import ExpenseSummaryCards from "@/component/expense-summary-cards/expense-summary-cards";
import ExpenseFilterBar from "@/component/expense-filter-bar/expense-filter-bar";
import ExpenseWeekList from "@/component/expense-week-list/expense-week-list";
import ExpenseUploadPanel from "@/component/expense-upload-panel/expense-upload-panel";
import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import { groupExpensesByWeek } from "@/lib/expense/group-by-week";
import { computeExpenseSummary } from "@/lib/expense/summary";
import styles from "./page.module.scss";

// "Now" for the summary cards — the mock data sits in April 2026, so May
// reads as the empty current month while the yearly total still adds up.
// Swap for `new Date()` once this reads a live feed.
const REFERENCE_DATE = new Date("2026-05-01");

const Home = () => {
  const weekGroups = groupExpensesByWeek(MOCK_EXPENSES);
  const summary = computeExpenseSummary(MOCK_EXPENSES, REFERENCE_DATE);
  const [uploadOpened, { open: openUpload, close: closeUpload }] =
    useDisclosure(false);

  return (
    <div className={styles.page}>
      <AnnouncementBar message="ขอบคุณผู้ใช้งานที่สนับสนุนนักพัฒนาคนไทยด้วยกัน" />

      <div className={styles.shell}>
        <DashboardSidebar />

        <main className={styles.content}>
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
              <Tabs.Tab
                value="expenses"
                leftSection={<Icon src="/icon/regular/list.svg" size={16} />}
              >
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
        </main>

        <ExpenseUploadPanel opened={uploadOpened} onClose={closeUpload} />
      </div>
    </div>
  );
};

export default Home;
