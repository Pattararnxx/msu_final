"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  Button,
  Group,
  Image,
  NumberInput,
  Select,
  Stack,
  Stepper,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import Icon from "@/component/icon/icon";
import type { DocumentType, PaymentStatus } from "@/lib/expense/types";
import { formatCurrency } from "@/lib/expense/group-by-week";
import styles from "./expense-upload-panel.module.css";

interface ExpenseUploadPanelProps {
  opened: boolean;
  onClose: () => void;
}

interface PickedFile {
  file: File;
  kind: "image" | "pdf";
  /** Object URL — only created for images; PDFs render an icon tile instead. */
  previewUrl?: string;
}

interface DraftLineItem {
  date: string;
  documentType: DocumentType;
  vendor: string;
  description: string;
  category: string;
  payer: string;
  status: PaymentStatus;
  amount: number | "";
}

// One staged expense: either backed by an uploaded file (auto-filled on
// add) or a manual, fileless placeholder — both carry the same editable
// draft, shown inline instead of behind a separate "edit" step.
interface StagedEntry {
  id: string;
  file?: PickedFile;
  draft: DraftLineItem;
}

const DOCUMENT_TYPES: DocumentType[] = [
  "สลิปโอนเงิน",
  "ใบเสร็จรับเงิน",
  "ใบกำกับภาษี",
  "อื่นๆ",
];
const CATEGORIES = [
  "วัตถุดิบ",
  "ค่าเช่าร้าน",
  "ค่าสาธารณูปโภค",
  "อุปกรณ์ครัว",
  "ค่าจ้างพนักงาน",
  "อื่นๆ",
];
const PAYERS = ["แม่ครัวใหญ่ สมศรี", "ผู้จัดการร้าน อนัญญา"];
const PAYMENT_STATUSES: PaymentStatus[] = ["จ่ายแล้ว", "รอจ่าย", "ยกเลิก"];

// Stand-ins for a real receipt-scanning/OCR service — cycled through as
// files come in so each upload looks freshly "read" instead of identical.
// Swap for an actual extraction call once one exists; until then this is
// what makes "upload a photo → fields fill themselves" demonstrable.
const MOCK_EXTRACTIONS: Array<{
  vendor: string;
  documentType: DocumentType;
  category: string;
  description: string;
  amountRange: [number, number];
}> = [
  {
    vendor: "ตลาดสดเช้าสี่มุมเมือง",
    documentType: "ใบเสร็จรับเงิน",
    category: "วัตถุดิบ",
    description: "ค่าวัตถุดิบสด",
    amountRange: [800, 4500],
  },
  {
    vendor: "ร้านกาแฟคั่วบ้านๆ",
    documentType: "สลิปโอนเงิน",
    category: "วัตถุดิบ",
    description: "ค่าเมล็ดกาแฟและนมสด",
    amountRange: [500, 2000],
  },
  {
    vendor: "ร้านแก๊สหุงต้มบุญมี",
    documentType: "ใบเสร็จรับเงิน",
    category: "ค่าสาธารณูปโภค",
    description: "ค่าแก๊สหุงต้ม",
    amountRange: [900, 1800],
  },
  {
    vendor: "ร้านข้าวสารบุญมี",
    documentType: "ใบเสร็จรับเงิน",
    category: "วัตถุดิบ",
    description: "ค่าข้าวสารและเส้นก๋วยเตี๋ยว",
    amountRange: [1000, 3000],
  },
  {
    vendor: "บมจ. การไฟฟ้า",
    documentType: "ใบเสร็จรับเงิน",
    category: "ค่าสาธารณูปโภค",
    description: "ค่าไฟฟ้าร้าน",
    amountRange: [1500, 4000],
  },
];

function fileKind(file: File): "image" | "pdf" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function blankDraft(): DraftLineItem {
  return {
    date: todayIso(),
    documentType: "อื่นๆ",
    vendor: "",
    description: "",
    category: CATEGORIES[0],
    payer: PAYERS[0],
    status: "รอจ่าย",
    amount: "",
  };
}

function simulatedDraft(seed: number): DraftLineItem {
  const preset = MOCK_EXTRACTIONS[seed % MOCK_EXTRACTIONS.length];
  const [min, max] = preset.amountRange;
  const amount = Math.round((min + Math.random() * (max - min)) * 100) / 100;
  return {
    date: todayIso(),
    documentType: preset.documentType,
    vendor: preset.vendor,
    description: preset.description,
    category: preset.category,
    payer: PAYERS[0],
    status: "รอจ่าย",
    amount,
  };
}

// A two-step flow (upload & fill → confirm) that slides in as a real flex
// sibling of <main> and squeezes it, rather than a Drawer/overlay — no
// backdrop, no portal, the main content area just gets narrower while this
// panel's width animates in. Uploading a file auto-fills its card's fields
// (simulated — see MOCK_EXTRACTIONS) right there in step one instead of
// behind a separate edit step; browsing/editing already-saved expenses
// still lives on their own page.
export default function ExpenseUploadPanel({ opened, onClose }: ExpenseUploadPanelProps) {
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<StagedEntry[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const fileEntryCount = entries.filter((entry) => entry.file).length;

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    let seed = fileEntryCount;
    const next: StagedEntry[] = Array.from(fileList).flatMap((file) => {
      const kind = fileKind(file);
      if (!kind) return [];
      const entry: StagedEntry = {
        id: `${file.name}-${file.lastModified}-${file.size}`,
        file: {
          file,
          kind,
          previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
        },
        draft: simulatedDraft(seed),
      };
      seed += 1;
      return [entry];
    });
    if (next.length === 0) return;
    setEntries((prev) => [...prev, ...next]);
  };

  const addManualEntry = () => {
    setEntries((prev) => [
      ...prev,
      { id: `manual-${Date.now()}-${prev.length}`, draft: blankDraft() },
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const target = prev.find((entry) => entry.id === id);
      if (target?.file?.previewUrl) URL.revokeObjectURL(target.file.previewUrl);
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const updateDraft = (id: string, patch: Partial<DraftLineItem>) => {
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, draft: { ...entry.draft, ...patch } } : entry)),
    );
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const resetAndClose = () => {
    entries.forEach((entry) => entry.file?.previewUrl && URL.revokeObjectURL(entry.file.previewUrl));
    setEntries([]);
    setActive(0);
    onClose();
  };

  const canConfirm =
    entries.length > 0 &&
    entries.every(
      (entry) => entry.draft.vendor.trim() !== "" && typeof entry.draft.amount === "number" && entry.draft.amount > 0,
    );

  const totalAmount = entries.reduce(
    (sum, entry) => sum + (typeof entry.draft.amount === "number" ? entry.draft.amount : 0),
    0,
  );

  const totalFileSize = entries.reduce((sum, entry) => sum + (entry.file?.file.size ?? 0), 0);
  const manualEntryCount = entries.length - fileEntryCount;

  const summaryParts: string[] = [];
  if (fileEntryCount > 0) summaryParts.push(`${fileEntryCount} ไฟล์ (${formatFileSize(totalFileSize)})`);
  if (manualEntryCount > 0) summaryParts.push(`${manualEntryCount} รายการกรอกเอง`);
  const summaryText = summaryParts.length > 0 ? `เลือกแล้ว ${summaryParts.join(" • ")}` : "";

  return (
    <aside
      className={opened ? `${styles.panel} ${styles.panelOpen}` : styles.panel}
      aria-label="อัปโหลดค่าใช้จ่าย"
      aria-hidden={!opened}
      inert={!opened}
    >
      {/* Fixed-width inner column — the outer <aside> is what animates its
          width (0 → 420px, needed so main content actually reflows narrower,
          not just gets covered), so this inner column stays a constant
          width and its own content never visibly squishes mid-transition. */}
      <div className={styles.inner}>
        <div className={styles.header}>
          <span className={styles.title}>อัปโหลดค่าใช้จ่าย</span>
          <UnstyledButton onClick={resetAndClose} aria-label="ปิด" className={styles.closeButton}>
            <Icon src="/icon/regular/x.svg" size={16} />
          </UnstyledButton>
        </div>

        <div className={styles.stepperHead}>
          <Stepper
            active={active}
            color="dark"
            size="xs"
            iconSize={26}
            allowNextStepsSelect={false}
            classNames={{ steps: styles.steps }}
          >
            <Stepper.Step label="อัปโหลดและกรอกข้อมูล" />
            <Stepper.Step label="ยืนยัน" />
            <Stepper.Completed>เสร็จสิ้น</Stepper.Completed>
          </Stepper>
        </div>

        <div className={styles.body}>
          {active === 0 && (
            <Stack gap={16}>
              {/* Hidden pickers live outside the conditional dropzone below
                  so the persistent "เพิ่มรูป"/"ถ่ายภาพ" buttons can always
                  trigger them, even once the dropzone itself is replaced by
                  the entry cards. */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                multiple
                className={styles.hiddenInput}
                onChange={(event) => addFiles(event.target.files)}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className={styles.hiddenInput}
                onChange={(event) => addFiles(event.target.files)}
              />

              {entries.length === 0 && (
                <div
                  className={
                    dragActive ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone
                  }
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") fileInputRef.current?.click();
                  }}
                >
                  <Icon src="/icon/regular/image-square.svg" size={28} />
                  <span className={styles.dropzoneTitle}>ลากไฟล์ใบเสร็จมาวางที่นี่</span>
                  <span className={styles.dropzoneHint}>
                    หรือคลิกเพื่อเลือกไฟล์ — JPG, PNG, PDF ไม่เกิน 10MB
                  </span>
                </div>
              )}

              {entries.length === 0 && (
                <>
                  <Stack gap={8}>
                    <Button
                      variant="default"
                      radius="md"
                      size="sm"
                      fullWidth
                      leftSection={<Icon src="/icon/regular/camera.svg" size={16} />}
                      onClick={() => cameraInputRef.current?.click()}
                    >
                      ถ่ายภาพ
                    </Button>
                    <Button
                      variant="default"
                      radius="md"
                      size="sm"
                      fullWidth
                      leftSection={<Icon src="/icon/regular/upload-simple.svg" size={16} />}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      เลือกไฟล์
                    </Button>
                  </Stack>

                  <Group gap={8} wrap="nowrap" className={styles.tip}>
                    <Icon src="/icon/regular/lightbulb.svg" size={16} />
                    <span>
                      ถ่ายให้เห็นชื่อร้าน วันที่ และยอดรวมชัดเจน — ระบบจะกรอกข้อมูลเบื้องต้นให้อัตโนมัติ แก้ไขเพิ่มเติมได้ทีหลัง
                    </span>
                  </Group>

                  <UnstyledButton className={styles.manualLink} onClick={addManualEntry}>
                    <Icon src="/icon/regular/note-pencil.svg" size={14} />
                    หรือกรอกข้อมูลเองแทน ไม่ต้องอัปโหลดไฟล์
                  </UnstyledButton>
                </>
              )}

              {/* Once something's staged, the upload chrome (dropzone,
                  ถ่ายภาพ/เลือกไฟล์) is gone for good — only the staged
                  data and this one link to add another manual entry
                  remain, so the panel reads as "your data" instead of
                  "an upload form" past the first item. */}
              {entries.length > 0 && (
                <UnstyledButton className={styles.manualLink} onClick={addManualEntry}>
                  <Icon src="/icon/regular/note-pencil.svg" size={14} />
                  เพิ่มรายการด้วยตนเอง
                </UnstyledButton>
              )}

              {summaryText && <span className={styles.summary}>{summaryText}</span>}

              {/* Only this list scrolls — everything above (dropzone/add
                  buttons/manual-entry link) stays put so it's always
                  reachable no matter how many entries pile up. */}
              {entries.length > 0 && (
                <div className={styles.entryScroll}>
                  <Stack gap={10}>
                    {entries.map((entry) => (
                      <div key={entry.id} className={styles.entryCard}>
                        <div className={styles.entryCardHeader}>
                          {entry.file?.kind === "image" && (
                            <Image
                              src={entry.file.previewUrl}
                              alt={entry.file.file.name}
                              w={36}
                              h={36}
                              radius="sm"
                              fit="cover"
                            />
                          )}
                          {entry.file?.kind === "pdf" && (
                            <span className={styles.entryBadge}>
                              <Icon src="/icon/regular/file-pdf.svg" size={16} />
                            </span>
                          )}
                          {!entry.file && (
                            <span className={styles.entryBadge}>
                              <Icon src="/icon/regular/note-pencil.svg" size={16} />
                            </span>
                          )}
                          <Stack gap={0} className={styles.entryCardInfo}>
                            <span className={styles.entryCardTitle}>
                              {entry.file ? entry.file.file.name : "กรอกข้อมูลเอง"}
                            </span>
                            {entry.file && (
                              <span className={styles.entryCardMeta}>
                                {formatFileSize(entry.file.file.size)}
                              </span>
                            )}
                          </Stack>
                          <UnstyledButton
                            onClick={() => removeEntry(entry.id)}
                            aria-label="ลบรายการนี้"
                            className={styles.fileRowRemove}
                          >
                            <Icon src="/icon/regular/x-circle.svg" size={16} />
                          </UnstyledButton>
                        </div>

                        {entry.file && (
                          <Group gap={6} wrap="nowrap" className={styles.autoFillNote}>
                            <Icon src="/icon/regular/sparkle.svg" size={13} />
                            <span>กรอกข้อมูลเบื้องต้นให้อัตโนมัติแล้ว กรุณาตรวจสอบก่อนบันทึก</span>
                          </Group>
                        )}

                        <Stack gap={10} className={styles.entryCardFields}>
                          <TextInput
                            label="วันที่"
                            type="date"
                            size="sm"
                            value={entry.draft.date}
                            onChange={(event) =>
                              updateDraft(entry.id, { date: event.currentTarget.value })
                            }
                          />
                          <Select
                            label="ประเภทเอกสาร"
                            size="sm"
                            data={DOCUMENT_TYPES}
                            value={entry.draft.documentType}
                            onChange={(value) =>
                              value && updateDraft(entry.id, { documentType: value as DocumentType })
                            }
                            checkIconPosition="right"
                          />
                          <TextInput
                            label="ร้านค้า"
                            size="sm"
                            placeholder="ชื่อร้านค้า/ผู้รับเงิน"
                            withAsterisk
                            value={entry.draft.vendor}
                            onChange={(event) =>
                              updateDraft(entry.id, { vendor: event.currentTarget.value })
                            }
                          />
                          <TextInput
                            label="รายละเอียด"
                            size="sm"
                            value={entry.draft.description}
                            onChange={(event) =>
                              updateDraft(entry.id, { description: event.currentTarget.value })
                            }
                          />
                          <Select
                            label="หมวดหมู่"
                            size="sm"
                            data={CATEGORIES}
                            value={entry.draft.category}
                            onChange={(value) => value && updateDraft(entry.id, { category: value })}
                            checkIconPosition="right"
                          />
                          <Select
                            label="ผู้จ่ายเงิน"
                            size="sm"
                            data={PAYERS}
                            value={entry.draft.payer}
                            onChange={(value) => value && updateDraft(entry.id, { payer: value })}
                            checkIconPosition="right"
                          />
                          <Select
                            label="สถานะจ่าย"
                            size="sm"
                            data={PAYMENT_STATUSES}
                            value={entry.draft.status}
                            onChange={(value) =>
                              value && updateDraft(entry.id, { status: value as PaymentStatus })
                            }
                            checkIconPosition="right"
                          />
                          <NumberInput
                            label="จำนวนเงิน"
                            size="sm"
                            withAsterisk
                            leftSection="฿"
                            min={0}
                            decimalScale={2}
                            value={entry.draft.amount}
                            onChange={(value) =>
                              updateDraft(entry.id, { amount: typeof value === "number" ? value : "" })
                            }
                          />
                        </Stack>
                      </div>
                    ))}
                  </Stack>
                </div>
              )}
            </Stack>
          )}

          {active === 1 && (
            <Stack gap={12}>
              <p className={styles.stepHint}>ตรวจสอบรายการก่อนบันทึก</p>
              <Stack gap={8}>
                {entries.map((entry) => (
                  <div key={entry.id} className={styles.reviewRow}>
                    <Stack gap={0} className={styles.reviewInfo}>
                      <span className={styles.reviewVendor}>{entry.draft.vendor || "-"}</span>
                      <span className={styles.reviewMeta}>
                        {entry.draft.category} • {entry.draft.date}
                      </span>
                    </Stack>
                    <span className={styles.reviewAmount}>
                      ฿{formatCurrency(typeof entry.draft.amount === "number" ? entry.draft.amount : 0)}
                    </span>
                  </div>
                ))}
              </Stack>
              <div className={styles.reviewTotal}>
                <span>ยอดรวมทั้งหมด</span>
                <span className={styles.reviewTotalAmount}>฿{formatCurrency(totalAmount)}</span>
              </div>
            </Stack>
          )}

          {active === 2 && (
            <Stack gap={10} align="center" className={styles.doneState}>
              <span className={styles.doneIcon}>
                <Icon src="/icon/regular/check-circle.svg" size={32} />
              </span>
              <span className={styles.doneTitle}>บันทึกค่าใช้จ่ายแล้ว</span>
              <span className={styles.stepHint}>
                บันทึก {entries.length} รายการ รวม ฿{formatCurrency(totalAmount)} เรียบร้อยแล้ว
              </span>
            </Stack>
          )}
        </div>

        <Group gap={8} justify="space-between" className={styles.footer}>
          {active === 0 && (
            <>
              <Button variant="default" radius="md" onClick={resetAndClose}>
                ยกเลิก
              </Button>
              <Button
                variant="filled"
                color="dark"
                radius="md"
                disabled={!canConfirm}
                onClick={() => setActive(1)}
              >
                ถัดไป
              </Button>
            </>
          )}
          {active === 1 && (
            <>
              <Button
                variant="default"
                radius="md"
                leftSection={<Icon src="/icon/regular/arrow-left.svg" size={14} />}
                onClick={() => setActive(0)}
              >
                ย้อนกลับ
              </Button>
              <Button variant="filled" color="dark" radius="md" onClick={() => setActive(2)}>
                ยืนยันและบันทึก
              </Button>
            </>
          )}
          {active === 2 && (
            <Button variant="filled" color="dark" radius="md" fullWidth onClick={resetAndClose}>
              เสร็จสิ้น
            </Button>
          )}
        </Group>
      </div>
    </aside>
  );
}
