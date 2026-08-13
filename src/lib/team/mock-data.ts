import type { HourlyUploadBucket, PermissionLogEntry, StaffMember } from "./types";

// Placeholder roster for "โจ๊กป้าแดง" — same staff names already used in
// the expense list's "พนักงานที่อัปโหลด" column (see lib/expense/mock-data),
// so the two pages read as the same restaurant rather than two demos.
export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: "staff-1",
    name: "บงกช",
    role: "เจ้าของร้าน",
    isOwner: true,
    permissions: { upload: true, edit: true, delete: true },
    lastUploadAt: "วันนี้ 07:12",
    uploadsThisWeek: 6,
  },
  {
    id: "staff-2",
    name: "อนัญญา",
    role: "ผู้จัดการร้าน",
    permissions: { upload: true, edit: true, delete: true },
    lastUploadAt: "วันนี้ 08:20",
    uploadsThisWeek: 9,
  },
  {
    id: "staff-3",
    name: "สมศรี",
    role: "แม่ครัวใหญ่",
    permissions: { upload: true, edit: true, delete: false },
    lastUploadAt: "วันนี้ 06:50",
    uploadsThisWeek: 12,
  },
  {
    id: "staff-4",
    name: "นภา",
    role: "พนักงานเสิร์ฟ",
    permissions: { upload: true, edit: false, delete: false },
    lastUploadAt: "เมื่อวาน 07:35",
    uploadsThisWeek: 8,
  },
  {
    id: "staff-5",
    name: "กิตติ",
    role: "พนักงานครัว",
    permissions: { upload: true, edit: false, delete: false },
    lastUploadAt: "เมื่อวาน 08:05",
    uploadsThisWeek: 3,
  },
  {
    id: "staff-6",
    name: "วิภา",
    role: "พนักงานเสิร์ฟ (พาร์ทไทม์)",
    permissions: { upload: false, edit: false, delete: false },
    lastUploadAt: null,
    uploadsThisWeek: 0,
  },
];

export const PERMISSION_LOG: PermissionLogEntry[] = [
  {
    id: "log-1",
    message: "อนัญญา ให้สิทธิ์อัปโหลดไฟล์กับ กิตติ",
    status: "success",
    timeAgo: "10 นาทีที่แล้ว",
  },
  {
    id: "log-2",
    message: "คำขอสิทธิ์แก้ไขข้อมูลจาก นภา รอการอนุมัติ",
    status: "pending",
    timeAgo: "1 ชั่วโมงที่แล้ว",
  },
  {
    id: "log-3",
    message: "วิภา เข้าร่วมทีมแล้ว รอกำหนดสิทธิ์",
    status: "warning",
    timeAgo: "3 ชั่วโมงที่แล้ว",
  },
  {
    id: "log-4",
    message: "อนัญญา ถอดสิทธิ์ลบข้อมูลของ สมศรี",
    status: "success",
    timeAgo: "เมื่อวาน",
  },
];

// Uploads by hour of day, aggregated across the week, across the
// restaurant's full opening hours (06:00–19:00) — not just the breakfast
// window, so the chart also shows the lunch bump and the quieter
// afternoon/dinner tail, not only the morning rush.
export const HOURLY_UPLOADS: HourlyUploadBucket[] = [
  { hour: "06:00", count: 4 },
  { hour: "07:00", count: 11 },
  { hour: "08:00", count: 14 },
  { hour: "09:00", count: 8 },
  { hour: "10:00", count: 5 },
  { hour: "11:00", count: 6 },
  { hour: "12:00", count: 10 },
  { hour: "13:00", count: 9 },
  { hour: "14:00", count: 4 },
  { hour: "15:00", count: 2 },
  { hour: "16:00", count: 3 },
  { hour: "17:00", count: 5 },
  { hour: "18:00", count: 7 },
  { hour: "19:00", count: 3 },
];
