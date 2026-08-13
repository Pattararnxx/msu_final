"use client";

import { Fragment, useState } from "react";
import { ActionIcon, Badge, Checkbox, Group, Table } from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { ExpenseWeekGroup } from "@/lib/expense/group-by-week";
import { formatCurrency, formatThaiDate } from "@/lib/expense/group-by-week";
import styles from "./expense-week-list.module.css";

interface ExpenseWeekListProps {
  groups: ExpenseWeekGroup[];
}

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
    return <div className={styles.empty}>ไม่มีออเดอร์ในช่วงที่เลือก</div>;
  }

  return (
    <Table.ScrollContainer minWidth={840} className={styles.scrollContainer}>
      <Table verticalSpacing={10} horizontalSpacing="md" className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th className={styles.checkboxCol}>
              <Checkbox aria-label="เลือกทั้งหมด" size="xs" />
            </Table.Th>
            <Table.Th>วันที่</Table.Th>
            <Table.Th>รายการอาหาร</Table.Th>
            <Table.Th>ชื่อผู้สั่ง</Table.Th>
            <Table.Th>รายละเอียด</Table.Th>
            <Table.Th>เวลาอัปโหลด</Table.Th>
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
                  <Table.Td colSpan={8} className={styles.groupCell}>
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
                      <span className={styles.groupLabel}>สัปดาห์ {group.rangeLabel}</span>
                      <Badge size="sm" variant="light" color="gray" radius="sm">
                        {group.items.length} รายการ
                      </Badge>
                      <span className={styles.groupTotal}>
                        ยอดรวม ฿{formatCurrency(group.total)}
                      </span>
                      <span className={isOpen ? styles.caretOpen : styles.caret}>
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
                          aria-label={`เลือก ${item.customerName ?? "ไม่ทราบชื่อ"}`}
                          size="xs"
                        />
                      </Table.Td>
                      <Table.Td className={styles.dateCell}>
                        {formatThaiDate(item.date)}
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="wrap">
                          {item.foodItems.map((food) => (
                            <Badge key={food} size="sm" variant="outline" color="gray" radius="sm">
                              {food}
                            </Badge>
                          ))}
                        </Group>
                      </Table.Td>
                      <Table.Td className={styles.customerNameCell}>
                        {item.customerName ? (
                          item.customerName
                        ) : (
                          <span className={styles.unknownName}>ไม่ทราบชื่อ</span>
                        )}
                      </Table.Td>
                      <Table.Td className={styles.descriptionCell}>
                        {item.description}
                      </Table.Td>
                      <Table.Td className={styles.uploadedAtCell}>{item.uploadedAt}</Table.Td>
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
                          <Icon src="/icon/regular/trash-simple.svg" size={16} />
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
