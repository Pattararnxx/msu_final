"use client";

import { Group, SegmentedControl, Select, TextInput } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./expense-filter-bar.module.css";

const PAYERS = ["ผู้จ่ายเงินทั้งหมด", "แม่ครัวใหญ่ สมศรี", "ผู้จัดการร้าน อนัญญา"];
const DOCUMENT_TYPES = [
  "ประเภทเอกสารทั้งหมด",
  "สลิปโอนเงิน",
  "ใบเสร็จรับเงิน",
  "ใบกำกับภาษี",
  "อื่นๆ",
];
const PAYMENT_STATUSES = ["สถานะจ่ายทั้งหมด", "จ่ายแล้ว", "รอจ่าย", "ยกเลิก"];
const CATEGORIES = [
  "หมวดหมู่ทั้งหมด",
  "วัตถุดิบ",
  "ค่าเช่าร้าน",
  "ค่าสาธารณูปโภค",
  "อุปกรณ์ครัว",
  "ค่าจ้างพนักงาน",
  "อื่นๆ",
];

// Static, non-wired filter row — swap for controlled state + real query
// params once the expense feed is live. SegmentedControl on the right picks
// which date column the (currently placeholder) date filter reads from.
export default function ExpenseFilterBar() {
  return (
    <div className={styles.bar}>
      <Group gap={8} className={styles.controls}>
        <button type="button" className={styles.dateButton}>
          <Icon src="/icon/regular/calendar-blank.svg" size={15} />
          เลือกวัน
        </button>

        <TextInput
          placeholder="ค้นหาร้านค้า, รายละเอียด"
          leftSection={<Icon src="/icon/regular/magnifying-glass.svg" size={15} />}
          radius="md"
          w={220}
          aria-label="ค้นหา"
        />

        <Select
          data={PAYERS}
          defaultValue={PAYERS[0]}
          leftSection={<Icon src="/icon/regular/user.svg" size={14} />}
          radius="md"
          w={168}
          checkIconPosition="right"
          aria-label="ผู้จ่ายเงิน"
        />
        <Select
          data={DOCUMENT_TYPES}
          defaultValue={DOCUMENT_TYPES[0]}
          leftSection={<Icon src="/icon/regular/file-text.svg" size={14} />}
          radius="md"
          w={180}
          checkIconPosition="right"
          aria-label="ประเภทเอกสาร"
        />
        <Select
          data={PAYMENT_STATUSES}
          defaultValue={PAYMENT_STATUSES[0]}
          leftSection={<Icon src="/icon/regular/check-circle.svg" size={14} />}
          radius="md"
          w={168}
          checkIconPosition="right"
          aria-label="สถานะจ่าย"
        />
        <Select
          data={CATEGORIES}
          defaultValue={CATEGORIES[0]}
          leftSection={<Icon src="/icon/regular/tag.svg" size={14} />}
          radius="md"
          w={168}
          checkIconPosition="right"
          aria-label="หมวดหมู่"
        />
      </Group>

      <SegmentedControl
        data={["วันที่ในใบเสร็จ", "วันที่อัปโหลด"]}
        size="xs"
        radius="md"
        className={styles.dateModeToggle}
      />
    </div>
  );
}
