import { INGREDIENTS, INGREDIENT_BY_ID, MENU_BY_ID, MENU_ITEMS } from "./catalog";
import type {
  ComputedOrder,
  IngredientCategory,
  IngredientUsageLine,
  MenuCategory,
  OrderItemBreakdown,
  OrderLine,
  RawOrder,
} from "./types";

// --- Order computation --------------------------------------------------

/**
 * Expands a raw order into every number the dashboard needs: ingredients
 * mapped through each menu item's recipe (with quantity deducted from
 * stock), cost at the unit price in effect right now, and profit — all
 * computed synchronously the moment the order is recorded. No AI guess is
 * involved: prices come from MENU_ITEMS (the shop's price list) and
 * quantities come from each item's fixed recipe, per AGENTS.md.
 */
export function computeOrder(
  raw: RawOrder,
  unitCosts: ReadonlyMap<string, number>,
): ComputedOrder {
  const usageMap = new Map<string, IngredientUsageLine>();
  const itemBreakdown: OrderItemBreakdown[] = [];
  let revenue = 0;

  for (const line of raw.lines) {
    const menu = MENU_BY_ID.get(line.menuItemId);
    if (!menu) continue;

    const lineRevenue = menu.price * line.qty;
    let lineCost = 0;

    for (const r of menu.recipe) {
      const ingredient = INGREDIENT_BY_ID.get(r.ingredientId);
      if (!ingredient) continue;
      const qty = r.qtyPerServing * line.qty;
      const unitCost = unitCosts.get(r.ingredientId) ?? ingredient.initialUnitCost;
      const cost = qty * unitCost;
      lineCost += cost;

      const existing = usageMap.get(r.ingredientId);
      if (existing) {
        existing.qty += qty;
        existing.cost += cost;
      } else {
        usageMap.set(r.ingredientId, {
          ingredientId: r.ingredientId,
          ingredientName: ingredient.name,
          unit: ingredient.unit,
          qty,
          cost,
        });
      }
    }

    revenue += lineRevenue;
    itemBreakdown.push({
      menuItemId: menu.id,
      menuItemName: menu.name,
      category: menu.category,
      qty: line.qty,
      revenue: lineRevenue,
      cost: lineCost,
      profit: lineRevenue - lineCost,
    });
  }

  const ingredientUsage = [...usageMap.values()];
  const cost = ingredientUsage.reduce((sum, u) => sum + u.cost, 0);
  const menuLabel = itemBreakdown
    .map((b) => (b.qty > 1 ? `${b.menuItemName} x${b.qty}` : b.menuItemName))
    .join(", ");

  return {
    id: raw.id,
    createdAt: raw.createdAt,
    lines: raw.lines,
    menuLabel,
    ingredientUsage,
    itemBreakdown,
    revenue,
    cost,
    profit: revenue - cost,
  };
}

// --- Synthetic order generation (demo stand-in for a real order feed) --

const MAIN_ITEMS = MENU_ITEMS.filter((m) => m.category !== "เครื่องเคียง/เครื่องดื่ม");
const SIDE_ITEMS = MENU_ITEMS.filter((m) => m.category === "เครื่องเคียง/เครื่องดื่ม");

function pickOne<T>(list: T[], rng: () => number): T {
  return list[Math.floor(rng() * list.length)];
}

/** One table's order: 1-2 distinct main dishes, occasionally a side/drink. */
export function generateOrderLines(rng: () => number = Math.random): OrderLine[] {
  const lines: OrderLine[] = [];
  const mainCount = rng() < 0.78 ? 1 : 2;
  const used = new Set<string>();

  for (let i = 0; i < mainCount; i++) {
    let item = pickOne(MAIN_ITEMS, rng);
    let guard = 0;
    while (used.has(item.id) && guard < 6) {
      item = pickOne(MAIN_ITEMS, rng);
      guard += 1;
    }
    used.add(item.id);
    lines.push({ menuItemId: item.id, qty: rng() < 0.22 ? 2 : 1 });
  }

  if (rng() < 0.4) {
    lines.push({ menuItemId: pickOne(SIDE_ITEMS, rng).id, qty: 1 });
  }

  return lines;
}

// --- Rollups / selectors -------------------------------------------------

export function computeCostByCategory(
  orders: ComputedOrder[],
): { category: IngredientCategory; value: number }[] {
  const totals = new Map<IngredientCategory, number>();
  for (const o of orders) {
    for (const u of o.ingredientUsage) {
      const ingredient = INGREDIENT_BY_ID.get(u.ingredientId);
      if (!ingredient) continue;
      totals.set(ingredient.category, (totals.get(ingredient.category) ?? 0) + u.cost);
    }
  }
  return [...totals.entries()].map(([category, value]) => ({ category, value }));
}

export function computeRevenueByMenuCategory(
  orders: ComputedOrder[],
): { category: MenuCategory; value: number }[] {
  const totals = new Map<MenuCategory, number>();
  for (const o of orders) {
    for (const b of o.itemBreakdown) {
      totals.set(b.category, (totals.get(b.category) ?? 0) + b.revenue);
    }
  }
  return [...totals.entries()].map(([category, value]) => ({ category, value }));
}

export interface MenuMarginStat {
  menuItemId: string;
  name: string;
  category: MenuCategory;
  qtySold: number;
  revenue: number;
  cost: number;
  profit: number;
  /** Live per-dish margin — what ranks the list, not a completed-task count. */
  marginPerServing: number;
  marginPct: number;
}

export function computeMarginRanking(orders: ComputedOrder[]): MenuMarginStat[] {
  const map = new Map<string, MenuMarginStat>();
  for (const o of orders) {
    for (const b of o.itemBreakdown) {
      const existing = map.get(b.menuItemId);
      if (existing) {
        existing.qtySold += b.qty;
        existing.revenue += b.revenue;
        existing.cost += b.cost;
        existing.profit += b.profit;
      } else {
        map.set(b.menuItemId, {
          menuItemId: b.menuItemId,
          name: b.menuItemName,
          category: b.category,
          qtySold: b.qty,
          revenue: b.revenue,
          cost: b.cost,
          profit: b.profit,
          marginPerServing: 0,
          marginPct: 0,
        });
      }
    }
  }
  return [...map.values()]
    .map((m) => ({
      ...m,
      marginPerServing: m.qtySold > 0 ? m.profit / m.qtySold : 0,
      marginPct: m.revenue > 0 ? m.profit / m.revenue : 0,
    }))
    .sort((a, b) => b.marginPerServing - a.marginPerServing);
}

export interface StockAlert {
  ingredientId: string;
  name: string;
  unit: string;
  remaining: number;
  threshold: number;
  /** remaining / threshold — the computed number the alert is sorted and colored by. */
  ratio: number;
  severity: "warning" | "critical";
}

/**
 * Below-threshold ingredients, purely from (initial stock − cumulative
 * usage). No one sets an "ใกล้หมด/หมดแล้ว" status by hand — severity is
 * derived from how far under threshold the computed remainder sits.
 */
export function computeStockAlerts(
  stockRemaining: ReadonlyMap<string, number>,
): StockAlert[] {
  const alerts: StockAlert[] = [];
  for (const ingredient of INGREDIENTS) {
    const remaining = stockRemaining.get(ingredient.id) ?? ingredient.initialStock;
    if (remaining >= ingredient.lowStockThreshold) continue;
    const ratio =
      ingredient.lowStockThreshold > 0 ? remaining / ingredient.lowStockThreshold : 0;
    alerts.push({
      ingredientId: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      remaining,
      threshold: ingredient.lowStockThreshold,
      ratio,
      severity: ratio <= 0.4 ? "critical" : "warning",
    });
  }
  return alerts.sort((a, b) => a.ratio - b.ratio);
}

export function computeRemainingStockValue(
  stockRemaining: ReadonlyMap<string, number>,
  unitCosts: ReadonlyMap<string, number>,
): number {
  let total = 0;
  for (const ingredient of INGREDIENTS) {
    const remaining = stockRemaining.get(ingredient.id) ?? ingredient.initialStock;
    const unitCost = unitCosts.get(ingredient.id) ?? ingredient.initialUnitCost;
    total += remaining * unitCost;
  }
  return total;
}

// --- Trend bucketing -------------------------------------------------

export type TrendGranularity = "minute" | "hour" | "day";

const BUCKET_MS: Record<TrendGranularity, number> = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
};

export interface TrendBucket {
  t: number;
  revenue: number;
  cost: number;
  profit: number;
}

export function bucketOrdersByTime(
  orders: ComputedOrder[],
  granularity: TrendGranularity,
): TrendBucket[] {
  const bucketMs = BUCKET_MS[granularity];
  const buckets = new Map<number, TrendBucket>();
  for (const o of orders) {
    const t = Math.floor(o.createdAt / bucketMs) * bucketMs;
    const bucket = buckets.get(t) ?? { t, revenue: 0, cost: 0, profit: 0 };
    bucket.revenue += o.revenue;
    bucket.cost += o.cost;
    bucket.profit += o.profit;
    buckets.set(t, bucket);
  }
  return [...buckets.values()].sort((a, b) => a.t - b.t);
}
