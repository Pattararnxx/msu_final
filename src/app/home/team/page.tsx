"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import Icon from "@/component/icon/icon";
import DashboardShell from "@/component/dashboard-shell/dashboard-shell";
import TeamStatsCards, {
  type StatCardConfig,
} from "@/component/team-stats-cards/team-stats-cards";
import TeamUploadChart from "@/component/team-upload-chart/team-upload-chart";
import TeamActivityLog from "@/component/team-activity-log/team-activity-log";
import TeamMembersTable from "@/component/team-members-table/team-members-table";
import { STAFF_MEMBERS, PERMISSION_LOG, HOURLY_UPLOADS } from "@/lib/team/mock-data";
import styles from "./page.module.css";

const TeamPage = () => {
  const [staff, setStaff] = useState(STAFF_MEMBERS);

  const changePermissions = (staffId: string, values: string[]) => {
    setStaff((prev) =>
      prev.map((member) =>
        member.id === staffId
          ? {
              ...member,
              permissions: {
                upload: values.includes("upload"),
                edit: values.includes("edit"),
                delete: values.includes("delete"),
              },
            }
          : member,
      ),
    );
  };

  const removeStaff = (staffId: string) => {
    setStaff((prev) => prev.filter((member) => member.id !== staffId));
  };

  const uploadAccessCount = staff.filter((member) => member.permissions.upload).length;
  const uploadsThisWeek = staff.reduce((sum, member) => sum + member.uploadsThisWeek, 0);
  const pendingRequestCount = PERMISSION_LOG.filter(
    (entry) => entry.status === "pending" || entry.status === "warning",
  ).length;

  // Deltas are placeholder — swap for a real previous-period comparison
  // once this reads live data. Direction is a plain increase/decrease
  // read, not a good/bad judgment (see team-stats-cards.tsx).
  const statCards: StatCardConfig[] = [
    {
      label: "พนักงานทั้งหมด",
      value: staff.length,
      trend: { direction: "up", label: "+1 จากเดือนที่แล้ว" },
    },
    {
      label: "มีสิทธิ์อัปโหลดไฟล์",
      value: uploadAccessCount,
      trend: { direction: "up", label: "+8% จากเดือนที่แล้ว" },
    },
    {
      label: "คำขอสิทธิ์รออนุมัติ",
      value: pendingRequestCount,
      alert: pendingRequestCount > 0,
      trend: { direction: "down", label: "-1 จากสัปดาห์ที่แล้ว" },
    },
    {
      label: "ใบออร์เดอร์ที่อัปโหลดสัปดาห์นี้",
      value: uploadsThisWeek,
      trend: { direction: "up", label: "+15% จากสัปดาห์ที่แล้ว" },
    },
  ];

  return (
    <DashboardShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>ผู้ใช้ในธุรกิจของฉัน</h1>
          <p className={styles.subtitle}>
            กำหนดสิทธิ์อัปโหลด แก้ไข และลบข้อมูลของพนักงานแต่ละคน
          </p>
        </div>
        <Button
          variant="filled"
          color="dark"
          radius="md"
          leftSection={<Icon src="/icon/regular/user-plus.svg" size={16} />}
        >
          เชิญพนักงานใหม่
        </Button>
      </div>

      <div className={styles.content}>
        <TeamStatsCards cards={statCards} />

        <div className={styles.chartsRow}>
          <TeamUploadChart buckets={HOURLY_UPLOADS} />
          <TeamActivityLog entries={PERMISSION_LOG} />
        </div>

        <TeamMembersTable
          staff={staff}
          onChangePermissions={changePermissions}
          onRemove={removeStaff}
        />
      </div>
    </DashboardShell>
  );
};

export default TeamPage;
