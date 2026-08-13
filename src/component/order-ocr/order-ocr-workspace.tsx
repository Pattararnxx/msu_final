"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/component/icon/icon";
import type { OrderItem, OrderPayload } from "@/lib/order-ocr/schema";
import styles from "./order-ocr-workspace.module.css";

type EditableItem = OrderItem;

const ACCEPTED_TYPES = "image/jpeg,image/png";

function formatConfidence(value: number) {
  return `${Math.round(value * 100)}%`;
}

function makePayload(data: OrderPayload, items: EditableItem[]): OrderPayload {
  const reviewedItems = items.map((item) => ({
    ...item,
    needs_review: item.needs_review || (!item.human_reviewed && item.confidence < 0.7),
  }));
  const needsReview = reviewedItems.some((item) => item.needs_review);
  return {
    ...data,
    order: { ...data.order, items: reviewedItems },
    quality: {
      ...data.quality,
      needs_review: needsReview,
      review_reasons: needsReview
        ? Array.from(new Set([...data.quality.review_reasons, "มีรายการที่ confidence ต่ำกว่า 70% หรือยังไม่ได้ตรวจทาน"]))
        : data.quality.review_reasons,
    },
  };
}

export default function OrderOcrWorkspace() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [payload, setPayload] = useState<OrderPayload | null>(null);
  const [items, setItems] = useState<EditableItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const reviewCount = useMemo(
    () => items.filter((item) => item.needs_review || (!item.human_reviewed && item.confidence < 0.7)).length,
    [items],
  );

  const selectFile = useCallback((nextFile: File | undefined) => {
    if (!nextFile) return;
    if (!ACCEPTED_TYPES.split(",").includes(nextFile.type)) {
      setError("รองรับเฉพาะ JPG หรือ PNG");
      return;
    }
    if (nextFile.size > 10 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 10 MB");
      return;
    }
    setError(null);
    setPayload(null);
    setItems([]);
    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }, []);

  async function runOcr() {
    if (!file) return;
    setIsScanning(true);
    setError(null);
    setPayload(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/order-ocr", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OCR ไม่สำเร็จ");
      setPayload(data as OrderPayload);
      setItems((data as OrderPayload).order.items);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "OCR ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setIsScanning(false);
    }
  }

  function updateItem(index: number, patch: Partial<EditableItem>) {
    setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function copyPayload() {
    if (!payload) return;
    void navigator.clipboard.writeText(JSON.stringify(makePayload(payload, items), null, 2));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadPayload() {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(makePayload(payload, items), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${file?.name.replace(/\.[^.]+$/, "") || "order"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><Icon src="/icon/regular/scan.svg" size={16} /> Restaurant operations</div>
          <h1>จากลายมือ<br /><span>สู่ครัวที่ไม่พลาด</span></h1>
          <p>สแกนใบออร์เดอร์ลายมือ แล้วเปลี่ยนเป็น JSON พร้อมใช้งานใน POS หรือระบบครัวภายในไม่กี่วินาที</p>
        </div>
        <div className={styles.heroSignal} aria-hidden="true">
          <span className={styles.signalLine} />
          <span className={styles.signalDot} />
          <span className={styles.signalLabel}>OCR / JSON</span>
        </div>
      </section>

      <div className={styles.workspace}>
        <section className={styles.uploadPanel} aria-labelledby="upload-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>01 / INPUT</span><h2 id="upload-title">อัปโหลดใบออร์เดอร์</h2></div>
            {file && <span className={styles.fileReady}><Icon src="/icon/regular/check-circle.svg" size={15} /> พร้อมสแกน</span>}
          </div>

          <button
            type="button"
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ""} ${file ? styles.dropzoneWithFile : ""}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]); }}
          >
            <input ref={inputRef} type="file" accept={ACCEPTED_TYPES} hidden onChange={(event) => selectFile(event.target.files?.[0])} />
            {previewUrl ? (
              <Image src={previewUrl} alt="ตัวอย่างใบออร์เดอร์ที่อัปโหลด" width={1200} height={900} unoptimized className={styles.preview} />
            ) : (
              <>
                <span className={styles.uploadIcon}><Icon src="/icon/regular/upload-simple.svg" size={26} /></span>
                <strong>ลากไฟล์มาวางที่นี่</strong>
                <span>หรือคลิกเพื่อเลือกภาพจากเครื่อง</span>
                <small>JPG, PNG · สูงสุด 10 MB</small>
              </>
            )}
          </button>

          {file && <div className={styles.fileMeta}><Icon src="/icon/regular/file-text.svg" size={18} /><span>{file.name}</span><small>{(file.size / 1024 / 1024).toFixed(2)} MB</small></div>}
          {error && <div className={styles.error} role="alert"><Icon src="/icon/regular/warning-circle.svg" size={18} />{error}</div>}
          <button type="button" className={styles.primaryButton} disabled={!file || isScanning} onClick={runOcr}>
            {isScanning ? <><span className={styles.spinner} /> กำลังอ่านลายมือ…</> : <><Icon src="/icon/regular/sparkle.svg" size={18} /> เริ่มแปลงเป็น JSON</>}
          </button>
          <p className={styles.privacy}><Icon src="/icon/regular/lock.svg" size={14} /> ภาพจะถูกส่งไปประมวลผลบนเซิร์ฟเวอร์ที่ตั้งค่าไว้ และไม่ถูกเก็บในหน้านี้</p>
        </section>

        <section className={styles.resultPanel} aria-labelledby="result-title">
          <div className={styles.sectionHeading}>
            <div><span className={styles.sectionKicker}>02 / REVIEW</span><h2 id="result-title">ตรวจผลก่อนส่งเข้าครัว</h2></div>
            {payload && <span className={reviewCount ? styles.reviewBadge : styles.successBadge}>{reviewCount ? `${reviewCount} จุดต้องตรวจ` : "ตรวจแล้ว"}</span>}
          </div>

          {!payload && !isScanning && <div className={styles.emptyState}><span><Icon src="/icon/regular/brackets-curly.svg" size={28} /></span><strong>ผลลัพธ์จะแสดงตรงนี้</strong><p>อัปโหลดภาพทางซ้ายเพื่อเริ่มอ่านใบออร์เดอร์</p></div>}
          {isScanning && <div className={styles.scanningState}><div className={styles.scanVisual}><span /><span /><span /></div><strong>กำลังอ่านลายมือและแยกรายการ</strong><p>AI กำลังตรวจจำนวน เมนู และคำสั่งพิเศษ</p></div>}
          {payload && <div className={styles.resultBody}>
            <div className={styles.orderMeta}><span>{payload.order.table_number ? `โต๊ะ ${payload.order.table_number}` : "ไม่พบเลขโต๊ะ"}</span><span>{payload.order.service_type === "dine_in" ? "ทานที่ร้าน" : "ไม่ระบุรูปแบบบริการ"}</span><span>ความมั่นใจ {formatConfidence(payload.quality.overall_confidence)}</span></div>
            <div className={styles.itemList}>
              {items.map((item, index) => <div className={`${styles.itemRow} ${item.needs_review || item.confidence < 0.7 ? styles.itemNeedsReview : ""}`} key={item.line_id}>
                <div className={styles.itemIndex}>{String(index + 1).padStart(2, "0")}</div>
                <div className={styles.itemFields}>
                  <input aria-label={`ชื่อเมนูรายการที่ ${index + 1}`} value={item.menu_item_name} onChange={(event) => updateItem(index, { menu_item_name: event.target.value })} />
                  <div className={styles.itemSubfields}><label>จำนวน <input aria-label={`จำนวนรายการที่ ${index + 1}`} type="number" min="1" value={item.quantity} onChange={(event) => updateItem(index, { quantity: Math.max(1, Number(event.target.value)) })} /></label><span>หน่วย: {item.unit}</span>{item.notes.length > 0 && <span>{item.notes.join(", ")}</span>}</div>
                </div>
                <div className={styles.confidence}><span className={item.confidence < 0.7 ? styles.confidenceLow : ""}>{formatConfidence(item.confidence)}</span>{item.needs_review || (!item.human_reviewed && item.confidence < 0.7) ? <button type="button" onClick={() => updateItem(index, { needs_review: false, human_reviewed: true })}>ยืนยัน</button> : <Icon src="/icon/regular/check-circle.svg" size={18} />}</div>
              </div>)}
            </div>
            {payload.quality.review_reasons.length > 0 && <div className={styles.reviewNote}><Icon src="/icon/regular/warning-circle.svg" size={17} /><span>{payload.quality.review_reasons.join(" · ")}</span></div>}
            <div className={styles.resultActions}><button type="button" className={styles.secondaryButton} onClick={copyPayload}><Icon src="/icon/regular/copy.svg" size={17} /> {copied ? "คัดลอกแล้ว" : "คัดลอก JSON"}</button><button type="button" className={styles.secondaryButton} onClick={downloadPayload}><Icon src="/icon/regular/download-simple.svg" size={17} /> ดาวน์โหลด</button></div>
          </div>}
        </section>
      </div>

      <section className={styles.payloadSection} aria-labelledby="payload-title">
        <div className={styles.payloadHeading}><div><span className={styles.sectionKicker}>03 / PAYLOAD</span><h2 id="payload-title">JSON พร้อมส่งต่อ</h2></div><span className={styles.schemaTag}>restaurant.order.v1</span></div>
        <pre className={styles.codeBlock}>{payload ? JSON.stringify(makePayload(payload, items), null, 2) : <><span className={styles.codeMuted}>{"// payload จะถูกสร้างหลังจากตรวจ OCR สำเร็จ"}</span>{"\n"}{"{\n  \"event\": \"restaurant.order.extracted\",\n  \"order\": { ... }\n}"}</>}</pre>
      </section>
      <footer className={styles.footer}><span><b>OrderLens</b> / handwritten order OCR</span><span>Human review stays in the loop.</span></footer>
    </div>
  );
}
