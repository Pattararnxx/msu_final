"use client";

import { Group, SegmentedControl, Select, TextInput } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./expense-filter-bar.module.css";

const FOOD_TYPES = ["รายการอาหารทั้งหมด", "ข้าวต้ม", "โจ๊ก", "ก๋วยจั๊บ", "อื่นๆ"];

// Static, non-wired filter row — swap for controlled state + real query
// params once the order feed is live. SegmentedControl on the right picks
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
          placeholder="ค้นหาชื่อผู้สั่ง, รายละเอียด"
          leftSection={<Icon src="/icon/regular/magnifying-glass.svg" size={15} />}
          radius="md"
          w={220}
          aria-label="ค้นหา"
        />

        <Select
          data={FOOD_TYPES}
          defaultValue={FOOD_TYPES[0]}
          leftSection={<Icon src="/icon/regular/file-text.svg" size={14} />}
          radius="md"
          w={180}
          checkIconPosition="right"
          aria-label="รายการอาหาร"
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
