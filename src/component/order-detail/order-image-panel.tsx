"use client";

import { useEffect, useState } from "react";
import { Image } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./order-image-panel.module.css";

interface OrderImagePanelProps {
  imageUrl?: string;
  orderNumber: string;
}

export default function OrderImagePanel({
  imageUrl,
  orderNumber,
}: OrderImagePanelProps) {
  const [randomImage, setRandomImage] = useState("");

  useEffect(() => {
    if (!imageUrl) {
      fetch("/api/random-food")
        .then((res) => res.json())
        .then((data) => setRandomImage(data.url));
    }
  }, [imageUrl]);

  const displayImage = imageUrl || randomImage;

  return (
    <div className={styles.card}>
      <div className={styles.viewport}>
        {displayImage ? (
          <Image
            src={displayImage}
            alt={`รูปใบสั่งของออเดอร์ ${orderNumber}`}
            className={styles.image}
          />
        ) : (
          <div className={styles.empty}>
            <Icon src="/icon/regular/image-square.svg" size={32} />
            <span className={styles.emptyTitle}>กำลังโหลดรูป...</span>
          </div>
        )}
      </div>
    </div>
  );
}
