"use client";

import { Image } from "@mantine/core";
import styles from "./order-image-panel.module.css";

interface OrderImagePanelProps {
  imageUrl?: string;
  orderNumber: string;
}
export default function OrderImagePanel({
  imageUrl,
  orderNumber,
}: OrderImagePanelProps) {
  // The historical mock rows predate image upload, so they share the local
  // handwritten order-slip fixture. Newly uploaded rows keep their own
  // object URL in `imageUrl`. Never substitute a food photo here: this area
  // is evidence for human review, not decorative imagery.
  const displayImage = imageUrl || "/food/bill.jpg";

  return (
    <div className={styles.card}>
      <div className={styles.viewport}>
        <Image
          src={displayImage}
          alt={`รูปใบออร์เดอร์ ${orderNumber}`}
          className={styles.image}
          fit="contain"
        />
      </div>
      {!imageUrl && (
        <p className={styles.fallbackNote}>
          ภาพตัวอย่างใบออร์เดอร์สำหรับข้อมูลจำลอง
        </p>
      )}
    </div>
  );
}
