"use client";

import { useRef, useState, type DragEvent } from "react";
import { ActionIcon, Button, Drawer, Group, Image, SimpleGrid, Stack } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./expense-upload-drawer.module.css";

interface ExpenseUploadDrawerProps {
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

// Right-side modal drawer for attaching receipt/expense files — Mantine's
// Drawer ships its own dimmed overlay (portalled above the whole shell), so
// "darken the background" is the default behavior here, not extra work.
// This step only stages files (photo or PDF, from the file picker, drag-drop,
// or the device camera); line-item detail entry and later edits happen on
// the expense's own page, not here.
export default function ExpenseUploadDrawer({ opened, onClose }: ExpenseUploadDrawerProps) {
  const [files, setFiles] = useState<PickedFile[]>([]);
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
  };

  const handleClose = () => {
    files.forEach((item) => item.previewUrl && URL.revokeObjectURL(item.previewUrl));
    setFiles([]);
    onClose();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    addFiles(event.dataTransfer.files);
  };

  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <Drawer
      opened={opened}
      onClose={handleClose}
      position="right"
      size={420}
      title="อัปโหลดค่าใช้จ่าย"
      overlayProps={{ backgroundOpacity: 0.6, blur: 2 }}
      classNames={{ body: styles.body }}
    >
      <Stack gap={16}>
        <div
          className={dragActive ? `${styles.dropzone} ${styles.dropzoneActive}` : styles.dropzone}
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
          <span className={styles.dropzoneHint}>หรือคลิกเพื่อเลือกไฟล์ — JPG, PNG, PDF ไม่เกิน 10MB</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            className={styles.hiddenInput}
            onChange={(event) => addFiles(event.target.files)}
          />
        </div>

        <Group gap={8} grow>
          <Button
            variant="default"
            radius="md"
            size="sm"
            leftSection={<Icon src="/icon/regular/camera.svg" size={16} />}
            onClick={() => cameraInputRef.current?.click()}
          >
            ถ่ายภาพ
          </Button>
          <Button
            variant="default"
            radius="md"
            size="sm"
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
        </Group>

        <Group gap={8} wrap="nowrap" className={styles.tip}>
          <Icon src="/icon/regular/lightbulb.svg" size={16} />
          <span>
            ถ่ายให้เห็นชื่อร้าน วันที่ และยอดรวมชัดเจน — กรอกรายละเอียดและตรวจสอบอีกครั้งได้ที่หน้ารายการค่าใช้จ่ายหลังอัปโหลด
          </span>
        </Group>

        {files.length > 0 && (
          <>
            <SimpleGrid cols={2} spacing={10}>
              {files.map((item) => (
                <div key={item.id} className={styles.thumb}>
                  {item.kind === "image" ? (
                    <Image src={item.previewUrl} alt={item.file.name} radius="md" h={120} fit="cover" />
                  ) : (
                    <div className={styles.pdfTile}>
                      <Icon src="/icon/regular/file-pdf.svg" size={28} />
                      <span>PDF</span>
                    </div>
                  )}
                  <ActionIcon
                    variant="filled"
                    color="dark"
                    size="sm"
                    radius="xl"
                    className={styles.removeButton}
                    aria-label={`นำ ${item.file.name} ออก`}
                    onClick={() => removeFile(item.id)}
                  >
                    <Icon src="/icon/regular/x-circle.svg" size={14} />
                  </ActionIcon>
                  <span className={styles.thumbName}>{item.file.name}</span>
                  <span className={styles.thumbSize}>{formatFileSize(item.file.size)}</span>
                </div>
              ))}
            </SimpleGrid>

            <span className={styles.summary}>
              เลือกแล้ว {files.length} ไฟล์ • รวม {formatFileSize(totalSize)}
            </span>
          </>
        )}
      </Stack>

      <Group gap={8} justify="flex-end" className={styles.footer}>
        <Button variant="default" radius="md" onClick={handleClose}>
          ยกเลิก
        </Button>
        <Button variant="filled" color="dark" radius="md" disabled={files.length === 0}>
          บันทึกและอัปโหลด{files.length > 0 ? ` (${files.length})` : ""}
        </Button>
      </Group>
    </Drawer>
  );
}
