"use client";

import { useRef, useState, type DragEvent } from "react";
import {
  Button,
  Group,
  Image,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
  UnstyledButton,
} from "@mantine/core";
import Icon from "@/component/icon/icon";
import { formatCurrency } from "@/lib/expense/group-by-week";
import {
  orderDraftNeedsReview,
  orderDraftToExpenseItem,
  orderDraftTotal,
} from "@/lib/expense/order-draft";
import {
  ORDER_TYPE_LABELS,
  type ExpenseItem,
  type OrderDraft,
  type OrderItemDraft,
  type OrderOcrFields,
  type OrderType,
} from "@/lib/expense/types";
import { MOCK_MENU_ITEMS } from "@/lib/menu/mock-data";
import type { OrderOcrPayload } from "@/lib/order-ocr/schema";
import styles from "./expense-upload-panel.module.css";

export interface ExpenseUploadPanelProps {
  opened: boolean;
  onClose: () => void;
  /** Confirmed mock orders are returned so the page can update list and summary in-session. */
  onSave?: (orders: ExpenseItem[]) => void;
}

type ScanStatus = "scanning" | "ready" | "error";

interface StagedOrder {
  id: string;
  file?: File;
  previewUrl?: string;
  status: ScanStatus;
  draft?: OrderDraft;
  provider?: "opentyphoon" | "mock";
  error?: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);
const MENU_OPTIONS = MOCK_MENU_ITEMS.map((item) => ({ value: item.id, label: `${item.name} · ฿${item.price}` }));
const ORDER_TYPE_OPTIONS = Object.entries(ORDER_TYPE_LABELS).map(([value, label]) => ({ value, label }));

function localDateTime() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function blankItem(index: number): OrderItemDraft {
  return {
    lineId: `manual-line-${index + 1}`,
    menuItemId: null,
    menuItemName: "",
    quantity: 1,
    unit: "ที่",
    toppings: [],
    unitPrice: "",
    totalPrice: "",
    notes: "",
    confidence: 1,
    needsReview: true,
    humanReviewed: false,
    rawText: "กรอกด้วยตนเอง",
    ocrUnitPrice: null,
    ocrTotalPrice: null,
  };
}

function blankDraft(): OrderDraft {
  return {
    orderNumber: `MANUAL-${Date.now().toString().slice(-6)}`,
    customerName: "",
    orderedAt: localDateTime(),
    orderType: "unknown",
    items: [blankItem(0)],
    notes: "",
    totalAmount: "",
    confidence: 1,
    needsReview: true,
    reviewReasons: ["รายการนี้กรอกด้วยตนเอง กรุณาตรวจทานก่อนบันทึก"],
    humanReviewed: false,
    rawText: "",
  };
}

function fieldsToDraft(fields: OrderOcrFields): OrderDraft {
  return {
    orderNumber: fields.orderNumber,
    customerName: fields.customerName ?? "",
    orderedAt: fields.orderedAt?.slice(0, 16) ?? "",
    orderType: fields.orderType,
    items: fields.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice ?? "",
      totalPrice: item.totalPrice ?? "",
      toppings: item.toppings.map((topping) => ({
        ...topping,
        unitPrice: topping.unitPrice ?? "",
        totalPrice: topping.totalPrice ?? "",
      })),
    })),
    notes: fields.notes ?? "",
    totalAmount: fields.totalAmount ?? "",
    confidence: fields.confidence,
    needsReview: fields.needsReview,
    reviewReasons: fields.reviewReasons,
    humanReviewed: false,
    rawText: fields.rawText,
  };
}

function confidenceLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}

function fileError(file: File): string | null {
  if (!ACCEPTED_TYPES.has(file.type)) return "รองรับเฉพาะภาพ JPG หรือ PNG";
  if (file.size > MAX_FILE_BYTES) return "ไฟล์ต้องมีขนาดไม่เกิน 10 MB";
  return null;
}

function recalculateItem(item: OrderItemDraft): OrderItemDraft {
  const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
  const toppingTotal = item.toppings.reduce(
    (sum, topping) => sum + (typeof topping.totalPrice === "number" ? topping.totalPrice : 0),
    0,
  );
  return { ...item, totalPrice: unitPrice * item.quantity + toppingTotal };
}

function comparableName(value: string) {
  return value.toLocaleLowerCase("th-TH").replace(/[\s()+/._-]/g, "");
}

function toppingsForMenu(item: OrderItemDraft, menuItemId: string) {
  const choices = MOCK_MENU_ITEMS
    .find((menu) => menu.id === menuItemId)
    ?.optionGroups.flatMap((group) => group.choices) ?? [];
  return item.toppings.map((topping) => {
    const comparable = comparableName(topping.name);
    const choice = choices.find((candidate) => {
      if (!comparable) return false;
      const configured = comparableName(candidate.label);
      return configured === comparable || configured.includes(comparable) || comparable.includes(configured);
    });
    const unitPrice: number | "" = choice?.priceDelta ?? "";
    const totalPrice: number | "" = typeof unitPrice === "number" ? unitPrice * topping.quantity : "";
    return {
      ...topping,
      unitPrice,
      totalPrice,
      needsReview: !choice || topping.confidence < 0.7,
      humanReviewed: false,
    };
  });
}

export default function ExpenseUploadPanel({ opened, onClose, onSave }: ExpenseUploadPanelProps) {
  const [active, setActive] = useState(0);
  const [entries, setEntries] = useState<StagedOrder[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  function updateEntry(id: string, updater: (entry: StagedOrder) => StagedOrder) {
    setEntries((current) => current.map((entry) => (entry.id === id ? updater(entry) : entry)));
  }

  async function scanEntry(id: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileLastModified", String(file.lastModified));
      // This project is intentionally a mock-data prototype. The endpoint can
      // still use Typhoon for other callers, while the panel demo stays local
      // and deterministic even when a developer has a key configured.
      formData.append("mode", "mock");
      const response = await fetch("/api/order-ocr", { method: "POST", body: formData });
      const data = (await response.json()) as OrderOcrPayload | { error?: string };
      if (!response.ok || !("extraction" in data)) {
        throw new Error("error" in data && data.error ? data.error : "OCR ไม่สำเร็จ");
      }
      updateEntry(id, (entry) => ({
        ...entry,
        status: "ready",
        draft: fieldsToDraft(data.extraction),
        provider: data.source.provider,
        error: undefined,
      }));
    } catch (error) {
      updateEntry(id, (entry) => ({
        ...entry,
        status: "error",
        error: error instanceof Error ? error.message : "OCR ไม่สำเร็จ กรุณาลองอีกครั้ง",
      }));
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const selected = Array.from(fileList);
    const invalid = selected.map(fileError).find(Boolean);
    if (invalid) {
      setUploadError(invalid);
      return;
    }
    setUploadError(null);
    const now = Date.now();
    const next = selected.map((file, index): StagedOrder => ({
      id: `scan-${now}-${index}-${file.name}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "scanning",
    }));
    setEntries((current) => [...current, ...next]);
    next.forEach((entry) => void scanEntry(entry.id, entry.file!));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function addManualEntry() {
    setEntries((current) => [
      ...current,
      { id: `manual-${Date.now()}`, status: "ready", draft: blankDraft(), provider: "mock" },
    ]);
  }

  function removeEntry(id: string) {
    setEntries((current) => {
      const removed = current.find((entry) => entry.id === id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((entry) => entry.id !== id);
    });
  }

  function patchDraft(id: string, patch: Partial<OrderDraft>) {
    updateEntry(id, (entry) => entry.draft
      ? { ...entry, draft: { ...entry.draft, ...patch, humanReviewed: false } }
      : entry);
  }

  function patchItem(entryId: string, lineId: string, patch: Partial<OrderItemDraft>) {
    updateEntry(entryId, (entry) => {
      if (!entry.draft) return entry;
      const items = entry.draft.items.map((item) =>
        item.lineId === lineId ? recalculateItem({ ...item, ...patch, humanReviewed: false }) : item,
      );
      return {
        ...entry,
        draft: { ...entry.draft, items, totalAmount: items.reduce((sum, item) => sum + (typeof item.totalPrice === "number" ? item.totalPrice : 0), 0), humanReviewed: false },
      };
    });
  }

  function selectMenu(entryId: string, item: OrderItemDraft, menuItemId: string | null) {
    const menu = MOCK_MENU_ITEMS.find((candidate) => candidate.id === menuItemId);
    const toppings = menu ? toppingsForMenu(item, menu.id) : item.toppings;
    patchItem(entryId, item.lineId, menu
      ? { menuItemId: menu.id, menuItemName: menu.name, unitPrice: menu.price, toppings, needsReview: toppings.some((topping) => topping.needsReview) }
      : { menuItemId: null, menuItemName: "", unitPrice: "", totalPrice: "", needsReview: true });
  }

  function confirmHumanReview(id: string) {
    updateEntry(id, (entry) => entry.draft ? {
      ...entry,
      draft: {
        ...entry.draft,
        needsReview: false,
        humanReviewed: true,
        items: entry.draft.items.map((item) => ({
          ...item,
          needsReview: false,
          humanReviewed: true,
          toppings: item.toppings.map((topping) => ({ ...topping, needsReview: false, humanReviewed: true })),
        })),
      },
    } : entry);
  }

  function resetAndClose(revoke = true) {
    if (revoke) entries.forEach((entry) => entry.previewUrl && URL.revokeObjectURL(entry.previewUrl));
    setEntries([]);
    setActive(0);
    setUploadError(null);
    onClose();
  }

  function saveOrders() {
    const orders = entries.flatMap((entry) => entry.draft
      ? [orderDraftToExpenseItem(entry.draft, { id: entry.id, imageUrl: entry.previewUrl })]
      : []);
    onSave?.(orders);
    setActive(2);
  }

  const readyEntries = entries.filter((entry) => entry.status === "ready" && entry.draft);
  const canContinue = entries.length > 0 && readyEntries.length === entries.length && readyEntries.every(({ draft }) => {
    if (!draft) return false;
    const requiredComplete = draft.orderNumber.trim() && draft.orderedAt && draft.items.length > 0 && draft.items.every((item) => item.menuItemId && item.quantity > 0 && typeof item.totalPrice === "number");
    return Boolean(requiredComplete) && (!orderDraftNeedsReview(draft) || draft.humanReviewed);
  });
  const total = readyEntries.reduce((sum, entry) => sum + orderDraftTotal(entry.draft!), 0);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  }

  return (
    <div className={opened ? `${styles.slot} ${styles.slotOpen}` : styles.slot}>
      <aside className={opened ? `${styles.panel} ${styles.panelOpen}` : styles.panel} aria-label="อัปโหลดใบออร์เดอร์" aria-hidden={!opened} inert={!opened}>
        <div className={styles.inner}>
          <div className={styles.header}>
            <div><span className={styles.title}>อัปโหลดใบออร์เดอร์</span><span className={styles.headerSubtitle}>อ่านใบออร์เดอร์ลูกค้าด้วย OCR</span></div>
            <UnstyledButton onClick={() => resetAndClose()} aria-label="ปิด" className={styles.closeButton}><Icon src="/icon/regular/x.svg" size={16} /></UnstyledButton>
          </div>

          <div className={styles.progress} aria-label="ขั้นตอนการบันทึกออร์เดอร์">
            <div className={`${styles.progressStep} ${styles.progressStepActive}`} aria-current={active === 0 ? "step" : undefined}><span className={styles.progressNumber}>1</span><span>สแกนและแก้ไข</span></div>
            <span className={styles.progressLine} aria-hidden="true" />
            <div className={active >= 1 ? `${styles.progressStep} ${styles.progressStepActive}` : styles.progressStep} aria-current={active === 1 ? "step" : undefined}><span className={styles.progressNumber}>2</span><span>{active === 2 ? "เสร็จสิ้น" : "ตรวจสอบ"}</span></div>
          </div>

          <div className={styles.body}>
            {active === 0 && <Stack gap={16}>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" multiple className={styles.hiddenInput} onChange={(event) => addFiles(event.target.files)} />
              <input ref={cameraInputRef} type="file" accept="image/jpeg,image/png" capture="environment" className={styles.hiddenInput} onChange={(event) => addFiles(event.target.files)} />
              {entries.length === 0 && <>
                <div className={dragActive ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInputRef.current?.click(); } }}>
                  <Icon src="/icon/regular/scan.svg" size={28} />
                  <span className={styles.dropzoneTitle}>อัปโหลดใบออร์เดอร์ของลูกค้า</span>
                  <span className={styles.dropzoneHint}>รองรับภาพตัวพิมพ์และลายมือ JPG/PNG ไม่เกิน 10 MB</span>
                </div>
                <div className={styles.quickActions}>
                  <Button variant="default" onClick={() => cameraInputRef.current?.click()} leftSection={<Icon src="/icon/regular/camera.svg" size={16} />}>ถ่ายภาพ</Button>
                  <Button variant="default" onClick={() => fileInputRef.current?.click()} leftSection={<Icon src="/icon/regular/upload-simple.svg" size={16} />}>เลือกไฟล์</Button>
                </div>
                <Group gap={8} wrap="nowrap" className={styles.tip}><Icon src="/icon/regular/lightbulb.svg" size={16} /><span>ระบบอ่านเมนู จำนวน ท็อปปิ้ง และคำสั่งพิเศษ แล้วคิดราคาจากเมนูที่ร้านตั้งไว้</span></Group>
                <UnstyledButton className={styles.manualLink} onClick={addManualEntry}><Icon src="/icon/regular/note-pencil.svg" size={14} />กรอกออร์เดอร์เองเมื่อภาพอ่านไม่ได้</UnstyledButton>
              </>}
              {uploadError && <div className={styles.errorMessage} role="alert"><Icon src="/icon/regular/warning-circle.svg" size={16} />{uploadError}</div>}
              {entries.length > 0 && <div className={styles.stagedToolbar}>
                <span className={styles.summary}>{entries.length} ใบออร์เดอร์ · OCR สำเร็จ {readyEntries.length}</span>
                <div className={styles.stagedActions}><Button variant="default" size="xs" onClick={() => fileInputRef.current?.click()}>เพิ่มภาพ</Button><Button variant="default" size="xs" onClick={addManualEntry}>เพิ่มเอง</Button></div>
              </div>}
              <Stack gap={10}>
                {entries.map((entry) => <div key={entry.id} className={styles.entryCard}>
                  <div className={styles.entryCardHeader}>
                    {entry.previewUrl ? <Image src={entry.previewUrl} alt={`ใบออร์เดอร์ ${entry.file?.name ?? "ที่อัปโหลด"}`} w={44} h={44} radius="sm" fit="cover" /> : <span className={styles.entryBadge}><Icon src="/icon/regular/note-pencil.svg" size={16} /></span>}
                    <div className={styles.entryCardInfo}><span className={styles.entryCardTitle}>{entry.file?.name ?? "กรอกออร์เดอร์เอง"}</span><span className={styles.entryCardMeta}>{entry.status === "scanning" ? "กำลังอ่าน OCR…" : entry.status === "error" ? "อ่านไม่สำเร็จ" : `${entry.provider === "mock" ? "Mock OCR" : "Typhoon OCR"} · ความมั่นใจ ${confidenceLabel(entry.draft?.confidence ?? 0)}`}</span></div>
                    <UnstyledButton onClick={() => removeEntry(entry.id)} aria-label="ลบใบออร์เดอร์นี้" className={styles.fileRowRemove}><Icon src="/icon/regular/x-circle.svg" size={16} /></UnstyledButton>
                  </div>
                  {entry.status === "scanning" && <div className={styles.scanning} role="status"><span className={styles.spinner} />กำลังแยกเมนู จำนวน และคำสั่งพิเศษ</div>}
                  {entry.status === "error" && <div className={styles.errorMessage} role="alert"><Icon src="/icon/regular/warning-circle.svg" size={16} /><span>{entry.error}</span><Button size="compact-xs" variant="subtle" onClick={() => entry.file && scanEntry(entry.id, entry.file)}>ลองใหม่</Button></div>}
                  {entry.draft && <>
                    <div className={styles.entryCardFields}>
                      <TextInput label="เลขออร์เดอร์" value={entry.draft.orderNumber} onChange={(event) => patchDraft(entry.id, { orderNumber: event.currentTarget.value })} />
                      <TextInput label="วันและเวลา" type="datetime-local" value={entry.draft.orderedAt} onChange={(event) => patchDraft(entry.id, { orderedAt: event.currentTarget.value })} />
                      <TextInput className={styles.fieldWide} label="ชื่อลูกค้า / โต๊ะ" value={entry.draft.customerName} onChange={(event) => patchDraft(entry.id, { customerName: event.currentTarget.value })} />
                      <Select className={styles.fieldWide} label="ประเภทออร์เดอร์" data={ORDER_TYPE_OPTIONS} value={entry.draft.orderType} onChange={(value) => value && patchDraft(entry.id, { orderType: value as OrderType })} />
                    </div>
                    <Stack gap={8}>
                      {entry.draft.items.map((item, index) => <div key={item.lineId} className={styles.menuItemCard}>
                        <div className={styles.menuItemHead}><span>รายการ {index + 1}</span><span className={item.confidence < 0.7 ? styles.confidenceLow : styles.confidenceGood}>OCR {confidenceLabel(item.confidence)}</span></div>
                        <Select searchable label="เมนู" data={MENU_OPTIONS} value={item.menuItemId} error={!item.menuItemId ? "กรุณาจับคู่กับเมนูของร้าน" : undefined} onChange={(value) => selectMenu(entry.id, item, value)} />
                        <div className={styles.itemGrid}>
                          <NumberInput label="จำนวน" min={1} value={item.quantity} onChange={(value) => patchItem(entry.id, item.lineId, { quantity: typeof value === "number" ? Math.max(1, value) : 1 })} />
                          <TextInput label="ราคาจากร้าน" value={typeof item.unitPrice === "number" ? `฿${formatCurrency(item.unitPrice)}` : "-"} readOnly />
                        </div>
                        {item.toppings.length > 0 && <div className={styles.toppingList}><span className={styles.fieldLabel}>ท็อปปิ้งที่อ่านได้</span>{item.toppings.map((topping) => <div key={topping.id} className={styles.toppingRow}><span>{topping.name}</span><span>x{topping.quantity}</span><span>{typeof topping.totalPrice === "number" ? `฿${formatCurrency(topping.totalPrice)}` : "ต้องตรวจราคา"}</span></div>)}</div>}
                        <Textarea label="คำสั่งพิเศษ" autosize minRows={1} value={item.notes} onChange={(event) => patchItem(entry.id, item.lineId, { notes: event.currentTarget.value })} />
                        <div className={styles.lineTotal}><span>รวมรายการ</span><strong>{typeof item.totalPrice === "number" ? `฿${formatCurrency(item.totalPrice)}` : "-"}</strong></div>
                      </div>)}
                    </Stack>
                    <Textarea label="หมายเหตุทั้งออร์เดอร์" autosize minRows={1} value={entry.draft.notes} onChange={(event) => patchDraft(entry.id, { notes: event.currentTarget.value })} />
                    {(orderDraftNeedsReview(entry.draft) || entry.draft.reviewReasons.length > 0) && <div className={entry.draft.humanReviewed ? styles.reviewConfirmed : styles.reviewWarning}>
                      <Icon src={entry.draft.humanReviewed ? "/icon/regular/check-circle.svg" : "/icon/regular/warning-circle.svg"} size={17} />
                      <div><strong>{entry.draft.humanReviewed ? "พนักงานตรวจทานแล้ว" : "ต้องตรวจทานโดยพนักงาน"}</strong><span>{entry.draft.reviewReasons.join(" · ") || "OCR มีข้อมูลที่ยังไม่มั่นใจ"}</span></div>
                      {!entry.draft.humanReviewed && <Button size="compact-xs" variant="default" onClick={() => confirmHumanReview(entry.id)}>ยืนยันว่าตรวจแล้ว</Button>}
                    </div>}
                    {entry.draft.rawText && <details className={styles.ocrEvidence}><summary>ดูข้อความดิบจาก OCR</summary><pre>{entry.draft.rawText}</pre></details>}
                  </>}
                </div>)}
              </Stack>
            </Stack>}

            {active === 1 && <Stack gap={12}><p className={styles.stepHint}>ตรวจยอดที่คิดจากราคาเมนูของร้านก่อนบันทึก</p>{readyEntries.map((entry) => <div key={entry.id} className={styles.reviewRow}><div className={styles.reviewInfo}><span className={styles.reviewVendor}>{entry.draft!.orderNumber}</span><span className={styles.reviewMeta}>{entry.draft!.items.map((item) => `${item.menuItemName} x${item.quantity}`).join(", ")}</span></div><span className={styles.reviewAmount}>฿{formatCurrency(orderDraftTotal(entry.draft!))}</span></div>)}<div className={styles.reviewTotal}><span>ยอดรวมทั้งหมด</span><span className={styles.reviewTotalAmount}>฿{formatCurrency(total)}</span></div></Stack>}
            {active === 2 && <Stack gap={10} align="center" className={styles.doneState}><span className={styles.doneIcon}><Icon src="/icon/regular/check-circle.svg" size={32} /></span><span className={styles.doneTitle}>บันทึกออร์เดอร์แล้ว</span><span className={styles.stepHint}>{readyEntries.length} ออร์เดอร์ถูกเพิ่มในรายการของ prototype</span></Stack>}
          </div>

          <Group gap={8} justify="space-between" className={styles.footer}>
            {active === 0 && <><Button variant="default" onClick={() => resetAndClose()}>ยกเลิก</Button><Button color="dark" disabled={!canContinue} onClick={() => setActive(1)}>ตรวจสอบยอด</Button></>}
            {active === 1 && <><Button variant="default" onClick={() => setActive(0)} leftSection={<Icon src="/icon/regular/arrow-left.svg" size={14} />}>ย้อนกลับ</Button><Button color="dark" onClick={saveOrders}>ยืนยันและบันทึก</Button></>}
            {active === 2 && <Button color="dark" fullWidth onClick={() => resetAndClose(false)}>เสร็จสิ้น</Button>}
          </Group>
        </div>
      </aside>
    </div>
  );
}
