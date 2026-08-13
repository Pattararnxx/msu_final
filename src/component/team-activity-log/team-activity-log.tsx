import { Badge } from "@mantine/core";
import type { PermissionLogEntry, PermissionLogStatus } from "@/lib/team/types";
import styles from "./team-activity-log.module.css";

interface TeamActivityLogProps {
  entries: PermissionLogEntry[];
}

// Same status-color convention as the expense list's payment-status badges
// (green/yellow/gray family) — success/pending/warning here map to the
// same "settled vs. needs attention" read.
const STATUS_COLOR: Record<PermissionLogStatus, string> = {
  success: "green",
  pending: "yellow",
  warning: "orange",
};

const STATUS_LABEL: Record<PermissionLogStatus, string> = {
  success: "เสร็จสิ้น",
  pending: "รอดำเนินการ",
  warning: "ต้องตรวจสอบ",
};

export default function TeamActivityLog({ entries }: TeamActivityLogProps) {
  return (
    <div className={styles.card}>
      <span className={styles.title}>ความเคลื่อนไหวล่าสุด</span>
      <div className={styles.list}>
        {entries.map((entry) => (
          <div key={entry.id} className={styles.row}>
            <div className={styles.rowInfo}>
              <span className={styles.message}>{entry.message}</span>
              <span className={styles.timeAgo}>{entry.timeAgo}</span>
            </div>
            <Badge size="sm" variant="light" color={STATUS_COLOR[entry.status]} radius="sm">
              {STATUS_LABEL[entry.status]}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
