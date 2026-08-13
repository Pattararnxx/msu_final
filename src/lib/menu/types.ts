import type { FoodType } from "@/lib/expense/types";

export type { FoodType };

export interface MenuOptionChoice {
  id: string;
  label: string;
  /** THB added to the base price when selected. 0 = a free flag/adjustment (e.g. "ไม่ผัก"). */
  priceDelta: number;
}

export interface MenuOptionGroup {
  id: string;
  label: string;
  selectionType: "single" | "multiple";
  choices: MenuOptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: FoodType;
  /**
   * Icon path under /icon/regular/** — stands in for a real dish photo
   * until the restaurant has photography assets to upload. Rendered as a
   * tinted tile, not a bitmap.
   */
  image: string;
  price: number;
  ingredients: string[];
  optionGroups: MenuOptionGroup[];
}

export const CATEGORY_META: Record<FoodType, { label: FoodType; color: string }> = {
  ข้าวต้ม: { label: "ข้าวต้ม", color: "teal" },
  โจ๊ก: { label: "โจ๊ก", color: "orange" },
  ก๋วยจั๊บ: { label: "ก๋วยจั๊บ", color: "red" },
  อื่นๆ: { label: "อื่นๆ", color: "blue" },
};

export const FOOD_TYPES: FoodType[] = ["ข้าวต้ม", "โจ๊ก", "ก๋วยจั๊บ", "อื่นๆ"];
