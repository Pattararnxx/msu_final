// Domain model for the live kitchen operations dashboard.
//
// Important scope note: everything here represents *confirmed* sales —
// orders that a staff member has already entered/confirmed at the till, the
// same way the till of an actual shop would work. This is a different stage
// of the pipeline than the OCR order-slip review flow described in
// AGENTS.md ("ผล OCR ที่ confidence ต่ำต้องผ่าน human review ก่อนนำไปใช้จริง").
// This dashboard does not read raw OCR output and does not skip that
// review — it computes live operational numbers *after* an order is
// confirmed, which is why there is no per-order status column: every row
// here is, by construction, already complete.

export type IngredientCategory =
  | "เนื้อสัตว์"
  | "ผัก"
  | "เครื่องปรุง"
  | "บรรจุภัณฑ์";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  /** Display unit, e.g. "กรัม", "ฟอง", "ใบ". */
  unit: string;
  /** Starting stock at the beginning of the session, in `unit`. */
  initialStock: number;
  /** Reorder threshold, in `unit` — below this, the ingredient is alerted. */
  lowStockThreshold: number;
  /** Starting cost per `unit`, in บาท. Can drift via supplier price updates. */
  initialUnitCost: number;
}

export type MenuCategory = "โจ๊ก" | "ข้าวต้ม" | "ก๋วยจั๊บ" | "เครื่องเคียง/เครื่องดื่ม";

export interface RecipeLine {
  ingredientId: string;
  /** Quantity of the ingredient's `unit` consumed per serving. */
  qtyPerServing: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategory;
  /** Sale price in บาท — from the shop's own price list, never AI-guessed. */
  price: number;
  recipe: RecipeLine[];
}

export interface OrderLine {
  menuItemId: string;
  qty: number;
}

/** A confirmed order as it arrives — the engine expands this into usage/cost. */
export interface RawOrder {
  id: string;
  createdAt: number;
  lines: OrderLine[];
}

export interface IngredientUsageLine {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  qty: number;
  /** Cost of this usage line at the unit cost in effect when the order was processed. */
  cost: number;
}

/** Per menu-item attribution within an order — what margin ranking reads from. */
export interface OrderItemBreakdown {
  menuItemId: string;
  menuItemName: string;
  category: MenuCategory;
  qty: number;
  revenue: number;
  cost: number;
  profit: number;
}

/** A fully computed order — what the order table and every rollup reads from. */
export interface ComputedOrder {
  id: string;
  createdAt: number;
  lines: OrderLine[];
  menuLabel: string;
  ingredientUsage: IngredientUsageLine[];
  itemBreakdown: OrderItemBreakdown[];
  revenue: number;
  cost: number;
  profit: number;
}

export interface UnitPricePoint {
  t: number;
  price: number;
}

export interface SupplierPriceUpdateEvent {
  ingredientId: string;
  ingredientName: string;
  at: number;
  fromPrice: number;
  toPrice: number;
}
