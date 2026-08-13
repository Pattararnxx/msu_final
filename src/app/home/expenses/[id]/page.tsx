"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Button } from "@mantine/core";
import AnnouncementBar from "@/component/announcement-bar/announcement-bar";
import DashboardSidebar from "@/component/dashboard-sidebar/dashboard-sidebar";
import Icon from "@/component/icon/icon";
import { formatCurrency, formatThaiDate } from "@/lib/expense/group-by-week";
import { MOCK_EXPENSES } from "@/lib/expense/mock-data";
import type { ExpenseItem } from "@/lib/expense/types";
import styles from "./page.module.css";

const ATTACHMENTS = [
  { label: "ใบเสร็จหลัก", type: "document" },
  { label: "ภาพเอกสาร 2", type: "document" },
  { label: "ภาพเอกสาร 3", type: "document" },
  { label: "เพิ่มเอกสาร", type: "add" },
] as const;

const LINE_ITEMS = [
  { label: "#1 ค่าแรงพนักงาน", amount: 10050 },
  { label: "#2 ค่าอาหารพนักงาน", amount: 108 },
  { label: "#3 ค่าวัตถุดิบ", amount: 40 },
  { label: "#4 ค่าถุงบรรจุภัณฑ์", amount: 80 },
  { label: "#5 ค่าเดินทาง", amount: 80 },
];

function getExpense(id: string | string[] | undefined): ExpenseItem | undefined {
  const expenseId = Array.isArray(id) ? id[0] : id;
  return MOCK_EXPENSES.find((item) => item.id === expenseId);
}

function DocumentMock({ amount, date }: { amount: number; date: string }) {
  return (
    <div className={styles.documentPaper} aria-label="ตัวอย่างเอกสารค่าใช้จ่าย">
      <div className={styles.documentBrand}>iEat <span>ใบสำคัญจ่าย</span></div>
      <div className={styles.documentLine} />
      <div className={styles.documentMeta}>
        <span>วันที่ {date}</span>
        <span>เลขที่ EXP-011</span>
      </div>
      <div className={styles.documentTitle}>รายละเอียดค่าใช้จ่าย</div>
      <div className={styles.documentTable}>
        <div className={styles.documentTableHead}><span>รายการ</span><span>จำนวนเงิน</span></div>
        <div><span>ค่าจ้างพนักงานรายวัน</span><span>฿{formatCurrency(amount)}</span></div>
        <div><span>หักภาษี ณ ที่จ่าย</span><span>-</span></div>
        <div><span>หมายเหตุ</span><span>จ่ายครบแล้ว</span></div>
      </div>
      <div className={styles.documentTotal}>
        <span>ยอดรวม</span>
        <strong>฿{formatCurrency(amount)}</strong>
      </div>
      <div className={styles.documentSignature}>
        <span>ผู้จ่ายเงิน<br /><b>อนัญญา</b></span>
        <span>ผู้รับเงิน<br /><b>ทีมพนักงานเสิร์ฟ</b></span>
      </div>
    </div>
  );
}

export default function ExpenseDetailPage() {
  const params = useParams<{ id: string }>();
  const expense = useMemo(() => getExpense(params?.id), [params?.id]);
  const [activeTab, setActiveTab] = useState<"details" | "summary">("details");
  const [selectedAttachment, setSelectedAttachment] = useState(0);
  const [selectedLine, setSelectedLine] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [saved, setSaved] = useState(false);

  if (!expense) {
    return (
      <div className={styles.page}>
        <AnnouncementBar message="ขอบคุณผู้ใช้งานที่สนับสนุนนักพัฒนาคนไทยด้วยกัน" />
        <div className={styles.shell}>
          <DashboardSidebar />
          <main className={styles.missingState}>
            <Icon src="/icon/regular/file-x.svg" size={32} />
            <h1>ไม่พบรายการค่าใช้จ่าย</h1>
            <p>รายการนี้อาจถูกลบหรือยังไม่ได้บันทึกในระบบ</p>
            <Button component={Link} href="/home" variant="filled" color="dark" radius="md">
              กลับรายการค่าใช้จ่าย
            </Button>
          </main>
        </div>
      </div>
    );
  }

  const dateLabel = formatThaiDate(expense.date);
  const selectedAmount = LINE_ITEMS[selectedLine]?.amount ?? expense.amount;

  return (
    <div className={styles.page}>
      <AnnouncementBar message="ขอบคุณผู้ใช้งานที่สนับสนุนนักพัฒนาคนไทยด้วยกัน" />
      <div className={styles.shell}>
        <DashboardSidebar />
        <main className={styles.content}>
          <header className={styles.topBar}>
            <div>
              <Link href="/home" className={styles.backLink}>
                <Icon src="/icon/regular/arrow-left.svg" size={17} />
                กลับรายการค่าใช้จ่าย
              </Link>
              <h1>แก้ไขรายจ่าย</h1>
            </div>
            <div className={styles.topMeta}>
              <Badge size="sm" variant="light" color="green" radius="sm">ตรวจแล้วบางส่วน</Badge>
              <span className={styles.fileCount}>ไฟล์ปัจจุบัน: 3 / 5</span>
              <Link href="/home" className={styles.closeButton} aria-label="ปิดและกลับรายการ">
                <Icon src="/icon/regular/x.svg" size={18} />
              </Link>
            </div>
          </header>

          <div className={styles.workspace}>
            <section className={styles.previewColumn} aria-label="ตัวอย่างเอกสาร">
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>เอกสารอ้างอิง</span>
                  <h2>{expense.documentType}</h2>
                </div>
                <span className={styles.documentPosition}>3 จาก 5</span>
              </div>

              <div className={styles.previewFrame}>
                <div className={styles.documentCanvas}>
                  <div className={styles.documentScaled} style={{ transform: `scale(${zoom / 100})` }}>
                    <DocumentMock amount={expense.amount} date={dateLabel} />
                  </div>
                  <div className={styles.canvasBadge}>
                    <Icon src="/icon/regular/check-circle.svg" size={14} /> อ่านเอกสารแล้ว
                  </div>
                </div>
                <div className={styles.previewToolbar}>
                  <button type="button" onClick={() => setZoom((value) => Math.max(75, value - 25))} aria-label="ย่อเอกสาร">
                    <Icon src="/icon/regular/magnifying-glass-minus.svg" size={17} />
                  </button>
                  <span>{zoom}%</span>
                  <button type="button" onClick={() => setZoom((value) => Math.min(125, value + 25))} aria-label="ขยายเอกสาร">
                    <Icon src="/icon/regular/magnifying-glass-plus.svg" size={17} />
                  </button>
                  <span className={styles.toolbarDivider} />
                  <button type="button" onClick={() => setZoom(100)} aria-label="รีเซ็ตขนาดเอกสาร">
                    <Icon src="/icon/regular/arrow-counter-clockwise.svg" size={17} />
                  </button>
                </div>
              </div>

              <div className={styles.attachmentHeader}>
                <div>
                  <h3>เอกสารรายจ่าย</h3>
                  <span>{ATTACHMENTS.length - 1} ไฟล์แนบในรายการนี้</span>
                </div>
                <button type="button" className={styles.hideButton}>ซ่อน <Icon src="/icon/regular/caret-up.svg" size={14} /></button>
              </div>
              <div className={styles.attachments}>
                {ATTACHMENTS.map((attachment, index) => (
                  <button
                    type="button"
                    key={attachment.label}
                    className={selectedAttachment === index ? `${styles.attachment} ${styles.attachmentActive}` : styles.attachment}
                    onClick={() => attachment.type !== "add" && setSelectedAttachment(index)}
                    disabled={attachment.type === "add"}
                  >
                    {attachment.type === "add" ? (
                      <span className={styles.addDocument}><Icon src="/icon/regular/plus.svg" size={20} /></span>
                    ) : (
                      <span className={styles.thumbnail}><span>iEat</span><i /><i /><i /></span>
                    )}
                    <span>{attachment.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={styles.editorColumn} aria-label="แก้ไขข้อมูลรายจ่าย">
              <div className={styles.tabs} role="tablist" aria-label="ส่วนของข้อมูลรายจ่าย">
                <button type="button" className={activeTab === "details" ? `${styles.tab} ${styles.tabActive}` : styles.tab} onClick={() => setActiveTab("details")} role="tab" aria-selected={activeTab === "details"}>
                  ข้อมูลรายจ่าย
                </button>
                <button type="button" className={activeTab === "summary" ? `${styles.tab} ${styles.tabActive}` : styles.tab} onClick={() => setActiveTab("summary")} role="tab" aria-selected={activeTab === "summary"}>
                  รายละเอียดและสรุปค่าใช้จ่าย
                </button>
              </div>

              {activeTab === "details" ? (
                <>
                  <div className={styles.reviewNotice} role="status">
                    <Icon src="/icon/regular/warning.svg" size={18} />
                    <div>
                      <strong>กรุณาแก้ไขข้อมูลที่อ่านไม่ชัดในใบนี้</strong>
                      <span>ตรวจสอบรายการที่มีเครื่องหมาย <b>*</b> ก่อนบันทึกทุกครั้ง</span>
                    </div>
                    <button type="button" aria-label="ปิดข้อความแจ้งเตือน"><Icon src="/icon/regular/x.svg" size={15} /></button>
                  </div>

                  <div className={styles.currencyField}>
                    <label htmlFor="currency">สกุลเงิน <b>*</b></label>
                    <select id="currency" defaultValue="THB - Thai Baht (฿)">
                      <option>THB - Thai Baht (฿)</option>
                      <option>USD - US Dollar ($)</option>
                    </select>
                  </div>

                  <div className={styles.helperBar}>
                    <Icon src="/icon/regular/info.svg" size={16} />
                    <span>รายการค่าใช้จ่ายจะถูกบันทึกตามหมวดหมู่ที่เลือกเพื่อความสะดวกในการจัดทำรายงานภาษี</span>
                  </div>

                  <div className={styles.formLayout}>
                    <div className={styles.lineItems}>
                      <div className={styles.lineItemsHeader}>
                        <span>รายการในเอกสาร</span>
                        <span>{LINE_ITEMS.length} รายการ</span>
                      </div>
                      {LINE_ITEMS.map((line, index) => (
                        <button type="button" key={line.label} className={selectedLine === index ? `${styles.lineItem} ${styles.lineItemActive}` : styles.lineItem} onClick={() => setSelectedLine(index)}>
                          <span>{line.label}</span>
                          <small>ยอดชำระ ฿{formatCurrency(line.amount)}</small>
                        </button>
                      ))}
                    </div>

                    <form className={styles.detailForm} onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
                      <div className={styles.formHeading}>
                        <div><span className={styles.formNumber}>#{selectedLine + 1}</span><h2>{LINE_ITEMS[selectedLine]?.label.replace(/^#\d+\s/, "")}</h2></div>
                        <Badge size="sm" variant="light" color="green" radius="sm">ตรวจแล้ว</Badge>
                      </div>
                      <label>รายละเอียด <b>*</b><input defaultValue={selectedLine === 0 ? expense.description : LINE_ITEMS[selectedLine]?.label.replace(/^#\d+\s/, "")} /></label>
                      <div className={styles.twoFields}>
                        <label>ประเภท <b>*</b><select defaultValue="สินค้า"><option>สินค้า</option><option>บริการ</option></select></label>
                        <label>จำนวนเงิน <b>*</b><input type="number" defaultValue={selectedAmount} min="0" step="0.01" /></label>
                      </div>
                      <label>หมวดหมู่ <b>*</b><select defaultValue="ค่าแรงพนักงาน"><option>ค่าแรงพนักงาน</option><option>วัตถุดิบ</option><option>บรรจุภัณฑ์</option><option>ค่าใช้จ่ายทั่วไป</option></select></label>
                      <label>ผู้จ่ายเงิน <input defaultValue={expense.payer} /></label>
                      <div className={styles.taxRow}><span>รวมก่อนภาษี</span><strong>฿{formatCurrency(selectedAmount)}</strong></div>
                      {saved && <p className={styles.savedMessage} role="status"><Icon src="/icon/regular/check-circle.svg" size={15} /> บันทึกฉบับร่างแล้ว</p>}
                      <div className={styles.formActions}>
                        <Button component={Link} href="/home" variant="default" radius="md">ยกเลิก</Button>
                        <Button type="submit" variant="filled" color="dark" radius="md" leftSection={<Icon src="/icon/regular/check.svg" size={16} />}>บันทึกข้อมูล</Button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className={styles.summaryPanel}>
                  <div className={styles.summaryHero}><span>ยอดรวมรายการนี้</span><strong>฿{formatCurrency(expense.amount)}</strong><small>ข้อมูลจากเอกสาร {expense.documentType} · {dateLabel}</small></div>
                  <div className={styles.summaryRows}>
                    <div><span>ร้านค้า / ผู้รับเงิน</span><strong>{expense.vendor}</strong></div>
                    <div><span>รายละเอียด</span><strong>{expense.description}</strong></div>
                    <div><span>ผู้จ่ายเงิน</span><strong>{expense.payer}</strong></div>
                    <div><span>สถานะจ่าย</span><Badge size="sm" variant="light" color="green" radius="sm">{expense.status}</Badge></div>
                  </div>
                  <div className={styles.summaryNote}><Icon src="/icon/regular/info.svg" size={16} /> ข้อมูลนี้เป็นฉบับร่างจากเอกสารที่อัปโหลด โปรดตรวจสอบกับใบจริงก่อนนำไปทำรายงาน</div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
