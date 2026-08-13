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
import Accordion, { type AccordionItem } from "@/component/accordion/accordion";
import type { DocumentType, PaymentStatus } from "@/lib/expense/types";
import { formatCurrency } from "@/lib/expense/group-by-week";
import styles from "./expense-upload-panel.module.css";

interface ExpenseUploadPanelProps {
  opened: boolean;
  onClose: () => void;
}

interface PickedFile {
  id: string;
  file: File;
  kind: "image" | "pdf";
  /** Object URL — only created for images; PDFs render an icon tile instead. */
  previewUrl?: string;
}

interface DraftLineItem {
  fileId: string;
  date: string;
  documentType: DocumentType;
  vendor: string;
  description: string;
  category: string;
  payer: string;
  status: PaymentStatus;
  amount: number | "";
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

function draftForFile(fileId: string): DraftLineItem {
  return {
    fileId,
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

// A three-step wizard (upload → edit → confirm) that slides in as a real
// flex sibling of <main> and squeezes it, rather than a Drawer/overlay —
// no backdrop, no portal, the main content area just gets narrower while
// this panel's width animates in. Detail entry here only tags the files
// that were just uploaded; browsing/editing already-saved expenses still
// lives on their own page.
export default function ExpenseUploadPanel({ opened, onClose }: ExpenseUploadPanelProps) {
  const [active, setActive] = useState(0);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [items, setItems] = useState<DraftLineItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next = Array.from(fileList).flatMap((file) => {
      const kind = fileKind(file);
      if (!kind) return [];
      return [
        {
          id: `${file.name}-${file.lastModified}-${file.size}`,
          file,
          kind,
          previewUrl: kind === "image" ? URL.createObjectURL(file) : undefined,
        },
      ];
    });
    if (next.length === 0) return;
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
    setItems((prev) => prev.filter((item) => item.fileId !== id));
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const resetAndClose = () => {
    files.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    setFiles([]);
    setItems([]);
    setActive(0);
    onClose();
  };

  const goToEdit = () => {
    setItems(files.map((file) => draftForFile(file.id)));
    setActive(1);
  };

  const updateItem = (fileId: string, patch: Partial<DraftLineItem>) => {
    setItems((prev) =>
      prev.map((item) => (item.fileId === fileId ? { ...item, ...patch } : item)),
    );
  };

  const canConfirm =
    items.length > 0 &&
    items.every((item) => item.vendor.trim() !== "" && typeof item.amount === "number" && item.amount > 0);

  const totalAmount = items.reduce(
    (sum, item) => sum + (typeof item.amount === "number" ? item.amount : 0),
    0,
  );

  const totalFileSize = files.reduce((sum, item) => sum + item.file.size, 0);

  const accordionItems: AccordionItem[] = items.map((item) => {
    const file = files.find((f) => f.id === item.fileId);
    return {
      value: item.fileId,
      label: file?.file.name ?? item.fileId,
      icon:
        file?.kind === "image" ? (
          <Image src={file.previewUrl} alt="" w={28} h={28} radius="sm" fit="cover" />
        ) : (
          <span className={styles.pdfBadge}>
            <Icon src="/icon/regular/file-pdf.svg" size={16} />
          </span>
        ),
      content: (
        <Stack gap={10}>
          <TextInput
            label="วันที่"
            type="date"
            size="sm"
            value={item.date}
            onChange={(event) => updateItem(item.fileId, { date: event.currentTarget.value })}
          />
          <Select
            label="ประเภทเอกสาร"
            size="sm"
            data={DOCUMENT_TYPES}
            value={item.documentType}
            onChange={(value) =>
              value && updateItem(item.fileId, { documentType: value as DocumentType })
            }
            checkIconPosition="right"
          />
          <TextInput
            label="ร้านค้า"
            size="sm"
            placeholder="ชื่อร้านค้า/ผู้รับเงิน"
            withAsterisk
            value={item.vendor}
            onChange={(event) => updateItem(item.fileId, { vendor: event.currentTarget.value })}
          />
          <TextInput
            label="รายละเอียด"
            size="sm"
            value={item.description}
            onChange={(event) =>
              updateItem(item.fileId, { description: event.currentTarget.value })
            }
          />
          <Select
            label="หมวดหมู่"
            size="sm"
            data={CATEGORIES}
            value={item.category}
            onChange={(value) => value && updateItem(item.fileId, { category: value })}
            checkIconPosition="right"
          />
          <Select
            label="ผู้จ่ายเงิน"
            size="sm"
            data={PAYERS}
            value={item.payer}
            onChange={(value) => value && updateItem(item.fileId, { payer: value })}
            checkIconPosition="right"
          />
          <Select
            label="สถานะจ่าย"
            size="sm"
            data={PAYMENT_STATUSES}
            value={item.status}
            onChange={(value) =>
              value && updateItem(item.fileId, { status: value as PaymentStatus })
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
            value={item.amount}
            onChange={(value) =>
              updateItem(item.fileId, { amount: typeof value === "number" ? value : "" })
            }
          />
        </Stack>
      ),
    };
  });

  return (
    <div className={opened ? `${styles.wrap} ${styles.wrapOpen}` : styles.wrap}>
      <aside
        className={styles.panel}
        aria-label="อัปโหลดค่าใช้จ่าย"
        aria-hidden={!opened}
        inert={!opened}
      >
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
            <Stepper.Step label="อัปโหลดข้อมูล" />
            <Stepper.Step label="แก้ไขข้อมูล" />
            <Stepper.Step label="ยืนยัน" />
            <Stepper.Completed>เสร็จสิ้น</Stepper.Completed>
          </Stepper>
        </div>

        <div className={styles.body}>
          {active === 0 && (
            <Stack gap={16}>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  multiple
                  className={styles.hiddenInput}
                  onChange={(event) => addFiles(event.target.files)}
                />
              </div>

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
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className={styles.hiddenInput}
                  onChange={(event) => addFiles(event.target.files)}
                />
              </Stack>

              <Group gap={8} wrap="nowrap" className={styles.tip}>
                <Icon src="/icon/regular/lightbulb.svg" size={16} />
                <span>
                  ถ่ายให้เห็นชื่อร้าน วันที่ และยอดรวมชัดเจน จะช่วยให้กรอกข้อมูลในขั้นถัดไปได้ง่ายขึ้น
                </span>
              </Group>

              {files.length > 0 && (
                <>
                  <Stack gap={8}>
                    {files.map((item) => (
                      <Group key={item.id} gap={10} wrap="nowrap" className={styles.fileRow}>
                        {item.kind === "image" ? (
                          <Image
                            src={item.previewUrl}
                            alt={item.file.name}
                            w={40}
                            h={40}
                            radius="sm"
                            fit="cover"
                          />
                        ) : (
                          <span className={styles.pdfBadge}>
                            <Icon src="/icon/regular/file-pdf.svg" size={18} />
                          </span>
                        )}
                        <Stack gap={0} className={styles.fileRowInfo}>
                          <span className={styles.fileRowName}>{item.file.name}</span>
                          <span className={styles.fileRowSize}>
                            {formatFileSize(item.file.size)}
                          </span>
                        </Stack>
                        <UnstyledButton
                          onClick={() => removeFile(item.id)}
                          aria-label={`นำ ${item.file.name} ออก`}
                          className={styles.fileRowRemove}
                        >
                          <Icon src="/icon/regular/x-circle.svg" size={16} />
                        </UnstyledButton>
                      </Group>
                    ))}
                  </Stack>
                  <span className={styles.summary}>
                    เลือกแล้ว {files.length} ไฟล์ • รวม {formatFileSize(totalFileSize)}
                  </span>
                </>
              )}
            </Stack>
          )}

          {active === 1 && (
            <Stack gap={12}>
              <p className={styles.stepHint}>
                กรอกรายละเอียดของแต่ละไฟล์ — ช่องที่มี * ต้องกรอกก่อนไปขั้นถัดไป
              </p>
              <Accordion items={accordionItems} multiple defaultValue={[items[0]?.fileId ?? ""]} />
            </Stack>
          )}

          {active === 2 && (
            <Stack gap={12}>
              <p className={styles.stepHint}>ตรวจสอบรายการก่อนบันทึก</p>
              <Stack gap={8}>
                {items.map((item) => (
                  <div key={item.fileId} className={styles.reviewRow}>
                    <Stack gap={0} className={styles.reviewInfo}>
                      <span className={styles.reviewVendor}>{item.vendor || "-"}</span>
                      <span className={styles.reviewMeta}>
                        {item.category} • {item.date}
                      </span>
                    </Stack>
                    <span className={styles.reviewAmount}>
                      ฿{formatCurrency(typeof item.amount === "number" ? item.amount : 0)}
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

          {active === 3 && (
            <Stack gap={10} align="center" className={styles.doneState}>
              <span className={styles.doneIcon}>
                <Icon src="/icon/regular/check-circle.svg" size={32} />
              </span>
              <span className={styles.doneTitle}>บันทึกค่าใช้จ่ายแล้ว</span>
              <span className={styles.stepHint}>
                บันทึก {items.length} รายการ รวม ฿{formatCurrency(totalAmount)} เรียบร้อยแล้ว
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
                disabled={files.length === 0}
                onClick={goToEdit}
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
              <Button
                variant="filled"
                color="dark"
                radius="md"
                disabled={!canConfirm}
                onClick={() => setActive(2)}
              >
                ถัดไป
              </Button>
            </>
          )}
          {active === 2 && (
            <>
              <Button
                variant="default"
                radius="md"
                leftSection={<Icon src="/icon/regular/arrow-left.svg" size={14} />}
                onClick={() => setActive(1)}
              >
                ย้อนกลับ
              </Button>
              <Button variant="filled" color="dark" radius="md" onClick={() => setActive(3)}>
                ยืนยันและบันทึก
              </Button>
            </>
          )}
          {active === 3 && (
            <Button variant="filled" color="dark" radius="md" fullWidth onClick={resetAndClose}>
              เสร็จสิ้น
            </Button>
          )}
        </Group>
      </aside>
    </div>
  );
}
