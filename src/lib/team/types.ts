export interface StaffPermissions {
  upload: boolean;
  edit: boolean;
  delete: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  /** The restaurant owner — permissions are always all-true and locked. */
  isOwner?: boolean;
  permissions: StaffPermissions;
  /** e.g. "วันนี้ 07:12" — null if they've never uploaded anything. */
  lastUploadAt: string | null;
  uploadsThisWeek: number;
}

export type PermissionLogStatus = "success" | "pending" | "warning";

export interface PermissionLogEntry {
  id: string;
  message: string;
  status: PermissionLogStatus;
  timeAgo: string;
}

export interface HourlyUploadBucket {
  /** e.g. "06:00" */
  hour: string;
  count: number;
}
