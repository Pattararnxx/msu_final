"use client";

import { Fragment, useState } from "react";
import { ActionIcon, Badge, Checkbox, Table } from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { ExpenseWeekGroup } from "@/lib/expense/group-by-week";
import { formatCurrency, formatThaiDate } from "@/lib/expense/group-by-week";
import type { PaymentStatus } from "@/lib/expense/types";
import styles from "./expense-week-list.module.css";

interface ExpenseWeekListProps {
  groups: ExpenseWeekGroup[];
}

const STATUS_COLOR: Record<PaymentStatus, string> = {
  จ่ายแล้ว: "green",
  รอจ่าย: "yellow",
  ยกเลิก: "gray",
};

export default function ExpenseWeekList({ groups }: ExpenseWeekListProps) {
  // All weeks start expanded, same as the reference design's month groups.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (groups.length === 0) {
    return (
      <div className={styles.empty}>ไม่มีรายการค่าใช้จ่ายในช่วงที่เลือก</div>
    );
  }

  return (
    <Table.ScrollContainer minWidth={880} className={styles.scrollContainer}>
      <Table
        verticalSpacing={10}
        horizontalSpacing="md"
        className={styles.table}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={styles.checkboxCol}></Table.Th>
            <Table.Th>วันที่</Table.Th>
            <Table.Th>ประเภทเอกสาร</Table.Th>
            <Table.Th>ร้านค้า</Table.Th>
            <Table.Th>รายละเอียด</Table.Th>
            <Table.Th>ผู้จ่ายเงิน</Table.Th>
            <Table.Th>สถานะจ่าย</Table.Th>
            <Table.Th className={styles.amountCol}>จำนวนเงิน</Table.Th>
            <Table.Th className={styles.actionCol} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {groups.map((group) => {
            const isOpen = !collapsed.has(group.key);
            return (
              <Fragment key={group.key}>
                <Table.Tr className={styles.groupRow}>
                  <Table.Td colSpan={9} className={styles.groupCell}>
                    <button
                      type="button"
                      className={styles.groupHeader}
                      onClick={() => toggleGroup(group.key)}
                      aria-expanded={isOpen}
                    >
                      <Checkbox
                        aria-label={`เลือกสัปดาห์ ${group.rangeLabel}`}
                        size="xs"
                        onClick={(event) => event.stopPropagation()}
                      />
                      <span className={styles.groupLabel}>
                        สัปดาห์ {group.rangeLabel}
                      </span>
                      <Badge size="sm" variant="light" color="gray" radius="sm">
                        {group.items.length} รายการ
                      </Badge>
                      <span className={styles.groupTotal}>
                        ยอดรวม ฿{formatCurrency(group.total)}
                      </span>
                      <span
                        className={isOpen ? styles.caretOpen : styles.caret}
                      >
                        <Icon src="/icon/regular/caret-down.svg" size={16} />
                      </span>
                    </button>
                  </Table.Td>
                </Table.Tr>

                {isOpen &&
                  group.items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Checkbox
                          aria-label={`เลือก ${item.description}`}
                          size="xs"
                        />
                      </Table.Td>
                      <Table.Td className={styles.dateCell}>
                        {formatThaiDate(item.date)}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="outline"
                          color="gray"
                          radius="sm"
                        >
                          {item.documentType}
                        </Badge>
                      </Table.Td>
                      <Table.Td className={styles.vendorCell}>
                        {item.vendor}
                      </Table.Td>
                      <Table.Td className={styles.descriptionCell}>
                        {item.description}
                      </Table.Td>
                      <Table.Td className={styles.payerCell}>
                        {item.payer}
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={STATUS_COLOR[item.status]}
                          radius="sm"
                        >
                          {item.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td className={styles.amountCol}>
                        ฿{formatCurrency(item.amount)}
                      </Table.Td>
                      <Table.Td className={styles.actionCol}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label="ลบรายการ"
                          size="sm"
                        >
                          <Icon
                            src="/icon/regular/trash-simple.svg"
                            size={16}
                          />
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Fragment>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
