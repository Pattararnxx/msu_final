"use client";

import { Select } from "@mantine/core";
import Icon from "@/component/icon/icon";
import styles from "./property-filter.module.css";

// Static option lists — wire these up to real filtering once the listing
// data is live. Left-hand half of the hero toolbar; PropertySearch is the
// right-hand half.
const PROPERTY_TYPES = [
  "ทุกประเภท",
  "บ้านเดี่ยว",
  "ทาวน์เฮาส์",
  "คอนโดมิเนียม",
  "ที่ดิน",
];

const PROVINCES = [
  "ทุกจังหวัด",
  "กรุงเทพมหานคร",
  "นนทบุรี",
  "ปทุมธานี",
  "สมุทรปราการ",
  "ชลบุรี",
  "ระยอง",
  "นครราชสีมา",
  "เชียงใหม่",
  "เชียงราย",
];

const PRICE_RANGES = [
  "ทุกช่วงราคา",
  "ต่ำกว่า 2 ล้าน",
  "2 - 5 ล้าน",
  "5 - 10 ล้าน",
  "มากกว่า 10 ล้าน",
];

export default function PropertyFilter() {
  return (
    <div className={styles.filter}>
      <span className={styles.icon} aria-hidden="true">
        <Icon src="/icon/regular/funnel.svg" size={16} />
      </span>
      <Select
        data={PROPERTY_TYPES}
        defaultValue={PROPERTY_TYPES[0]}
        aria-label="ประเภททรัพย์"
        radius={128}
        w={160}
        checkIconPosition="right"
      />
      <Select
        data={PROVINCES}
        defaultValue={PROVINCES[0]}
        aria-label="จังหวัด"
        radius={128}
        w={160}
        checkIconPosition="right"
      />
      <Select
        data={PRICE_RANGES}
        defaultValue={PRICE_RANGES[0]}
        aria-label="ช่วงราคา"
        radius={128}
        w={160}
        checkIconPosition="right"
      />
    </div>
  );
}
