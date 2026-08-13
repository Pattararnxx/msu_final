"use client";

import { ActionIcon, MultiSelect, Table } from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { StaffMember, StaffPermissions } from "@/lib/team/types";
import styles from "./team-members-table.module.css";

interface TeamMembersTableProps {
  staff: StaffMember[];
  onChangePermissions: (staffId: string, values: string[]) => void;
  onRemove: (staffId: string) => void;
}

const PERMISSION_OPTIONS: Array<{ value: keyof StaffPermissions; label: string }> = [
  { value: "upload", label: "อัปโหลด" },
  { value: "edit", label: "แก้ไข" },
  { value: "delete", label: "ลบ" },
];

function permissionsToValues(permissions: StaffPermissions): string[] {
  return PERMISSION_OPTIONS.filter((option) => permissions[option.value]).map(
    (option) => option.value,
  );
}

export default function TeamMembersTable({
  staff,
  onChangePermissions,
  onRemove,
}: TeamMembersTableProps) {
  return (
    <Table.ScrollContainer minWidth={760} className={styles.scrollContainer}>
      <Table verticalSpacing={10} horizontalSpacing="md" className={styles.table}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>พนักงาน</Table.Th>
            <Table.Th className={styles.permissionCol}>สิทธิ์</Table.Th>
            <Table.Th>อัปโหลดล่าสุด</Table.Th>
            <Table.Th className={styles.weekCol}>สัปดาห์นี้</Table.Th>
            <Table.Th className={styles.actionCol} />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {staff.map((member) => {
            const selectedPermissionValues = permissionsToValues(member.permissions);

            return (
              <Table.Tr key={member.id}>
                <Table.Td>
                  <div className={styles.identity}>
                    <span className={styles.avatar} aria-hidden="true">
                      {member.name.charAt(0)}
                    </span>
                    <div className={styles.identityText}>
                      <span className={styles.name}>
                        {member.name}
                        {member.isOwner && <span className={styles.ownerTag}>เจ้าของร้าน</span>}
                      </span>
                      <span className={styles.role}>{member.role}</span>
                    </div>
                  </div>
                </Table.Td>
                <Table.Td className={styles.permissionCol}>
                  <MultiSelect
                    size="xs"
                    radius={128}
                    data={PERMISSION_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    value={selectedPermissionValues}
                    onChange={(values) => onChangePermissions(member.id, values)}
                    disabled={member.isOwner}
                    placeholder={
                      !member.isOwner && selectedPermissionValues.length === 0 ? "เลือกสิทธิ์" : ""
                    }
                    clearable={!member.isOwner}
                    checkIconPosition="right"
                    aria-label={`สิทธิ์ของ ${member.name}`}
                    className={styles.permissionSelect}
                    classNames={{ input: styles.permissionInput }}
                  />
                </Table.Td>
                <Table.Td className={styles.mutedCell}>
                  {member.lastUploadAt ?? "ยังไม่เคยอัปโหลด"}
                </Table.Td>
                <Table.Td className={styles.weekCol}>{member.uploadsThisWeek}</Table.Td>
                <Table.Td className={styles.actionCol}>
                  {!member.isOwner && (
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      aria-label={`นำ ${member.name} ออกจากทีม`}
                      onClick={() => onRemove(member.id)}
                    >
                      <Icon src="/icon/regular/trash-simple.svg" size={16} />
                    </ActionIcon>
                  )}
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
}
